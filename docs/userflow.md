# Vaanam — Screen-by-Screen User Flow

## 1. Product Flow Overview

Vaanam is a continuous environmental accountability platform, not just a report generator.

Core loop:

**Measure → Plan → Plant → Identify → Monitor → Verify → Act → Report**

Primary users:

1. **Authority / Government** — oversight, compliance, verification, alerts.
2. **Project Organization / Developer** — creates projects, submits project data, manages obligations.
3. **Field Team / Plantation Agency** — executes plantation and field verification.
4. **Public / Citizen (optional later)** — transparent read-only environmental information.

---

# 2. Global Navigation

After login, the main application uses a role-based navigation.

### Authority
- Overview
- Projects
- Environmental Map
- Alerts
- Compliance
- Monitoring
- Reports
- Audit Trail

### Project Organization
- Dashboard
- Projects
- Baseline
- Impact Assessment
- Plantation Plan
- Monitoring
- Tasks
- Alerts
- Reports

### Field Team
- Assigned Projects
- Today's Tasks
- Plantation
- Tree Verification
- Field Surveys
- Issues
- Sync Status

---

# 3. Screen 01 — Login / Authentication

### Purpose
Identify the user and load the correct role and permissions.

### UI
- Email / mobile
- Password or OTP
- Login
- Forgot password
- Organization / authority identity

### Flow

```text
Login
  ↓
Authentication
  ↓
Role Detection
  ↓
Role-specific Dashboard
```

---

# 4. Screen 02 — Organization / User Setup

Shown during first-time onboarding.

### UI
- Organization name
- Organization type
- Authorized person
- Contact information
- Verification documents
- Role selection

### Flow

```text
Account
  ↓
Organization Verification
  ↓
User Role
  ↓
Dashboard
```

---

# 5. Screen 03 — Main Dashboard

The dashboard should answer one question:

> "What is the current environmental status of everything I am responsible for?"

### Organization Dashboard

Key cards:

- Active Projects
- Total Baseline Trees
- Trees Affected
- Plantation Target
- Trees Planted
- Verified Trees
- Survival Rate
- Compliance Score
- Open Alerts

### Main visual

Project/environmental map with status layers.

### Flow

```text
Dashboard
 ├── Project → Project Overview
 ├── Alert → Alert Details
 ├── Compliance → Compliance Dashboard
 ├── Map → Environmental Map
 └── Monitoring → Monitoring Center
```

---

# 6. Screen 04 — Create Project

### Purpose
Create the environmental monitoring entity.

### Fields

- Project name
- Project type
- Organization
- Project description
- Start date
- Expected completion date
- Project status
- Responsible officer

### Flow

```text
Create Project
  ↓
Enter Details
  ↓
Save Draft
  ↓
Define Project Area
```

---

# 7. Screen 05 — Define Project Area

This is the first major geospatial screen.

### User actions

- Draw polygon on map
- Upload GIS boundary
- Upload supported spatial file
- Edit boundary
- Confirm project area

### UI

```text
┌─────────────────────────────────┐
│ Search location                 │
├─────────────────────────────────┤
│                                 │
│         PROJECT MAP             │
│                                 │
│       ┌───────────────┐         │
│       │ Project Area  │         │
│       │               │         │
│       └───────────────┘         │
│                                 │
├─────────────────────────────────┤
│ Area: 42.6 ha     [Confirm]     │
└─────────────────────────────────┘
```

### Flow

```text
Project Details
  ↓
Draw / Upload Boundary
  ↓
Validate Geometry
  ↓
Confirm Area
  ↓
Baseline Assessment
```

---

# 8. Screen 06 — Baseline Assessment

### Purpose
Establish the environmental condition before major project impact.

### Data

- Existing vegetation
- Estimated tree count
- Green cover
- Land cover
- Historical vegetation trends
- Sensitive areas
- Baseline imagery
- Confidence / data quality

### UI

```text
BASELINE

Area                    42.6 ha
Estimated trees         3,842
Green cover             68%
Vegetation condition    Good
Sensitive zones         2

[View Baseline Map]
[Compare Historical Data]
[Approve Baseline]
```

### Important principle

Baseline should be **timestamped and immutable after approval**, with corrections recorded in the audit trail.

### Flow

```text
Project Area
  ↓
Acquire / Process Data
  ↓
Environmental Analysis
  ↓
Review
  ↓
Approve Baseline
  ↓
Impact Assessment
```

---

# 9. Screen 07 — Baseline Map

Interactive map showing the environmental starting point.

### Layers

- Project boundary
- Vegetation
- Tree clusters / detected trees
- Green cover
- Sensitive zones
- Historical imagery

### User actions

- Toggle layers
- Inspect area
- Compare dates
- View evidence
- Flag incorrect detection

---

# 10. Screen 08 — Project Impact Assessment

### Purpose
Understand how the planned project may change the baseline.

### Inputs

- Construction boundary
- Construction zones
- Infrastructure footprint
- Planned clearing
- Project timeline
- Relevant regulatory obligations

### Output

```text
Baseline trees             3,842
Potentially affected       1,240
Remaining projected        2,602

Compensation requirement   Based on applicable rules
```

### Important

Vaanam should not hardcode a universal compensation ratio. The applicable legal/regulatory requirement should be configurable by jurisdiction and project type.

### Flow

```text
Approved Baseline
  ↓
Project / Construction Data
  ↓
Spatial Impact Analysis
  ↓
Review
  ↓
Impact Assessment
  ↓
Restoration / Plantation Planning
```

---

# 11. Screen 09 — Plantation / Restoration Plan

### Purpose
Convert environmental obligations into an executable plan.

### UI

- Required plantation quantity
- Target area
- Candidate plantation zones
- Species recommendations
- Planting schedule
- Maintenance period
- Responsible agency
- Monitoring schedule

### Map

Show:

- Existing project area
- Proposed plantation zones
- Restricted zones
- Suitable zones

### Flow

```text
Impact Assessment
  ↓
Determine Obligation
  ↓
Select Restoration Zones
  ↓
Define Plantation Plan
  ↓
Assign Responsible Agency
  ↓
Schedule Execution
```

---

# 12. Screen 10 — Assign Field Team / Agency

### Purpose
Connect planning with real-world execution.

### Actions

- Select agency
- Assign field officers
- Assign zones
- Set targets
- Set deadlines
- Define verification requirements

### Flow

```text
Plantation Plan
  ↓
Assign Agency
  ↓
Assign Zones
  ↓
Assign Tasks
  ↓
Field App
```

---

# 13. Screen 11 — Field Team Home

Designed primarily for mobile.

### UI

```text
TODAY

Assigned Projects       3
Pending Tasks            12
Plantations Due          8
Verifications Due        5
Issues                   2

[Start Field Work]
```

The field experience should minimize typing and work well with weak connectivity.

---

# 14. Screen 12 — Plantation Recording

### Field workflow

```text
Select Project
  ↓
Select Plantation Zone
  ↓
Capture GPS
  ↓
Plant Tree
  ↓
Capture Photo
  ↓
Select Species
  ↓
Enter / Scan Tree ID
  ↓
Submit
```

### Captured evidence

- GPS
- Timestamp
- Photo
- Species
- Tree ID
- Field officer
- Project
- Plantation zone

---

# 15. Screen 13 — Tree Identity

Every monitored tree should have a persistent digital identity where feasible.

### Example

```text
TREE ID
VAANAM-T-000182

Species              Neem
Project               ABC Infrastructure
Zone                  Zone 04
Planted               12 Aug 2026
Latitude              XX.XXXX
Longitude             XX.XXXX

Current Status        Healthy
Last Verified         21 Sep 2026

Timeline
────────────────────────
12 Aug  Planting
21 Aug  Verification
10 Sep  Monitoring
21 Sep  Healthy
```

This turns a plantation entry into a lifecycle record.

---

# 16. Screen 14 — Tree / Plantation Verification

### Purpose
Confirm that reported plantation actually exists.

### Verification modes

- Field verification
- Photo evidence
- GPS verification
- Satellite / remote sensing evidence where technically suitable
- Manual review

### Status

```text
Reported
   ↓
Verification Pending
   ↓
Verified
   OR
Rejected / Needs Review
```

---

# 17. Screen 15 — Continuous Monitoring Center

This is one of Vaanam's core screens.

### Purpose

Continuously evaluate environmental status after plantation and during project lifecycle.

### UI

```text
MONITORING CENTER

Projects monitored          18
Healthy zones               42
At-risk zones               7
Potential loss detected     3
Verification required       11
```

### Monitoring sources

- Satellite imagery
- Remote sensing indices
- Field observations
- Geospatial change detection
- Uploaded evidence
- Optional IoT/sensor data in future

### Flow

```text
New Data
  ↓
Change Detection
  ↓
Environmental Analysis
  ↓
Risk Classification
  ↓
Alert / No Alert
  ↓
Verification if needed
```

---

# 18. Screen 16 — Environmental Map

A unified map across the entire lifecycle.

### Layers

- Project boundaries
- Baseline
- Construction footprint
- Plantation zones
- Individual tree records
- Vegetation condition
- Risk zones
- Alerts
- Historical change
- Monitoring observations

### Key interaction

User can select a location and see:

```text
What was here before?
        ↓
What changed?
        ↓
What was planted?
        ↓
What is the current condition?
        ↓
What action is required?
```

---

# 19. Screen 17 — Alert Center

### Purpose
Convert monitoring signals into actionable work.

### Alert examples

```text
🔴 Critical
Possible plantation loss in Zone 04

🟠 High
Vegetation decline detected

🟡 Medium
Verification overdue

🔵 Information
New satellite observation available
```

### Alert lifecycle

```text
Detected
  ↓
Alert Created
  ↓
Assigned
  ↓
Field Verification
  ↓
Confirmed / False Positive
  ↓
Action
  ↓
Resolved
```

---

# 20. Screen 18 — Issue / Action Management

An alert should not end as a notification.

### Example

```text
Issue:
119 trees potentially missing

Action:
Field team verification

Owner:
XYZ Agency

Deadline:
30 Sep 2026

Status:
In Progress
```

Possible actions:

- Verify
- Replant
- Inspect
- Update evidence
- Escalate
- Close

---

# 21. Screen 19 — Compliance Dashboard

### Purpose
Show whether the project is meeting its environmental obligations.

### Metrics

- Baseline condition
- Environmental impact
- Required obligation
- Plantation progress
- Verification rate
- Survival / health indicators
- Maintenance compliance
- Open issues
- Overdue actions
- Overall compliance status

### Example

```text
ENVIRONMENTAL COMPLIANCE

Plantation target       3,720
Planted                  3,720
Verified                 3,581
Currently healthy        3,214

Open critical issues         2
Overdue actions              5

Status: NEEDS ATTENTION
```

The score should be explainable rather than a black-box number.

---

# 22. Screen 20 — Project Lifecycle Timeline

Every project gets one chronological environmental timeline.

```text
2026
│
├── Jan   Baseline approved
│
├── Mar   Construction started
│
├── Apr   Impact monitoring
│
├── Jun   Vegetation change detected
│
├── Aug   Plantation started
│
├── Sep   Plantation verified
│
├── Oct   Monitoring
│
└── ...
```

This provides a single narrative of what happened to the environment.

---

# 23. Screen 21 — Evidence & Audit Trail

### Purpose
Make every important claim traceable.

For any record, show:

- Who created it
- When
- Location
- Source
- Supporting image/data
- Previous value
- Current value
- Approval
- Action history

### Example

```text
Claim:
Tree marked as missing

Evidence:
Satellite observation
Field verification
Photograph
GPS

Decision:
Confirmed

Action:
Replanting required
```

---

# 24. Screen 22 — Reports

Reports become an **output of the platform**, not the platform itself.

### Reports

- Baseline assessment
- Impact assessment
- Plantation progress
- Monitoring report
- Compliance report
- Project closure report
- Audit/evidence package

### Flow

```text
Live Platform Data
  ↓
Validated Records
  ↓
Report Builder
  ↓
Generate Report
```

---

# 25. Screen 23 — Project Closure

A project should not simply be marked "completed".

### Closure checklist

- Construction status
- Baseline archived
- Impact recorded
- Plantation obligation fulfilled
- Plantation verified
- Monitoring period completed
- Open issues resolved
- Final compliance review
- Evidence archived

### Flow

```text
Project Completion
  ↓
Environmental Closure Review
  ↓
Resolve Outstanding Issues
  ↓
Authority Approval
  ↓
Project Closed
  ↓
Long-term Monitoring (if required)
```

---

# 26. Screen 24 — Authority Command Center

This is the government-level view.

### Dashboard

```text
TOTAL PROJECTS                 248
ACTIVE                         173
AT RISK                         31
NON-COMPLIANT                   12
UNDER VERIFICATION              27

Trees affected             1.2M
Trees planted              3.8M
Verified                   3.4M
```

### Map

Authority can filter by:

- State / district
- Organization
- Project type
- Compliance status
- Risk level
- Environmental zone

---

# 27. Screen 25 — Public Transparency View (Future)

Optional and carefully scoped.

Public users could see:

- Project location
- Environmental commitments
- Plantation progress
- High-level monitoring status
- Verified environmental outcomes

Sensitive operational data, personal information, and security-sensitive details should not be exposed.

---

# 28. End-to-End User Flow

```text
                    LOGIN
                      │
                      ▼
                 DASHBOARD
                      │
              ┌───────┴────────┐
              ▼                ▼
        CREATE PROJECT     EXISTING PROJECT
              │                │
              ▼                ▼
       DEFINE PROJECT AREA   OVERVIEW
              │
              ▼
       BASELINE ASSESSMENT
              │
              ▼
       BASELINE APPROVAL
              │
              ▼
       IMPACT ASSESSMENT
              │
              ▼
      ENVIRONMENTAL OBLIGATION
              │
              ▼
       PLANTATION PLAN
              │
              ▼
       ASSIGN FIELD TEAM
              │
              ▼
        FIELD EXECUTION
              │
              ▼
       TREE IDENTIFICATION
              │
              ▼
          VERIFICATION
              │
              ▼
      CONTINUOUS MONITORING
              │
        ┌─────┴─────┐
        ▼           ▼
     HEALTHY      CHANGE
        │           │
        │           ▼
        │         ALERT
        │           │
        │           ▼
        │      FIELD VERIFY
        │           │
        │      ┌────┴────┐
        │      ▼         ▼
        │   CONFIRMED   FALSE
        │      │
        │      ▼
        │   ACTION
        │      │
        └──────┴──────────┐
                          ▼
                 COMPLIANCE STATUS
                          │
                          ▼
                     REPORTING
                          │
                          ▼
                    PROJECT CLOSURE
                          │
                          ▼
                 LONG-TERM MONITORING
```

---

# 29. The Most Important Product Loop

Vaanam should repeatedly answer these five questions:

### 1. What was there?
**Baseline**

### 2. What changed?
**Impact / Change Detection**

### 3. What did we promise to restore?
**Environmental Obligation**

### 4. Did we actually restore it?
**Plantation + Verification**

### 5. Is it still there and healthy?
**Continuous Monitoring**

That makes Vaanam fundamentally different from a system that only generates a PDF at the end.

---

# 30. MVP Screen Set

Do not build all 25 screens initially.

For an MVP / SIH prototype, prioritize:

1. Login
2. Dashboard
3. Create Project
4. Project Area Map
5. Baseline Assessment
6. Impact Assessment
7. Plantation Plan
8. Field Plantation Entry
9. Tree Identity
10. Monitoring Center
11. Alerts
12. Compliance Dashboard
13. Environmental Map
14. Reports
15. Audit Trail

These screens demonstrate the complete product loop without turning the project into an oversized enterprise system.

---

# 31. MVP Demonstration Story

The strongest demo should follow **one project** from beginning to end.

Example:

```text
Bullet Train Project
        ↓
Select Project Area
        ↓
Vaanam establishes baseline
        ↓
3,842 trees identified/estimated
        ↓
Construction impact detected/planned
        ↓
Environmental obligation calculated
        ↓
Plantation plan created
        ↓
Field team plants trees
        ↓
Trees receive digital identities
        ↓
Monitoring begins
        ↓
Vaanam detects vegetation/tree-risk change
        ↓
Alert generated
        ↓
Field team verifies
        ↓
Action taken
        ↓
Compliance dashboard updated
        ↓
Evidence-backed report generated
```

**This is the story the UI should tell.**

---

# 32. Product Principle

> **Reports are an output. Monitoring and accountability are the product.**

The core Vaanam experience is therefore:

**Project → Baseline → Impact → Obligation → Restoration → Verification → Continuous Monitoring → Action → Compliance**

