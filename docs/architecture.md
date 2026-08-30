# Vaanam — System Architecture

## 1. Overview

Vaanam is a continuous environmental intelligence platform designed to monitor, analyze, and evaluate the environmental impact of infrastructure and development projects over time.

The platform combines:

- Satellite imagery
- Geospatial processing
- Computer Vision
- Remote Sensing
- Environmental analytics
- Rule-based intelligence
- Large Language Models (LLMs)
- Continuous monitoring
- Alerts and risk detection

Vaanam is **not primarily a report-generation system**.

Its core purpose is to create a continuously updated environmental understanding of a project area and convert observed environmental changes into actionable intelligence.

---

# 2. Core Architecture Principle

The fundamental architecture follows:

```text
Data
  ↓
Geospatial Processing
  ↓
Computer Vision / Remote Sensing
  ↓
Structured Environmental Facts
  ↓
Environmental Intelligence
  ↓
LLM Interpretation
  ↓
Decision / Action
  ↓
Continuous Monitoring
```

The LLM should **not directly analyze raw satellite imagery**.

Instead:

```text
Raw Satellite Image
       ↓
CV / Remote Sensing
       ↓
Measurable Environmental Data
       ↓
LLM
       ↓
Human-readable Interpretation
```

This separation improves reliability, explainability, cost efficiency, and system scalability.

---

# 3. High-Level Architecture

```text
┌───────────────────────────────────────────────────────────────┐
│                         DATA SOURCES                          │
├───────────────────────────────────────────────────────────────┤
│ Satellite Imagery │ GIS │ Project Documents │ Weather │ APIs │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     DATA INGESTION LAYER                      │
├───────────────────────────────────────────────────────────────┤
│ Satellite Acquisition │ Document Processing │ Metadata       │
│ AOI / Boundary Input  │ Data Validation     │ Scheduling     │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                 GEO-SPATIAL PROCESSING LAYER                  │
├───────────────────────────────────────────────────────────────┤
│ AOI Clipping │ Cloud Masking │ Reprojection │ Tiling         │
│ Mosaicing    │ Alignment     │ Normalization │ Pre-processing │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│               COMPUTER VISION / RS ENGINE                     │
├───────────────────────────────────────────────────────────────┤
│ Vegetation Detection │ Canopy Analysis │ Land Cover          │
│ NDVI / NDWI           │ Change Detection │ Anomaly Detection │
│ Plantation Monitoring │ Vegetation Loss │ Growth Analysis    │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│               ENVIRONMENTAL DATA LAYER                        │
├───────────────────────────────────────────────────────────────┤
│ Baseline │ Observations │ Vegetation Metrics │ Change Metrics│
│ Timeline │ Project State │ Monitoring History │ Evidence      │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│              ENVIRONMENTAL INTELLIGENCE ENGINE                │
├───────────────────────────────────────────────────────────────┤
│ Risk Scoring │ Rule Engine │ Trend Analysis │ Compliance      │
│ Impact Analysis │ Threshold Detection │ Anomaly Analysis     │
└───────────────────────────────┬───────────────────────────────┘
                                │
                     ┌──────────┴──────────┐
                     ▼                     ▼
          ┌──────────────────┐   ┌──────────────────┐
          │    LLM LAYER     │   │ ALERT ENGINE     │
          ├──────────────────┤   ├──────────────────┤
          │ Interpretation   │   │ Threshold Alerts │
          │ Explanation      │   │ Risk Alerts      │
          │ Recommendations  │   │ Change Alerts    │
          │ AI Assistant     │   │ Monitoring Alerts│
          └─────────┬────────┘   └────────┬─────────┘
                    │                     │
                    └──────────┬──────────┘
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                          │
├───────────────────────────────────────────────────────────────┤
│ Dashboard │ Project View │ Environmental Timeline             │
│ Maps      │ Risk View    │ Monitoring │ Alerts │ AI Assistant │
└───────────────────────────────────────────────────────────────┘
```

---

# 4. Architecture Layers

## 4.1 Data Sources Layer

Vaanam can consume multiple types of environmental and project data.

### Primary Sources

- Satellite imagery
- GIS boundaries
- Project Area of Interest (AOI)
- Project metadata
- Construction/project documents
- Environmental baseline information
- Weather and climate data
- Existing environmental datasets

### Satellite Data

Potential sources include:

- Sentinel-2
- Landsat
- Other satellite providers
- Higher-resolution commercial imagery in future versions
- Drone imagery in future versions

The architecture should remain provider-agnostic.

---

# 5. Data Ingestion Layer

The ingestion layer is responsible for acquiring and validating incoming data.

```text
External Sources
      │
      ▼
Data Ingestion Service
      │
      ├── Image Acquisition
      ├── GIS Import
      ├── Document Import
      ├── Metadata Extraction
      └── Validation
      │
      ▼
Object Storage / Database
```

### Responsibilities

- Fetch satellite imagery
- Accept project boundaries
- Validate geographic coordinates
- Extract image metadata
- Store source references
- Track acquisition dates
- Detect missing or invalid data
- Trigger processing pipelines

---

# 6. Geospatial Processing Layer

Raw satellite imagery cannot directly be passed to the analysis pipeline.

It first goes through geospatial preprocessing.

```text
Raw Imagery
    ↓
Quality Check
    ↓
Cloud / Shadow Masking
    ↓
Reprojection
    ↓
AOI Clipping
    ↓
Band Processing
    ↓
Tiling / Mosaicing
    ↓
Analysis Ready Image
```

### Responsibilities

- Coordinate system normalization
- AOI clipping
- Cloud masking
- Image alignment
- Resampling
- Tiling
- Mosaicing
- Band normalization
- Temporal alignment

This layer should produce standardized analysis-ready imagery.

---

# 7. Computer Vision / Remote Sensing Layer

This is the primary environmental observation layer.

The system extracts measurable information from imagery.

## 7.1 Vegetation Detection

Detect:

- Vegetated areas
- Non-vegetated areas
- Vegetation density
- Vegetation change

## 7.2 Canopy Analysis

Estimate:

- Canopy coverage
- Canopy change
- Canopy density
- Spatial distribution

Individual-tree detection should not be treated as a guaranteed MVP capability because it depends heavily on imagery resolution.

Higher-resolution imagery or drone data can support individual-tree analysis in later phases.

## 7.3 Land Cover Classification

Possible classes:

```text
Forest
Agriculture
Grassland
Built-up
Bare Soil
Water
Construction Area
Other
```

## 7.4 Vegetation Indices

Potential indices include:

- NDVI
- NDWI
- EVI
- SAVI
- Other domain-specific indices

## 7.5 Change Detection

Compare observations across time.

```text
T1 ──────────────── T2
 │                    │
 ▼                    ▼
Baseline Image    Latest Image
 │                    │
 └─────────┬──────────┘
           ▼
      Change Detection
           │
           ▼
    Environmental Change
```

Possible outputs:

- Vegetation loss
- Vegetation gain
- Canopy reduction
- Land-cover transition
- Construction expansion
- Plantation growth
- Plantation decline

---

# 8. Environmental Data Layer

The CV engine should not directly communicate with the frontend or LLM.

Its outputs are converted into structured environmental observations.

Example:

```json
{
  "project_id": "PROJECT-001",
  "observation_date": "2026-08-30",
  "vegetation_area_ha": 42.6,
  "canopy_area_ha": 31.2,
  "vegetation_change_percent": -35.9,
  "canopy_change_percent": -28.4,
  "construction_area_ha": 18.7,
  "confidence": 0.91
}
```

This layer becomes the **source of truth for environmental observations**.

---

# 9. Baseline System

Every project should establish an environmental baseline.

```text
Project Boundary
       ↓
Historical / Initial Imagery
       ↓
Environmental Analysis
       ↓
Baseline Metrics
       ↓
Baseline Snapshot
```

Example baseline:

```text
Project Area:           120 ha
Vegetation Area:         42.6 ha
Canopy Area:             31.2 ha
Water Bodies:             4.1 ha
Built-up Area:           11.3 ha
Baseline Date:       Jan 2026
```

Future observations are compared against this baseline.

---

# 10. Environmental Intelligence Engine

The Environmental Intelligence Engine converts observations into meaningful environmental conclusions.

```text
Environmental Observations
            ↓
      Rules + Analytics
            ↓
      ┌─────┴─────┐
      ▼           ▼
   Trends       Risks
      │           │
      └─────┬─────┘
            ▼
      Environmental
        Intelligence
```

### Responsibilities

- Baseline comparison
- Historical comparison
- Trend analysis
- Risk scoring
- Threshold detection
- Environmental impact analysis
- Anomaly detection
- Monitoring status
- Compliance indicators

---

# 11. Rule Engine

Not every decision should depend on an LLM.

Deterministic rules should handle measurable conditions.

Example:

```text
IF vegetation_loss > threshold
THEN environmental_risk = HIGH
```

Another example:

```text
IF plantation_survival < required_threshold
THEN plantation_status = AT_RISK
```

The rule engine provides deterministic and auditable decisions.

---

# 12. Risk Scoring

A project can receive a continuously updated environmental risk score.

Example conceptual model:

```text
Vegetation Change
       +
Canopy Change
       +
Land Cover Change
       +
Plantation Health
       +
Historical Trend
       +
Other Indicators
       ↓
   Risk Engine
       ↓
Environmental Risk Score
```

Example:

```text
Risk Score: 78 / 100

Vegetation Loss       HIGH
Canopy Reduction      MEDIUM
Plantation Health     HIGH
Recent Change         HIGH
```

The exact scoring model should be configurable rather than hard-coded into the UI.

---

# 13. LLM Layer

The LLM is an interpretation and interaction layer.

It should consume **structured, validated data**, not raw satellite imagery.

```text
Environmental Database
        │
        ▼
Context Builder
        │
        ├── Project Context
        ├── Baseline
        ├── Latest Observations
        ├── Historical Trends
        ├── Risk Results
        └── Relevant Rules
        │
        ▼
       LLM
        │
        ├── Explanation
        ├── Summary
        ├── Recommendations
        └── Natural Language Q&A
```

### Example

User:

> Why is this project currently at high environmental risk?

Context provided to LLM:

```text
Vegetation loss: 35.9%
Canopy loss: 28.4%
Recent construction expansion: 12.7 ha
Plantation survival: 62%
Risk score: 78
```

The LLM converts these facts into an understandable explanation.

The LLM should **not invent environmental measurements**.

---

# 14. AI Assistant

The AI assistant provides natural-language access to project intelligence.

Example questions:

```text
"What changed in the last 6 months?"

"Why is the risk score increasing?"

"Show me the vegetation loss trend."

"Which monitoring areas require attention?"

"How is the plantation performing?"

"Compare the current state with the baseline."
```

The assistant should retrieve data through controlled APIs/tools instead of having unrestricted database access.

---

# 15. Continuous Monitoring Architecture

Continuous monitoring is one of the core differentiators of Vaanam.

```text
             Scheduler
                 │
                 ▼
        New Imagery Available?
                 │
          ┌──────┴──────┐
          │             │
         YES             NO
          │             │
          ▼             └──→ Wait
    Data Ingestion
          │
          ▼
   Geo Processing
          │
          ▼
      CV Analysis
          │
          ▼
    Change Detection
          │
          ▼
    Risk Evaluation
          │
       ┌──┴──┐
       │     │
    Change   No Significant
    Found       Change
       │           │
       ▼           ▼
     Alert       Store
       │
       ▼
   Dashboard
```

---

# 16. Alert Engine

The alert engine generates actionable notifications.

### Possible Alerts

```text
VEGETATION_LOSS
CANOPY_DECLINE
ABNORMAL_CHANGE
PLANTATION_AT_RISK
RESTORATION_DELAY
MONITORING_REQUIRED
HIGH_ENVIRONMENTAL_RISK
```

Alerts should include:

- What changed
- Where it changed
- When it changed
- Magnitude of change
- Confidence
- Supporting evidence
- Recommended next action

---

# 17. Application Architecture

The frontend should communicate through backend APIs.

```text
┌────────────────────────────┐
│        Web Frontend        │
├────────────────────────────┤
│ Dashboard                  │
│ Project Management         │
│ Environmental Map          │
│ Timeline                   │
│ Risk Dashboard             │
│ Alerts                     │
│ AI Assistant               │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│        API Gateway         │
└──────────────┬─────────────┘
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
 Project   Monitoring   AI
 Service    Service   Service
      │        │        │
      └────────┼────────┘
               ▼
        Data / Analytics
```

---

# 18. Backend Services

The backend can initially be implemented as a modular monolith and later split into independent services when scale requires it.

Recommended logical modules:

```text
Backend
│
├── Authentication
├── User Management
├── Project Management
├── AOI Management
├── Satellite Data Service
├── Image Processing Service
├── Environmental Analysis
├── Monitoring Service
├── Risk Engine
├── Alert Service
├── AI Service
└── Report / Export Service
```

For MVP, these do not necessarily need to be separate microservices.

---

# 19. Storage Architecture

Vaanam handles multiple types of data, so a single storage mechanism is insufficient.

```text
                    Storage
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Relational     Object       Geospatial
      Database      Storage        Storage
          │            │            │
          ▼            ▼            ▼
 Metadata       Satellite       GIS Data
 Projects       Images           Geometry
 Users          Outputs          Spatial Data
 Metrics        Documents        AOIs
 Alerts         Model Results
```

### Relational Database

Store:

- Users
- Projects
- Organizations
- Monitoring jobs
- Environmental metrics
- Risk scores
- Alerts
- Observations
- Model metadata

### Object Storage

Store:

- Satellite imagery
- Processed imagery
- Model outputs
- Documents
- Generated artifacts

### Geospatial Storage

Use geospatial database capabilities for:

- Project boundaries
- AOIs
- Detection polygons
- Monitoring zones
- Change areas
- Spatial observations

---

# 20. Processing Architecture

Heavy geospatial and ML workloads should run asynchronously.

```text
API Request
    ↓
Create Processing Job
    ↓
Job Queue
    ↓
Worker
    ↓
Satellite / CV Processing
    ↓
Store Results
    ↓
Update Job Status
    ↓
Notify Application
```

This prevents long-running satellite processing from blocking API requests.

---

# 21. Model Architecture

The CV system should support replaceable models.

```text
                  CV Interface
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 Vegetation Model  Land Cover    Change Detection
                     Model           Model
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                Standard Output
```

This makes it possible to improve models without redesigning the entire system.

---

# 22. Confidence and Evidence

Every automated environmental observation should ideally include confidence metadata.

Example:

```json
{
  "metric": "vegetation_loss",
  "value": 35.9,
  "unit": "percent",
  "confidence": 0.91,
  "source_observation": "OBS-2026-08-30",
  "baseline_observation": "OBS-2026-01-15"
}
```

This enables Vaanam to provide explainable results rather than opaque AI conclusions.

---

# 23. Auditability

Environmental decisions should be traceable.

```text
Decision
   ↓
Risk Score
   ↓
Metrics
   ↓
CV Result
   ↓
Processed Image
   ↓
Original Satellite Observation
```

The system should maintain:

- Observation timestamps
- Model versions
- Processing versions
- Input imagery references
- Confidence scores
- Rule versions
- Risk calculation versions
- AI context used for explanations

This is important for future compliance and institutional use.

---

# 24. Security Architecture

Core security components:

```text
User
  ↓
Authentication
  ↓
Authorization
  ↓
API Gateway
  ↓
Project-Level Access Control
  ↓
Data
```

Recommended controls:

- Role-based access control
- Organization-level isolation
- Project-level permissions
- Secure API authentication
- Encrypted data transfer
- Secure object storage
- Audit logs
- Secrets management

---

# 25. MVP Architecture

The MVP should avoid unnecessary complexity.

```text
Satellite Data
      ↓
Python Geospatial Pipeline
      ↓
CV / Remote Sensing
      ↓
PostGIS / PostgreSQL
      ↓
Environmental Metrics
      ↓
Rule-Based Risk Engine
      ↓
LLM
      ↓
FastAPI Backend
      ↓
Web Dashboard
```

### MVP Focus

The first version should demonstrate:

1. Project creation
2. AOI definition
3. Satellite imagery ingestion
4. Environmental baseline generation
5. Vegetation analysis
6. Change detection
7. Environmental metrics
8. Risk scoring
9. AI explanation
10. Monitoring timeline
11. Alerts

---

# 26. Future Architecture

As Vaanam matures:

```text
                    VAANAM
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Satellite        Drone        IoT / Field
     Data           Data            Data
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              Multimodal Processing
                       │
                       ▼
             Environmental Digital
                    Twin
                       │
                       ▼
             Intelligence Engine
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Prediction    Simulation   Decision
          │            │            │
          └────────────┼────────────┘
                       ▼
               Continuous Action
```

Potential future capabilities:

- Higher-resolution imagery
- Individual-tree detection
- Drone integration
- Field-worker/mobile verification
- IoT sensors
- Predictive environmental risk
- Restoration progress prediction
- Advanced compliance automation
- Environmental digital twin
- Multi-project analytics

---

# 27. Key Architectural Decisions

## Decision 1 — CV before LLM

Raw imagery is processed using computer vision and remote sensing before reaching the LLM.

**Reason:**

- Lower cost
- Better reliability
- Better explainability
- Structured inputs
- Easier validation

---

## Decision 2 — Rule Engine + LLM

Critical environmental logic should not depend entirely on an LLM.

```text
Deterministic Rules
        +
Statistical / ML Analysis
        +
LLM Interpretation
```

This provides both reliability and natural-language intelligence.

---

## Decision 3 — Modular Monolith for MVP

The MVP should not start with dozens of microservices.

Use logical modules inside one backend and separate services only when scaling requires it.

This reduces:

- Development time
- Deployment complexity
- Infrastructure cost
- Debugging overhead

---

## Decision 4 — Asynchronous Processing

Satellite processing and CV workloads should run through background jobs.

This keeps the application responsive.

---

## Decision 5 — Provider-Agnostic Satellite Layer

The architecture should not depend on a single satellite provider.

```text
Satellite Provider A
Satellite Provider B
Satellite Provider C
        │
        ▼
Common Data Interface
        │
        ▼
Vaanam Processing Pipeline
```

---

# 28. End-to-End Example

Consider a highway construction project.

### Phase 1 — Baseline

```text
Project Boundary
       ↓
Historical Satellite Image
       ↓
Vegetation Analysis
       ↓
Baseline = 42.6 ha vegetation
```

### Phase 2 — Construction

```text
New Satellite Image
       ↓
CV Analysis
       ↓
Vegetation = 27.3 ha
       ↓
Change Detection
       ↓
15.3 ha reduction
```

### Phase 3 — Intelligence

```text
15.3 ha reduction
       ↓
Risk Engine
       ↓
High Environmental Risk
```

### Phase 4 — AI Interpretation

```text
Structured Evidence
       ↓
LLM
       ↓
"Vegetation coverage has decreased
significantly compared with the baseline..."
```

### Phase 5 — Continuous Monitoring

```text
Next Image
    ↓
Analysis
    ↓
Comparison
    ↓
Risk Update
    ↓
Alert / No Alert
```

This cycle continues throughout the project lifecycle.

---

# 29. Final Architecture Philosophy

Vaanam should be built as an **Environmental Intelligence and Continuous Monitoring Platform**, not as a document-generation application.

The architecture therefore follows:

```text
                    OBSERVE
                       │
                       ▼
                 Satellite / GIS
                       │
                       ▼
                    ANALYZE
                       │
                       ▼
                 CV / Remote Sensing
                       │
                       ▼
                 MEASURE
                       │
                       ▼
             Environmental Metrics
                       │
                       ▼
                 UNDERSTAND
                       │
                       ▼
          Rules + Analytics + LLM
                       │
                       ▼
                   DECIDE
                       │
                       ▼
              Risk / Recommendation
                       │
                       ▼
                    ACT
                       │
                       ▼
             Alert / Investigation
                       │
                       ▼
                  MONITOR AGAIN
                       │
                       └───────────────┐
                                       │
                                       ▼
                              Continuous Cycle
```

### Core principle

> **Vaanam converts satellite observations into continuous environmental intelligence and actionable decisions.**

The system's intelligence is therefore distributed across three layers:

```text
Computer Vision
     = "What changed?"

Intelligence Engine
     = "How significant is the change?"

LLM
     = "What does it mean and what should the user understand/do?"
```
