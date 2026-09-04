// Final live verification of the Sentinel-2 overview band.
// 1) fit-India (z~6) fill + screenshot     2) z3 world fill + screenshot
// 3) pan & zoom continuity (no errors, imagery persists)  4) warm revisit speed
// 5) basemap-host scan (must be zero non-/api/ tile hosts) 6) screenshots
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(EDGE) ? EDGE : CHROME;
const PORT = 9480;
const FRONT = 'http://localhost:5173';
const BACK = 'http://localhost:8000';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let id = 0;
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
  if (r.result?.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result?.result?.value;
}
const errors = [];
const hosts = new Set();
async function main() {
  try { execSync('taskkill /f /im chrome.exe /im msedge.exe 2>nul', { stdio: 'pipe' }); } catch {}
  await delay(1500);
  const token = JSON.parse(execSync(`curl -s -X POST ${BACK}/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=ritam-dev%40localhost.test&password=Ritam%40123"`, { encoding: 'utf-8' })).access_token;
  const proc = spawn(browser, ['--headless=new', '--remote-debugging-port=' + PORT, '--disable-gpu', '--no-sandbox',
    '--disable-dev-shm-usage', '--user-data-dir=C:\\temp\\vf_' + Date.now(), 'about:blank'], { stdio: 'ignore', windowsHide: true });
  await delay(5000);
  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  await cdp(ws, 'Runtime.enable');
  await cdp(ws, 'Page.enable');
  await cdp(ws, 'Network.enable');
  await cdp(ws, 'Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false });
  ws.addEventListener('message', (evt) => {
    const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
    if (m.method === 'Network.requestWillBeSent') {
      try { hosts.add(new URL(m.params.request.url).host); } catch {}
    }
    if (m.method === 'Runtime.exceptionThrown') errors.push(String(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text).slice(0, 200));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console: ' + m.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 200));
  });

  const snap = `(async (gridZ) => {
    const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img'));
    let net=0, loaded=0, local=0, queued=0;
    for (const img of imgs) {
      const s = img.src || '';
      if (!s) { queued++; continue; }
      if (s.indexOf('data:') === 0) { local++; continue; }
      net++;
      if (img.complete && img.naturalWidth > 2) loaded++;
    }
    const m = window.__RITAM_MAP__;
    return JSON.stringify({ z: m ? m.getZoom() : null, net, loaded, local, queued,
      card: document.querySelector('.leaflet-container')?.clientWidth });
  })()`;

  await cdp(ws, 'Page.navigate', { url: FRONT });
  await delay(2500);
  await ev(ws, `localStorage.setItem('ritam_token', '${token}')`);
  await cdp(ws, 'Page.navigate', { url: FRONT });
  await delay(12000);
  await ev(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  console.log('--- FIT-INDIA (cold) ---');
  for (const s of [2, 10, 30, 60, 90]) {
    await delay(s === 2 ? 2000 : s === 10 ? 8000 : s === 30 ? 20000 : s === 60 ? 30000 : 30000);
    console.log('t=' + s + 's ' + await ev(ws, snap));
    if (s === 90) {
      const ss = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
      if (ss.result?.data) fs.writeFileSync('_h_fitindia.png', Buffer.from(ss.result.data, 'base64'));
    }
  }
  console.log('--- Z3 WORLD (cold) ---');
  await ev(ws, `window.__RITAM_MAP__.setView([23.5, 78.5], 3, { animate: false }); 'ok'`);
  for (const s of [15, 45, 90]) {
    await delay(s === 15 ? 15000 : s === 45 ? 30000 : 45000);
    console.log('t=' + s + 's ' + await ev(ws, snap));
    if (s === 90) {
      const ss = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
      if (ss.result?.data) fs.writeFileSync('_h_zoom3.png', Buffer.from(ss.result.data, 'base64'));
    }
  }
  console.log('--- PAN CONTINUITY at z3 (westwards, imagery must stay) ---');
  const p1 = await ev(ws, snap);
  await ev(ws, `window.__RITAM_MAP__.panBy([-700, 0], { animate: false }); 'ok'`);
  await delay(6000);
  const p2 = await ev(ws, snap);
  await ev(ws, `window.__RITAM_MAP__.panBy([700, -60], { animate: false }); 'ok'`);
  await delay(6000);
  const p3 = await ev(ws, snap);
  console.log('before pan:', p1);
  console.log('after pan1:', p2);
  console.log('after pan2:', p3);
  const e1 = await ev(ws, `document.querySelectorAll('.leaflet-tile-pane img').length`);
  console.log('imgs in pane after pans:', e1);
  console.log('--- ZOOM continuity 6 -> 7 -> 10 ---');
  await ev(ws, `window.__RITAM_MAP__.setView([22.6, 77.2], 6, { animate: false }); 'ok'`);
  await delay(3000);
  console.log('z6:', await ev(ws, snap));
  await ev(ws, `window.__RITAM_MAP__.setView([22.6, 77.2], 7, { animate: false }); 'ok'`);
  await delay(15000);
  console.log('z7:', await ev(ws, snap));
  await ev(ws, `window.__RITAM_MAP__.setView([22.6, 77.2], 10, { animate: false }); 'ok'`);
  await delay(12000);
  console.log('z10:', await ev(ws, snap));
  const ss2 = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss2.result?.data) fs.writeFileSync('_h_z10.png', Buffer.from(ss2.result.data, 'base64'));
  console.log('--- WARM REVISIT fit-India ---');
  await ev(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(2500);
  await ev(ws, `window.__RITAM_MAP__.setView([23.5, 78.5], 3, { animate: false }); 'ok'`);
  await delay(8000);
  console.log('warm z3 t=8s:', await ev(ws, snap));
  await delay(10000);
  console.log('warm z3 t=18s:', await ev(ws, snap));
  console.log('HOSTS requested:', JSON.stringify([...hosts]));
  console.log('page errors:', JSON.stringify(errors.slice(0, 6)));
  ws.close(); proc.kill();
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
