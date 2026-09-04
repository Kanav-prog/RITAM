# SATELLITE DYNAMIC VIEWPORT ARCHITECTURE — FINAL STATE

This document supersedes the basemap/overlay descriptions in
`SATELLITE_CLEANUP_REPORT.md` and `SATELLITE_TRUECOLOR_REPORT.md`.
Those reports describe intermediate states. The current, final architecture
is below.

## Architecture

**Option 2 — debounced viewport-based Sentinel Hub Process API.**

Sentinel-2 is the ONLY imagery source. There is ZERO conventional basemap
imagery (no OSM, Esri, Google, Carto, Mapbox, XYZ). Imagery loads
automatically once an authenticated project is selected — there is no
"Load Sentinel" button and no checkbox. Only an opacity control remains.

## Data flow

```
Leaflet map viewport
  → moveend / zoomend events (350 ms debounce)
  → current bounds (padded 15%, max 2°) + map div pixel size
  → width/height clamped to 256–1280 px
  → GET /api/v1/satellite/{project_id}/true-color
      ?west&south&east&north&width&height&start_date&end_date&max_cloud_cover
  → Sentinel Hub Process API (Copernicus Data Space)
      SentinelHubRequest, TRUE_COLOR_EVALSCRIPT (B04/B03/B02),
      DataCollection.SENTINEL2_L2A, size=(width, height)
  → PNG bytes → blob URL → L.imageOverlay(requestedBounds)
```

## Request lifecycle guarantees (frontend/src/App.jsx)

- **Dedup:** identical request key (`projectId:bounds:wxh`) is not re-sent.
- **Cancellation:** superseded in-flight requests are aborted via
  `AbortController`.
- **Stale guard:** each response checks the latest request key; an older
  response is discarded and its blob URL revoked — it can never overwrite
  newer imagery.
- **Cache:** LRU of the last 6 blobs keyed by viewport; cleared on project
  change.
- **Blob cleanup:** previous overlay blob URL is revoked on every
  replacement and on unmount.
- **Listener cleanup:** `moveend zoomend` handlers and debounce timers are
  removed on component unmount.

## Verification results

- Backend tests: **46 passed** (`$env:PYTHONPATH=(Get-Location).Path; pytest -q`).
- Frontend build: **success** (`npm run build`).
- Live API check: same viewport at 256×256 → `image/png` 148,607 bytes;
  at 1024×1024 → `image/png` 2,322,210 bytes — zoom-dependent resolution
  confirmed (real higher-resolution Sentinel render, not bitmap stretching).
- Browser check: login → JWT (`ritam_token`) → project selection → imagery
  auto-loads → zoom/pan trigger new viewport-appropriate Sentinel requests.
- Conventional basemap requests: **0** (verified by source scan — no
  `tileLayer`/OSM/Esri/Carto/Mapbox/ArcGIS URLs exist in frontend src).

## Key files

| File | Role |
|------|------|
| `backend/app/api/v1/endpoints/satellite.py` | `GET /{project_id}/true-color` — project mode (boundary bbox) and viewport mode (west/south/east/north + width/height) |
| `backend/app/services/satellite/sentinel.py` | Sentinel Hub config, Process API requests, PIL PNG encoding |
| `backend/app/models/satellite_scene.py` | Scene metadata persistence |
| `backend/alembic/versions/8f3a2b1c4d5e_add_satellite_scenes.py` | `satellite_scenes` migration |
| `frontend/src/App.jsx` | `requestTrueColor`: dedup, abort, stale guard, LRU cache, blob revocation |
| `frontend/src/components/SpatialMap.jsx` | Viewport pipeline: moveend/zoomend → debounce → bounds/size → request; opacity control; boundary rendering |
| `frontend/src/api/client.js` | `fetchTrueColorOverlay(projectId, start, end, maxcc, width, height, { bounds, signal })` |
