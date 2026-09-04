
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  console.log('=== PHASE 1: Load App ===');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check if map is visible
  const mapExists = await page.evaluate(() => {
    const el = document.querySelector('.leaflet-container');
    return el ? { width: el.offsetWidth, height: el.offsetHeight } : null;
  });
  console.log('Map container:', JSON.stringify(mapExists));
  
  // Screenshot
  await page.screenshot({ path: '_qa_01_initial.png', fullPage: false });
  console.log('Screenshot: _qa_01_initial.png');
  
  // Count tiles
  let tileCount = await page.evaluate(() => {
    return document.querySelectorAll('.leaflet-tile-pane img').length;
  });
  console.log('Initial tile count:', tileCount);
  
  // Check if any tiles are Sentinel (non-OSM)
  let tileSources = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    return Array.from(imgs).slice(0, 5).map(img => img.src.substring(0, 120));
  });
  console.log('Tile sources (first 5):', JSON.stringify(tileSources, null, 2));
  
  console.log('
=== PHASE 2: Zoom Out from India ===');
  // Zoom out progressively  
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const map = document.querySelector('.leaflet-container');
      if (map && map._leaflet_id) {
        // Access Leaflet map instance
        const maps = Object.values(window).filter(v => v && v._zoom !== undefined);
      }
    });
    // Use zoom buttons
    const zoomOutBtn = await page.;
    if (zoomOutBtn) await zoomOutBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }
  await page.screenshot({ path: '_qa_02_zoomed_out.png', fullPage: false });
  tileCount = await page.evaluate(() => document.querySelectorAll('.leaflet-tile-pane img').length);
  console.log('After zoom-out tile count:', tileCount);
  console.log('Screenshot: _qa_02_zoomed_out.png');
  
  // Check zoom level
  const zoomLevel = await page.evaluate(() => {
    const zoomEl = document.querySelector('.spatial-capsule');
    return zoomEl ? zoomEl.textContent : 'not found';
  });
  console.log('Zoom HUD text:', zoomLevel);
  
  console.log('
=== PHASE 3: Zoom in progressively ===');
  // Zoom in
  for (let i = 0; i < 8; i++) {
    const zoomInBtn = await page.;
    if (zoomInBtn) await zoomInBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }
  await page.screenshot({ path: '_qa_03_zoomed_in.png', fullPage: false });
  tileCount = await page.evaluate(() => document.querySelectorAll('.leaflet-tile-pane img').length);
  console.log('After zoom-in tile count:', tileCount);
  const zoomInText = await page.evaluate(() => {
    const zoomEl = document.querySelector('.spatial-capsule');
    return zoomEl ? zoomEl.textContent : 'not found';
  });
  console.log('Zoom HUD text:', zoomInText);
  console.log('Screenshot: _qa_03_zoomed_in.png');
  
  // Check tile sizes for quality assessment
  let tileSizes = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    return Array.from(imgs).slice(0, 3).map(img => ({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.offsetWidth,
      displayHeight: img.offsetHeight,
      src: img.src.substring(0, 100)
    }));
  });
  console.log('Tile sizes:', JSON.stringify(tileSizes, null, 2));
  
  console.log('
=== PHASE 4: Check for broken/blank tiles ===');
  let brokenTiles = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    let blank = 0, error = 0, loaded = 0;
    imgs.forEach(img => {
      if (img.complete && img.naturalWidth === 0) blank++;
      else if (img.complete) loaded++;
      else error++;
    });
    return { total: imgs.length, loaded, blank, error };
  });
  console.log('Tile status:', JSON.stringify(brokenTiles));
  
  console.log('
=== PHASE 5: Check map card occupancy ===');
  let cardInfo = await page.evaluate(() => {
    const mapCard = document.querySelector('.leaflet-container');
    const parent = mapCard ? mapCard.parentElement : null;
    const grandparent = parent ? parent.parentElement : null;
    return {
      mapWidth: mapCard?.offsetWidth,
      mapHeight: mapCard?.offsetHeight,
      parentWidth: parent?.offsetWidth,
      parentHeight: parent?.offsetHeight,
      grandparentWidth: grandparent?.offsetWidth,
      grandparentHeight: grandparent?.offsetHeight,
      mapStyle: mapCard?.parentElement?.getAttribute('style'),
    };
  });
  console.log('Card info:', JSON.stringify(cardInfo, null, 2));
  
  // Check for any basemap elements (OSM, Google, Esri)
  let basemapCheck = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    return {
      hasOSM: html.includes('openstreetmap') || html.includes('tile.openstreetmap'),
      hasGoogle: html.includes('googleapis.com/vt') || html.includes('google.com/maps'),
      hasEsri: html.includes('arcgisonline') || html.includes('esri.com'),
      hasMapbox: html.includes('mapbox.com'),
    };
  });
  console.log('Basemap check:', JSON.stringify(basemapCheck));
  
  console.log('
=== PHASE 6: Check network for Sentinel tiles ===');
  // Navigate back to initial view
  const fitBtn = await page.;
  if (fitBtn) await fitBtn.click();
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '_qa_04_fit_india.png', fullPage: false });
  console.log('Screenshot: _qa_04_fit_india.png');
  
  console.log('
=== ALL PHASES COMPLETE ===');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
