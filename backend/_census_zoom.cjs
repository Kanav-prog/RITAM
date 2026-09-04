// Zoom-level census of the Sentinel-2 tile layer.
// For each zoom in LEVELS: fresh page + cleared browser cache, drive map to zoom,
// sample DOM tile census + network counters over time. Reports a JSON summary.
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(EDGE) ? EDGE : CHROME;
const PORT = 9461;
const FRONT = 'http://localhost:5173';
const BACK = 'http://localhost:8000';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let id = 0;

const LEVELS = process.argv[2] ? process.argv[2].split(',').map(Number) : [3, 4, 5, 6, 7, 8, 10, 12, 14];
const WINDOW = process.argv[3] || '1600x900';
const [WIN_W, WIN_H] = WINDOW.split('x').map(Number);
// Max seconds to observe per level (longer for the low zoom levels that need it).
const MAX_OBSERVE = { 3: 120, 4: 90, 5: 75, 6: 60, 7: 45 };
const SAMPLE = [2, 5, 10, 15, 20, 30, 45, 60, 75, 90, 120];

function cdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    const t = setTimeout(() => reject(new Error('timeout ' + method)), 90000);
    const h = (evt) => {
      const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
      if (m.id === mid) { clearTimeout(t); ws.removeEventListener('message', h); resolve(m); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}
async function ev(ws, expr) {
  const r = await cdp(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
}

// Parse tile z/x/y out of a /tile/ URL
const parseTile = `function parseTile(url){var seg=url.split('/tile/')[1];if(!seg)return null;var p=seg.split('?')[0].split('/');return {z:+p[0],x:+p[1],y:+p[2]};}`;

// DOM census: total imgs in tile pane, loaded (complete), India-intersecting counts.
// gridZ: the native grid zoom the tile layer loads at the current map zoom
// (max(zoom, minNativeZoom=6)). Only tiles on that grid are "relevant".
const censusExpr = parseTile + `
(async (gridZ) => {
  const INDIA = { lat: [6.5, 35.5], lon: [68.0, 97.5] };
  const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img'));
  let rel = 0, relLoaded = 0, stale = 0, pending = 0, nonImage = 0, indiaTotal = 0, indiaLoaded = 0;
  let net = 0, netLoaded = 0, local = 0, queued = 0;
  const seen = new Set();
  for (const img of imgs) {
    const src = img.src || '';
    if (!src) { queued++; continue; }        // pipeline placeholder, src not yet assigned
    const isLocal = src.indexOf('data:') === 0;
    if (isLocal) { local++; continue; }
    const t = parseTile(src);
    if (!t) { nonImage++; continue; }
    seen.add(src.split('?')[0]);
    if (t.z !== gridZ) { stale++; continue; }
    rel++; net++;
    if (!img.complete || img.naturalWidth === 0) { pending++; continue; }
    if (img.naturalWidth <= 2) continue;
    relLoaded++; netLoaded++;
    const n = 2 ** t.z;
    const west = t.x / n * 360 - 180, east = (t.x + 1) / n * 360 - 180;
    const latOf = (yy) => 180 / Math.PI * Math.atan(Math.sinh(Math.PI * (1 - 2 * yy / n)));
    const south = latOf(t.y + 1), north = latOf(t.y);
    const hitsIndia = !(east < INDIA.lon[0] || west > INDIA.lon[1] || south > INDIA.lat[1] || north < INDIA.lat[0]);
    if (hitsIndia) { indiaTotal++; if (img.complete && img.naturalWidth > 2) indiaLoaded++; }
  }
  const map = window.__RITAM_MAP__;
  const b = map ? map.getBounds() : null;
  return {
    zoom: map ? map.getZoom() : null,
    gridZ,
    totalImgs: imgs.length,
    uniqueSrcs: seen.size,
    rel, relLoaded, stale, pending, nonImage,
    net, netLoaded, local, queued,
    indiaInDom: indiaTotal, indiaLoaded,
    bounds: b ? [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] : null,
    card: [document.querySelector('.leaflet-container')?.clientWidth, document.querySelector('.leaflet-container')?.clientHeight]
  };
})`;

async function main() {
  try { execSync('taskkill /f /im chrome.exe /im msedge.exe 2>nul', { stdio: 'pipe' }); } catch {}
  await delay(1500);
  const token = JSON.parse(execSync(`curl -s -X POST ${BACK}/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=ritam-dev%40localhost.test&password=Ritam%40123"`, { encoding: 'utf-8' })).access_token;

  const proc = spawn(browser, ['--headless=new', '--remote-debugging-port=' + PORT, '--disable-gpu', '--no-sandbox',
    '--disable-dev-shm-usage', '--window-size=' + WIN_W + ',' + WIN_H,
    '--user-data-dir=C:\\temp\\census_' + Date.now(), 'about:blank'], { stdio: 'ignore', windowsHide: true });
  await delay(5000);
  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  await cdp(ws, 'Runtime.enable');
  await cdp(ws, 'Page.enable');
  await cdp(ws, 'Network.enable');
  await cdp(ws, 'Emulation.setDeviceMetricsOverride', { width: WIN_W, height: WIN_H, deviceScaleFactor: 1, mobile: false });

  const results = {};
  for (const z of LEVELS) {
    const net = { started: [], ok: [], failed: [], aborted: [] };
    const h = (evt) => {
      const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
      if (!m.params) return;
      const url = m.params.request?.url || m.params.response?.url || '';
      if (!url.includes('/tile/')) return;
      const t = Date.now();
      if (m.method === 'Network.requestWillBeSent') net.started.push(t);
      else if (m.method === 'Network.responseReceived' && m.params.response?.status === 200) net.ok.push(t);
      else if (m.method === 'Network.loadingFailed') {
        if (m.params.canceled) net.aborted.push(t); else net.failed.push(t);
      }
    };
    ws.addEventListener('message', h);

    await cdp(ws, 'Network.clearBrowserCache');
    await cdp(ws, 'Page.navigate', { url: FRONT });
    await delay(2500);
    await ev(ws, `localStorage.setItem('ritam_token', '${token}')`);
    await cdp(ws, 'Page.navigate', { url: FRONT });
    await delay(10000); // app boot + project fit
    // land on the target zoom, centered on India
    await ev(ws, `(() => { const m = window.__RITAM_MAP__; if (!m) return 'no map'; m.setView([23.5, 78.5], ${z}, { animate: false }); return 'ok'; })()`);
    await delay(400);
    const t0 = Date.now();
    const timeline = [];
    const maxWait = (MAX_OBSERVE[z] || 30) * 1000;
    let last = 0;
    for (const s of SAMPLE) {
      const wait = Math.min(s * 1000, maxWait) - last;
      if (wait <= 0) continue;
      await delay(wait);
      last = s * 1000;
      const c = await ev(ws, censusExpr + '(' + Math.max(z, 6) + ')');
      const el = Date.now() - t0;
      const ok = net.ok.filter((t) => t - t0 <= el).length;
      const started = net.started.filter((t) => t - t0 <= el).length;
      timeline.push({ s, ...c, started, ok });
      if (el >= maxWait) break;
      if (c.net > 0 && c.netLoaded >= c.net && s >= 20) break; // settled & fully loaded
    }
    results[z] = {
      viewport: timeline[timeline.length - 1]?.card,
      bounds: timeline[timeline.length - 1]?.bounds,
      requestsStartedTotal: net.started.length,
      requestsOkTotal: net.ok.length,
      requestsAbortedTotal: net.aborted.length,
      requestsFailedTotal: net.failed.length,
      firstLoadedAtS: timeline.find((t) => t.loaded > 0)?.s ?? null,
      timeline,
    };
    ws.removeEventListener('message', h);
    console.log('LEVEL z' + z + ' DONE');
    fs.writeFileSync('_census_result.json', JSON.stringify(results, null, 1));
  }
  console.log(JSON.stringify(results, null, 1));
  ws.close(); proc.kill();
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
