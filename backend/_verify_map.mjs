const { spawn } = require('child_process');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9344;
const URL = 'http://127.0.0.1:5173';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const edge = spawn(EDGE, [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    '--disable-gpu', '--no-sandbox', '--virtual-time-budget=90000',
    '--window-size=1280,800', URL
  ], { stdio: 'pipe', windowsHide: true });

  edge.stdout.on('data', d => process.stdout.write('[edge] ' + d.toString().slice(0, 150)));
  edge.stderr.on('data', d => process.stderr.write('[err] ' + d.toString().slice(0, 150)));

  await sleep(8000);

  try {
    const ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    if (!ver.webSocketDebuggerUrl) { console.log('No WS'); return; }

    const browser = new WebSocket(ver.webSocketDebuggerUrl);
    await new Promise(r => browser.on('open', r));

    // Create page target
    let id = 1;
    const send = (ws, method, params = {}) => ws.send(JSON.stringify({ id: id++, method, params }));

    send(browser, 'Target.createTarget', { url: URL });
    await sleep(3000);

    const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    const page = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
    if (!page) { console.log('No page tab'); return; }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    const net = [];
    const logs = [];

    ws.on('message', d => {
      const m = JSON.parse(d.toString());
      if (m.method === 'Network.responseReceived') {
        net.push({ url: m.params.response.url, status: m.params.response.status, ct: m.params.response.mimeType });
      }
      if (m.method === 'Runtime.consoleAPICalled') {
        const a = (m.params.args || []).map(x => x.value || x.description || '').join(' ');
        logs.push(`[${m.params.type}] ${a}`);
      }
      if (m.method === 'Runtime.exceptionThrown') {
        logs.push('[EXC] ' + (m.params.exceptionDetails.exception?.description || JSON.stringify(m.params)));
      }
    });

    send(ws, 'Runtime.enable');
    send(ws, 'Page.enable');
    send(ws, 'Network.enable');
    await sleep(6000);

    // Try login
    send(ws, 'Runtime.evaluate', {
      expression: `(function(){
        const e=document.querySelector('input[type=email],input#email');
        const p=document.querySelector('input[type=password],input#password');
        if(e&&p){e.value='ritam-dev@localhost.test';p.value='Ritam@123';const b=document.querySelector('button[type=submit],button');if(b)b.click();return 'logged in';}
        return 'no form';
      })()`
    });
    await sleep(12000);

    // Check map
    send(ws, 'Runtime.evaluate', {
      expression: `(function(){
        const c=document.querySelector('.leaflet-container');
        return {
          containers: document.querySelectorAll('.leaflet-container').length,
          imageLayers: document.querySelectorAll('.leaflet-image-layer').length,
          tileImgs: document.querySelectorAll('.leaflet-tile-pane img').length,
          tileSrcs: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i=>i.src.slice(0,100)),
          rect: c?{w:c.getBoundingClientRect().width,h:c.getBoundingClientRect().height}:null,
          mapPane: document.querySelectorAll('.leaflet-map-pane').length,
          tilePane: document.querySelectorAll('.leaflet-tile-pane').length
        };
      })()`
    });
    await sleep(3000);

    // Screenshot
    send(ws, 'Page.captureScreenshot', { format: 'png' });
    await sleep(4000);

    console.log('\n=== SATELLITE REQUESTS ===');
    net.filter(r => r.url.includes('satellite')).forEach(r =>
      console.log(`  ${r.status} ${r.ct} ${r.url.slice(0, 140)}`));

    console.log('\n=== ALL IMAGE REQUESTS ===');
    net.filter(r => r.ct && r.ct.includes('image')).forEach(r =>
      console.log(`  ${r.status} ${r.ct} ${r.url.slice(0, 140)}`));

    console.log('\n=== CONSOLE/ERRORS ===');
    logs.slice(-30).forEach(l => console.log('  ' + l.slice(0, 300)));

    console.log('\n=== BASEMAP CHECK ===');
    const bad = ['openstreetmap', 'esri', 'carto', 'google', 'mapbox', 'arcgis'];
    const hits = net.filter(r => bad.some(b => r.url.toLowerCase().includes(b)) && !r.url.includes('satellite'));
    console.log('Conventional basemap requests:', hits.length);

    browser.close();
    ws.close();
  } catch (e) {
    console.error('ERR:', e.message);
  } finally {
    edge.kill();
    console.log('DONE');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
