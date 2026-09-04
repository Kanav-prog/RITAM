const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Collect network requests for Sentinel tiles
  const sentinelRequests = [];
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/satellite/') && url.includes('/tile/')) {
      sentinelRequests.push({
        url: url.substring(0, 150),
        status: resp.status(),
        contentType: resp.headers()['content-type'] || 'unknown',
      });
    }
  });

  console.log('=== PHASE 1: Load App & Initial State ===');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));

  // Check map container
  const mapInfo = await page.evaluate(() => {
    const el = document.querySelector('.leaflet-container');
    return el ? { width: el.offsetWidth, height: el.offsetHeight } : null;
  });
  console.log('Map container:', JSON.stringify(mapInfo));

  // Check tile count
  let tileCount = await page.evaluate(() => {
    return document.querySelectorAll('.leaflet-tile-pane img').length;
  });
  console.log('Initial tile count:', tileCount);

  // Check tile sources
  let tileSources = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    return Array.from(imgs).slice(0, 5).map(img => img.src.substring(0, 150));
  });
  console.log('Tile sources (first 5):', JSON.stringify(tileSources, null, 2));

  // Check zoom level from HUD
  const hudText = await page.evaluate(() => {
    const el = document.querySelector('.spatial-capsule');
    return el ? el.textContent.trim() : 'not found';
  });
  console.log('HUD text:', hudText);

  await page.screenshot({ path: '_qa_01_initial.png', fullPage: false });

  // === PHASE 2: Zoom Out ===
  console.log('\n=== PHASE 2: Zoom Out Progressively ===');
  for (let i = 0; i < 3; i++) {
    await page.click('button[title="Zoom Out"]');
    await new Promise(r => setTimeout(r, 2000));
  }
  tileCount = await page.evaluate(() => document.querySelectorAll('.leaflet-tile-pane img').length);
  const hudAfterZoomOut = await page.evaluate(() => {
    const el = document.querySelector('.spatial-capsule');
    return el ? el.textContent.trim() : 'not found';
  });
  console.log('After zoom-out - tiles:', tileCount, 'HUD:', hudAfterZoomOut);
  await page.screenshot({ path: '_qa_02_zoomed_out.png', fullPage: false });

  // Check tile status (blank/loaded/error)
  let tileStatus = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    let blank = 0, loaded = 0, pending = 0;
    imgs.forEach(img => {
      if (img.complete && img.naturalWidth === 0) blank++;
      else if (img.complete && img.naturalWidth > 0) loaded++;
      else pending++;
    });
    return { total: imgs.length, loaded, blank, pending };
  });
  console.log('Tile status after zoom-out:', JSON.stringify(tileStatus));

  // === PHASE 3: Zoom In Progressively ===
  console.log('\n=== PHASE 3: Zoom In Progressively ===');
  // First go back to India
  await page.click('button[title="Fit Full India View"]');
  await new Promise(r => setTimeout(r, 2000));

  for (let i = 0; i < 8; i++) {
    await page.click('button[title="Zoom In"]');
    await new Promise(r => setTimeout(r, 1500));
    const z = await page.evaluate(() => {
      const el = document.querySelector('.spatial-capsule');
      return el ? el.textContent.trim() : '';
    });
    const ts = await page.evaluate(() => {
      const imgs = document.querySelectorAll('.leaflet-tile-pane img');
      let blank = 0, loaded = 0, pending = 0;
      imgs.forEach(img => {
        if (img.complete && img.naturalWidth === 0) blank++;
        else if (img.complete && img.naturalWidth > 0) loaded++;
        else pending++;
      });
      return { total: imgs.length, loaded, blank, pending };
    });
    console.log(`  Zoom step ${i+1} - HUD: ${z} | tiles: ${JSON.stringify(ts)}`);
  }

  // Check tile native vs display sizes
  const tileSizes = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    return Array.from(imgs).slice(0, 5).map(img => ({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.offsetWidth,
      displayHeight: img.offsetHeight,
      src: img.src.substring(0, 100),
    }));
  });
  console.log('Tile sizes at high zoom:', JSON.stringify(tileSizes, null, 2));
  await page.screenshot({ path: '_qa_03_zoomed_in.png', fullPage: false });

  // === PHASE 4: Check for Basemap contamination ===
  console.log('\n=== PHASE 4: Basemap Check ===');
  const basemapCheck = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    const urls = Array.from(imgs).map(i => i.src);
    return {
      hasOSM: urls.some(u => u.includes('openstreetmap')),
      hasGoogle: urls.some(u => u.includes('googleapis.com/vt') || u.includes('google.com')),
      hasEsri: urls.some(u => u.includes('arcgisonline') || u.includes('esri.com')),
      hasMapbox: urls.some(u => u.includes('mapbox.com')),
      allSentinel: urls.every(u => u.includes('/satellite/') && u.includes('/tile/')),
      tileUrls: urls.slice(0, 3).map(u => u.substring(0, 120)),
    };
  });
  console.log('Basemap check:', JSON.stringify(basemapCheck, null, 2));

  // === PHASE 5: Global Navigation (pan outside India) ===
  console.log('\n=== PHASE 5: Global Navigation ===');
  await page.click('button[title="Fit Full India View"]');
  await new Promise(r => setTimeout(r, 2000));

  // Pan right (East) by dragging
  await page.mouse.move(700, 450);
  await page.mouse.down();
  await page.mouse.move(300, 450, { steps: 20 });
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 2000));

  tileStatus = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.leaflet-tile-pane img');
    let blank = 0, loaded = 0, pending = 0;
    imgs.forEach(img => {
      if (img.complete && img.naturalWidth === 0) blank++;
      else if (img.complete && img.naturalWidth > 0) loaded++;
      else pending++;
    });
    return { total: imgs.length, loaded, blank, pending };
  });
  console.log('After pan right - tiles:', JSON.stringify(tileStatus));
  await page.screenshot({ path: '_qa_04_pan_right.png', fullPage: false });

  // === PHASE 6: Map card occupancy ===
  console.log('\n=== PHASE 6: Map Card Occupancy ===');
  const cardInfo = await page.evaluate(() => {
    const map = document.querySelector('.leaflet-container');
    const parent = map?.parentElement;
    const grandparent = parent?.parentElement;
    return {
      mapW: map?.offsetWidth, mapH: map?.offsetHeight,
      parentW: parent?.offsetWidth, parentH: parent?.offsetHeight,
      gpW: grandparent?.offsetWidth, gpH: grandparent?.offsetHeight,
      parentStyle: parent?.getAttribute('style'),
    };
  });
  console.log('Card info:', JSON.stringify(cardInfo, null, 2));

  // === PHASE 7: Network summary ===
  console.log('\n=== PHASE 7: Network Summary ===');
  console.log('Total Sentinel tile requests observed:', sentinelRequests.length);
  const statusCounts = {};
  const contentTypes = {};
  sentinelRequests.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    contentTypes[r.contentType] = (contentTypes[r.contentType] || 0) + 1;
  });
  console.log('Status codes:', JSON.stringify(statusCounts));
  console.log('Content types:', JSON.stringify(contentTypes));
  if (sentinelRequests.length > 0) {
    console.log('Sample tile URLs:', sentinelRequests.slice(0, 3).map(r => r.url));
  }

  // Final zoom back
  await page.click('button[title="Fit Full India View"]');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '_qa_05_final.png', fullPage: false });

  console.log('\n=== QA COMPLETE ===');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
