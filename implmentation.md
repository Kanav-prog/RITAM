# Implementation Specification: RITAM (Vaanam) Backend

## 1. Technical Stack & Dependencies

* **Runtime:** Python 3.11+
* **Framework:** FastAPI (Asynchronous ASGI)
* **Database:** PostgreSQL 16 with PostGIS extension enabled
* **ORM:** SQLAlchemy 2.0 (AsyncIO) & GeoAlchemy2
* **Geospatial Processing:** Shapely
* **Data Validation & Schemas:** Pydantic v2
* **Database Migrations:** Alembic
* **Authentication:** OAuth2 Password Bearer flow, HS256/RS256 JWT (`python-jose`), direct `bcrypt` password hashing
* **Object Store:** S3-compatible API (MinIO / AWS S3 via `aioboto3` or `boto3`)
* **Testing:** Pytest, pytest-asyncio, HTTPX

---

## 2. Directory Structure

```text
backend/
├── alembic/
│   ├── env.py
│   └── versions/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── organizations.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── baselines.py
│   │   │   │   ├── monitoring.py
│   │   │   │   ├── actions.py
│   │   │   │   ├── field.py
│   │   │   │   ├── compliance.py
│   │   │   │   └── reports.py
│   │   │   └── router.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── exceptions.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── user.py
│   │   ├── organization.py
│   │   ├── project.py
│   │   ├── baseline.py
│   │   ├── change_event.py
│   │   ├── mitigation_action.py
│   │   ├── tree_identity.py
│   │   ├── evidence.py
│   │   └── audit.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── project.py
│   │   ├── baseline.py
│   │   ├── monitoring.py
│   │   ├── field.py
│   │   └── compliance.py
│   └── services/
│       ├── s3.py
│       ├── spatial.py
│       ├── audit.py
│       └── compliance_engine.py
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_projects.py
│   ├── test_field.py
│   └── test_compliance.py
├── alembic.ini
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── pyproject.toml

3. Database Schema & Data Models3.1 EnumerationsUserRole: AUTHORITY, DEVELOPER, FIELD_OFFICER, AUDITOR  ProjectStatus: DRAFT, BASELINE_PENDING, ACTIVE, ACTION_REQUIRED, AT_RISK, COMPLETED  BaselineStatus: DRAFT, REVIEW_PENDING, APPROVED, LOCKED  ChangeSeverity: INFO, LOW, MEDIUM, HIGH, CRITICAL  ChangeStatus: DETECTED, UNDER_REVIEW, CONFIRMED, REJECTED  ActionStatus: PENDING, ASSIGNED, IN_PROGRESS, VERIFICATION_PENDING, COMPLETED, OVERDUE  VerificationStatus: REPORTED, PENDING, VERIFIED, REJECTED  TreeHealthStatus: HEALTHY, DEGRADED, AT_RISK, DEAD, MISSING  3.2 Relational Entities & Constraintsorganizationsid: UUID (Primary Key)name: VARCHAR(255), Not Nullorg_type: VARCHAR(100), Not Null  authorized_person: VARCHAR(255), Not Null  contact_email: VARCHAR(255), Unique, Not Null  is_verified: BOOLEAN, Default FALSE  created_at, updated_at: TIMESTAMPTZusersid: UUID (Primary Key)org_id: UUID, Foreign Key -> organizations(id) ON DELETE CASCADErole: UserRole, Not Null  email: VARCHAR(255), Unique, Not Null  hashed_password: VARCHAR(255), Not Nullfull_name: VARCHAR(255), Not Nullis_active: BOOLEAN, Default TRUEcreated_at: TIMESTAMPTZprojectsid: UUID (Primary Key)org_id: UUID, Foreign Key -> organizations(id) ON DELETE CASCADEname: VARCHAR(255), Not Null  project_type: VARCHAR(100), Not Null  description: TEXT  boundary: GEOMETRY(MultiPolygon, 4326), Not Null  area_hectares: NUMERIC(10, 2), Not Null  status: ProjectStatus, Default 'DRAFT'  created_by: UUID, Foreign Key -> users(id)created_at, updated_at: TIMESTAMPTZIndex: Spatial GIST index on boundarybaselinesid: UUID (Primary Key)project_id: UUID, Foreign Key -> projects(id) ON DELETE CASCADE  version: INT, Default 1, Not Null  status: BaselineStatus, Default 'DRAFT'tree_count_estimate: INT, Default 0  green_cover_pct: NUMERIC(5, 2), Not Null  analysis_raster_url: TEXT  metadata: JSONB, Default '{}'  approved_by: UUID, Foreign Key -> users(id)approved_at: TIMESTAMPTZ  created_at: TIMESTAMPTZConstraint: Unique on (project_id, version)change_eventsid: UUID (Primary Key)project_id: UUID, Foreign Key -> projects(id) ON DELETE CASCADE  detection_date: TIMESTAMPTZ, Not Null  affected_boundary: GEOMETRY(Geometry, 4326)  indicator: VARCHAR(64), Not Null  change_magnitude: NUMERIC(6, 2), Not Null  confidence_score: NUMERIC(5, 2), Not Null  severity: ChangeSeverity, Default 'MEDIUM'  status: ChangeStatus, Default 'DETECTED'  reviewed_by: UUID, Foreign Key -> users(id)  reviewed_at: TIMESTAMPTZcreated_at: TIMESTAMPTZIndex: Spatial GIST index on affected_boundarymitigation_actionsid: UUID (Primary Key)project_id: UUID, Foreign Key -> projects(id) ON DELETE CASCADE  change_event_id: UUID, Foreign Key -> change_events(id)  target_trees: INT, Not Null  planted_trees: INT, Default 0  verified_trees: INT, Default 0  surviving_trees: INT, Default 0  assigned_org_id: UUID, Foreign Key -> organizations(id)  deadline: TIMESTAMPTZ, Not Null  status: ActionStatus, Default 'PENDING'  restoration_boundary: GEOMETRY(Polygon, 4326)  created_at, updated_at: TIMESTAMPTZtree_identitiesid: UUID (Primary Key)tree_tag: VARCHAR(100), Unique, Indexed, Not Null  project_id: UUID, Foreign Key -> projects(id) ON DELETE CASCADE  action_id: UUID, Foreign Key -> mitigation_actions(id) ON DELETE SET NULLspecies: VARCHAR(100), Not Null  planted_at: TIMESTAMPTZ, Not Null  planted_by: UUID, Foreign Key -> users(id)  location: GEOMETRY(Point, 4326), Not Null  current_status: TreeHealthStatus, Default 'HEALTHY'  last_verified_at: TIMESTAMPTZ  created_at: TIMESTAMPTZIndex: Spatial GIST index on locationevidence_recordsid: UUID (Primary Key)project_id: UUID, Foreign Key -> projects(id) ON DELETE CASCADE  tree_id: UUID, Foreign Key -> tree_identities(id) ON DELETE SET NULLaction_id: UUID, Foreign Key -> mitigation_actions(id) ON DELETE SET NULL  submitted_by: UUID, Foreign Key -> users(id), Not Null  evidence_type: VARCHAR(64), Not Null  file_url: TEXT, Not Nullfile_hash_sha256: VARCHAR(64), Not Nulllocation: GEOMETRY(Point, 4326)  verification_status: VerificationStatus, Default 'REPORTED'  metadata: JSONB, Default '{}'  captured_at: TIMESTAMPTZ, Not Null  created_at: TIMESTAMPTZaudit_logsid: UUID (Primary Key)entity_name: VARCHAR(64), Not Nullentity_id: UUID, Not Nullaction: VARCHAR(32), Not Null  actor_id: UUID, Foreign Key -> users(id)  previous_state: JSONB  current_state: JSONB  ip_address: INETcreated_at: TIMESTAMPTZ  4. Core Business Logic & Mathematical Formulas4.1 Survival & Verification RatesSurvival Rate:  $$\text{Survival Rate} = \left( \frac{\text{surviving\_trees}}{\text{verified\_trees}} \right) \times 100$$  Verification Rate:$$\text{Verification Rate} = \left( \frac{\text{verified\_trees}}{\text{planted\_trees}} \right) \times 100$$4.2 Compliance State MachineIf target_trees == 0 $\rightarrow$ BASELINE_ONLYIf verified_trees < (target_trees * 0.8) $\rightarrow$ NEEDS_ATTENTION  If survival_rate < 70.0% $\rightarrow$ AT_RISK  Otherwise $\rightarrow$ COMPLIANT  4.3 Spatial Operations (PostGIS)Ingestion & Projection: Convert GeoJSON coordinates into SRID 4326 multi-polygons:ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(:geojson), 4326))Validation: Validate polygon boundaries via ST_IsValid(geom).  Area Computation: Derive area directly in hectares using geography casts:ST_Area(geom::geography) / 10000.0  5. Security & Invariant RulesMulti-Tenancy Isolation:Non-AUTHORITY users can only query and mutate records matching org_id = current_user.org_id.Unauthenticated or cross-tenant access attempts must immediately return HTTP 403 Forbidden.Audit & Baseline Immutability:Baselines, change logs, and evidence records are strictly append-only.Updating an approved baseline directly is rejected; revisions must be recorded under a new version integer.  Evidence Authenticity:Every photo or raster upload must have a SHA-256 cryptographic digest calculated prior to writing to object storage.Store this hash in evidence_records.file_hash_sha256 to ensure non-repudiation and prevent file tampering.  Parameterized SQL:Never concatenate user inputs into spatial or transactional SQL statements. Bindings must use parameterized constructs (text(...)).6. API Route Contracts6.1 Auth (/api/v1/auth)POST /login: Authenticates credentials; returns an access token with claims: {"sub": user_id, "org_id": org_id, "role": role}.  POST /register: Registers a new organization and provisions the root organization administrator.  6.2 Projects (/api/v1/projects)GET /: Lists projects accessible to the authenticated tenant/user.  POST /: Accepts project metadata and GeoJSON boundary. Validates geometry, computes area in hectares, and assigns initial status BASELINE_PENDING.  GET /{id}: Returns complete project profile, calculated area, and spatial boundary coordinates.  6.3 Baselines (/api/v1/projects/{id}/baseline)POST /: Ingests baseline dataset, green cover percentage, and estimated tree count.  POST /approve: Locks baseline snapshot as immutable, logs an audit entry, and updates project status to ACTIVE.  6.4 Change Events (/api/v1/projects/{id}/changes)GET /: Lists detected vegetation change events for the project area.  POST /{change_id}/review: Accepts review outcome (CONFIRMED or REJECTED). If confirmed, spawns a corresponding mitigation_actions record.  6.5 Field Operations (/api/v1/field)POST /trees/record: Multipart form-data accepting tree_tag, project_id, species, lat, lng, and uploaded image file. Computes SHA-256 hash, stores file in MinIO, and creates entries in tree_identities and evidence_records.  POST /trees/{tag}/verify: Records on-site inspection, verifies status, and updates last_verified_at.  6.6 Compliance (/api/v1/projects/{id}/compliance)GET /: Computes and returns survival percentage, verification rate, target progress, and the overall operational compliance score.  