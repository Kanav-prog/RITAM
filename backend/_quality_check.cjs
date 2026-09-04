const { spawn } = require('child_process');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9449;
const FRONTEND_URL = 'http://127.0.0.1:5173';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
let msgId = 0;

function cdpCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const timeout = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 20000);
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
    expression: expr, returnByValue: true, awaitPromise: true
  });
  return r.result?.result?.value;
}

async function setMapZoom(ws, zoom) {
  await evalJS(ws, `document.querySelector('.leaflet-container')?.__leaflet_map?.setZoom(${zoom}) || 'no map ref'`);
}

async function main() {
  try { require('child_process').execSync('taskkill /f /im msedge.exe 2>nul'); } catch {}
  await delay(2000);
  
  const edge = spawn(EDGE_PATH, [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    FRONTEND_URL
  ], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  await delay(8000);
  
  const tabsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
  const tabs = await tabsRes.json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });
  await cdpCommand(ws, 'Runtime.enable');
  await cdpCommand(ws, 'Network.enable');
  
  // Track satellite responses
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
  
  // Login
  await evalJS(ws, `(async () => {
    const r = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: 'username=ritam-dev%40localhost.test&password=Ritam%40123'
    });
    const d = await r.json();
    if(d.access_token) localStorage.setItem('ritam_token', d.access_token);
  })()`);
  
  // Reload
  await cdpCommand(ws, 'Page.navigate', { url: FRONTEND_URL });
  await delay(20000);
  
  console.log('=== 1. INITIAL STATE (India, zoom 6-12) ===');
  const initState = await evalJS(ws, `JSON.stringify({
    mapExists: !!document.querySelector('.leaflet-container'),
    mapRect: (() => { const r = document.querySelector('.leaflet-container')?.getBoundingClientRect(); return r ? Math.round(r.width)+'x'+Math.round(r.height) : 'N/A'; })(),
    tileImgs: document.querySelectorAll('.leaflet-tile-pane img').length,
    tileSrcs: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i => {
      const m = i.src.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
      return m ? {z:m[1],x:m[2],y:m[3]} : null;
    }),
    // Check image dimensions (natural vs display)
    imgSizes: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i => ({
      nw: i.naturalWidth, nh: i.naturalHeight,
      dw: Math.round(i.getBoundingClientRect().width),
      dh: Math.round(i.getBoundingClientRect().height),
    })),
    bodySnippet: document.body?.innerText?.substring(0, 200),
  })`);
  console.log(initState);
  
  // Take initial screenshot
  const ss1 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss1.result?.data) require('fs').writeFileSync('backend/_q_initial.png', Buffer.from(ss1.result.data, 'base64'));
  console.log('Screenshot: _q_initial.png');
  
  // === TEST: Find the Leaflet map instance ===
  console.log('\n=== FINDING MAP INSTANCE ===');
  const findMap = await evalJS(ws, `(() => {
    // Leaflet stores the map reference in the container element
    // We can find it by checking the _leaflet_id and iterating global objects
    const container = document.querySelector('.leaflet-container');
    if (!container) return 'NO_CONTAINER';
    const id = container._leaflet_id;
    
    // Try to find the map via a common Leaflet internal pattern
    // Leaflet v1.x stores _leaflet_map on the container
    // But we can also hook into the existing tileLayer by checking the DOM
    
    // The simplest way: expose the map on window for future calls
    // Actually, let's look for it through React fiber
    const fiberKey = Object.keys(container).find(k => k.startsWith('__reactFiber'));
    if (!fiberKey) return 'NO_REACT_FIBER';
    
    // Walk the fiber tree to find the map ref
    let fiber = container[fiberKey];
    let mapFound = false;
    let attempts = 0;
    while (fiber && attempts < 100) {
      if (fiber.memoizedState) {
        let state = fiber.memoizedState;
        while (state) {
          if (state.queue && state.queue.lastRenderedState && 
              state.queue.lastRenderedState._container === container) {
            window.__ritam_map = state.queue.lastRenderedState;
            mapFound = true;
            break;
          }
          if (state.memoizedState && typeof state.memoizedState === 'object' && state.memoizedState !== null) {
            const val = state.memoizedState;
            if (val.current && val.current._container === container) {
              window.__ritam_map = val.current;
              mapFound = true;
              break;
            }
          }
          state = state.next;
        }
      }
      if (mapFound) break;
      fiber = fiber.return;
      attempts++;
    }
    
    return { found: mapFound, attempts };
  })()`);
  console.log('Map instance search:', findMap);
  
  // Use Leaflet's internal map access from the container
  const setMapRef = await evalJS(ws, `(() => {
    // Leaflet stores map reference in container's closure. We can find it by
    // checking for _leaflet properties on the container and using them.
    // The simplest hack: override the container's setView to capture the map
    // Actually, let's use a different approach - check leaflet's internal store
    const c = document.querySelector('.leaflet-container');
    if (!c) return 'no container';
    
    // Leaflet stores a reference to each map in its internal registry
    // In L.Map constructor, it does: container._leaflet_id = L.Util.stamp(this)
    // We can get the map from L.Map instances
    
    // Try finding via event handlers attached to the container
    // The _leaflet_events object contains references to the map
    if (c._leaflet_events) {
      const events = Object.keys(c._leaflet_events);
      return { events: events.slice(0, 5), found: 'via events' };
    }
    
    return 'no events found';
  })()`);
  console.log('Map ref:', setMapRef);
  
  // Direct approach: inject a global reference via the tile layer
  const injectRef = await evalJS(ws, `(() => {
    // Access the map through the tile layer's _map property
    const tileImgs = document.querySelectorAll('.leaflet-tile-pane img');
    if (tileImgs.length === 0) return 'no tile imgs';
    
    // Walk up from a tile img to find the tile layer's container
    // Each img is inside a .leaflet-tile-container inside a .leaflet-layer
    const layer = tileImgs[0].closest('.leaflet-layer');
    if (!layer) return 'no layer parent';
    
    // The tile layer stores a reference to the map
    // We can find it through Leaflet's internal _leaflet_id system
    // Each DOM element with _leaflet_id has a corresponding JS object
    const layerId = layer._leaflet_id;
    
    // Actually, the simplest way: just call the setView/fitBounds through 
    // the existing React component. Let's use Leaflet's global L object.
    if (typeof L !== 'undefined') {
      // Find the map instance through Leaflet's internal layer tracking
      // L.Map instances store themselves in a global counter
      // We can find our map by looking at container._leaflet_id
      return { leafletVersion: L.version, containerLeafletId: document.querySelector('.leaflet-container')._leaflet_id };
    }
    return 'L not defined';
  })()`);
  console.log('Leaflet:', injectRef);

  // === TEST: Check zoom-out behavior ===
  console.log('\n=== 2. ZOOM OUT TEST ===');
  // Use fitBounds to zoom out to different levels
  await evalJS(ws, `(() => {
    // Find the map instance by hacking into the React ref
    // Actually, Leaflet maps store a reference on the container
    const c = document.querySelector('.leaflet-container');
    // Check all _leaflet properties
    const props = {};
    for (const k in c) {
      if (k.startsWith('_leaflet') && typeof c[k] !== 'function') {
        props[k] = typeof c[k] === 'object' ? 'object' : c[k];
      }
    }
    return JSON.stringify(props);
  })()`);
  
  // The most reliable way: Use the React component's handlers
  // The SpatialMap has zoom in/out buttons. Let me simulate clicking them.
  // Or better, use the map's setView through the DOM event system
  
  // Actually, Leaflet attaches the map to the container via the _leaflet_id
  // Let's try a different approach: use the existing handlers on the window
  
  // Simplest approach: dispatch wheel events or use the zoom buttons
  // The zoom-in button triggers map.zoomIn()
  // Let me click the zoom-out button many times
  
  console.log('Zooming out via UI buttons...');
  // Click zoom-out button multiple times
  for (let i = 0; i < 6; i++) {
    await evalJS(ws, `
      const btn = document.querySelector('button[title="Zoom Out"]');
      if (btn) btn.click();
    `);
    await delay(3000);
  }
  
  // Capture state after zoom out
  const zoomOutState = await evalJS(ws, `JSON.stringify({
    tileImgs: document.querySelectorAll('.leaflet-tile-pane img').length,
    tileSrcs: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,3).map(i => {
      const m = i.src.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
      return m ? 'z'+m[1] : '?';
    }),
    hud: document.body.innerText.match(/ZOOM \\d+/)?.[0] || 'N/A',
  })`);
  console.log('After zoom-out:', zoomOutState);
  
  const ss2 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss2.result?.data) require('fs').writeFileSync('backend/_q_zoomout.png', Buffer.from(ss2.result.data, 'base64'));
  console.log('Screenshot: _q_zoomout.png');
  
  // === TEST: Zoom back in ===
  console.log('\n=== 3. ZOOM IN TEST ===');
  console.log('Zooming in via UI buttons...');
  for (let i = 0; i < 10; i++) {
    await evalJS(ws, `
      const btn = document.querySelector('button[title="Zoom In"]');
      if (btn) btn.click();
    `);
    await delay(3000);
  }
  
  const zoomInState = await evalJS(ws, `JSON.stringify({
    tileImgs: document.querySelectorAll('.leaflet-tile-pane img').length,
    tileSrcs: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i => {
      const m = i.src.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
      return m ? 'z'+m[1] : '?';
    }),
    imgSizes: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,3).map(i => ({
      nw: i.naturalWidth, nh: i.naturalHeight,
      dw: Math.round(i.getBoundingClientRect().width),
      dh: Math.round(i.getBoundingClientRect().height),
      complete: i.complete,
    })),
    hud: document.body.innerText.match(/ZOOM \\d+/)?.[0] || 'N/A',
  })`);
  console.log('After zoom-in:', zoomInState);
  
  const ss3 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss3.result?.data) require('fs').writeFileSync('backend/_q_zoomin.png', Buffer.from(ss3.result.data, 'base64'));
  console.log('Screenshot: _q_zoomin.png');
  
  // === TEST: Click Fit India ===
  console.log('\n=== 4. FIT INDIA TEST ===');
  await evalJS(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await delay(5000);
  
  const fitIndiaState = await evalJS(ws, `JSON.stringify({
    tileImgs: document.querySelectorAll('.leaflet-tile-pane img').length,
    imgSizes: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,3).map(i => ({
      nw: i.naturalWidth, nh: i.naturalHeight,
      dw: Math.round(i.getBoundingClientRect().width),
      dh: Math.round(i.getBoundingClientRect().height),
    })),
    hud: document.body.innerText.match(/ZOOM \\d+/)?.[0] || 'N/A',
    tileSrcs: Array.from(document.querySelectorAll('.leaflet-tile-pane img')).slice(0,5).map(i => {
      const m = i.src.match(/tile\\/(\\d+)\\/(\\d+)\\/(\\d+)/);
      return m ? 'z'+m[1] : '?';
    }),
  })`);
  console.log('Fit India:', fitIndiaState);
  
  const ss4 = await cdpCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (ss4.result?.data) require('fs').writeFileSync('backend/_q_fitindia.png', Buffer.from(ss4.result.data, 'base64'));
  console.log('Screenshot: _q_fitindia.png');
  
  // === Satellite response summary ===
  console.log('\n=== 5. SATELLITE RESPONSE SUMMARY ===');
  console.log('Total satellite responses:', satResponses.length);
  const statusCounts = {};
  satResponses.forEach(r => {
    const key = r.status + ' ' + r.ct;
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });
  console.log('Status breakdown:', JSON.stringify(statusCounts));
  
  // Check for any non-200 responses
  const failures = satResponses.filter(r => r.status !== 200);
  if (failures.length > 0) {
    console.log('FAILED requests:', failures.length);
    failures.slice(0, 5).forEach(f => console.log('  ', f.status, f.url.substring(0, 120)));
  }
  
  // Check for basemap requests
  const basemapProviders = ['openstreetmap', 'esri', 'carto', 'google', 'mapbox', 'arcgis', 'tile.openstreetmap', 'basemaps'];
  const allReqs = satResponses.map(r => r.url);
  const basemapReqs = allReqs.filter(u => basemapProviders.some(p => u.toLowerCase().includes(p)));
  console.log('Conventional basemap requests:', basemapReqs.length);
  
  // Check if any conventional basemap is loaded
  const basemapCheck = await evalJS(ws, `JSON.stringify({
    osmImgs: document.querySelectorAll('img[src*="openstreetmap"]').length,
    esriImgs: document.querySelectorAll('img[src*="esri"]').length,
    cartoImgs: document.querySelectorAll('img[src*="carto"]').length,
    googleImgs: document.querySelectorAll('img[src*="google"]').length,
    mapboxImgs: document.querySelectorAll('img[src*="mapbox"]').length,
  })`);
  console.log('Basemap DOM check:', basemapCheck);
  
  // === Map card fill check ===
  console.log('\n=== 6. MAP CARD FILL CHECK ===');
  const cardFill = await evalJS(ws, `JSON.stringify({
    mapContainer: (() => {
      const c = document.querySelector('.leaflet-container');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) };
    })(),
    parentCard: (() => {
      // Find the flex container with flex: 0 0 65%
      const divs = document.querySelectorAll('div');
      for (const d of divs) {
        if (d.style.flex === '0 0 65%') {
          const r = d.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) };
        }
      }
      return null;
    })(),
    viewportSize: { w: window.innerWidth, h: window.innerHeight },
  })`);
  console.log('Card fill:', cardFill);
  
  ws.close();
  edge.kill();
  console.log('\n=== DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
