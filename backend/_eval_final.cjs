// Final state check at product-relevant zooms. Dumps ASCII of the map card + census.
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(EDGE) ? EDGE : CHROME;
const PORT = 9454;
const FRONT = 'http://localhost:5173';
const BACK = 'http://localhost:8000';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let id = 0;
function cdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    const t = setTimeout(() => reject(new Error('timeout ' + method)), 60000);
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
const getZoomExpr = `(() => { const m = Array.from(document.querySelectorAll('.spatial-capsule')).map(e=>e.textContent).join('|').match(/ZOOM\\s+(\\d+)/); return m ? Number(m[1]) : null; })()`;

// Tile census classified + colored fraction of each loaded tile.
const censusExpr = `
(async () => {
  const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img'));
  const out = { total: imgs.length, loaded: 0, IMAGE: 0, mostlyBlack: 0, BLACK: 0, TRANSPARENT: 0, pending: 0, broken: 0, coloredPx: 0, totalPx: 0 };
  for (const img of imgs) {
    if (!img.complete) { out.pending++; continue; }
    if (img.naturalWidth === 0) { out.broken++; continue; }
    if (img.naturalWidth <= 2) { out.TRANSPARENT++; continue; }
    out.loaded++;
    try {
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let alpha = 0, opaque = 0, black = 0, colored = 0;
      for (let p = 0; p < d.length; p += 4) {
        if (d[p + 3] < 16) { alpha++; continue; }
        opaque++;
        const r = d[p], g = d[p+1], b = d[p+2];
        const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
        if (r < 25 && g < 25 && b < 25) black++;
        else if (mx - mn > 30 && r+g+b > 180) colored++;
      }
      const n = d.length / 4;
      const bp = 100 * black / Math.max(opaque, 1), cp = 100 * colored / n;
      out.totalPx += n; out.coloredPx += colored;
      const kind = (100 * alpha / n) > 98 ? 'TRANSPARENT' : bp > 80 ? 'BLACK' : bp > 30 ? 'mostlyBlack' : 'IMAGE';
      out[kind]++;
    } catch (e) { out.broken++; }
  }
  out.coloredPct = out.totalPx ? Math.round(100 * out.coloredPx / out.totalPx) : 0;
  return JSON.stringify(out);
})()
`;

async function setZoomRel(ws, target) {
  for (let i = 0; i < 12; i++) {
    const z = await ev(ws, getZoomExpr);
    if (z === null) return null;
    if (z === target) return z;
    const title = z < target ? 'Zoom In' : 'Zoom Out';
    await ev(ws, `document.querySelector('button[title="${title}"]')?.click()`);
    await delay(1000);
  }
  return ev(ws, getZoomExpr);
}

async function stateAt(ws, tag, name) {
  const res = await ev(ws, censusExpr);
  const ss = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss.result?.data) fs.writeFileSync(name, Buffer.from(ss.result.data, 'base64'));
  const rect = await ev(ws, `(() => { const r = document.querySelector('.leaflet-container')?.getBoundingClientRect(); return r ? [r.x, r.y, r.width, r.height] : null; })()`);
  console.log(`[${tag}] zoom=${await ev(ws, getZoomExpr)} rect=${JSON.stringify(rect)} census=${res}`);
}

async function main() {
  try { execSync('taskkill /f /im chrome.exe /im msedge.exe 2>nul', { stdio: 'pipe' }); } catch {}
  await delay(1500);
  const token = JSON.parse(execSync(`curl -s -X POST ${BACK}/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=ritam-dev%40localhost.test&password=Ritam%40123"`, { encoding: 'utf-8' })).access_token;
  const proc = spawn(browser, ['--headless=new', '--remote-debugging-port=' + PORT, '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=C:\\temp\\eval_final_' + Date.now(), 'about:blank'], { stdio: 'ignore', windowsHide: true });
  await delay(5000);
  const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  await cdp(ws, 'Runtime.enable');
  await cdp(ws, 'Page.enable');
  await cdp(ws, 'Page.navigate', { url: FRONT });
  await delay(2500);
  await ev(ws, `localStorage.setItem('ritam_token', '${token}')`);
  await cdp(ws, 'Page.navigate', { url: FRONT });
  await delay(20000);
  // project/city view (initial fit ~z12)
  await delay(8000);
  await stateAt(ws, 'PROJECT-z12', '_f_project.png');
  // zoom to 8
  await setZoomRel(ws, 8);
  await delay(8000);
  await stateAt(ws, 'REGION-z8', '_f_zoom8.png');
  // zoom to 6
  await setZoomRel(ws, 6);
  await delay(12000);
  await stateAt(ws, 'REGION-z6', '_f_zoom6.png');
  // zoom to 5
  await setZoomRel(ws, 5);
  await delay(12000);
  await stateAt(ws, 'REGION-z5', '_f_zoom5.png');
  // Fit India
  await ev(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(4000);
  await setZoomRel(ws, 4);
  await delay(15000);
  await stateAt(ws, 'INDIA-z4', '_f_india4.png');
  ws.close(); proc.kill();
  console.log('DONE');
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
