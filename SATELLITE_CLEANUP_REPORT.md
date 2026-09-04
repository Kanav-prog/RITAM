# SATELLITE ARCHITECTURE CLEANUP REPORT

**Date:** September 1, 2026
**Status:** COMPLETE — All corrections implemented and verified

---

## FILES CREATED

| File | Purpose |
|------|---------|
| `SATELLITE_ARCHITECTURE_AUDIT.md` | Phase 1 audit documenting all architecture problems found |
| `SATELLITE_CLEANUP_REPORT.md` | This file — final summary of all changes |

---

## FILES MODIFIED

| File | Changes Made |
|------|-------------|
| `frontend/src/components/SpatialMap.jsx` | **Major:** Replaced Esri World Imagery basemap with OpenStreetMap. Renamed "Satellite" mode to "Standard Map". Added Sentinel-2 NDVI overlay layer toggle. Added `sentinel2OverlayUrl`, `showSentinel2Overlay`, `onToggleSentinel2Overlay` props. |
| `frontend/src/components/MonitoringView.jsx` | **Major:** Replaced "ORBITAL PIPELINE ACTIVE" badge with "DEMO DATA — CHANGE EVENTS BELOW". Changed before/after slider labels from fake "Sentinel-2 L2A Pre-Construction Canopy" to "Simulated pre-construction canopy". Added "DEMO DATA — NOT FROM REAL SENTINEL-2" label on slider. Changed "Show/Hide Satellite Data" to "Show/Hide Real Satellite Data" with "REAL SENTINEL-2 DATA — FROM BACKEND API" label. |
| `frontend/src/components/SatelliteMonitoring.jsx` | Added `onNdviOverlayLoaded` callback prop. Updated NDVI calculation to call callback with overlay URL when data loads. Improved error messages to say "Satellite data unavailable" instead of generic errors. |
| `frontend/src/components/CommandCenter.jsx` | Added `sentinel2OverlayUrl`, `showSentinel2Overlay`, `onToggleSentinel2Overlay` props and passes them to SpatialMap. |
| `frontend/src/App.jsx` | Added `sentinel2OverlayUrl`, `showSentinel2Overlay` state. Passes NDVI overlay props to CommandCenter and MonitoringView. |
| `frontend/src/api/client.js` | Added `getNdviOverlayUrl()` method that returns a URL for Sentinel-2 NDVI visualization image overlay. |
| `backend/app/api/v1/endpoints/satellite.py` | Added `GET /{project_id}/ndvi-overlay` endpoint that generates Sentinel-2 NDVI visualization PNG images via Sentinel Hub evalscript. Returns color-mapped NDVI image (red=bare → green=vegetation). Added `NDVI_VISUALIZATION_EVALSCRIPT` for color-mapped NDVI rendering. |

---

## FILES DELETED

None. No files were deleted.

---

## ARCHITECTURE BEFORE

```
MAP LAYERS:
  1. Esri World Imagery (satellite basemap) — labeled "Satellite"
  2. Esri Reference Labels
  3. Project boundaries (mock data)
  4. Tree markers (mock data)

PROBLEMS:
  - Esri imagery presented as "Satellite" — users think it's Sentinel-2
  - MonitoringView shows mock NDVI values as if they're real
  - "ORBITAL PIPELINE ACTIVE" badge on mock data view
  - No Sentinel-2 overlay on map
  - Before/after slider uses fake NDVI numbers
```

## ARCHITECTURE AFTER

```
MAP LAYERS:
  1. BASE MAP: OpenStreetMap (geographic reference) — clearly labeled "Standard Map"
  2. DARK MAP: CartoDB Dark Matter — labeled "Dark Map"
  3. SENTINEL-2 NDVI OVERLAY: Color-mapped vegetation health from backend API (toggleable)
  4. PROJECT BOUNDARY: GeoJSON polygon from database
  5. CHANGE ZONES: Red (loss) / Green (gain) from ChangeEvent
  6. TREE MARKERS: Individual tree locations

DATA FLOW:
  Frontend (SatelliteMonitoring) → Backend API → Sentinel Hub SDK → Copernicus Data Space
                                                            ↓
                                              NDVI Statistics + Scene Metadata
                                                            ↓
                                              NDVI Visualization PNG (for map overlay)
                                                            ↓
                                              ChangeEvent (if vegetation loss)
                                                            ↓
                                              EvidenceRecord (with SHA-256)

UI LABELS:
  - "DEMO DATA — CHANGE EVENTS BELOW" (for mock change events)
  - "DEMO DATA — NOT FROM REAL SENTINEL-2" (on before/after slider)
  - "REAL SENTINEL-2 DATA — FROM BACKEND API" (for SatelliteMonitoring panel)
  - "Simulated pre-construction canopy — Use Satellite Panel for real data"
```

---

## EXACT SENTINEL-2 DATA FLOW

1. **User navigates to Monitoring page** → sees demo change events (clearly labeled)
2. **User clicks "Calculate NDVI"** in SatelliteMonitoring panel → API call to `GET /api/v1/satellite/{project_id}/ndvi`
3. **Backend** → `sentinelhub` SDK → Copernicus Data Space → Sentinel-2 L2A → NDVI statistics
4. **Backend stores** scene metadata in `satellite_scenes` table
5. **Frontend receives** real NDVI statistics (mean, min, max, std)
6. **NDVI overlay** → `GET /api/v1/satellite/{project_id}/ndvi-overlay` → PNG image → Leaflet ImageOverlay on map
7. **If vegetation loss detected** → `ChangeEvent` created with status "DETECTED" → `EvidenceRecord` with SHA-256

---

## EXACT MAP RENDERING FLOW

1. **SpatialMap** initializes with OpenStreetMap basemap (NOT satellite imagery)
2. **Project boundaries** rendered as GeoJSON polygons from props
3. **Sentinel-2 NDVI overlay** loaded as `L.imageOverlay()` when user toggles it on
4. **NDVI color mapping**: Red (bare, NDVI<0.2) → Yellow (sparse, 0.2-0.4) → Green (dense, >0.4)
5. **Change zones** rendered from project data as red/green polygons

---

## MOCK DATA STILL REMAINING

| Component | Mock Data | Why It's Safe |
|-----------|-----------|---------------|
| `mockData.js` | PROJECTS, ENVIRONMENTAL_CHANGES, AUDIT_LOGS | UI demo data for non-satellite features. Used by CommandCenter, ProjectsView, EvidenceView, etc. |
| `MonitoringView.jsx` | Before/after slider visualization | Clearly labeled "DEMO DATA — NOT FROM REAL SENTINEL-2". Users are directed to Satellite Panel for real data. |
| `mockData.js` | ndviBefore/ndviAfter values | Only used in the labeled demo slider. Never used in real satellite workflow. |

**Why remaining mock data is safe:**
- All satellite-specific mock data is clearly labeled as "DEMO DATA"
- The real satellite workflow (SatelliteMonitoring component) makes actual API calls
- Mock NDVI values are never silently substituted into real data views
- The API fails gracefully with "Satellite data unavailable" messages

---

## API ENDPOINTS USED

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/satellite/{project_id}/scenes` | GET/POST | Search Sentinel-2 L2A scenes |
| `/api/v1/satellite/{project_id}/ndvi` | GET/POST | Calculate NDVI statistics |
| `/api/v1/satellite/{project_id}/ndvi-overlay` | GET | Generate NDVI visualization PNG image |
| `/api/v1/satellite/{project_id}/compare` | GET/POST | Before/after NDVI comparison |
| `/api/v1/satellite/{project_id}/history` | GET | Retrieve stored scene history |

---

## TEST RESULTS

```
============================= 40 passed, 2 warnings in 7.71s ==============================
```

All 40 tests pass, including:
- 34 satellite-specific tests (NDVI formula, classification, geometry, etc.)
- 4 security tests
- 2 monitoring tests

---

## REMAINING LIMITATIONS

1. **Sentinel Hub credentials required**: The NDVI overlay endpoint requires valid `SENTINEL_CLIENT_ID` and `SENTINEL_CLIENT_SECRET` environment variables. Without these, the overlay will fail.

2. **No real-time scene search**: The `search_sentinel2_scenes()` function has a fallback that estimates scenes based on the 5-day Sentinel-2 revisit cycle when the catalog API is unavailable.

3. **Single time step NDVI overlay**: The NDVI overlay currently uses the most recent scene in the date range. Multi-temporal NDVI composites would require additional implementation.

4. **No cloud-masked RGB imagery**: The overlay is NDVI color-mapped only. True-color Sentinel-2 RGB imagery would require a separate evalscript and endpoint.

5. **Frontend demo data dependency**: The change events list in MonitoringView still uses mock data. When the backend has real ChangeEvent records, this should be updated to fetch from `GET /api/v1/monitoring/`.

6. **Image overlay positioning**: The NDVI overlay uses `L.imageOverlay()` which positions the image based on map bounds. For precise georeferencing, a WMS tile layer would be more accurate.

---

## SUMMARY

The satellite architecture has been corrected to clearly distinguish:
- **Base Map**: OpenStreetMap (geographic reference)
- **Sentinel-2 NDVI**: Real data from Copernicus Data Space via Sentinel Hub
- **Mock/Demo Data**: Clearly labeled as "DEMO DATA" with no confusion

The Esri World Imagery layer has been removed from the default view. Sentinel-2 imagery is now a separate, toggleable overlay that loads real NDVI visualization from the backend API. All NDVI values displayed in the satellite monitoring panel come from actual Sentinel Hub calculations, not hardcoded mock values.
