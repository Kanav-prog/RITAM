const { spawn } = require('child_process');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9450;
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8000';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
let msgId = 0;

function cdpCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const timeout = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 45000);
    function onMsg(evt) {
      const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
      if (m.id === id) {
        clearTimeout(timeout);
        ws.removeEventListener('message', onMsg);
        resolve(m);
      }
    }
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJS(ws, expr) {
  const r = await cdpCommand(ws, 'Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: false
  });
  return r.result?.result?.value;
}

async function main() {
  // Kill existing Edge on our debug port
  try { require('child_process').execSync('taskkill /f /im msedge.exe 2>nul', { stdio: 'pipe' }); } catch {}
  await delay(2000);
  
  // First get a token via curl
  const { execSync } = require('child_process');
  const tokenJson = execSync(`curl -s -X POST ${BACKEND_URL}/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=ritam-dev%40localhost.test&password=Ritam%40123"`, { encoding: 'utf-8' });
  const token = JSON.parse(tokenJson).access_token;
  console.log('Got token:', token ? 'yes (' + token.length + ' chars)' : 'NO');
  
  const edge = spawn(EDGE_PATH, [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--user-data-dir=C:\\temp\\edge_qa_' + Date.now(),
    FRONTEND_URL
  ], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  
  console.log('Launching Edge...');
  await delay(8000);
  
  const tabsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
  const tabs = await tabsRes.json();
  console.log('Tabs:', tabs.length);
  const tab = tabs.find(t => t.type === 'page');
  if (!tab) { console.error('No page tab'); edge.kill(); process.exit(1); }
  console.log('Tab URL:', tab.url);
  
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });
  await cdpCommand(ws, 'Runtime.enable');
  await cdpCommand(ws, 'Network.enable');
  console.log('CDP connected');
  
  // Track satellite network responses
  const satResponses = [];
  ws.addEventListener('message', (evt) => {
    try {
      const m = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.toString());
      if (m.method === 'Network.responseReceived' && m.params.response.url.includes('satellite')) {
        satResponses.push({
          url: m.params.response.url,
          status: m.params.response.status,
          ct: m.params.response.mimeType,
        });
      }
    } catch {}
  });
  
  // Set token BEFORE navigating
  console.log('Setting token...');
  await cdpCommand(ws, 'Page.navigate', { url: FRONTEND_URL });
  await delay(3000);
  await evalJS(ws, `localStorage.setItem('ritam_token', '${token}')`);
  console.log('Token set');
  
  // Reload to trigger authenticated requests
  await cdpCommand(ws, 'Page.navigate', { url: FRONTEND_URL });
  await delay(15000);
  console.log('Page loaded');
  
  // === 1. INITIAL STATE ===
  console.log('\n=== 1. INITIAL STATE ===');
  const initState = await evalJS(ws, `JSON.stringify({
    mapExists: !!document.querySelector('.leaflet-container'),
    mapSize: (() => {
      const r = document.querySelector('.leaflet-container')?.getBoundingClientRect();
      return r ? Math.round(r.width)+'x'+Math.round(r.height) : 'N/A';
    })(),
    tileCount: document.querySelectorAll('.leaflet-tile-pane img').length,
    tileSrcs: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i => {
      const m = i.src.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
      return m ? 'z'+m[1]+'/x'+m[2]+'/y'+m[3] : i.src.substring(0,80);
    }),
    tileStatus: (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      let blank=0, loaded=0, pending=0;
      imgs.forEach(i => {
        if (i.complete && i.naturalWidth === 0) blank++;
        else if (i.complete && i.naturalWidth > 0) loaded++;
        else pending++;
      });
      return { total: imgs.length, loaded, blank, pending };
    })(),
    hud: document.querySelector('.spatial-capsule')?.textContent?.trim()?.substring(0,100) || 'N/A',
  })`);
  console.log('State:', initState);
  
  // Screenshot
  const ss1 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss1.result?.data) require('fs').writeFileSync('_q_initial.png', Buffer.from(ss1.result.data, 'base64'));
  console.log('Screenshot: _q_initial.png');
  
  // === 2. TILE QUALITY DETAILS ===
  console.log('\n=== 2. TILE QUALITY ===');
  const tileQuality = await evalJS(ws, `JSON.stringify({
    imgSizes: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,8).map(i => ({
      nw: i.naturalWidth, nh: i.naturalHeight,
      dw: Math.round(i.getBoundingClientRect().width), dh: Math.round(i.getBoundingClientRect().height),
      ratio: i.naturalWidth > 0 && i.getBoundingClientRect().width > 0
        ? (i.naturalWidth / i.getBoundingClientRect().width).toFixed(2) : 'N/A',
    })),
  })`);
  console.log('Tile sizes:', tileQuality);
  
  // === 3. BASEMAP CHECK ===
  console.log('\n=== 3. BASEMAP CHECK ===');
  const basemap = await evalJS(ws, `JSON.stringify({
    hasOSM: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).some(i => i.src.includes('openstreetmap')),
    hasGoogle: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).some(i => i.src.includes('googleapis')),
    hasEsri: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).some(i => i.src.includes('arcgisonline') || i.src.includes('esri')),
    hasMapbox: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).some(i => i.src.includes('mapbox')),
    allSentinel: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).length > 0 && 
      Array.from(document.querySelectorAll('.leaflet-tile-pane img')).every(i => i.src.includes('/satellite/') && i.src.includes('/tile/')),
  })`);
  console.log('Basemap:', basemap);
  
  // === 4. ZOOM OUT (5 clicks) ===
  console.log('\n=== 4. ZOOM OUT TEST ===');
  for (let i = 0; i < 5; i++) {
    await evalJS(ws, `document.querySelector('button[title="Zoom Out"]')?.click()`);
    await delay(2500);
  }
  const zoomOut = await evalJS(ws, `JSON.stringify({
    hud: document.querySelector('.spatial-capsule')?.textContent?.trim()?.substring(0,80) || 'N/A',
    tileCount: document.querySelectorAll('.leaflet-tile-pane img').length,
    tileStatus: (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      let blank=0, loaded=0;
      imgs.forEach(i => {
        if (i.complete && i.naturalWidth === 0) blank++;
        else if (i.complete && i.naturalWidth > 0) loaded++;
      });
      return { loaded, blank };
    })(),
  })`);
  console.log('After zoom-out:', zoomOut);
  const ss2 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss2.result?.data) require('fs').writeFileSync('_q_zoomout.png', Buffer.from(ss2.result.data, 'base64'));
  console.log('Screenshot: _q_zoomout.png');
  
  // === 5. ZOOM IN (8 clicks from Fit India) ===
  console.log('\n=== 5. ZOOM IN TEST ===');
  await evalJS(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(3000);
  
  for (let i = 0; i < 8; i++) {
    await evalJS(ws, `document.querySelector('button[title="Zoom In"]')?.click()`);
    await delay(2000);
    const step = await evalJS(ws, `JSON.stringify({
      hud: document.querySelector('.spatial-capsule')?.textContent?.trim()?.substring(0,60) || 'N/A',
      tileCount: document.querySelectorAll('.leaflet-tile-pane img').length,
      loaded: (() => { let c=0; document.querySelectorAll('.leaflet-tile-pane img').forEach(i=>{if(i.complete&&i.naturalWidth>0)c++}); return c; })(),
      blank: (() => { let c=0; document.querySelectorAll('.leaflet-tile-pane img').forEach(i=>{if(i.complete&&i.naturalWidth===0)c++}); return c; })(),
    })`);
    console.log(`  Step ${i+1}:`, step);
  }
  
  // Detailed tile info at high zoom
  const highZoom = await evalJS(ws, `JSON.stringify({
    imgSizes: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i => ({
      nw: i.naturalWidth, nh: i.naturalHeight,
      dw: Math.round(i.getBoundingClientRect().width), dh: Math.round(i.getBoundingClientRect().height),
      ratio: i.naturalWidth > 0 && i.getBoundingClientRect().width > 0
        ? (i.naturalWidth / i.getBoundingClientRect().width).toFixed(2) : 'N/A',
    })),
    hud: document.querySelector('.spatial-capsule')?.textContent?.trim() || 'N/A',
  })`);
  console.log('High zoom details:', highZoom);
  
  const ss3 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss3.result?.data) require('fs').writeFileSync('_q_zoomin.png', Buffer.from(ss3.result.data, 'base64'));
  console.log('Screenshot: _q_zoomin.png');
  
  // === 6. FIT INDIA ===
  console.log('\n=== 6. FIT INDIA ===');
  await evalJS(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(5000);
  const fitIndia = await evalJS(ws, `JSON.stringify({
    hud: document.querySelector('.spatial-capsule')?.textContent?.trim()?.substring(0,80) || 'N/A',
    tileCount: document.querySelectorAll('.leaflet-tile-pane img').length,
    tileStatus: (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      let blank=0, loaded=0;
      imgs.forEach(i => { if(i.complete&&i.naturalWidth===0) blank++; else if(i.complete&&i.naturalWidth>0) loaded++; });
      return { loaded, blank };
    })(),
    imgSizes: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,3).map(i => ({
      nw: i.naturalWidth, nh: i.naturalHeight,
      dw: Math.round(i.getBoundingClientRect().width), dh: Math.round(i.getBoundingClientRect().height),
    })),
  })`);
  console.log('Fit India:', fitIndia);
  const ss4 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss4.result?.data) require('fs').writeFileSync('_q_fitindia.png', Buffer.from(ss4.result.data, 'base64'));
  console.log('Screenshot: _q_fitindia.png');
  
  // === 7. CARD FILL ===
  console.log('\n=== 7. CARD FILL ===');
  const cardFill = await evalJS(ws, `JSON.stringify({
    viewport: { w: window.innerWidth, h: window.innerHeight },
    map: (() => {
      const c = document.querySelector('.leaflet-container');
      return c ? { w: c.offsetWidth, h: c.offsetHeight } : null;
    })(),
    occupancy: (() => {
      const c = document.querySelector('.leaflet-container');
      return c ? ((c.offsetWidth * c.offsetHeight) / (window.innerWidth * window.innerHeight) * 100).toFixed(1)+'%' : 'N/A';
    })(),
  })`);
  console.log('Card fill:', cardFill);
  
  // === 8. NETWORK SUMMARY ===
  console.log('\n=== 8. NETWORK SUMMARY ===');
  console.log('Total satellite responses:', satResponses.length);
  const sc = {}, cc = {};
  satResponses.forEach(r => { sc[r.status] = (sc[r.status]||0)+1; cc[r.ct] = (cc[r.ct]||0)+1; });
  console.log('Status codes:', JSON.stringify(sc));
  console.log('Content types:', JSON.stringify(cc));
  
  ws.close();
  edge.kill();
  console.log('\n=== QA COMPLETE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
