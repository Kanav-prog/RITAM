// QA: Browser visual quality verification via Chrome DevTools Protocol
// Checks: blank map, tile loading, basemap contamination, card occupancy

import { createConnection } from 'net';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import WebSocket from 'ws'  ;

const CDP_PORT = 9222;
const FRONTEND = 'http://localhost:5173';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function sendCDP(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1e6);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 30000);
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) {
        clearTimeout(timeout);
        ws.removeListener('message', handler);
        if (msg.error) reject(new Error(`CDP error: ${JSON.stringify(msg.error)}`));
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(ws, expression) {
  const result = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result?.result?.value;
}

(async () => {
  // Connect to Chrome
  console.log('Connecting to Chrome CDP...');
  const res = execSync(`curl -s http://localhost:${CDP_PORT}/json`).toString();
  const tabs = JSON.parse(res);
  const page = tabs.find(t => t.type === 'page');
  if (!page) { console.error('No page tab found'); process.exit(1); }
  
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.on('open', resolve));
  console.log('Connected to:', page.title);
  
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Page.enable');

  // Navigate to frontend
  console.log('Navigating to frontend...');
  await sendCDP(ws, 'Page.navigate', { url: FRONTEND });
  await sleep(5000);

  // === TEST 1: Map Container ===
  console.log('\n=== TEST 1: Map Container ===');
  const mapInfo = await evaluate(ws, `
    (() => {
      const el = document.querySelector('.leaflet-container');
      if (!el) return { error: 'No leaflet container found' };
      return {
        width: el.offsetWidth,
        height: el.offsetHeight,
        childCount: el.children.length,
        hasTilePane: !!el.querySelector('.leaflet-tile-pane'),
        tilePaneChildCount: el.querySelector('.leaflet-tile-pane')?.children?.length || 0
      };
    })()
  `);
  console.log('Map info:', JSON.stringify(mapInfo));

  // === TEST 2: Tile Analysis ===
  console.log('\n=== TEST 2: Tile Analysis ===');
  const tileInfo = await evaluate(ws, `
    (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      const tiles = Array.from(imgs).map(img => ({
        src: img.src.substring(0, 150),
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        displayW: img.offsetWidth,
        displayH: img.offsetHeight,
        complete: img.complete,
        loaded: img.complete && img.naturalWidth > 0,
      }));
      
      const sentinelTiles = tiles.filter(t => t.src.includes('/satellite/') && t.src.includes('/tile/'));
      const osmTiles = tiles.filter(t => t.src.includes('openstreetmap'));
      const googleTiles = tiles.filter(t => t.src.includes('googleapis'));
      const blankTiles = tiles.filter(t => t.complete && t.naturalW === 0);
      
      return {
        totalTiles: tiles.length,
        sentinelCount: sentinelTiles.length,
        osmCount: osmTiles.length,
        googleCount: googleTiles.length,
        blankCount: blankTiles.length,
        loadedCount: tiles.filter(t => t.loaded).length,
        pendingCount: tiles.filter(t => !t.complete).length,
        sampleTileSizes: tiles.slice(0, 3).map(t => ({
          natural: t.naturalW + 'x' + t.naturalH,
          display: t.displayW + 'x' + t.displayH,
          loaded: t.loaded,
        })),
        sampleSrcs: tiles.slice(0, 3).map(t => t.src),
      };
    })()
  `);
  console.log('Tile analysis:', JSON.stringify(tileInfo, null, 2));

  // === TEST 3: Zoom Level ===
  console.log('\n=== TEST 3: Zoom Level & HUD ===');
  const zoomInfo = await evaluate(ws, `
    (() => {
      const capsule = document.querySelector('.spatial-capsule');
      return {
        hudText: capsule ? capsule.textContent.trim() : 'not found',
        leafletZoom: (() => {
          const mapEl = document.querySelector('.leaflet-container');
          // Try to get zoom from Leaflet internal state
          const keys = Object.keys(mapEl || {});
          return 'check needed';
        })(),
      };
    })()
  `);
  console.log('Zoom info:', JSON.stringify(zoomInfo));

  // Take screenshot at initial view
  await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }).then(r => {
    writeFileSync('_qa_browser_initial.png', Buffer.from(r.data, 'base64'));
    console.log('Screenshot saved: _qa_browser_initial.png');
  });

  // === TEST 4: Basemap Check ===
  console.log('\n=== TEST 4: Basemap Contamination ===');
  const basemapCheck = await evaluate(ws, `
    (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      const urls = Array.from(imgs).map(i => i.src);
      const html = document.documentElement.innerHTML;
      return {
        totalSrcs: urls.length,
        hasOSM: urls.some(u => u.includes('openstreetmap')),
        hasGoogle: urls.some(u => u.includes('googleapis.com/vt') || u.includes('google.com/maps')),
        hasEsri: urls.some(u => u.includes('arcgisonline') || u.includes('esri.com')),
        hasMapbox: urls.some(u => u.includes('mapbox.com')),
        allFromBackend: urls.every(u => u.includes('/satellite/') && u.includes('/tile/')),
        first3Urls: urls.slice(0, 3).map(u => u.substring(0, 100)),
      };
    })()
  `);
  console.log('Basemap check:', JSON.stringify(basemapCheck, null, 2));

  // === TEST 5: Card Occupancy ===
  console.log('\n=== TEST 5: Card Occupancy ===');
  const cardInfo = await evaluate(ws, `
    (() => {
      const map = document.querySelector('.leaflet-container');
      const parent = map?.parentElement;
      const grandparent = parent?.parentElement;
      const viewport = { w: window.innerWidth, h: window.innerHeight };
      return {
        viewport,
        mapW: map?.offsetWidth,
        mapH: map?.offsetHeight,
        parentW: parent?.offsetWidth,
        parentH: parent?.offsetHeight,
        parentTag: parent?.tagName,
        gpW: grandparent?.offsetWidth,
        gpH: grandparent?.offsetHeight,
        gpTag: grandparent?.tagName,
        mapStyle: map?.parentElement?.getAttribute('style'),
        occupancy: map ? ((map.offsetWidth * map.offsetHeight) / (viewport.w * viewport.h) * 100).toFixed(1) + '%' : 'N/A',
      };
    })()
  `);
  console.log('Card info:', JSON.stringify(cardInfo, null, 2));

  // === TEST 6: Zoom In Test ===
  console.log('\n=== TEST 6: Zoom In & Check Tile Loading ===');
  // Click zoom in 6 times
  for (let i = 0; i < 6; i++) {
    await evaluate(ws, `document.querySelector('button[title="Zoom In"]')?.click()`);
    await sleep(2500);
  }
  
  const zoomInResult = await evaluate(ws, `
    (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      const tiles = Array.from(imgs);
      const sentinelTiles = tiles.filter(t => t.src.includes('/satellite/') && t.src.includes('/tile/'));
      const blankTiles = tiles.filter(t => t.complete && t.naturalWidth === 0);
      const capsule = document.querySelector('.spatial-capsule');
      
      // Check tile size consistency (quality indicator)
      const sizes = sentinelTiles.slice(0, 5).map(t => ({
        naturalW: t.naturalWidth,
        naturalH: t.naturalHeight,
        displayW: t.offsetWidth,
        displayH: t.offsetHeight,
        ratio: t.offsetWidth > 0 ? (t.naturalWidth / t.offsetWidth).toFixed(2) : 'N/A',
      }));
      
      return {
        hud: capsule?.textContent?.trim(),
        totalTiles: tiles.length,
        sentinelCount: sentinelTiles.length,
        blankCount: blankTiles.length,
        loadedCount: tiles.filter(t => t.complete && t.naturalWidth > 0).length,
        tileSizes: sizes,
      };
    })()
  `);
  console.log('After 6x zoom-in:', JSON.stringify(zoomInResult, null, 2));
  
  await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }).then(r => {
    writeFileSync('_qa_browser_zoomed.png', Buffer.from(r.data, 'base64'));
    console.log('Screenshot saved: _qa_browser_zoomed.png');
  });

  // === TEST 7: Zoom Out to Globe ===
  console.log('\n=== TEST 7: Zoom Out to Globe View ===');
  // Click Fit India first
  await evaluate(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await sleep(2000);
  // Zoom out max times
  for (let i = 0; i < 5; i++) {
    await evaluate(ws, `document.querySelector('button[title="Zoom Out"]')?.click()`);
    await sleep(2500);
  }
  
  const zoomOutResult = await evaluate(ws, `
    (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      const tiles = Array.from(imgs);
      const sentinelTiles = tiles.filter(t => t.src.includes('/satellite/') && t.src.includes('/tile/'));
      const blankTiles = tiles.filter(t => t.complete && t.naturalWidth === 0);
      const capsule = document.querySelector('.spatial-capsule');
      
      return {
        hud: capsule?.textContent?.trim(),
        totalTiles: tiles.length,
        sentinelCount: sentinelTiles.length,
        blankCount: blankTiles.length,
        loadedCount: tiles.filter(t => t.complete && t.naturalWidth > 0).length,
      };
    })()
  `);
  console.log('After zoom-out to globe:', JSON.stringify(zoomOutResult, null, 2));
  
  await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }).then(r => {
    writeFileSync('_qa_browser_globe.png', Buffer.from(r.data, 'base64'));
    console.log('Screenshot saved: _qa_browser_globe.png');
  });

  // === TEST 8: Pan Test ===
  console.log('\n=== TEST 8: Pan Across Region ===');
  // Zoom back to a good level
  await evaluate(ws, `document.querySelector('button[title="Fit Full India View"]')?.click()`);
  await sleep(2000);
  
  // Pan right by dragging
  await sendCDP(ws, 'Input.dispatchMouseEvent', { type: 'mousePressed', x: 700, y: 450, button: 'left', clickCount: 1 });
  for (let i = 0; i < 10; i++) {
    await sendCDP(ws, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x: 700 - i * 40, y: 450, button: 'left' });
    await sleep(100);
  }
  await sendCDP(ws, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x: 300, y: 450, button: 'left' });
  await sleep(3000);
  
  const panResult = await evaluate(ws, `
    (() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      const tiles = Array.from(imgs);
      const sentinelTiles = tiles.filter(t => t.src.includes('/satellite/') && t.src.includes('/tile/'));
      const blankTiles = tiles.filter(t => t.complete && t.naturalWidth === 0);
      return {
        totalTiles: tiles.length,
        sentinelCount: sentinelTiles.length,
        blankCount: blankTiles.length,
        loadedCount: tiles.filter(t => t.complete && t.naturalWidth > 0).length,
      };
    })()
  `);
  console.log('After pan:', JSON.stringify(panResult));
  
  await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }).then(r => {
    writeFileSync('_qa_browser_panned.png', Buffer.from(r.data, 'base64'));
    console.log('Screenshot saved: _qa_browser_panned.png');
  });

  console.log('\n=== ALL QA TESTS COMPLETE ===');
  ws.close();
})().catch(e => { console.error('QA Error:', e.message); process.exit(1); });
