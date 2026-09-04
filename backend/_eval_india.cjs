// Focused: Fit-India overview quality — India-bounds tile census after settle.
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = fs.existsSync(EDGE) ? EDGE : CHROME;
const PORT = 9453;
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
  if (r.result?.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result?.result?.value;
}

const parseTile = [
  'function parseTile(url) {',
  '  const seg = url.split("/tile/")[1];',
  '  if (!seg) return null;',
  '  const parts = seg.split("?")[0].split("/");',
  '  return { z: Number(parts[0]), x: Number(parts[1]), y: Number(parts[2]) };',
  '}'
].join('\n');

// Census body as a string (avoid template-literal escape issues)
const censusBody = `
(async () => {
  const imgs = Array.from(document.querySelectorAll('.leaflet-tile-pane img'));
  const stat = (list) => {
    const out = { total: list.length, IMAGE: 0, BLACK: 0, mostlyBlack: 0, TRANSPARENT: 0, pending: 0, broken: 0 };
    for (const img of list) {
      if (!img.complete) { out.pending++; continue; }
      if (img.naturalWidth === 0) { out.broken++; continue; }
      if (img.naturalWidth <= 2) { out.TRANSPARENT++; continue; }
      try {
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let alpha = 0, opaque = 0, black = 0;
        for (let p = 0; p < d.length; p += 4) {
          if (d[p + 3] < 16) { alpha++; continue; }
          opaque++;
          if (d[p] < 25 && d[p + 1] < 25 && d[p + 2] < 25) black++;
        }
        const t = 100 * alpha / (d.length / 4), b = 100 * black / Math.max(opaque, 1);
        if (t > 98) out.TRANSPARENT++;
        else if (b > 80) out.BLACK++;
        else if (b > 30) out.mostlyBlack++;
        else out.IMAGE++;
      } catch (e) { out.broken++; }
    }
    return out;
  };
  const INDIA = { lat: [6.5, 35.5], lon: [68.0, 97.5] };
  const indiaTiles = imgs.filter((img) => {
    const t = parseTile(img.src);
    if (!t) return false;
    const n = 2 ** t.z;
    const west = t.x / n * 360 - 180, east = (t.x + 1) / n * 360 - 180;
    const latOf = (yy) => 180 / Math.PI * Math.atan(Math.sinh(Math.PI * (1 - 2 * yy / n)));
    const north = latOf(t.y), south = latOf(t.y + 1);
    return !(east < INDIA.lon[0] || west > INDIA.lon[1] || south > INDIA.lat[1] || north < INDIA.lat[0]);
  });
  const zoomText = Array.from(document.querySelectorAll('.spatial-capsule')).map(e => e.textContent).join('|').match(/ZOOM\\s+(\\d+)/);
  return JSON.stringify({ whole: stat(imgs), india: stat(indiaTiles), zoom: zoomText ? zoomText[1] : null });
})()
`;
const censusExpr = parseTile + '\n' + censusBody;

async function main() {
  try { execSync('taskkill /f /im chrome.exe /im msedge.exe 2>nul', { stdio: 'pipe' }); } catch {}
  await delay(1500);
  const token = JSON.parse(execSync(`curl -s -X POST ${BACK}/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=ritam-dev%40localhost.test&password=Ritam%40123"`, { encoding: 'utf-8' })).access_token;
  const proc = spawn(browser, ['--headless=new', '--remote-debugging-port=' + PORT, '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--user-data-dir=C:\\temp\\eval_india_' + Date.now(), 'about:blank'], { stdio: 'ignore', windowsHide: true });
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
  await ev(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(2000);
  for (let s = 0; s <= 90; s += 15) {
    if (s > 0) await delay(15000);
    const res = await ev(ws, censusExpr);
    console.log('t=' + s + 's ' + res);
    if (s === 30 || s === 90) {
      const ss = await cdp(ws, 'Page.captureScreenshot', { format: 'png' });
      if (ss.result?.data) fs.writeFileSync('_e_india_' + s + '.png', Buffer.from(ss.result.data, 'base64'));
    }
  }
  ws.close(); proc.kill();
  console.log('EVAL DONE');
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
