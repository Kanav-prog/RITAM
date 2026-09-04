# SATELLITE ARCHITECTURE AUDIT

**Date:** September 1, 2026
**Status:** AUDIT COMPLETE — CORRECTIONS IN PROGRESS

---

## Current Map Layer

| Item | Detail |
|------|--------|
| **Source** | Esri World Imagery (`server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) |
| **File** | `frontend/src/components/SpatialMap.jsx` (lines 78-83) |
| **Real or Mock?** | REAL Esri imagery — but NOT Sentinel-2 |
| **Labels** | Esri Reference/World_Boundaries_and_Places layer |
| **Dark mode** | CartoDB Dark Matter basemap |
| **Problem** | Labeled "Satellite" in the UI switcher — misleading users into thinking this is Sentinel-2 imagery |

---

## Sentinel-2 Integration

| Item | Detail |
|------|--------|
| **Backend Service** | `backend/app/services/satellite/sentinel.py` |
| **SDK** | `sentinelhub==3.11.5` (Copernicus Data Space) |
| **Config** | `backend/app/core/config.py` — SENTINEL_CLIENT_ID, SENTINEL_CLIENT_SECRET, SENTINEL_TOKEN_URL |
| **API Endpoints** | `GET /api/v1/satellite/{project_id}/scenes` |
| | `GET /api/v1/satellite/{project_id}/ndvi` |
| | `GET /api/v1/satellite/{project_id}/compare` |
| | `GET /api/v1/satellite/{project_id}/history` |
| **Authentication** | Backend-only via SHConfig (credentials never exposed to frontend) |
| **NDVI Formula** | `(B08 - B04) / (B08 + B04)` — CORRECT |
| **Thresholds** | Loss < -0.15, Gain > +0.15 — CORRECT |
| **Imagery rendered on map?** | **NO** — NDVI statistics are returned as JSON, no image overlay |
| **Scene fallback** | `_estimate_scenes()` generates estimated scenes when API fails |

### What Sentinel-2 Service Actually Does
- Calculates NDVI **statistics** (mean, min, max, std) for a project boundary
- Searches available scenes (with fallback estimation)
- Performs before/after NDVI comparison
- Creates ChangeEvent + EvidenceRecord on vegetation loss

### What Sentinel-2 Service Does NOT Do
- Generate image tiles/overlays for map rendering
- Produce RGB visualization images
- Return image URLs for Leaflet tile layers

---

## Mock Data

| File/Component | What is Mocked | Status |
|---------------|----------------|--------|
| `frontend/src/data/mockData.js` | 4 projects, trees, environmental changes, NDVI values | Primary data source |
| `frontend/src/components/MonitoringView.jsx` | Uses `ENVIRONMENTAL_CHANGES` from mockData for change list AND before/after slider (hardcoded NDVI: 0.72, 0.35, 0.78, 0.36, etc.) | **PROBLEM** — Mock NDVI shown as real |
| `frontend/src/components/SatelliteMonitoring.jsx` | Makes REAL API calls to backend | **CORRECT** — but isolated from MonitoringView's main display |
| `frontend/src/components/SpatialMap.jsx` | Renders mock project boundaries/trees from props | Mock data for UI demo — acceptable for non-satellite layers |

### Mock NDVI Values Found in MonitoringView.jsx
- `selectedChange.ndviBefore || 0.72` (line ~140)
- `selectedChange.ndviAfter || 0.35` (line ~140)
- These come from `ENVIRONMENTAL_CHANGES` in mockData.js

### Hardcoded Fake Values in mockData.js
- `ev-01`: ndviBefore: 0.42, ndviAfter: 0.76
- `ev-02`: ndviBefore: 0.78, ndviAfter: 0.36
- `ev-03`: ndviBefore: 0.61, ndviAfter: 0.89
- `ev-04`: ndviBefore: 0.68, ndviAfter: 0.29
- `ev-05`: ndviBefore: 0.24, ndviAfter: 0.58

---

## Architecture Problems

### Problem 1: Esri Imagery Presented as "Satellite"
**SpatialMap.jsx** uses Esri World Imagery as the basemap. The UI switcher labels this as "Satellite". This is NOT Sentinel-2 imagery — it is commercial satellite basemap imagery. Users may confuse it with the project's Sentinel-2 monitoring data.

### Problem 2: MonitoringView Shows Mock NDVI as Real
`MonitoringView.jsx` renders a before/after slider using hardcoded mock NDVI values from `ENVIRONMENTAL_CHANGES`. The UI text says "Sentinel-2 L2A Pre-Construction Canopy" and "PlanetScope 3m Surface Reflectance" — but these are purely cosmetic labels on mock data.

### Problem 3: SatelliteMonitoring is Isolated
The `SatelliteMonitoring.jsx` component makes REAL API calls but is embedded inside `MonitoringView.jsx` as a collapsible panel. The main before/after visualization (the slider) still uses mock data. The real satellite data panel is secondary to the mock visualization.

### Problem 4: No Sentinel-2 Map Overlay
The backend can compute NDVI statistics but cannot produce image tiles for Leaflet rendering. There is no WMS/tile endpoint for Sentinel-2 imagery overlay.

### Problem 5: Misleading UI Labels
- "ORBITAL PIPELINE ACTIVE" badge on MonitoringView — but the pipeline isn't connected to real data display
- "Continuous Sentinel-2 L2A & PlanetScope 3m multispectral anomaly detection" — description suggests real-time monitoring
- Before/after slider labels Sentinel-2 and PlanetScope data that is actually mock

---

## Recommended Final Architecture

```
BASEMAP: OpenStreetMap (standard geographic reference)
OVERLAY: Sentinel-2 NDVI layer (via Sentinel Hub WMS or Process API)
OVERLAY: Project boundary (PostGIS → GeoJSON → Leaflet polygon)
OVERLAY: Change detection zones (from ChangeEvent records)

DATA FLOW:
  Frontend → Backend Satellite API → Sentinel Hub SDK → Copernicus Data Space
                                                    ↓
                                              NDVI Statistics + Scene Metadata
                                                    ↓
                                         ChangeEvent (if vegetation loss)
                                                    ↓
                                         EvidenceRecord (with SHA-256)

MAP LAYERS:
  1. Base Map: OpenStreetMap (always available, no satellite confusion)
  2. Sentinel-2 NDVI: Color-coded vegetation health overlay (when loaded)
  3. Project Boundary: GeoJSON polygon from database
  4. Change Zones: Red (loss) / Green (gain) polygons from ChangeEvent
  5. Tree Markers: Individual tree locations from TreeIdentity

UI PRINCIPLE:
  - Basemap = geographic reference (always present)
  - Sentinel-2 data = separately loaded, clearly labeled layer
  - Mock data = only for demo/fallback, clearly labeled as "DEMO DATA"
```
