// Verification harness (after-fix measurement).
// Drives the real app: Fit India view → zoom out to 3 → samples the tile
// mosaic over time → zooms back through 4/5/6/7 → pans → zooms back out.
// Reports DOM tile counts, per-zoom network request stats, per-tile pixel
// census (IMAGE / BLACK / TRANSPARENT), and screenshots at each state.
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(EDGE) ? EDGE : CHROME;
const DEBUG_PORT = 9452;
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8000';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let msgId = 0;

function cdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const t = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 60000);
    const onMsg = (evt) => {
      const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
      if (m.id === id) { clearTimeout(t); ws.removeEventListener('message', onMsg); resolve(m); }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evalJS(ws, expr) {
  const r = await cdp(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error('eval fail: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
  return r.result?.result?.value;
}
const getZoom = `(() => {
  const txts = Array.from(document.querySelectorAll('.spatial-capsule')).map(e => e.textContent || '');
  const m = txts.join('|').match(/ZOOM\\s+(\\d+)/);
  return m ? Number(m[1]) : null;
})()`;

const readZoom = (ws) => evalJS(ws, getZoom);

const stateSnap = `(() => {
  const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img'));
  const byZ = {}, counts = { loaded: 0, tiny: 0, pending: 0, broken: 0 };
  let srcs = [];
  for (const i of imgs) {
    const m = i.src.match(/tile\\/(\\d+)\\/(\\d+)\\.(\\d+)/);
    if (!m) continue;
    const z = m[1]; byZ[z] = (byZ[z] || 0) + 1;
    if (!i.complete) counts.pending++;
    else if (i.naturalWidth === 0) counts.broken++;
    else if (i.naturalWidth <= 2) counts.tiny++;
    else counts.loaded++;
    if (srcs.length < 4) srcs.push(i.src.replace(/^.*tile\\//, '').replace(/\\?.*$/, ''));
  }
  const r = document.querySelector('.leaflet-container')?.getBoundingClientRect();
  return JSON.stringify({ zoom: Number((${''})), domTiles: imgs.length, byZ, counts, srcs, mapRect: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null });
})()`;

const tileCensus = `(async () => {
  const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img')).filter((i) => i.complete && i.naturalWidth > 2);
  const out = { total: imgs.length, IMAGE: 0, BLACK: 0, mostlyBlack: 0, TRANSPARENT: 0, list: [] };
  for (const img of imgs) {
    const m = img.src.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
    const key = m ? 'z' + m[1] + '/x' + m[2] + '/y' + m[3] : '?';
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let n = d.length / 4, alpha = 0, opaque = 0, black = 0;
      for (let p = 0; p < d.length; p += 4) {
        if (d[p + 3] < 16) { alpha++; continue; }
        opaque++;
        if (d[p] < 25 && d[p + 1] < 25 && d[p + 2] < 25) black++;
      }
      const t = 100 * alpha / n, b = 100 * black / Math.max(opaque, 1);
      const kind = t > 98 ? 'TRANSPARENT' : b > 80 ? 'BLACK' : b > 30 ? 'mostlyBlack' : 'IMAGE';
      out[kind]++;
      out.list.push({ key, kind, blackPct: Math.round(b) });
    } catch (e) { out.list.push({ key, kind: 'decode-error' }); }
  }
  return JSON.stringify(out);
})()`;

async function snap(ws, name, label, extra = '') {
  const state = JSON.parse(await evalJS(ws, `(() => { const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img')); const byZ = {}; let loaded=0,pending=0,tiny=0,broken=0; for (const i of imgs) { const m = i.src.match(/tile\\/(\\d+)\\//); const z = m?m[1]:'?'; byZ[z]=(byZ[z]||0)+1; if(!i.complete)pending++; else if(i.naturalWidth===0)broken++; else if(i.naturalWidth<=2)tiny++; else loaded++; } const r=document.querySelector('.leaflet-container')?.getBoundingClientRect(); return JSON.stringify({zoom:Number((()=>{const txts=Array.from(document.querySelectorAll('.spatial-capsule')).map(e=>e.textContent||'');const m=txts.join('|').match(/ZOOM\\s+(\\d+)/);return m?m[1]:null})()),domTiles:imgs.length,byZ,counts:{loaded,pending,tiny,broken},mapRect:r?[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]:null}); })()`));
  const ss = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss.result?.data) fs.writeFileSync(name, Buffer.from(ss.result.data, 'base64'));
  console.log(`[${label}] ${JSON.stringify(state)}${extra ? ' ' + extra : ''}`);
  return state;
}

async function setZoom(ws, target, dir, maxClicks) {
  // dir: -1 = out, +1 = in
  for (let i = 0; i < (maxClicks || 10); i++) {
    const z = await readZoom(ws);
    if (z === null) throw new Error('zoom read failed');
    if (z === target) return z;
    if (dir > 0 && z > target) break;
    if (dir < 0 && z < target) break;
    const title = dir > 0 ? 'Zoom In' : 'Zoom Out';
    await evalJS(ws, `document.querySelector('button[title="${title}"]')?.click()`);
    await delay(1300);
  }
  return readZoom(ws);
}

async function sampleFill(ws, label, totalMs, stepMs, namePrefix) {
  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < totalMs) {
    await delay(stepMs);
    const st = JSON.parse(await evalJS(ws, `(() => { const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img')); let loaded=0,pending=0,tiny=0,broken=0; for(const i of imgs){ if(!i.complete)pending++; else if(i.naturalWidth===0)broken++; else if(i.naturalWidth<=2)tiny++; else loaded++; } return JSON.stringify({loaded,pending,tiny,broken}); })()`));
    samples.push({ tSec: Math.round((Date.now() - t0) / 1000), ...st });
  }
  console.log(`[${label}] fill-sample ${JSON.stringify(samples)}`);
  return samples;
}

async function main() {
  try { execSync('taskkill /f /im chrome.exe /im msedge.exe 2>nul', { stdio: 'pipe' }); } catch {}
  await delay(1500);
  const token = JSON.parse(execSync(
    `curl -s -X POST ${BACKEND_URL}/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=ritam-dev%40localhost.test&password=Ritam%40123"`,
    { encoding: 'utf-8' }
  )).access_token;

  const proc = spawn(browser, [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--user-data-dir=C:\\temp\\verify_zoom_' + Date.now(), 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });
  await delay(5000);
  const tabs = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
  const tab = tabs.find((t) => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  await cdp(ws, 'Runtime.enable');
  await cdp(ws, 'Network.enable');
  await cdp(ws, 'Page.enable');

  // request tracking keyed by requestId
  const reqs = new Map();
  const tilesSeen = {};
  ws.addEventListener('message', (evt) => {
    try {
      const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
      if (m.method === 'Network.requestWillBeSent') {
        const url = m.params.request.url;
        if (url.includes('/tile/')) {
          const mm = url.match(/tile\/(\d+)\/(\d+)\/(\d+)/);
          reqs.set(m.params.requestId, { url, z: mm ? mm[1] : '?', x: mm ? mm[2] : '', y: mm ? mm[3] : '', t0: Date.now(), status: null, cache: null, dur: null, failed: null });
        }
      } else if (m.method === 'Network.responseReceived') {
        const r = reqs.get(m.params.requestId);
        if (r) { r.status = m.params.response.status; r.cache = m.params.response.headers['x-sentinel-cache'] || '-'; r.dur = Date.now() - r.t0; }
      } else if (m.method === 'Network.loadingFailed') {
        const r = reqs.get(m.params.requestId);
        if (r) { r.failed = m.params.errorText || 'err'; r.dur = Date.now() - r.t0; }
      }
    } catch {}
  });

  await cdp(ws, 'Page.navigate', { url: FRONTEND_URL });
  await delay(2500);
  await evalJS(ws, `localStorage.setItem('ritam_token', '${token}')`);
  await cdp(ws, 'Page.navigate', { url: FRONTEND_URL });
  await delay(20000);
  await snap(ws, '_v0_project.png', 'PROJECT');

  // ---- Fit India ----
  await evalJS(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(6000);
  const fitZoom = await readZoom(ws);
  console.log('Fit-India zoom =', fitZoom);
  await sampleFill(ws, 'FIT-INDIA-fill', 30000, 10000, '_v');
  await snap(ws, '_v1_fitindia.png', 'FIT-INDIA');

  // ---- Zoom out to 3 ----
  await setZoom(ws, 3, -1, 6);
  await sampleFill(ws, 'ZOOM3-fill', 40000, 10000, '_v');
  const c3 = JSON.parse(await evalJS(ws, tileCensus));
  console.log('[ZOOM3 census]', JSON.stringify({ total: c3.total, IMAGE: c3.IMAGE, BLACK: c3.BLACK, mostlyBlack: c3.mostlyBlack, TRANSPARENT: c3.TRANSPARENT }));
  fs.writeFileSync('_v_zoom3_census.json', JSON.stringify(c3, null, 1));
  await snap(ws, '_v2_zoom3.png', 'ZOOM-3');

  // ---- Zoom back in: 4,5,6,7 ----
  for (const tz of [4, 5, 6, 7]) {
    const cur = await readZoom(ws);
    await setZoom(ws, tz, 1, 8);
    await delay(6000);
    await snap(ws, `_v3_zoom${tz}.png`, `ZOOM-${tz}`);
  }

  // ---- Pan (drag map) ----
  await evalJS(ws, `(() => {
    const el = document.querySelector('.leaflet-container');
    const r = el.getBoundingClientRect();
    const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
    const fire = (type, x, y) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0 }));
    fire('pointerdown', cx, cy); fire('pointermove', cx + 220, cy + 90); fire('pointerup', cx + 220, cy + 90);
  })()`);
  await delay(10000);
  await snap(ws, '_v4_pan.png', 'PAN');

  // ---- Zoom back out to 3, check imagery persists ----
  await setZoom(ws, 3, -1, 8);
  await sampleFill(ws, 'BACKTO3-fill', 20000, 10000, '_v');
  await snap(ws, '_v5_backto3.png', 'BACK-TO-3');

  // ---- stats ----
  const byZ = {}, status = {}, cache = {}, durs = [];
  let failed = 0;
  for (const r of reqs.values()) {
    byZ[r.z] = (byZ[r.z] || 0) + 1;
    if (r.status) status[r.status] = (status[r.status] || 0) + 1;
    if (r.cache) cache[r.cache] = (cache[r.cache] || 0) + 1;
    if (r.failed) failed++;
    if (r.dur != null) durs.push(r.dur);
  }
  durs.sort((a, b) => a - b);
  const q = (p) => durs.length ? durs[Math.floor(p * (durs.length - 1))] : null;
  const summary = { totalRequests: reqs.size, failed, byZ, status, cache, durMs: { n: durs.length, p50: q(0.5), p90: q(0.9), max: durs.length ? durs[durs.length - 1] : null } };
  console.log('NETWORK SUMMARY', JSON.stringify(summary, null, 1));
  fs.writeFileSync('_v_network.json', JSON.stringify(summary, null, 1));
  ws.close();
  proc.kill();
  console.log('VERIFY DONE');
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
