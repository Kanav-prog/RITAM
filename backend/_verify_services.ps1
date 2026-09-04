const { spawn } = require('child_process');
const http = require('http');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('=== SERVICE CHECK ===');
  
  // Check backend
  try {
    const backend = await httpGet('http://127.0.0.1:8000/health');
    console.log('Backend /health:', backend.status, backend.body.slice(0, 200));
  } catch (e) {
    console.log('Backend UNAVAILABLE:', e.message);
  }
  
  // Check frontend
  try {
    const frontend = await httpGet('http://127.0.0.1:5173/');
    console.log('Frontend /:', frontend.status, '- HTML length:', frontend.body.length);
  } catch (e) {
    console.log('Frontend UNAVAILABLE:', e.message);
  }
  
  // Check if client.js is served correctly
  try {
    const clientJs = await httpGet('http://127.0.0.1:5173/src/api/client.js');
    console.log('client.js:', clientJs.status, '- length:', clientJs.body.length);
    // Check for the tile URL function
    if (clientJs.body.includes('getSentinelTileUrl')) {
      console.log('  -> getSentinelTileUrl: PRESENT');
    } else {
      console.log('  -> getSentinelTileUrl: MISSING');
    }
    if (clientJs.body.includes('API_BASE_URL')) {
      console.log('  -> API_BASE_URL: PRESENT');
    }
  } catch (e) {
    console.log('client.js UNAVAILABLE:', e.message);
  }
  
  // Check SpatialMap.jsx
  try {
    const spatialMap = await httpGet('http://127.0.0.1:5173/src/components/SpatialMap.jsx');
    console.log('SpatialMap.jsx:', spatialMap.status, '- length:', spatialMap.body.length);
    if (spatialMap.body.includes('L.tileLayer')) {
      console.log('  -> L.tileLayer: PRESENT');
    } else {
      console.log('  -> L.tileLayer: MISSING');
    }
    if (spatialMap.body.includes('getSentinelTileUrl')) {
      console.log('  -> getSentinelTileUrl usage: PRESENT');
    } else {
      console.log('  -> getSentinelTileUrl usage: MISSING');
    }
  } catch (e) {
    console.log('SpatialMap.jsx UNAVAILABLE:', e.message);
  }
  
  console.log('\n=== SERVICE CHECK COMPLETE ===');
}

main().catch(e => { console.error(e); process.exit(1); });
