// Live diagnostic: WHY does zoom 3 show a fragmented mosaic with black gaps?
// Captures: exact tile URL set Leaflet requests per zoom, per-tile response
// headers (X-Sentinel-Cache), timings, failures, and pixel-decodes every
// rendered tile to classify: good imagery / opaque-black / transparent.
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = fs.existsSync(EDGE) ? EDGE : CHROME;
const DEBUG_PORT = 9451;
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
      if (m.id === id) {
        clearTimeout(t);
        ws.removeEventListener('message', onMsg);
        resolve(m);
      }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJS(ws, expr) {
  const r = await cdp(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
}

const browserState = `(() => {
  const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img'));
  const zoomText = (document.querySelector('.spatial-capsule')?.textContent || '');
  const zMatch = zoomText.match(/ZOOM\\s+(\\d+)/);
  const cnt = { loaded: 0, blank: 0, tiny: 0, pending: 0, broken: 0 };
  const sizes = {};
  const srcs = [];
  for (const i of imgs) {
    const s = i.src;
    srcs.push(s);
    const m = s.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
    const z = m ? m[1] : '?';
    sizes[z] = (sizes[z] || 0) + 1;
    if (!i.complete) cnt.pending++;
    else if (i.naturalWidth === 0) cnt.broken++;
    else if (i.naturalWidth <= 2) cnt.tiny++;
    else if (i.naturalWidth > 2) cnt.loaded++;
  }
  const rect = document.querySelector('.leaflet-container')?.getBoundingClientRect();
  return JSON.stringify({
    zoom: zMatch ? Number(zMatch[1]) : null,
    hud: zoomText.trim().slice(0, 90),
    mapPx: rect ? Math.round(rect.width) + 'x' + Math.round(rect.height) : null,
    domTiles: imgs.length,
    byZ: sizes,
    counts: cnt,
    sampleSrc: srcs.slice(0, 3),
  });
})()`;

// Per-tile pixel census executed in-page: classify each rendered tile image.
const tileCensus = `(async () => {
  const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img')).filter(
    (i) => i.complete && i.naturalWidth > 2
  );
  const out = { total: imgs.length, transparent: 0, opaqueBlack: 0, hasImage: 0, list: [] };
  for (const img of imgs) {
    const m = img.src.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
    const key = m ? 'z' + m[1] + '/x' + m[2] + '/y' + m[3] : img.src.slice(-60);
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let n = d.length / 4, alpha = 0, opaque = 0, black = 0, lum = 0;
      for (let p = 0; p < d.length; p += 4) {
        if (d[p + 3] < 16) { alpha++; continue; }
        opaque++;
        const b = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
        lum += b;
        if (d[p] < 25 && d[p + 1] < 25 && d[p + 2] < 25) black++;
      }
      const t = 100 * alpha / n, b = 100 * black / Math.max(opaque, 1);
      let kind;
      if (t > 98) kind = 'TRANSPARENT';
      else if (b > 80) kind = 'BLACK';
      else if (b > 30) kind = 'mostly-black';
      else kind = 'IMAGE';
      if (kind === 'TRANSPARENT') out.transparent++;
      else if (kind === 'BLACK') out.opaqueBlack++;
      else out.hasImage++;
      out.list.push({ key, kind, transparentPct: Math.round(t), blackPct: Math.round(b), meanLum: Math.round(lum / Math.max(opaque, 1)) });
    } catch (e) { out.list.push({ key, kind: 'decode-error:' + e.message }); }
  }
  return JSON.stringify(out);
})()`;

async function snap(ws, name, label) {
  const st = await evalJS(ws, browserState);
  const ss = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss.result?.data) fs.writeFileSync(name, Buffer.from(ss.result.data, 'base64'));
  console.log(`[${label}] state=${st} screenshot=${name}`);
  return JSON.parse(st);
}

async function zoomTo(ws, target, maxClicks) {
  for (let i = 0; i < (maxClicks || 10); i++) {
    const st = await evalJS(ws, `(() => {
      const t = (document.querySelector('.spatial-capsule')?.textContent || '');
      const m = t.match(/ZOOM\\s+(\\d+)/);
      return m ? Number(m[1]) : null;
    })()`);
    if (st === target) return st;
    await evalJS(ws, `document.querySelector('button[title="Zoom Out"]')?.click()`);
    await delay(1400);
  }
  return await evalJS(ws, `(() => { const m = (document.querySelector('.spatial-capsule')?.textContent||'').match(/ZOOM\\s+(\\d+)/); return m ? Number(m[1]) : null; })()`);
}

async function main() {
  try { execSync('taskkill /f /im chrome.exe /im msedge.exe 2>nul', { stdio: 'pipe' }); } catch {}
  await delay(1500);

  const token = JSON.parse(execSync(
    `curl -s -X POST ${BACKEND_URL}/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=ritam-dev%40localhost.test&password=Ritam%40123"`,
    { encoding: 'utf-8' }
  )).access_token;
  console.log('token ok', token.length);

  const proc = spawn(browser, [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--user-data-dir=C:\\temp\\diag_zoom_' + Date.now(),
    '--window-size=1680,1050',
    'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  await delay(5000);
  let tabs = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
  let tab = tabs.find((t) => t.type === 'page');
  if (!tab) throw new Error('no page tab');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  await cdp(ws, 'Runtime.enable');
  await cdp(ws, 'Network.enable');
  await cdp(ws, 'Page.enable');

  // ---- Network capture ----
  const reqLog = [];
  const openReqs = new Map();
  ws.addEventListener('message', (evt) => {
    try {
      const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
      if (m.method === 'Network.responseReceived') {
        const url = m.params.response.url;
        if (url.includes('/satellite/') && url.includes('/tile/')) {
          reqLog.push({
            url,
            status: m.params.response.status,
            cache: m.params.response.headers['x-sentinel-cache'] || m.params.response.headers['X-Sentinel-Cache'] || '-',
            at: Date.now(),
            durMs: null,
            type: 'response'
          });
          if (openReqs.has(url)) {
            openReqs.get(url).durMs = Date.now() - openReqs.get(url).at;
            openReqs.delete(url);
          }
        }
      } else if (m.method === 'Network.loadingFailed') {
        const req = m.params;
        if (openReqs.has(req.requestId)) {
          const o = openReqs.get(req.requestId);
          o.durMs = Date.now() - o.at;
          o.failed = req.errorText || 'error';
          o.type = 'failed';
          openReqs.delete(req.requestId);
        }
      } else if (m.method === 'Network.requestWillBeSent') {
        const url = m.params.request.url;
        if (url.includes('/satellite/') && url.includes('/tile/')) {
          openReqs.set(m.params.requestId, { url, at: Date.now() });
        }
      }
    } catch {}
  });

  // ---- 1. Load app, authenticated ----
  await cdp(ws, 'Page.navigate', { url: FRONTEND_URL });
  await delay(2500);
  await evalJS(ws, `localStorage.setItem('ritam_token', '${token}')`);
  await cdp(ws, 'Page.navigate', { url: FRONTEND_URL });
  console.log('page loading…');
  await delay(18000);
  await snap(ws, '_d0_project.png', '1.PROJECT-INITIAL');

  // ---- 2. Fit India (zoom ~5) ----
  await evalJS(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(12000);
  await snap(ws, '_d1_fitindia.png', '2.FIT-INDIA');

  // ---- 3. Zoom out to 3 ----
  const z = await zoomTo(ws, 3, 6);
  console.log('reached zoom:', z);
  await delay(25000);
  await snap(ws, '_d2_zoom3.png', '3.ZOOM-3');

  const census = await evalJS(ws, tileCensus);
  const censusObj = JSON.parse(census);
  const kindCount = {};
  censusObj.list.forEach((t) => { kindCount[t.kind] = (kindCount[t.kind] || 0) + 1; });
  console.log('ZOOM3 census:', JSON.stringify({ total: censusObj.total, kindCount }));
  fs.writeFileSync('_d_zoom3_census.json', census);

  // ---- 4. Zoom in 4,5,6 ----
  for (const tz of [4, 5, 6]) {
    const cur = await evalJS(ws, `(() => { const m = (document.querySelector('.spatial-capsule')?.textContent||'').match(/ZOOM\\s+(\\d+)/); return m ? Number(m[1]) : null; })()`);
    const steps = tz - cur;
    for (let i = 0; i < steps; i++) { await evalJS(ws, `document.querySelector('button[title="Zoom In"]')?.click()`); await delay(1200); }
    await delay(tz >= 6 ? 12000 : 10000);
    await snap(ws, `_d3_zoom${tz}.png`, `4.ZOOM-${tz}`);
  }

  // ---- Summary ----
  const byZ = {}, byStatus = {}, byCache = {};
  let failed = 0, timed = [];
  reqLog.forEach((r) => {
    const m = r.url.match(/tile\/(\d+)\//);
    const z = m ? m[1] : '?';
    byZ[z] = (byZ[z] || 0) + 1;
    if (r.status) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    if (r.cache) byCache[r.cache] = (byCache[r.cache] || 0) + 1;
    if (r.failed) failed++;
    if (r.durMs != null) timed.push(r.durMs);
  });
  timed.sort((a, b) => a - b);
  const q = (arr, p) => arr.length ? arr[Math.floor(p * (arr.length - 1))] : null;
  const summary = {
    totalTileRequests: reqLog.length,
    failed,
    byRequestedZ: byZ,
    byStatus: byStatus,
    byCacheHeader: byCache,
    durMs: { count: timed.length, p50: q(timed, 0.5), p90: q(timed, 0.9), max: timed.length ? timed[timed.length - 1] : null },
  };
  console.log('NETWORK SUMMARY:', JSON.stringify(summary, null, 1));
  fs.writeFileSync('_d_network.json', JSON.stringify(summary, null, 1));

  ws.close();
  proc.kill();
  console.log('DIAG DONE');
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
