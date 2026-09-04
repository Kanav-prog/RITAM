const { spawn } = require('child_process');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9333;
const FRONTEND_URL = 'http://127.0.0.1:5173';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

let msgId = 0;
async function main() {
  console.log('Starting Edge headless...');
  const edge = spawn(EDGE_PATH, [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT, '--disable-gpu',
    '--no-sandbox', '--virtual-time-budget=80000', FRONTEND_URL
  ], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  edge.stdout.on('data', d => process.stdout.write('[edge] ' + d.toString().slice(0,200)));
  edge.stderr.on('data', d => process.stderr.write('[edge-err] ' + d.toString().slice(0,200)));
  console.log('Waiting for Edge...');
  await delay(10000);
  try {
    const cdpRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    const cdpInfo = await cdpRes.json();
    console.log('CDP WS:', cdpInfo.webSocketUrl ? 'FOUND' : 'NOT FOUND');
    if (!cdpInfo.webSocketUrl) { console.log('No WS URL'); return; }
    const ws = new WebSocket(cdpInfo.webSocketUrl);
    await new Promise(resolve => ws.on('open', resolve));
    console.log('Connected to CDP');
    ws.send(JSON.stringify({ id: ++msgId, method: 'Target.createTarget', params: { url: FRONTEND_URL } }));
    await delay(2000);
    const tabsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
    const tabs = await tabsRes.json();
    const pageTab = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
    if (!pageTab) { console.log('No page tab'); return; }
    console.log('Page:', pageTab.url);
    const pws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(resolve => pws.on('open', resolve));
    console.log('Connected to page');
    pws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    pws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
    pws.send(JSON.stringify({ id: 3, method: 'Network.enable' }));
    const reqs = [];
    const errors = [];
    pws.on('message', d => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Network.responseReceived') {
        reqs.push({ url: m.params.response.url, status: m.params.response.status, ct: m.params.response.mimeType });
      }
      if (m.method === 'Runtime.exceptionThrown') {
        errors.push(m.params.exceptionDetails.exception?.details?.value || JSON.stringify(m.params));
      }
      if (m.method === 'Runtime.consoleAPICalled') {
        const args = (m.params.args || []).map(a => a.value || a.description || '').join(' ');
        if (/[Ee]rror|warn/i.test(args)) errors.push(args);
      }
    });
    console.log('Waiting for page render...');
    await delay(8000);
    try {
      pws.send(JSON.stringify({ id: 11, method: 'Runtime.evaluate', params: {
        expression: "document.querySelector('input[type=email]')?.value='ritam-dev@localhost.test'; document.querySelector('input[type=password]')?.value='Ritam@123'; const btn=document.querySelector('button[type=submit],button'); if(btn) btn.click(); 'login attempted'"
      }}));
      await delay(10000);
      console.log('Login attempted');
    } catch(e) { console.log('Login:', e.message); }
    await delay(15000);
    pws.send(JSON.stringify({ id: 50, method: 'Page.captureScreenshot', params: { format: 'png', quality: 100 } }));
    await delay(5000);
    pws.send(JSON.stringify({ id: 60, method: 'Runtime.evaluate', params: {
      expression: "({leafletContainers: document.querySelectorAll('.leaflet-container').length, imageLayers: document.querySelectorAll('.leaflet-image-layer').length, tileImgs: document.querySelectorAll('.leaflet-tile-pane img').length, tileSrcs: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i=>i.src), mapRect: document.querySelector('.leaflet-container')?.getBoundingClientRect()})"
    }}));
    await delay(3000);
    console.log('\n=== SATELLITE/NETWORK REQUESTS ===');
    console.log('Total requests:', reqs.length);
    reqs.filter(r => r.url.includes('satellite')).forEach(r =>
      console.log(`  ${r.status} ${r.ct} ${r.url.slice(0,130)}`));
    console.log('\n=== ERRORS ===');
    if (errors.length === 0) console.log('No errors'); else errors.forEach(e => console.log('  ' + e.toString().slice(0,300)));
    console.log('\n=== BASEMAP CHECK ===');
    const providers = ['openstreetmap','esri','carto','google','mapbox','arcgis','tile.openstreetmap'];
    const basemap = reqs.filter(r => providers.some(p => r.url.toLowerCase().includes(p)) && !r.url.includes('satellite/'));
    console.log('Conventional basemap requests:', basemap.length);
    ws.close(); pws.close();
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    edge.kill();
    console.log('Done');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
