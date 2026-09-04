# Sentinel-2 True Color Imagery — Implementation Report

**Date:** September 1, 2026

---

## FILES CREATED

None.

## FILES MODIFIED

| File | Change |
|------|--------|
| `backend/app/api/v1/endpoints/satellite.py` | Added `GET /{project_id}/true-color` endpoint with `TRUE_COLOR_EVALSCRIPT` (B04/B03/B02 RGB). Reuses existing `_get_project_with_boundary()`, `get_sh_config()`, `project_boundary_to_bbox()`, `project_boundary_to_geometry()`, `postgis_geometry_to_geojson()`. Stores scene metadata in `SatelliteScene`. |
| `frontend/src/api/client.js` | Added `fetchTrueColorOverlay()` method with auth token, content-type validation, blob URL creation. |
| `frontend/src/components/SpatialMap.jsx` | Added `trueColorOverlayUrl`, `trueColorOverlayBounds`, `showTrueColorOverlay`, `onToggleTrueColorOverlay`, `trueColorOverlayOpacity`, `onTrueColorOverlayOpacityChange` props. Added `trueColorOverlay` layer group. Added `L.imageOverlay()` useEffect for true-color. Added UI toggle with opacity slider in layers panel. |
| `frontend/src/components/CommandCenter.jsx` | Passes true-color props from App to SpatialMap. |
| `frontend/src/components/SatelliteMonitoring.jsx` | Added `onTrueColorOverlayLoaded` prop. Added "Load Sentinel-2 True Color" button that calls `apiClient.fetchTrueColorOverlay()`. |
| `frontend/src/App.jsx` | Added `trueColorOverlayUrl`, `showTrueColorOverlay`, `trueColorOverlayOpacity` state. Refactored bounds computation into `computeOverlayBounds()`. Passes all true-color props to CommandCenter and MonitoringView. |

## FILES DELETED

None.

---

## BACKEND ENDPOINTS

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `GET /api/v1/satellite/{project_id}/true-color` | GET | Real Sentinel-2 L2A true-color RGB PNG | **NEW** |
| `GET /api/v1/satellite/{project_id}/ndvi-overlay` | GET | Real Sentinel-2 NDVI color-mapped PNG | Existing |
| `GET /api/v1/satellite/{project_id}/ndvi` | GET | NDVI statistics | Existing |
| `GET /api/v1/satellite/{project_id}/scenes` | GET | Scene search | Existing |
| `GET /api/v1/satellite/{project_id}/compare` | GET | Before/after comparison | Existing |
| `GET /api/v1/satellite/{project_id}/history` | GET | Stored scene history | Existing |

---

## SENTINEL HUB ARCHITECTURE

```
Sentinel Hub OAuth2 (credentials in backend/.env)
    ↓
SentinelHubRequest (sentinelhub SDK)
    ↓
Copernicus Data Space → Sentinel-2 L2A
    ↓
    ├── TRUE COLOR: B04/B03/B02 → RGB PNG (TRUE_COLOR_EVALSCRIPT)
    ├── NDVI: B08-B04/B08+B04 → Color-mapped PNG (NDVI_VISUALIZATION_EVALSCRIPT)
    └── NDVI STATS: B08-B04/B04+B08 → Float statistics (NDVI_EVALSCRIPT)
    ↓
Backend encodes PNG via PIL
    ↓
Frontend receives blob URL → Leaflet ImageOverlay
```

---

## TRUE-COLOR IMAGERY FLOW

1. User clicks "Load Sentinel-2 True Color" in SatelliteMonitoring
2. `apiClient.fetchTrueColorOverlay()` → `GET /api/v1/satellite/{id}/true-color` with `Authorization: Bearer` header
3. Backend: `_get_project_with_boundary()` → verifies tenant ownership → loads PostGIS boundary
4. `postgis_geometry_to_geojson()` → `project_boundary_to_bbox()` → Sentinel Hub BBox
5. `SentinelHubRequest` with `TRUE_COLOR_EVALSCRIPT` → B04/B03/B02 → RGB output
6. `DataCollection.SENTINEL2_L2A` → cloud filtering via `maxcc`
7. PIL encodes numpy array → PNG bytes
8. Frontend: blob → `URL.createObjectURL()` → `L.imageOverlay(blobUrl, projectBounds)`
9. Map shows real Sentinel-2 L2A true-color imagery

---

## NDVI FLOW (PRESERVED)

1. User clicks "Calculate NDVI" in SatelliteMonitoring
2. Backend: `SentinelHubRequest` with `NDVI_EVALSCRIPT` → B08-B04/B08+B04 → float statistics
3. `fetchNdviOverlay()` → backend: `NDVI_VISUALIZATION_EVALSCRIPT` → color-mapped PNG
4. Frontend: blob URL → `L.imageOverlay()` with project boundary bounds

---

## MOCK IMAGERY REMOVED

| Item | Status |
|------|--------|
| Esri World Imagery basemap | ✅ Removed — replaced with OpenStreetMap |
| "Satellite" mode label | ✅ Renamed to "Standard Map" |
| Mock NDVI values in MonitoringView slider | ✅ Clearly labeled "DEMO DATA" |
| Silent mock fallback in scene search | ✅ Removed — returns empty list |
| Fake satellite images | ✅ None found in active code |

---

## TESTS PASSED

```
40 passed, 2 warnings in 7.16s
```

## FRONTEND BUILD

```
✓ built in 1.11s (vite v8.2.2)
```

---

## REMAINING BLOCKERS

1. **Sentinel Hub credentials**: Requires valid `SENTINEL_CLIENT_ID` and `SENTINEL_CLIENT_SECRET` in `backend/.env`. Without these, endpoints return 502.

2. **No auth token**: `getAuthToken()` reads from `localStorage.getItem('ritam_token')`. Users must log in first.

3. **Demo projects lack PostGIS boundaries**: Mock projects in `mockData.js` have JS arrays, not PostGIS geometries. Real projects with stored boundaries are needed for the overlay to work.

4. **Pillow dependency**: The true-color endpoint uses PIL. If Pillow is not installed, the endpoint will fail. Verify with `pip install Pillow`.
