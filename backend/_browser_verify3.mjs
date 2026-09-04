const { spawn } = require('child_process');
const http = require('http');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9334;
const FRONTEND_URL = 'http://127.0.0.1:5173';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function httpPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname, port: urlObj.port, path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body), ...headers }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('=== BROWSER VERIFICATION ===');
  console.log('\n[1] Authenticating...');
  const loginRes = await httpPost('http://127.0.0.1:8000/api/v1/auth/login',
    new URLSearchParams({ username: 'ritam-dev@localhost.test', password: 'Ritam@123' }).toString());
  const token = JSON.parse(loginRes.body).access_token;
  console.log('Token obtained:', token.length, 'chars');

  console.log('\n[2] Starting Edge headless...');
  const edge = spawn(EDGE_PATH, [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT, '--disable-gpu',
    '--no-sandbox', '--window-size=1280,800', FRONTEND_URL
  ], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  edge.stdout.on('data', d => {});
  edge.stderr.on('data', d => {});
  await delay(8000);

  console.log('\n[3] Connecting to CDP...');
  const cdpRes = await httpGet('http://127.0.0.1:' + DEBUG_PORT + '/json/version');
  const cdpInfo = JSON.parse(cdpRes.body);
  console.log('CDP WS URL:', cdpInfo.webSocketDebuggerUrl ? 'FOUND' : 'NOT FOUND');
  if (!cdpInfo.webSocketDebuggerUrl) { edge.kill(); return; }

  console.log('\n[4] Creating target...');
  const browserWs = new WebSocket(cdpInfo.webSocketDebuggerUrl);
  await new Promise(resolve => browserWs.on('open', resolve));
  let msgId = 1;
  function sendCDP(ws, method, params = {}) { const id = msgId++; ws.send(JSON.stringify({ id, method, params })); return id; }
  sendCDP(browserWs, 'Target.createTarget', { url: FRONTEND_URL });
  await delay(3000);

  const tabsRes = await httpGet('http://127.0.0.1:' + DEBUG_PORT + '/json');
  const tabs = JSON.parse(tabsRes.body);
  const pageTab = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!pageTab) { console.log('No page tab'); edge.kill(); return; }
  console.log('Page tab:', pageTab.url);

  console.log('\n[5] Connecting to page...');
  const pageWs = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(resolve => pageWs.on('open', resolve));
  sendCDP(pageWs, 'Runtime.enable');
  sendCDP(pageWs, 'Page.enable');
  sendCDP(pageWs, 'Network.enable');

  const networkRequests = [];
  const consoleMessages = [];
  const exceptions = [];
  pageWs.on('message', d => {
    const m = JSON.parse(d.toString());
    if (m.method === 'Network.responseReceived') networkRequests.push({ url: m.params.response.url, status: m.params.response.status, ct: m.params.response.mimeType });
    if (m.method === 'Runtime.consoleAPICalled') consoleMessages.push('[' + m.params.type + '] ' + (m.params.args || []).map(a => a.value || a.description || '').join(' '));
    if (m.method === 'Runtime.exceptionThrown') exceptions.push(m.params.exceptionDetails.exception?.description || JSON.stringify(m.params));
  });

  console.log('\n[6] Waiting for page load...');
  await delay(8000);

  console.log('\n[7] Injecting token...');
  sendCDP(pageWs, 'Runtime.evaluate', { expression: 'localStorage.setItem(\'ritam_token\', \'' + token + '\'); \'set\'' });
  await delay(1000);
  sendCDP(pageWs, 'Page.reload');
  await delay(12000);

  console.log('\n[8] Checking DOM...');
  const evalId = sendCDP(pageWs, 'Runtime.evaluate', {
    expression: 'JSON.stringify({ containers: document.querySelectorAll(\'.leaflet-container\').length, layers: document.querySelectorAll(\'.leaflet-layer\').length, tileImgs: document.querySelectorAll(\'.leaflet-tile-pane img\').length, imgLayers: document.querySelectorAll(\'.leaflet-image-layer\').length, mapRect: (() => { const el = document.querySelector(\'.leaflet-container\'); if(!el) return null; const r = el.getBoundingClientRect(); return {w:r.width,h:r.height}; })(), tileSrcs: Array.from(document.querySelectorAll(\'.leaflet-tile-pane img\')).slice(0,5).map(i=>i.src) })'
  });

  console.log('\n[9] Taking screenshot...');
  const ssId = sendCDP(pageWs, 'Page.captureScreenshot', { format: 'png' });
  await delay(5000);

  // Collect any pending responses
  const responses = {};
  pageWs.on('message', d => { const m = JSON.parse(d.toString()); if (m.id && m.result) responses[m.id] = m.result; });

  console.log('\n=== REPORT ===');
  console.log('Network requests:', networkRequests.length);
  const satReqs = networkRequests.filter(r => r.url && r.url.includes('satellite'));
  console.log('Satellite requests:', satReqs.length);
  satReqs.slice(0, 10).forEach(r => console.log('  ' + r.status + ' ' + (r.ct || '') + ' ' + r.url.slice(0, 120)));
  const tileReqs = networkRequests.filter(r => r.url && r.url.includes('/tile/'));
  console.log('Tile requests:', tileReqs.length);
  tileReqs.slice(0, 10).forEach(r => console.log('  ' + r.status + ' ' + (r.ct || '') + ' ' + r.url.slice(0, 120)));
  console.log('Console:', consoleMessages.length);
  consoleMessages.slice(0, 20).forEach(m => console.log('  ' + m.slice(0, 200)));
  console.log('Exceptions:', exceptions.length);
  exceptions.slice(0, 10).forEach(e => console.log('  ' + e.slice(0, 200)));
  const basemap = networkRequests.filter(r => r.url && ['openstreetmap','esri','carto','google','mapbox','arcgis'].some(p => r.url.toLowerCase().includes(p)) && !r.url.includes('satellite/'));
  console.log('Basemap requests:', basemap.length);

  // Screenshot
  if (responses[ssId] && responses[ssId].result && responses[ssId].result.data) {
    require('fs').writeFileSync('C:\\Users\\MANIK MEHRA\\RITAM\\backend\\_verify_screenshot.png', Buffer.from(responses[ssId].result.data, 'base64'));
    console.log('Screenshot saved');
  }
  if (responses[evalId] && responses[evalId].result) {
    console.log('DOM state:', responses[evalId].result.value);
  }

  browserWs.close();
  pageWs.close();
  edge.kill();
  console.log('\n=== COMPLETE ===');
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
