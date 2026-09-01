# RITAM — COMPREHENSIVE TECHNICAL AUDIT & SENTINEL-2 INTEGRATION PLAN

**Document Date:** September 1, 2026  
**Status:** Deep Repository Analysis & Implementation Strategy  
**Responsibility:** Sentinel-2 Satellite Integration & Environmental Before/After Verification  
**Platform Name:** Vaanam (RITAM)

---

## EXECUTIVE SUMMARY

### Current State
RITAM is a **half-implemented environmental intelligence platform** with:
- ✅ **Complete database schema** (PostGIS, spatial types, all models)
- ✅ **Solid backend foundation** (FastAPI, async SQLAlchemy, 70% endpoint coverage)
- ✅ **Frontend architecture** (React/Leaflet maps, comprehensive UI)
- ✅ **Mock data layer** (realistic projects, trees, environmental changes)
- ⚠️ **Placeholder endpoints** (many return hardcoded/stub responses)
- ❌ **No Sentinel-2 integration** (not connected despite schema support)
- ❌ **Limited API completeness** (baselines, reports mostly stubs)
- ❌ **No real satellite imagery processing**

### Your Responsibility
Integrate **Sentinel-2 satellite imagery** to enable:
1. **Baseline environmental observation** before mitigation begins
2. **Post-intervention verification** using satellite data
3. **Change detection** between before/after states
4. **NDVI/vegetation metrics** to support compliance verification
5. **End-to-end flow:** Project AOI → Sentinel-2 search → baseline image → post-intervention image → change detection → evidence → compliance

### MVP Target
**Functional satellite evidence chain** for ONE test project:
- Retrieve project boundary (AOI)
- Search suitable Sentinel-2 imagery
- Calculate NDVI (Normalized Difference Vegetation Index)
- Perform before/after comparison
- Store results as evidence in database
- Display in frontend

---

## PART 1: REPOSITORY INVENTORY & STRUCTURE

### Current Git State
```
Branch: master
Status: Clean working tree (nothing to commit)
Remote: origin/master (up to date)
```

### Complete Repository Tree
```
c:\Users\MANIK MEHRA\RITAM/
├── agents.md                           # Agent directives
├── docker-compose.yml                  # Local PostgreSQL + MinIO
├── implmentation.md                    # Technical specification
│
├── docs/
│   ├── architecture.md                 # High-level system design
│   ├── prd.md                          # Product requirements
│   └── userflow.md                     # UI/UX screen flows
│
├── backend/
│   ├── alembic.ini                     # Migration configuration
│   ├── requirements.txt                # Python dependencies
│   │
│   ├── alembic/
│   │   ├── env.py                      # Migration environment
│   │   ├── script.py.mako              # Migration template
│   │   └── versions/
│   │       └── 7e114bad7185_initial_schema.py  # COMPLETE SCHEMA
│   │
│   ├── app/
│   │   ├── main.py                     # FastAPI app entry
│   │   │
│   │   ├── core/
│   │   │   ├── config.py               # Environment config
│   │   │   ├── database.py             # AsyncSession factory
│   │   │   └── security.py             # OAuth2/JWT
│   │   │
│   │   ├── api/
│   │   │   ├── deps.py                 # Dependency injection
│   │   │   └── v1/
│   │   │       ├── api.py              # Router aggregation
│   │   │       └── endpoints/
│   │   │           ├── auth.py         # LOGIN/REGISTER (IMPLEMENTED)
│   │   │           ├── projects.py     # Projects API (PARTIAL)
│   │   │           ├── baselines.py    # STUB
│   │   │           ├── monitoring.py   # Change events (PARTIAL)
│   │   │           ├── field.py        # Tree verification (PARTIAL)
│   │   │           ├── compliance.py   # Compliance calc (STUB)
│   │   │           ├── actions.py      # Mitigation actions (PARTIAL)
│   │   │           └── reports.py      # MISSING
│   │   │
│   │   ├── models/
│   │   │   ├── base.py                 # BaseModel with UUID/timestamps
│   │   │   ├── user.py                 # User entity
│   │   │   ├── organization.py         # Org entity
│   │   │   ├── project.py              # Project + boundary (MULTIPOLYGON)
│   │   │   ├── baseline.py             # Baseline + spatial_data
│   │   │   ├── change_event.py         # Change detection results
│   │   │   ├── evidence_record.py      # Evidence with SHA-256
│   │   │   ├── mitigation_action.py    # Plantation/restoration
│   │   │   ├── tree_identity.py        # Individual trees with GPS
│   │   │   └── audit_log.py            # Immutable audit trail
│   │   │
│   │   ├── services/
│   │   │   └── compliance_engine.py    # Business logic (REAL)
│   │   │
│   │   └── __init__.py
│   │
│   ├── tests/
│   │   ├── test_compliance.py          # Unit tests (REAL)
│   │   ├── test_monitoring.py          # STUB
│   │   ├── test_security.py            # STUB
│   │   └── conftest.py                 # MISSING
│   │
│   └── __init__.py
│
├── frontend/
│   ├── package.json                    # Node dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── index.html
│   ├── README.md
│   │
│   ├── public/                         # Static assets
│   │
│   ├── src/
│   │   ├── main.jsx                    # React entry
│   │   ├── App.jsx                     # Main app router
│   │   ├── App.css                     # Global styles
│   │   ├── index.css                   # Tailwind/CSS vars
│   │   │
│   │   ├── api/
│   │   │   └── client.js               # API wrapper (graceful fallback)
│   │   │
│   │   ├── data/
│   │   │   └── mockData.js             # COMPREHENSIVE MOCK (8 projects, 800+ trees)
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.jsx             # Left navigation
│   │   │   ├── TopCommandBar.jsx       # Search + settings
│   │   │   ├── CommandCenter.jsx       # Main dashboard
│   │   │   ├── SpatialMap.jsx          # Leaflet map (REAL IMPLEMENTATION)
│   │   │   ├── ProjectsView.jsx        # Project list
│   │   │   ├── ProjectDetailModal.jsx  # Project details
│   │   │   ├── ProjectInfoPanel.jsx    # Project sidebar
│   │   │   ├── MonitoringView.jsx      # Change detection UI
│   │   │   ├── EnvironmentalChanges.jsx# Change events list
│   │   │   ├── EcozonesView.jsx        # Ecozone monitoring
│   │   │   ├── EvidenceView.jsx        # SHA-256 evidence vault
│   │   │   ├── EvidenceDetailModal.jsx # Evidence detail
│   │   │   ├── AnalyticsView.jsx       # Analytics dashboard
│   │   │   ├── CompensationView.jsx    # Compensation view
│   │   │   ├── AskRitamView.jsx        # LLM assistant
│   │   │   └── ...other components
│   │   │
│   │   └── assets/                     # Images, icons
│
└── RITAM/                              # (Empty placeholder)

```

### Key Technology Stack (VERIFIED FROM CODE)

**Backend**
- ✅ Python 3.11+ (requirements.txt)
- ✅ FastAPI (async)
- ✅ Uvicorn ASGI server
- ✅ SQLAlchemy 2.0 (AsyncIO mode)
- ✅ GeoAlchemy2 (PostGIS integration)
- ✅ Shapely (geometry operations)
- ✅ Pydantic (data validation)
- ✅ Alembic (migrations)
- ✅ python-jose + bcrypt (auth)
- ✅ asyncpg (PostgreSQL async driver)

**Frontend**
- ✅ React 18+
- ✅ Vite (build tool)
- ✅ Leaflet.js (maps)
- ✅ lucide-react (icons)
- ✅ CSS Variables + responsive design

**Infrastructure**
- ✅ PostgreSQL 16 + PostGIS (via docker-compose.yml)
- ✅ MinIO S3-compatible (object storage)

---

## PART 2: DATABASE & POSTGIS AUDIT

### Database Schema Analysis

All models are **fully defined and migrated** (Alembic migration: `7e114bad7185_initial_schema.py`)

| Model | Type | Spatial Data | Purpose | Satellite Relevant |
|-------|------|--------------|---------|-------------------|
| **Project** | Entity | `boundary` (MULTIPOLYGON, SRID 4326) | Infrastructure/project AOI | ✅ YES — Primary AOI for search |
| **Baseline** | Entity | `spatial_data` (MULTIPOLYGON, SRID 4326) | Pre-intervention environmental snapshot | ✅ YES — Baseline imagery anchor |
| **ChangeEvent** | Entity | `location` (POLYGON, SRID 4326) | Detected changes (detected location) | ✅ YES — Satellite-derived changes |
| **EvidenceRecord** | Entity | `location` (POINT, SRID 4326) | Field/satellite evidence link | ✅ YES — Can store satellite metadata |
| **MitigationAction** | Entity | `location` (POLYGON, SRID 4326) | Plantation/restoration zones | ✅ PARTIAL — Monitors outcomes |
| **TreeIdentity** | Entity | `location` (POINT, SRID 4326) | Individual tree GPS + status | ⚠️ LIMITED — Individual trees not detectable by Sentinel-2 (10m resolution) |
| **Organization** | Entity | — | Tenant container | ✅ Tenant isolation |
| **User** | Entity | — | Authentication | — |
| **AuditLog** | Entity | — | Immutable audit trail | ✅ Can log all satellite operations |

### Spatial Capabilities (VERIFIED)

✅ **SRID 4326** — WGS84 (global coordinates)  
✅ **PostGIS geometry types** — POINT, POLYGON, MULTIPOLYGON  
✅ **Spatial indexes** — GIST indexes on geometry columns (migration shows cleanup)  
✅ **Geometry validation** — `ST_IsValid()` used in projects.py  
✅ **Area calculation** — `ST_Area()` with geography cast for hectares  
✅ **GeoJSON support** — `ST_GeomFromGeoJSON()` in projects endpoint  

### Evidence Model Design

**EvidenceRecord** is the **key model for satellite data storage**:
```python
class EvidenceRecord(BaseModel):
    entity_id: String        # e.g., project_id, baseline_id
    entity_type: String      # e.g., 'Baseline', 'SatelliteScene'
    evidence_type: String    # 'Photo', 'Satellite', 'Document'
    url: String              # MinIO path or Sentinel API reference
    file_hash_sha256: String # Cryptographic proof
    metadata_json: JSON      # NDVI, cloud%, acquisition date, etc.
    location: POINT (4326)   # Scene centroid
    uploaded_by: UUID FK     # User who submitted
```

**Unused but important:** `metadata_json` field can store:
- Satellite scene ID
- Acquisition date
- Cloud coverage %
- NDVI value
- EVI value
- Vegetation index metadata
- Processing date
- Data source attribution

---

## PART 3: BACKEND ARCHITECTURE AUDIT

### Current State: 70% Implemented

#### Implemented/Functional
- ✅ **auth.py** — Full login/register with JWT tokens
- ✅ **projects.py** — Create project with GeoJSON boundary, list projects
- ✅ **field.py** — Tree recording with SHA-256, tree verification endpoint
- ✅ **monitoring.py** — List change events, review decision workflow
- ✅ **actions.py** — List mitigation actions, update quantities
- ✅ **compliance.py** — Compliance calculation (calls service)
- ✅ **compliance_engine.py** — Real business logic (survival rate, verification rate, compliance scoring)
- ✅ **security.py** — Password hashing, JWT creation, token verification
- ✅ **database.py** — AsyncSession factory, proper engine configuration
- ✅ **core/deps.py** — Dependency injection for auth

#### Partial/Incomplete
- ⚠️ **projects.py** — create_project has incomplete geometry assignment (comments suggest params not being passed correctly)
- ⚠️ **field.py** — tree recording doesn't commit to DB (placeholder mitigation_action_id)
- ⚠️ **monitoring.py** — Only GET and POST review; no filtering or detail endpoints

#### Stub/Placeholder
- ❌ **baselines.py** — Two empty endpoints returning strings
- ❌ **reports.py** — Not present (may be missing)
- ❌ **test files** — Mostly stubs except test_compliance.py

#### Missing Services
- ❌ **Sentinel-2 search service** — Not present
- ❌ **NDVI calculation service** — Not present
- ❌ **Image processing service** — Not present
- ❌ **Before/after comparison service** — Not present
- ❌ **Raster handling** — No GeoTIFF/raster I/O

### API Endpoint Analysis

| Method | Path | Status | Purpose |
|--------|------|--------|---------|
| **POST** | /auth/login | ✅ IMPLEMENTED | OAuth2 token flow |
| **POST** | /auth/register | ✅ IMPLEMENTED | User registration |
| **GET** | /projects/ | ✅ IMPLEMENTED | List projects (with org filter) |
| **POST** | /projects/ | ⚠️ PARTIAL | Create project (geometry handling incomplete) |
| **GET** | /baselines/ | ❌ STUB | Placeholder |
| **POST** | /baselines/ | ❌ STUB | Placeholder |
| **GET** | /monitoring/ | ✅ IMPLEMENTED | List change events |
| **POST** | /monitoring/{id}/review | ✅ IMPLEMENTED | Review change (creates mitigation action) |
| **GET** | /field/trees/record | ❌ MISSING | No GET, only POST |
| **POST** | /field/trees/record | ⚠️ PARTIAL | Record tree (no commit, placeholder FK) |
| **POST** | /field/trees/{tag}/verify | ✅ IMPLEMENTED | Verify tree (stub body but endpoint exists) |
| **GET** | /compliance/{project_id} | ✅ IMPLEMENTED | Get compliance status |
| **GET** | /actions/ | ✅ IMPLEMENTED | List mitigation actions |
| **PATCH** | /actions/{id} | ✅ IMPLEMENTED | Update action quantities |
| **GET** | /reports/ | ❌ MISSING | Not implemented |

---

## PART 4: FRONTEND AUDIT

### Component Status

| Component | Purpose | Mock/Real | Status |
|-----------|---------|-----------|--------|
| **SpatialMap.jsx** | Leaflet.js map renderer | REAL (Mock data input) | ✅ Fully implemented — renders projects, trees, ecozones, change zones |
| **CommandCenter.jsx** | Main dashboard grid | REAL + Mock | ✅ Complete — shows map + panels |
| **ProjectsView.jsx** | Project list/card view | Mock + API fallback | ✅ Implemented |
| **MonitoringView.jsx** | Change detection UI | MOCK | ✅ Displays mock changes with before/after slider |
| **EnvironmentalChanges.jsx** | Change events list | MOCK | ✅ Displays mock environmental changes |
| **EvidenceView.jsx** | SHA-256 vault + verifier | MOCK | ✅ Displays mock audit logs + hash validator |
| **EcozonesView.jsx** | Ecozone monitoring | MOCK | ✅ Renders ecozone boundaries + stats |
| **ProjectDetailModal.jsx** | Full project details | MOCK | ✅ Shows comprehensive project info |
| **AnalyticsView.jsx** | Analytics dashboard | MOCK | Partial — displays mock stats |
| **AskRitamView.jsx** | LLM assistant UI | MOCK | Stub — AI integration not implemented |

### API Client (client.js) Status

The frontend API client has **graceful degradation**:
```javascript
// Example: getProjects()
try {
  const response = await fetch(`${API_BASE_URL}/projects/`);
  return await response.json();
} catch (err) {
  console.warn('Backend connection warning, using localized cache:', err.message);
  return null;  // Caller then uses mockData as fallback
}
```

**Current API status:**
- If backend is offline → frontend uses mock data
- If backend is online → frontend uses API (but many endpoints return stubs)
- No detection mechanism for "backend is online but endpoint is incomplete"

### Map Implementation (SpatialMap.jsx)

**REAL spatial features:**
- Leaflet.js renderer with 2 tile layers (satellite + labels, dark mode option)
- Project boundary polygon rendering with fill/stroke
- Ecozone boundary rendering (dashed, different color)
- Individual tree markers (microTrees) with click handling
- Boundary corner markers (cadastral points)
- Vegetation zones (polygons)
- Change zones (loss/restoration colored differently)
- Plantation zones (planted areas)

**Layer control:**
- Toggle each layer group on/off
- Zoom levels 5-19 (locked to India bounds)
- Tooltip/popup on hover/click

**Limitations:**
- No raster imagery overlay (no satellite images displayed)
- Polygons are GeoJSON hardcoded in mockData.js
- No WMS/tile server for satellite imagery

---

## PART 5: CURRENT DATA FLOW ANALYSIS

### Real Data Flow (When Backend is Online)

```
Frontend User Action
  ↓
React State Update
  ↓
API Client (client.js)
  ↓
FastAPI Router (/api/v1/...)
  ↓
Endpoint Handler (e.g., projects.py)
  ↓
SQLAlchemy Query
  ↓
PostgreSQL + PostGIS
  ↓
Response (JSON or error)
  ↓
Frontend renders
```

**Actual coverage:** auth (complete), projects list/create (mostly), monitoring (partial), actions (complete), compliance (complete as calculation, incomplete as data source)

### Mock Data Flow (When Backend is Offline or Unused)

```
Frontend loads mockData.js
  ↓
App state initialized with INITIAL_PROJECTS
  ↓
SpatialMap renders hardcoded boundaries
  ↓
MonitoringView displays hardcoded ENVIRONMENTAL_CHANGES
  ↓
EvidenceView displays hardcoded AUDIT_LOGS + GEOTAGGED_TREES
  ↓
User sees complete demo experience
```

**Mock data completeness:**
- ✅ 8 projects with full details
- ✅ 200+ individual trees with coordinates
- ✅ 5 environmental changes with NDVI before/after
- ✅ 4 audit log entries
- ✅ Project boundaries, ecozones, plantation zones

### Environmental Data Flow (Mock)

```
ENVIRONMENTAL_CHANGES (mock data)
  ├── ev-01: Ecozone expansion (+6.4 ha, NDVI +0.34)
  ├── ev-02: Vegetation loss (-2.1 ha, NDVI -0.42)  [Action required]
  ├── ev-03: Ecozone expansion (+14.2 ha, NDVI +0.28)
  ├── ev-04: Corridor fragmentation (-3.8 ha, EVI anomaly) [Critical]
  └── ev-05: Restoration (+3.1 ha, NDVI +0.34)

Each change has:
- project_id (links to project)
- type (LOSS, ECOZONE_EXPANSION, RESTORATION)
- area_hectares
- coordinates (lat, lng)
- confidence percentage
- sensor source
- NDVI before/after
- SHA-256 hash
- verification status
- action_needed flag
```

**Reality check:** All environmental changes are **manually crafted mock data**. None are derived from real Sentinel-2 imagery.

---

## PART 6: MOCK VS REAL FUNCTIONALITY MATRIX

| Feature | Implemented | Real | Mock | Status |
|---------|-----------|------|------|--------|
| User authentication | ✅ | ✅ | — | READY |
| Create project | ✅ | ⚠️ | — | PARTIAL (geometry issue) |
| List projects | ✅ | ✅ | Fallback | READY |
| Project boundaries (display) | ✅ | ⚠️ | ✅ | Mock primary |
| Baselines | ✅ | ❌ | ✅ | MOCK ONLY |
| Environmental changes | ✅ | ❌ | ✅ | MOCK ONLY |
| Change event review | ✅ | ✅ | — | READY |
| Tree recording | ✅ | ⚠️ | ✅ | PARTIAL + Mock |
| Tree verification | ✅ | ✅ (stub) | ✅ | Both incomplete |
| Mitigation actions | ✅ | ✅ | ✅ | READY |
| Compliance calculation | ✅ | ✅ | — | READY |
| **Sentinel-2 imagery search** | ❌ | ❌ | ❌ | **MISSING** |
| **NDVI calculation** | ❌ | ❌ | ❌ | **MISSING** |
| **Before/after comparison** | ⚠️ | ❌ | ✅ | Mock only |
| **Raster processing** | ❌ | ❌ | ❌ | **MISSING** |
| Reports | ❌ | ❌ | ❌ | **MISSING** |

---

## PART 7: SENTINEL-2 GAP ANALYSIS

### Current Capability vs Required

| Requirement | Already Exists? | Where | Missing Piece | Priority |
|-------------|----------------|-------|----------------|----------|
| **Project AOI (boundary)** | ✅ | Project.boundary (MULTIPOLYGON) | None — ready to use | — |
| **AOI retrieval** | ✅ | GET /projects/{id} (needs endpoint) | Need detail endpoint | HIGH |
| **Sentinel-2 scene search** | ❌ | None | Complete search service | HIGH |
| **Cloud filtering** | ❌ | None | Cloud % threshold logic | MEDIUM |
| **Image date range** | ❌ | None | Date picker input + filtering | MEDIUM |
| **NDVI calculation** | ❌ | None | Raster math module | HIGH |
| **Before/after storage** | ⚠️ | Baseline + ChangeEvent (schema supports) | Link satellite scenes to models | HIGH |
| **Verification storage** | ✅ | ChangeEvent + EvidenceRecord | Schema ready; need API | MEDIUM |
| **Satellite evidence linking** | ⚠️ | EvidenceRecord.entity_type, metadata_json | Need to define "SatelliteScene" entity_type | MEDIUM |
| **Map imagery overlay** | ❌ | SpatialMap.jsx exists | WMS/tile server or raster layer | MEDIUM |
| **Compliance verification** | ✅ | ComplianceEngine | Already calculates survival/verification rates | — |
| **Database persistence** | ✅ | All models exist | No new tables needed | — |

### Sentinel-2 Integration Dependency Chain

```
1. Project AOI (EXISTS)
   ↓
2. Sentinel-2 Search Service (MISSING)
   ├─ Inputs: Lat/Lng bounds, date range, cloud %
   ├─ Outputs: Scene list with metadata
   └─ Technology: Sentinel Hub API or Google Earth Engine
   ↓
3. Image Retrieval (MISSING)
   ├─ Download or stream image
   ├─ Extract bands (B4, B8 for NDVI)
   └─ Store in MinIO or temporary cache
   ↓
4. Preprocessing (MISSING)
   ├─ Cloud masking
   ├─ Atmospheric correction (L2A already corrected)
   ├─ Reprojection if needed
   └─ Clip to AOI
   ↓
5. NDVI Calculation (MISSING)
   ├─ Formula: (NIR - Red) / (NIR + Red)
   ├─ Output: Float raster [-1, +1]
   └─ Store result in database or object storage
   ↓
6. Before/After Comparison (MISSING)
   ├─ Baseline image (from past Sentinel-2 scene)
   ├─ Current image (recent Sentinel-2 scene)
   ├─ Calculate difference: Current NDVI - Baseline NDVI
   └─ Classify changes (loss, gain, stable)
   ↓
7. ChangeEvent Creation (PARTIAL)
   ├─ Inputs: Change detection results
   ├─ Schema: Already designed
   ├─ Endpoint: GET/POST /monitoring/ exists
   └─ Missing: Automatic creation from satellite
   ↓
8. Evidence Recording (READY)
   ├─ Store satellite scene metadata in EvidenceRecord
   ├─ Link to ChangeEvent or Baseline
   └─ SHA-256 hash of image
   ↓
9. API Exposure (PARTIAL)
   ├─ Endpoint for satellite baseline
   ├─ Endpoint for satellite change detection
   └─ Need new endpoints
   ↓
10. Frontend Display (PARTIAL)
    ├─ MonitoringView exists (designed for display)
    ├─ Map overlay missing
    └─ Before/after comparison UI exists (mock)
```

---

## PART 8: TREE TRACKING: SATELLITE VS FIELD REALITY CHECK

### What Sentinel-2 Can Detect (10m resolution)

✅ **Area-level metrics:**
- Vegetation coverage percentage
- Vegetation health proxy (NDVI, EVI)
- Canopy density change
- Large-scale tree loss/gain (>0.1 ha)
- Seasonal variation

✅ **Temporal changes:**
- Before/after plantation status
- Canopy closure progression over months/years
- Recovery trajectory

⚠️ **At edge of capability:**
- Plot-level changes (Sentinel-2 B4, B8 are 10m, but multispectral fusion can reach ~5m estimates)
- Plantation vs natural regeneration distinction
- Species identification (limited)

### What Sentinel-2 Cannot Reliably Detect

❌ **Individual trees:**
- Sentinel-2 10m resolution = each pixel is ~100 m² area
- Minimum detectable crown size: ~5-10 trees minimum in one pixel
- **Impossible to identify single trees**

❌ **Tree health details:**
- Species
- Height
- Girth / DBH
- Pest/disease status
- Survival individual status

❌ **Within-canopy detail:**
- Understory vegetation
- Deadfall assessment
- Plantation layout precision

### RITAM Architecture Reality

The current RITAM model **mixes two scales:**

```
TreeIdentity (Field-level):
  - Individual tree GPS (POINT)
  - Species
  - Survival status
  → Information source: Field verification, GPS tagging

Satellite-level:
  - Project area (MULTIPOLYGON)
  - Vegetation index
  - Canopy change
  → Information source: Sentinel-2 (10m resolution)
```

**Correct usage pattern:**
1. **Baseline** = Sentinel-2 NDVI + canopy closure at project start
2. **Field trees** = Ground-truth for plot verification
3. **Post-intervention** = Sentinel-2 NDVI at plantation locations (shows canopy development)
4. **Compliance** = "Did planted area show vegetation recovery?" (satellite) + "Are individual trees surviving?" (field)

**Do NOT claim:**
- Sentinel-2 identified specific trees
- Individual tree survival from satellite alone
- Species identification from satellite

**DO leverage:**
- Plantation area recovery trajectory
- Vegetation comeback in restoration zones
- Large-scale environmental change
- Complementary evidence to field surveys

---

## PART 9: BEFORE/AFTER VERIFICATION ARCHITECTURE

### Current Schema Support

**Baseline model** (represents "before" state):
```python
class Baseline:
    project_id: FK → Project
    estimated_trees: int
    green_cover_percentage: float
    vegetation_condition: string
    sensitive_zones_count: int
    spatial_data: GEOMETRY(MULTIPOLYGON)  # Pre-intervention environment
    
    created_at, updated_at: TIMESTAMP
```

**ChangeEvent model** (represents detected changes):
```python
class ChangeEvent:
    project_id: FK → Project
    indicator: string  # e.g., "Vegetation"
    change_type: string  # e.g., "Decrease", "Increase"
    severity: string
    confidence: float
    status: string  # DETECTED, CONFIRMED, REJECTED
    location: GEOMETRY(POLYGON)
    evidence_data: JSON  # Can store NDVI, dates, etc.
    
    created_at, updated_at: TIMESTAMP
```

**MitigationAction model** (represents intervention):
```python
class MitigationAction:
    project_id: FK → Project
    action_type: string  # "Plantation", "Restoration"
    target_quantity: int
    completed_quantity: int
    verified_quantity: int
    surviving_quantity: int
    location: GEOMETRY(POLYGON)
    status: ActionStatus  # PLANNED → IN_PROGRESS → COMPLETED → VERIFIED
    deadline: TIMESTAMP
    
    created_at, updated_at: TIMESTAMP
    
    trees: Relationship → TreeIdentity[]
```

### Complete Before/After Flow

```
1. PRE-INTERVENTION STATE
   ├─ Baseline created (from field survey or satellite)
   │  └─ Baseline.green_cover_percentage = 45%
   │  └─ Baseline.spatial_data = original vegetation area
   │  └─ Baseline.created_at = T0
   │
   ├─ Satellite baseline (new)
   │  └─ Sentinel-2 scene at T0
   │  └─ NDVI baseline calculated
   │  └─ Stored in EvidenceRecord
   │
   └─ Store: Baseline, EvidenceRecord with satellite metadata

2. INTERVENTION
   ├─ MitigationAction created
   │  └─ action_type = "Plantation"
   │  └─ target_quantity = 42,000 trees
   │  └─ location = plantation zone
   │
   └─ Field team plants trees (TreeIdentity records created)

3. POST-INTERVENTION STATE (Weeks/Months Later)
   ├─ Satellite image acquired at T1
   │  └─ Sentinel-2 scene at T1
   │  └─ NDVI calculated
   │
   ├─ Change detection (T1 vs T0)
   │  └─ Δ NDVI = NDVI(T1) - NDVI(T0)
   │  └─ Positive delta = vegetation recovery
   │  └─ Confidence based on atmospheric effects, cloud cover
   │
   ├─ ChangeEvent created
   │  └─ change_type = "Increase"
   │  └─ severity = based on Δ NDVI magnitude
   │  └─ evidence_data = {"ndvi_before": 0.42, "ndvi_after": 0.68, "sensor": "Sentinel-2"}
   │
   ├─ Field verification
   │  └─ Team verifies trees in field
   │  └─ Updates MitigationAction quantities
   │
   └─ Store: ChangeEvent, EvidenceRecord

4. COMPLIANCE VERIFICATION
   ├─ ComplianceEngine.assess_compliance_status()
   │  ├─ survival_rate = verified_surviving / verified_planted
   │  ├─ verification_rate = verified_planted / target_planted
   │  └─ Status = COMPLIANT if both thresholds met
   │
   └─ Output: Pass/Fail with evidence trail

5. IMMUTABLE RECORD
   └─ AuditLog entry for each decision
      └─ SHA-256 hash of satellite scene
      └─ Timestamp, actor, details
```

### Frontend Display Integration

**MonitoringView.jsx** is already designed for before/after:
- Left: Change events list (source data)
- Right: Before/after slider (scrubby timeline)
- Shows NDVI values
- Displays satellite sensor info

**No changes needed to UI layout** — just needs real satellite data instead of mock.

---

## PART 10: SENTINEL-2 DATA ACCESS RESEARCH

### Free Sentinel-2 Data Sources (for MVP)

#### Option A: Google Earth Engine API (RECOMMENDED FOR MVP)

**Pros:**
- ✅ Free access to Sentinel-2 data
- ✅ Pre-processed and quality-controlled
- ✅ REST API + Python library (ee)
- ✅ Cloud masking included
- ✅ AOI-based search
- ✅ Band access (B4 red, B8 NIR for NDVI)
- ✅ Handles atmospheric correction
- ✅ Supports time series
- ✅ India coverage excellent

**Cons:**
- ⚠️ Requires Google account + sign-up
- ⚠️ Computational resource limits (free tier)
- ⚠️ Python ee library has learning curve
- ⚠️ Data served via Earth Engine; not raw download

**Integration complexity:** MEDIUM  
**Recommended:** YES — Use for MVP

#### Option B: Sentinel Hub (Copernicus)

**Pros:**
- ✅ Official ESA Sentinel program
- ✅ Free tier available (limited requests)
- ✅ REST API
- ✅ India coverage
- ✅ True Sentinel-2 L2A (BOA reflectance)

**Cons:**
- ⚠️ Limited free API quota
- ⚠️ Registration required
- ⚠️ Paid for higher volumes

**Integration complexity:** MEDIUM  
**Recommended:** Secondary option

#### Option C: Microsoft Planetary Computer

**Pros:**
- ✅ Free STAC API access to Sentinel-2
- ✅ No quota limits
- ✅ India coverage
- ✅ REST/Python library access

**Cons:**
- ⚠️ Newest service (less documentation)
- ⚠️ Smaller ecosystem

**Integration complexity:** MEDIUM  
**Recommended:** Alternative if GEE insufficient

#### Option D: USGS Earth Explorer (Landsat, NOT Sentinel-2)

**Pros:**
- ✅ Free
- ✅ Established

**Cons:**
- ❌ 30m resolution (too coarse for plantation detail)
- ❌ Not Sentinel-2 (not your requirement)

**Recommendation:** SKIP

### MVP Recommendation

**Use: Google Earth Engine (Python ee library)**

```python
# Conceptual MVP flow
import ee
ee.Authenticate()  # One-time OAuth
ee.Initialize()

# Define project AOI
aoi = ee.Geometry.Rectangle([77.44, 28.58, 77.68, 28.84])  # Project boundary

# Search Sentinel-2 L2A (BOA reflectance)
collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
    .filterBounds(aoi) \
    .filterDate('2024-01-01', '2024-06-30') \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
    .select(['B4', 'B8'])  # Red, NIR

# Calculate NDVI
def add_ndvi(image):
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    return image.addBands(ndvi)

ndvi_collection = collection.map(add_ndvi)

# Get baseline (earliest cloud-free image)
baseline_image = ndvi_collection.first()
baseline_ndvi = baseline_image.select('NDVI')

# Get current (latest cloud-free image)
current_image = ndvi_collection.sort('system:time_start', False).first()
current_ndvi = current_image.select('NDVI')

# Calculate change
ndvi_diff = current_ndvi.subtract(baseline_ndvi)

# Export to GeoTIFF or extract statistics
stats = ndvi_diff.reduceRegion(ee.Reducer.mean(), aoi, 10).getInfo()
# stats['NDVI'] = mean change
```

---

## PART 11: REQUIRED DEPENDENCIES

### Python Backend (requirements.txt additions)

**For Sentinel-2 Integration:**

```
# Google Earth Engine (MVP)
google-auth-httplib2==0.2.0
google-auth-oauthlib==1.1.0
google-cloud-auth==2.25.0
earthengine-api==0.1.387  # Latest version

# Alternative: Sentinel Hub
sentinelhub==3.9.1

# Raster processing
rasterio==1.3.8  # GeoTIFF I/O
xarray==2023.12.0  # Multi-dimensional arrays
rioxarray==0.14.3  # Xarray-rasterio integration
numpy==1.26.2
scipy==1.11.4  # Scientific computing

# Geospatial processing
fiona==1.9.5  # Shape file / GIS I/O
pyproj==3.6.1  # Coordinate reference systems

# Image utilities
Pillow==10.1.0  # PIL for image manipulation

# Async HTTP
httpx==0.25.2  # Already in requirements for async

# Optional: caching
redis==5.0.1  # Cache satellite scene metadata
```

**Environment variables:**

```
EARTH_ENGINE_PRIVATE_KEY=<JSON key from GCP>
EARTH_ENGINE_PROJECT_ID=<GCP project>
```

### Frontend Dependencies

**Already included:**
- leaflet.js ✅
- React ✅

**Potentially useful additions (optional for MVP):**
- `leaflet-image` — Capture map as PNG (not needed initially)
- `georaster` — Client-side raster visualization (not needed initially)

### Docker Services

**docker-compose.yml updates:**

Currently has PostgreSQL + PostGIS + MinIO.

**Additions needed:**
- None for MVP (Earth Engine is cloud-based, no local service needed)
- Optional: Redis for caching satellite metadata

---

## PART 12: SECURITY & ENVIRONMENT VARIABLES

### Current Auth Pattern

```python
# backend/app/core/security.py
OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
verify_password(plain_password, hashed_password)
create_access_token(subject=user_id, expires_delta=timedelta)
```

**Current flow:**
1. User login → password verified
2. JWT token generated with user ID
3. Token stored in frontend localStorage
4. Token sent in Authorization header on subsequent requests

### Satellite Credential Management

**NEVER expose satellite API keys in frontend.**

**Correct pattern:**

```
Frontend (React)
  ↓ POST /api/v1/satellite/search-imagery
  ↓ (User is authenticated; token included)
  ↓
Backend (FastAPI)
  ├─ Verify token
  ├─ Extract user.org_id
  ├─ Retrieve satellite credential from env (EARTH_ENGINE_PRIVATE_KEY)
  ├─ Call Earth Engine API (server-side)
  ├─ Query Sentinel-2 (server-side)
  ├─ Return results to frontend
  └─ Results filtered by org_id (tenant isolation)
```

**Implementation:**

```python
# backend/app/core/config.py
class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    EARTH_ENGINE_PRIVATE_KEY: str = os.getenv("EARTH_ENGINE_PRIVATE_KEY")  # JSON
    EARTH_ENGINE_PROJECT_ID: str = os.getenv("EARTH_ENGINE_PROJECT_ID")
    # Never expose in frontend

# backend/app/api/v1/endpoints/satellite.py
@router.get("/search-imagery")
async def search_sentinel2_imagery(
    project_id: str,
    start_date: str,  # "2024-01-01"
    end_date: str,
    cloud_percent: int = 20,  # Default 20% cloud max
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    # Verify user owns project (org_id check)
    project = await verify_project_ownership(project_id, current_user, db)
    if not project:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Call Earth Engine (server-side only)
    scenes = await earth_engine_search(
        boundary=project.boundary,
        start_date=start_date,
        end_date=end_date,
        cloud_percent=cloud_percent
    )
    
    # Return to frontend (safe)
    return {"scenes": scenes}
```

**Environment file (.env.local or .env):**
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/ritam
EARTH_ENGINE_PRIVATE_KEY='{"type": "service_account", "project_id": ..., "private_key": "..."}'
EARTH_ENGINE_PROJECT_ID=your-gcp-project-id
```

**Never commit .env to git.**

---

## PART 13: TESTING PLAN

### Unit Tests Needed

**Satellite Service**
```python
# backend/tests/test_satellite.py

def test_earth_engine_search():
    """Verify Earth Engine search returns scenes with metadata"""
    boundary = "MULTIPOLYGON(...)"
    scenes = earth_engine_search(boundary, "2024-01-01", "2024-06-30", 20)
    assert len(scenes) > 0
    assert "scene_id" in scenes[0]
    assert "acquisition_date" in scenes[0]
    assert "cloud_percent" in scenes[0]

def test_ndvi_calculation():
    """NDVI formula: (NIR - Red) / (NIR + Red)"""
    # Mock image data
    red = np.array([[100, 150], [200, 250]])
    nir = np.array([[200, 250], [300, 350]])
    
    ndvi = (nir - red) / (nir + red)
    
    # Validate range [-1, +1]
    assert ndvi.min() >= -1
    assert ndvi.max() <= 1

def test_before_after_comparison():
    """NDVI difference calculation"""
    ndvi_before = 0.42
    ndvi_after = 0.68
    delta = ndvi_after - ndvi_before
    
    assert delta == 0.26
    assert delta > 0  # Vegetation increased

def test_change_detection_classification():
    """Classify NDVI change as loss/gain/stable"""
    deltas = [-0.3, -0.1, 0.0, 0.1, 0.3]
    
    for delta in deltas:
        if delta < -0.15:
            category = "LOSS"
        elif delta > 0.15:
            category = "GAIN"
        else:
            category = "STABLE"
        
        assert category in ["LOSS", "GAIN", "STABLE"]
```

### Integration Tests

```python
# backend/tests/test_satellite_api.py

async def test_search_imagery_endpoint(client, async_session, auth_token):
    """Full flow: search imagery for project"""
    
    # Create test project
    project = await create_test_project(async_session, org_id=test_org_id)
    
    # Call endpoint
    response = client.get(
        f"/api/v1/satellite/search-imagery?project_id={project.id}&start_date=2024-01-01&end_date=2024-06-30",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "scenes" in data
    assert len(data["scenes"]) > 0

async def test_calculate_ndvi_endpoint(client, auth_token):
    """Full flow: calculate NDVI for scene"""
    
    response = client.post(
        "/api/v1/satellite/calculate-ndvi",
        json={
            "scene_id": "S2A_MSIL2A_20240515...",
            "project_id": "proj-01"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "ndvi_mean" in data
    assert "ndvi_array" in data

async def test_before_after_comparison(client, auth_token):
    """Full flow: compare baseline vs current"""
    
    response = client.post(
        "/api/v1/satellite/compare-baselines",
        json={
            "project_id": "proj-01",
            "baseline_scene_id": "S2A_..._20240101",
            "current_scene_id": "S2A_..._20240601"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "ndvi_delta" in data
    assert "change_type" in data  # LOSS, GAIN, STABLE
```

### Frontend Tests (Optional for MVP)

```javascript
// frontend/src/components/__tests__/SatelliteImagery.test.jsx

describe("SatelliteImagery Component", () => {
  it("displays baseline image", async () => {
    const mockBaselineImage = {
      scene_id: "S2A_...",
      url: "data:image/..."
    };
    
    render(<SatelliteImagery baseline={mockBaselineImage} />);
    expect(screen.getByTestId("baseline-image")).toBeInTheDocument();
  });
  
  it("displays before/after slider", () => {
    render(<SatelliteImagery baseline={...} current={...} />);
    expect(screen.getByTestId("before-after-slider")).toBeInTheDocument();
  });
});
```

---

## PART 14: FILE-BY-FILE IMPLEMENTATION PLAN

| File | Existing/New | Action | Purpose | Dependencies |
|------|-----------|--------|---------|--------------|
| **backend/requirements.txt** | Existing | MODIFY | Add earthengine-api, rasterio, xarray, rioxarray | — |
| **backend/app/core/config.py** | Existing | MODIFY | Add EARTH_ENGINE_PRIVATE_KEY, EARTH_ENGINE_PROJECT_ID | — |
| **backend/app/services/earth_engine.py** | NEW | CREATE | Google Earth Engine client wrapper | earthengine-api |
| **backend/app/services/satellite.py** | NEW | CREATE | Sentinel-2 search, NDVI calculation, comparison | earth_engine.py, numpy, rasterio |
| **backend/app/api/v1/endpoints/satellite.py** | NEW | CREATE | API endpoints for satellite operations | satellite.py, projects.py |
| **backend/app/models/satellite_scene.py** | NEW | CREATE | Database model for satellite imagery metadata | — |
| **backend/alembic/versions/XXXX_add_satellite_model.py** | NEW | CREATE | Migration to add SatelliteScene table | — |
| **backend/tests/test_satellite.py** | NEW | CREATE | Unit tests for satellite module | pytest, numpy |
| **backend/tests/test_satellite_api.py** | NEW | CREATE | Integration tests for API endpoints | httpx, pytest-asyncio |
| **frontend/src/components/SatelliteImagery.jsx** | NEW | CREATE | Display satellite before/after | Leaflet, React |
| **frontend/src/api/client.js** | Existing | MODIFY | Add satellite API calls | — |
| **.env** or **.env.local** | NEW | CREATE | Store Earth Engine credentials | (gitignore) |
| **docker-compose.yml** | Existing | NO CHANGE | Not needed for MVP (GEE is cloud-based) | — |

---

## PART 15: IMPLEMENTATION SEQUENCE (ORDERED)

### Phase 1: Setup & Configuration (Day 1)
**Objective:** Prepare backend for satellite integration

- [ ] **1.1** Install dependencies (requirements.txt)
  - Add earthengine-api, rasterio, xarray, rioxarray, numpy, scipy, Pillow, httpx
  - Verify pip install completes
  
- [ ] **1.2** Create Google Cloud Project & Earth Engine access
  - Create GCP project or use existing
  - Enable Earth Engine API
  - Create service account JSON key
  - Export to EARTH_ENGINE_PRIVATE_KEY env var
  
- [ ] **1.3** Update config.py
  - Add EARTH_ENGINE_PRIVATE_KEY from environment
  - Add EARTH_ENGINE_PROJECT_ID from environment
  - Create .env.local file (add to .gitignore)

- [ ] **1.4** Test Earth Engine authentication
  - Create `test_ee_auth.py` (temporary)
  - Call `ee.Initialize()` with credentials
  - Verify connection
  - Delete test file

**Completion criteria:** Earth Engine SDK initialized, credentials working

---

### Phase 2: Satellite Service Layer (Day 2)
**Objective:** Implement core satellite data operations

- [ ] **2.1** Create `backend/app/services/earth_engine.py`
  - Wrap ee library initialization
  - Handle authentication with private key
  - Create reusable Earth Engine session
  - Error handling for API failures

- [ ] **2.2** Create `backend/app/services/satellite.py`
  - Function: `search_sentinel2_scenes(boundary_geojson, start_date, end_date, max_cloud_percent)`
    - Input: AOI (MULTIPOLYGON), date range, cloud filter
    - Output: List of scene metadata (ID, date, cloud%, NDVI stats if available)
  
  - Function: `calculate_ndvi(scene_id, aoi_geometry)`
    - Input: Sentinel-2 scene ID, project boundary
    - Output: NDVI raster mean/min/max/array
  
  - Function: `compare_ndvi(baseline_scene_id, current_scene_id, aoi)`
    - Input: Two scene IDs (baseline and current), AOI
    - Output: NDVI difference, change classification (LOSS/GAIN/STABLE)
  
  - Function: `mask_clouds(image, cloud_percent_threshold)`
    - Input: Earth Engine Image, max cloud % threshold
    - Output: Cloud-masked image

- [ ] **2.3** Create `backend/tests/test_satellite.py`
  - Unit test: `test_earth_engine_search()` — verify mock scenes returned
  - Unit test: `test_ndvi_formula()` — validate (NIR-Red)/(NIR+Red)
  - Unit test: `test_change_detection()` — verify delta calculation
  - Unit test: `test_cloud_masking()` — verify clouds excluded
  
  **Tip:** Use mock Earth Engine responses, don't hit real API in unit tests

**Completion criteria:** All satellite service functions work; tests pass

---

### Phase 3: Database Model for Satellite Scenes (Day 2-3)
**Objective:** Persist satellite imagery metadata

- [ ] **3.1** Create `backend/app/models/satellite_scene.py`
  ```python
  class SatelliteScene:
      project_id: FK → Project
      scene_id: String (Sentinel-2 ID, e.g., "S2A_MSIL2A_...")
      sensor: String ("Sentinel-2")
      acquisition_date: DateTime
      cloud_percent: Float
      ndvi_mean: Float (cached)
      ndvi_array_url: String (MinIO reference if stored)
      bounds: Geometry(POLYGON, SRID=4326)
      metadata_json: JSON (additional S2 metadata)
      scene_type: String ("BASELINE" or "CURRENT" or "MONITOR")
      
      created_at, updated_at: TIMESTAMP
  ```

- [ ] **3.2** Create Alembic migration
  - `alembic revision --autogenerate -m "add_satellite_scene_model"`
  - Verify migration generates SatelliteScene table
  - Run `alembic upgrade head`

- [ ] **3.3** Link SatelliteScene to existing models
  - Modify EvidenceRecord to reference SatelliteScene via entity_id
  - Set entity_type = "SatelliteScene" when storing satellite evidence

**Completion criteria:** SatelliteScene table created; migrations applied

---

### Phase 4: Backend API Endpoints (Day 3-4)
**Objective:** Expose satellite operations via REST API

- [ ] **4.1** Create `backend/app/api/v1/endpoints/satellite.py`

  **Endpoint 1: Search Sentinel-2 imagery**
  ```
  GET /api/v1/satellite/search-imagery
  Query params:
    - project_id (required)
    - start_date (required, YYYY-MM-DD)
    - end_date (required, YYYY-MM-DD)
    - max_cloud_percent (optional, default 20)
  
  Returns:
    {
      "scenes": [
        {
          "scene_id": "S2A_MSIL2A_20240501...",
          "acquisition_date": "2024-05-01",
          "cloud_percent": 15.3,
          "ndvi_mean": 0.52,
          "url": "https://..."
        },
        ...
      ]
    }
  ```

  **Endpoint 2: Get scene detail**
  ```
  GET /api/v1/satellite/scene/{scene_id}
  
  Returns:
    {
      "scene_id": "...",
      "metadata": {...},
      "ndvi_array": "data:image/png;base64,..."
    }
  ```

  **Endpoint 3: Set baseline for project**
  ```
  POST /api/v1/satellite/set-baseline
  Body:
    {
      "project_id": "proj-01",
      "scene_id": "S2A_MSIL2A_20240101...",
      "scene_type": "BASELINE"
    }
  
  Creates:
    - SatelliteScene record
    - EvidenceRecord linking to Baseline model
  ```

  **Endpoint 4: Calculate NDVI for scene**
  ```
  POST /api/v1/satellite/calculate-ndvi
  Body:
    {
      "project_id": "proj-01",
      "scene_id": "S2A_...",
    }
  
  Returns:
    {
      "ndvi_mean": 0.52,
      "ndvi_min": 0.21,
      "ndvi_max": 0.89,
      "ndvi_array_url": "minio://bucket/..."
    }
  ```

  **Endpoint 5: Compare two scenes (before/after)**
  ```
  POST /api/v1/satellite/compare-scenes
  Body:
    {
      "project_id": "proj-01",
      "baseline_scene_id": "S2A_..._20240101",
      "current_scene_id": "S2A_..._20240601"
    }
  
  Returns:
    {
      "ndvi_delta": 0.26,
      "change_type": "GAIN",
      "confidence": 0.96,
      "vegetation_recovery_percent": 50
    }
  ```

- [ ] **4.2** Update existing endpoint: `GET /projects/{id}`
  - Return satellite baseline if exists
  - Link to SatelliteScene model

- [ ] **4.3** Create integration tests
  - `test_satellite_api.py` with full flow tests

**Completion criteria:** All 5 endpoints implemented, tested, and working

---

### Phase 5: Link Satellite Data to Environmental Changes (Day 4)
**Objective:** Auto-create ChangeEvents from satellite comparison

- [ ] **5.1** Extend monitoring.py endpoint
  - New endpoint: `POST /api/v1/monitoring/create-from-satellite`
  - Input: satellite comparison results
  - Creates ChangeEvent with satellite metadata
  
  ```python
  @router.post("/create-from-satellite")
  async def create_change_from_satellite(
      project_id: str,
      baseline_scene_id: str,
      current_scene_id: str,
      current_user = Depends(get_current_user),
      db = Depends(get_db)
  ):
      # Call satellite comparison
      comparison = await satellite_service.compare_scenes(...)
      
      # Create ChangeEvent
      change_event = ChangeEvent(
          project_id=project_id,
          indicator="Vegetation",
          change_type="Increase" if comparison["ndvi_delta"] > 0 else "Decrease",
          severity=classify_severity(comparison["ndvi_delta"]),
          confidence=comparison["confidence"],
          evidence_data={
              "ndvi_delta": comparison["ndvi_delta"],
              "baseline_scene_id": baseline_scene_id,
              "current_scene_id": current_scene_id
          }
      )
      db.add(change_event)
      await db.commit()
      
      return change_event
  ```

- [ ] **5.2** Create EvidenceRecord for satellite scene
  - Link SatelliteScene to ChangeEvent via EvidenceRecord
  - Store scene metadata and SHA-256 hash

**Completion criteria:** Satellite comparisons → ChangeEvents created automatically

---

### Phase 6: Frontend Integration (Day 5)
**Objective:** Display satellite data in UI

- [ ] **6.1** Update `frontend/src/api/client.js`
  - Add functions: searchSatelliteImagery, setSatelliteBaseline, compareSatelliteScenes
  - Handle API fallback (if offline, use mock data)

- [ ] **6.2** Create `frontend/src/components/SatelliteImagery.jsx`
  - Input: project_id
  - Display: 
    - Baseline satellite scene (if available)
    - Current satellite scene (if available)
    - Before/after comparison slider
    - NDVI heatmap overlay
    - Scene metadata (date, cloud%, NDVI values)
  
  - UI flow:
    1. User selects project
    2. Component fetches satellite scenes
    3. Displays latest baseline + most recent current
    4. Shows before/after slider
    5. Displays NDVI difference

- [ ] **6.3** Update `frontend/src/components/MonitoringView.jsx`
  - If satellite data available, show satellite comparison
  - Fallback to mock data if not

- [ ] **6.4** Update `frontend/src/components/ProjectDetailModal.jsx`
  - Add tab for "Satellite Evidence"
  - Show baseline image date, current image date
  - Show NDVI trend over time

**Completion criteria:** Frontend displays satellite imagery, before/after slider works

---

### Phase 7: End-to-End Testing (Day 5-6)
**Objective:** Verify complete flow works

- [ ] **7.1** Manual test: Full flow
  1. Create test project with boundary
  2. Call `/satellite/search-imagery` → Get real Sentinel-2 scenes
  3. Set baseline scene
  4. Set current scene
  5. Call `/satellite/compare-scenes` → Get NDVI difference
  6. View in frontend
  7. Verify ChangeEvent created

- [ ] **7.2** Automated integration test
  - Mock Earth Engine responses
  - Test full API chain
  - Verify database records created
  - Verify frontend renders correctly

- [ ] **7.3** Performance test
  - Sentinel-2 scene search returns in <5 seconds
  - NDVI calculation completes in <10 seconds
  - Frontend rendering smooth

**Completion criteria:** Full end-to-end flow works; all tests pass; no errors in logs

---

### Phase 8: Compliance Integration (Day 6)
**Objective:** Connect satellite evidence to compliance verification

- [ ] **8.1** Extend ComplianceEngine
  - Add method: `assess_compliance_with_satellite(project_id, db)`
  - Input: Project with satellite baseline + current images
  - Verify: Has vegetation recovered? (satellite NDVI ≥ baseline threshold)
  - Output: compliance_status

- [ ] **8.2** Update compliance endpoint
  - GET `/api/v1/compliance/{project_id}` now includes satellite evidence
  - Shows: "Compliance verified via Sentinel-2 NDVI comparison"

**Completion criteria:** Compliance calculation includes satellite data

---

### Phase 9: MVP Documentation (Day 6-7)
**Objective:** Document for demonstration

- [ ] **9.1** Create `SATELLITE_INTEGRATION_GUIDE.md`
  - How to run the system
  - How satellite data flows through RITAM
  - Example project with real Sentinel-2 data
  - Screenshots/diagrams

- [ ] **9.2** Create test data
  - Seeded project in database with real coordinates
  - Real Sentinel-2 scenes from India
  - Real NDVI calculations

**Completion criteria:** Documentation complete; system ready for demo

---

## PART 16: EXACT FILE-BY-FILE CHANGES

### NEW FILES TO CREATE

#### `backend/app/services/earth_engine.py`
- Initialize Earth Engine client
- Handle authentication
- Provide reusable ee session

#### `backend/app/services/satellite.py`
- `search_sentinel2_scenes()`
- `calculate_ndvi()`
- `compare_ndvi()`
- `mask_clouds()`
- Helper functions

#### `backend/app/models/satellite_scene.py`
- SatelliteScene ORM model
- All fields for scene metadata

#### `backend/app/api/v1/endpoints/satellite.py`
- 5 main endpoints
- Dependency injection
- Error handling

#### `backend/tests/test_satellite.py`
- Unit tests for satellite service

#### `backend/tests/test_satellite_api.py`
- Integration tests for API

#### `frontend/src/components/SatelliteImagery.jsx`
- React component for satellite display
- Before/after slider
- NDVI visualization

#### `Alembic migration` (auto-generated)
- Add SatelliteScene table

### EXISTING FILES TO MODIFY

#### `backend/requirements.txt`
- Add: earthengine-api, rasterio, xarray, rioxarray, numpy, scipy, Pillow

#### `backend/app/core/config.py`
- Add: EARTH_ENGINE_PRIVATE_KEY, EARTH_ENGINE_PROJECT_ID

#### `backend/app/api/v1/endpoints/monitoring.py`
- Add: `POST /monitoring/create-from-satellite` endpoint

#### `backend/app/api/v1/api.py`
- Include satellite router

#### `frontend/src/api/client.js`
- Add: satellite API functions

#### `frontend/src/components/ProjectDetailModal.jsx`
- Add: Satellite tab

#### `frontend/src/components/MonitoringView.jsx`
- Integrate: Real satellite data + mock fallback

---

## PART 17: CRITICAL TECHNICAL RISKS & MITIGATIONS

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| **Earth Engine authentication fails** | Cannot search Sentinel-2 | MEDIUM | Test auth immediately (Phase 1); have fallback (mock data) |
| **Cloud cover too high** | No suitable images available | HIGH | Set cloud filter to 30% initially; handle "no data" gracefully |
| **Image acquisition gaps** | Temporal continuity breaks | MEDIUM | Show date gap in UI; allow manual scene selection |
| **NDVI calculation accuracy** | Change detection false positives | MEDIUM | Validate formula; compare with published tools; document confidence |
| **Seasonal variation** | NDVI changes from weather, not intervention | HIGH | Use same season for comparison; document date in UI |
| **Atmospheric effects** | Aerosols distort NDVI | MEDIUM | Use L2A (atmospherically corrected); apply cloud mask |
| **Sentinel-2 revisit gap** | 5-10 days between images | LOW | Document in UI; use recent available image |
| **Individual tree confusion** | Claim satellite identifies trees (impossible at 10m) | CRITICAL | Document clearly that satellite shows area trends, not individual trees |
| **Database storage limits** | NDVI arrays consume disk space | MEDIUM | Store in MinIO, not database; only store statistics in DB |
| **API rate limits** | Earth Engine quota exceeded | LOW (MVP) | Implement caching; monitor usage |
| **Tenant isolation failure** | Data leak between orgs | CRITICAL | Always filter by current_user.org_id on satellite queries |

---

## PART 18: CURRENT VS TARGET ARCHITECTURE DIAGRAMS

### DIAGRAM 1: CURRENT RITAM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Leaflet)                 │
│ - SpatialMap (renders mock projects + mock trees)           │
│ - MonitoringView (displays mock environmental changes)      │
│ - EvidenceView (shows mock audit logs + SHA-256 hashes)     │
│ - API Client (tries backend, falls back to mockData.js)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────▼──────────────┐
                │   API Client        │
                │  (graceful fallback)│
                └──────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼───┐                    ┌────▼────────┐
   │ Backend │               ┌───► mockData.js │
   │ (online)│               │    (fallback)   │
   │  or     │───── ERROR ───┘                 │
   │ (error) │                                 │
   └────┬────┘                                 │
        │                                      │
        ▼                                      │
   ┌───────────────────────────────────────┐  │
   │      FastAPI Endpoints (70% ready)    │  │
   │  /auth/login ........................ │  │
   │  /projects/list ..................... │  │
   │  /projects/create ................... │  │
   │  /monitoring/list ................... │  │
   │  /field/trees/record ................ │  │
   │  /compliance/{id} ................... │  │
   │  /baselines (STUB) .................. │  │
   │  /reports (MISSING) ................. │  │
   └────┬────────────────────────────────────┘  │
        │                                       │
        ▼                                       │
   ┌────────────────────────────┐              │
   │  PostgreSQL + PostGIS      │              │
   │  - Projects (boundary ✅)   │              │
   │  - Baselines (spatial ✅)   │              │
   │  - ChangeEvents (location ✅)│             │
   │  - Evidence (location ✅)   │              │
   │  - Trees (location ✅)      │              │
   │  - SatelliteScene (NONE)    │──────┬───────┘
   │  - All models ready         │      │
   └────────────────────────────┘      │
                                       │
                                   Uses mock
```

**Current Limitations:**
- ❌ No Sentinel-2 integration
- ❌ No satellite scene search
- ❌ No NDVI calculation
- ❌ No before/after comparison (satellite)
- ❌ Many endpoints are stubs
- ⚠️ Frontend relies on mock data for all meaningful functionality

---

### DIAGRAM 2: RITAM + SENTINEL-2 TARGET ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Leaflet)                 │
│ - SpatialMap (renders projects + REAL satellite imagery)    │
│ - MonitoringView (displays REAL satellite changes)          │
│ - SatelliteImagery (before/after slider with NDVI)          │
│ - EvidenceView (shows REAL satellite evidence + SHA-256)    │
│ - API Client (calls backend; graceful mock fallback)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────▼──────────────┐
                │   API Client        │
                │  /satellite/...     │
                │  /monitoring/...    │
                └──────┬──────────────┘
                       │
                       ▼
           ┌───────────────────────────┐
           │   FastAPI Backend (REAL)  │
           │                           │
           │ ┌─────────────────────┐   │
           │ │ Auth Endpoints      │   │
           │ │ /auth/login         │   │
           │ │ /auth/register      │   │
           │ └─────────────────────┘   │
           │                           │
           │ ┌──── NEW ─────────────┐  │
           │ │ Satellite Endpoints  │  │
           │ │ /satellite/search    │  │
           │ │ /satellite/scene     │  │
           │ │ /satellite/baseline  │  │
           │ │ /satellite/compare   │  │
           │ │ /satellite/ndvi      │  │
           │ └──────────────────────┘  │
           │                           │
           │ ┌─────────────────────┐   │
           │ │ Project Endpoints   │   │
           │ │ /projects/list      │   │
           │ │ /projects/create    │   │
           │ └─────────────────────┘   │
           │                           │
           │ ┌─────────────────────┐   │
           │ │ Monitoring/Change   │   │
           │ │ /monitoring/...     │   │
           │ │ /monitoring/from-sat│   │
           │ └─────────────────────┘   │
           │                           │
           │ ┌──── SERVICES ─────────┐ │
           │ │ EarthEngine (NEW)      │ │
           │ │ Satellite (NEW)        │ │
           │ │ ComplianceEngine ✅    │ │
           │ │ Security ✅            │ │
           │ └────────────────────────┘ │
           └────┬───────────────────────┘
                │
        ┌───────┴────────┬──────────┐
        │                │          │
        ▼                ▼          ▼
   ┌─────────┐  ┌─────────────┐  ┌────────────┐
   │  Google │  │ PostgreSQL  │  │   MinIO    │
   │ Earth   │  │  + PostGIS  │  │ (Storage)  │
   │ Engine  │  │             │  │            │
   │ (Cloud) │  │ - Projects  │  │ - Rasters  │
   │         │  │ - Baselines │  │ - Indices  │
   │ Sentinel│  │ - Changes   │  │ - Images   │
   │-2 Data  │  │ - Satellite │  │            │
   │         │  │   Scenes    │  │            │
   │ (Real)  │  │ - Evidence  │  │            │
   └─────────┘  │ - Audit     │  └────────────┘
                └─────────────┘

Data Flow:
┌──────────────────────────────────────────────────────────┐
│ 1. User selects project (boundary in DB) ✅              │
│ 2. Frontend → Backend: search_imagery(project_id)        │
│ 3. Backend → Earth Engine: Search Sentinel-2 scenes      │
│ 4. Earth Engine returns scene list (real)                │
│ 5. Backend → Frontend: Scene metadata                    │
│ 6. User selects baseline scene → Store in SatelliteScene │
│ 7. User selects current scene → Store in SatelliteScene  │
│ 8. Backend calculates NDVI (real satellite math)         │
│ 9. Backend compares NDVI delta                           │
│ 10. Creates ChangeEvent with satellite evidence          │
│ 11. Stores EvidenceRecord with SHA-256 of scene          │
│ 12. Frontend displays before/after with NDVI overlay     │
│ 13. ComplianceEngine verifies satellite + field evidence │
│ 14. AuditLog records all satellite operations            │
└──────────────────────────────────────────────────────────┘
```

**Target Capabilities:**
- ✅ Real Sentinel-2 search
- ✅ NDVI calculation
- ✅ Before/after comparison
- ✅ Satellite evidence storage
- ✅ Compliance verification via satellite
- ✅ Immutable audit trail
- ✅ Tenant isolation
- ✅ Full end-to-end flow

---

## PART 19: MVP DEFINITION OF DONE

### What the MVP Demonstrates

**Single test project (real Sentinel-2 data):**

1. **Project AOI** — Actual coordinates in India (e.g., plantation site)
2. **Baseline image** — Sentinel-2 scene from plantation start date
3. **Current image** — Sentinel-2 scene from recent date
4. **Baseline NDVI** — Calculated from baseline scene (e.g., 0.42 sparse vegetation)
5. **Current NDVI** — Calculated from current scene (e.g., 0.68 dense plantation)
6. **NDVI Delta** — +0.26 (50% vegetation increase)
7. **Change classification** — GAIN (vegetation recovery verified)
8. **Satellite evidence** — Stored with SHA-256 hash, timestamp, scene ID
9. **ChangeEvent** — Created automatically from satellite comparison
10. **Compliance** — "Satellite evidence confirms plantation area vegetation recovery"
11. **Audit trail** — All operations logged with immutable hash
12. **Frontend display** — Before/after slider showing satellite scenes + NDVI heatmap

**Not in MVP:**

- ❌ Individual tree tracking from satellite (impossible at 10m resolution)
- ❌ Multiple competing satellite sources
- ❌ Real-time monitoring (scheduled jobs)
- ❌ Paid satellite data (stay with free Sentinel-2)
- ❌ Advanced computer vision models
- ❌ LLM interpretation (AskRitamView)
- ❌ Public-facing compliance reports

---

## PART 20: FINAL SUMMARY & NEXT STEPS

### What RITAM Currently Is

✅ **Database-complete** — All models, schema, migrations ready  
✅ **API-partial** — 70% of endpoints implemented; many are stubs  
✅ **Frontend-polished** — UI/UX complete; mock data realistic  
✅ **Architecture-sound** — Spatial data, tenant isolation, auth ready  
❌ **Satellite-missing** — No Sentinel-2 integration  
❌ **Intelligence-lacking** — No real environmental change detection  

### What Your Responsibility Adds

1. **Satellite module** — Search, download, process Sentinel-2
2. **NDVI intelligence** — Calculate vegetation indices
3. **Before/after flow** — Complete environmental verification loop
4. **Evidence persistence** — Store satellite data with immutable proof
5. **Compliance link** — Connect satellite evidence to compliance verification
6. **Frontend integration** — Display real satellite data to users

### Implementation Roadmap

**Timeline:** 7-8 days (6-7 development days + 1 day documentation/testing)

**Daily breakdown:**
- **Day 1:** Setup (Earth Engine auth, dependencies)
- **Day 2:** Satellite service layer (core functions)
- **Day 2-3:** Database model + migration
- **Day 3-4:** Backend API endpoints
- **Day 4:** Link to compliance
- **Day 5:** Frontend integration
- **Day 5-6:** End-to-end testing
- **Day 6-7:** MVP documentation + demo prep

### File Count

- **New files:** 7 (5 backend + 2 frontend)
- **Modified files:** 9 (3 backend + 4 frontend + 2 config)
- **Alembic migrations:** 1 (auto-generated)
- **Tests:** 2 new test files

### Estimated Code Volume

- **Backend satellite module:** ~800 lines (satellite.py + earth_engine.py)
- **Backend API endpoints:** ~400 lines (satellite.py endpoints)
- **Database migration:** ~50 lines (auto-generated)
- **Frontend component:** ~300 lines (SatelliteImagery.jsx)
- **Tests:** ~500 lines (unit + integration)

### Success Criteria

✅ Sentinel-2 scenes searchable by project AOI  
✅ NDVI calculation works on real data  
✅ Before/after comparison produces delta  
✅ ChangeEvent automatically created from satellite  
✅ Evidence stored with SHA-256 proof  
✅ Frontend displays satellite imagery  
✅ Before/after slider works smoothly  
✅ Compliance calculation includes satellite evidence  
✅ Audit trail records all satellite operations  
✅ All tests pass (unit + integration)  
✅ No data leaks between organizations  
✅ System handles "no suitable images" gracefully  

---

## APPENDIX A: CURRENT ENDPOINT CHECKLIST

- [x] POST /auth/login — WORKING
- [x] POST /auth/register — WORKING
- [x] GET /projects/ — WORKING (org filter)
- [x] POST /projects/ — PARTIAL (geometry issue)
- [ ] GET /projects/{id} — MISSING (need detail endpoint)
- [ ] PUT /projects/{id} — MISSING
- [ ] DELETE /projects/{id} — MISSING
- [ ] GET /baselines/ — STUB
- [ ] POST /baselines/ — STUB
- [ ] GET /baselines/{id} — MISSING
- [ ] PUT /baselines/{id} — MISSING
- [x] GET /monitoring/ — WORKING (list changes)
- [ ] POST /monitoring/ — MISSING (create endpoint)
- [x] POST /monitoring/{id}/review — WORKING
- [ ] GET /monitoring/{id} — MISSING
- [x] POST /field/trees/record — PARTIAL (no commit)
- [x] POST /field/trees/{tag}/verify — WORKING (stub)
- [x] GET /actions/ — WORKING
- [x] PATCH /actions/{id} — WORKING
- [x] GET /compliance/{project_id} — WORKING
- [ ] POST /reports/ — MISSING
- [ ] GET /reports/ — MISSING

---

## APPENDIX B: EARTH ENGINE CODE SNIPPET (Reference)

```python
# backend/app/services/earth_engine.py (reference implementation)

import ee
import json
from app.core.config import settings

class EarthEngineClient:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def initialize(self):
        if self._initialized:
            return
        
        try:
            # Authenticate with service account JSON
            key_dict = json.loads(settings.EARTH_ENGINE_PRIVATE_KEY)
            credentials = ee.ServiceAccountCredentials(
                email=key_dict['client_email'],
                key_data=key_dict['private_key']
            )
            ee.Initialize(credentials)
            self._initialized = True
        except Exception as e:
            raise RuntimeError(f"Earth Engine initialization failed: {str(e)}")
    
    def get_session(self):
        self.initialize()
        return ee  # Return ee module for use

# backend/app/services/satellite.py (reference implementation)

import ee
import numpy as np
from app.services.earth_engine import EarthEngineClient

async def search_sentinel2_scenes(boundary_geojson, start_date, end_date, max_cloud_pct=20):
    """
    Search for Sentinel-2 L2A scenes within AOI and date range.
    
    Args:
        boundary_geojson: {"type": "Polygon", "coordinates": [...]}
        start_date: "2024-01-01"
        end_date: "2024-06-30"
        max_cloud_pct: 20
    
    Returns:
        List of scene metadata dicts
    """
    ee_client = EarthEngineClient().get_session()
    
    # Create geometry from GeoJSON
    coords = boundary_geojson['coordinates'][0]  # Assuming Polygon
    geometry = ee.Geometry.Polygon(coords)
    
    # Filter Sentinel-2 L2A collection
    collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
        .filterBounds(geometry) \
        .filterDate(start_date, end_date) \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', max_cloud_pct)) \
        .sort('system:time_start')
    
    # Get image list
    images = collection.toList(100).getInfo()
    
    scenes = []
    for image_dict in images:
        props = image_dict['properties']
        scenes.append({
            'scene_id': image_dict['id'],
            'acquisition_date': props.get('system:index', '').split('_')[0],  # Parse date from ID
            'cloud_percent': props.get('CLOUDY_PIXEL_PERCENTAGE', 0),
            'timestamp': props.get('system:time_start', 0)
        })
    
    return scenes

async def calculate_ndvi(scene_id, aoi_geometry_geojson):
    """
    Calculate NDVI for a Sentinel-2 scene within AOI.
    
    NDVI = (NIR - Red) / (NIR + Red)
    Sentinel-2: B8 = NIR (10m), B4 = Red (10m)
    """
    ee_client = EarthEngineClient().get_session()
    
    # Load scene
    image = ee.Image(scene_id)
    
    # Create geometry
    coords = aoi_geometry_geojson['coordinates'][0]
    geometry = ee.Geometry.Polygon(coords)
    
    # Calculate NDVI
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    
    # Get statistics within AOI
    stats = ndvi.reduceRegion(ee.Reducer.mean(), geometry, 10).getInfo()
    
    return {
        'ndvi_mean': stats.get('NDVI'),
        'scene_id': scene_id,
        'aoi': geometry.getInfo()
    }

async def compare_ndvi(baseline_scene_id, current_scene_id, aoi_geojson):
    """
    Compare NDVI between baseline and current scenes.
    """
    baseline_ndvi = await calculate_ndvi(baseline_scene_id, aoi_geojson)
    current_ndvi = await calculate_ndvi(current_scene_id, aoi_geojson)
    
    ndvi_delta = current_ndvi['ndvi_mean'] - baseline_ndvi['ndvi_mean']
    
    # Classify change
    if ndvi_delta > 0.15:
        change_type = 'GAIN'
    elif ndvi_delta < -0.15:
        change_type = 'LOSS'
    else:
        change_type = 'STABLE'
    
    return {
        'ndvi_baseline': baseline_ndvi['ndvi_mean'],
        'ndvi_current': current_ndvi['ndvi_mean'],
        'ndvi_delta': ndvi_delta,
        'change_type': change_type,
        'confidence': 0.95  # Simplified
    }
```

---

**End of Technical Audit Report**

*This document is intended as a guide for implementing Sentinel-2 satellite integration into RITAM. Follow the ordered implementation sequence and reference the exact file-by-file plan. All recommendations are based on actual inspection of the current codebase and existing architecture.*

