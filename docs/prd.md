# Vaanam --- Product Requirements Document (PRD)

**Document Version:** 2.0\
**Status:** Product Definition / MVP Planning\
**Date:** 29 August 2026\
**Product:** Vaanam\
**Category:** Environmental Intelligence & Compliance Platform

------------------------------------------------------------------------

## 1. Executive Summary

Vaanam is an Environmental Intelligence & Compliance Platform designed
to continuously monitor the environmental impact of infrastructure and
development projects throughout their lifecycle.

The core idea is to move environmental monitoring from a
**document/report-centric process** to a **continuous, evidence-driven
system**.

Vaanam combines:

-   GIS and project boundaries
-   Satellite and remote-sensing data
-   Baseline environmental assessment
-   Change detection
-   Vegetation and green-cover monitoring
-   Field verification
-   Plantation/restoration tracking
-   Survival monitoring
-   Compliance commitments
-   Evidence management
-   Alerts and decision support

The platform creates a living environmental record for a project rather
than producing a static report at the end.

### Product Principle

> **Vaanam does not exist to generate reports. Reports are one output of
> a continuously monitored environmental intelligence system.**

------------------------------------------------------------------------

# 2. Problem Statement

Large infrastructure and development projects can alter forests,
vegetation, water bodies, land use, and other environmental assets.

The current ecosystem is often fragmented across:

-   Environmental impact documents
-   GIS files
-   Satellite imagery
-   Government approvals
-   Plantation records
-   Field inspection reports
-   Photographs
-   Spreadsheets
-   Compliance submissions
-   Different monitoring teams

This creates several problems:

1.  Environmental conditions before a project may not be represented in
    one continuously accessible baseline.
2.  Environmental changes during construction may be difficult to detect
    and correlate with project activity.
3.  Compensatory plantation/restoration commitments may be tracked
    separately from the original environmental impact.
4.  Plantation survival may not be continuously monitored.
5.  Evidence is distributed across documents and systems.
6.  Authorities and organizations may have difficulty understanding the
    current environmental status of a project.
7.  Compliance can become a periodic documentation exercise rather than
    a continuously verified state.

### Core Problem

There is a gap between:

**What existed → What changed → What was required → What was actually
done → Whether it survived → Whether the project is currently
compliant.**

Vaanam aims to connect this entire chain.

------------------------------------------------------------------------

# 3. Product Vision

> **Build a living environmental intelligence layer for development
> projects that continuously connects environmental baseline, project
> activity, environmental impact, mitigation commitments, field actions,
> and verification.**

Vaanam should allow a user to open a project and understand:

-   What was there before the project?
-   What is there now?
-   What changed?
-   Where did the change happen?
-   What environmental obligation resulted from the change?
-   What mitigation/restoration action was required?
-   Was the action completed?
-   Did it survive?
-   What evidence supports the current status?
-   What action is required next?

------------------------------------------------------------------------

# 4. Product Goals

## 4.1 Primary Goals

### G1 --- Establish a reliable environmental baseline

Create a spatial and temporal baseline for a project area before major
project activity.

### G2 --- Continuously monitor environmental change

Detect meaningful changes in vegetation, land cover and other supported
environmental indicators.

### G3 --- Connect impact to action

Connect detected or recorded environmental impact with corresponding
mitigation, restoration or compensation commitments.

### G4 --- Verify implementation

Allow field and remote evidence to verify whether required actions were
actually completed.

### G5 --- Monitor restoration outcomes

Track plantation/restoration progress and survival over time.

### G6 --- Create a living evidence trail

Maintain a chronological record of environmental observations, actions,
evidence and verification.

### G7 --- Support decisions

Give authorities, organizations and environmental teams a current
environmental status instead of forcing them to reconstruct it from
multiple reports.

------------------------------------------------------------------------

# 5. Non-Goals

Vaanam will not initially:

-   Replace statutory environmental authorities.
-   Automatically grant environmental clearances.
-   Make legally binding compliance decisions without human review.
-   Replace environmental experts or certified field assessors.
-   Guarantee individual-tree identification in every environment.
-   Treat satellite-derived estimates as legally definitive without
    validation.
-   Become a generic GIS platform.
-   Become only a document/report generator.

------------------------------------------------------------------------

# 6. Target Users

## 6.1 Project / Infrastructure Organization

Examples:

-   Rail projects
-   Highways
-   Industrial projects
-   Mining projects
-   Energy projects
-   Urban development projects

### Needs

-   Monitor environmental commitments
-   Track plantation/restoration
-   Reduce compliance risk
-   Maintain evidence
-   Identify issues early

------------------------------------------------------------------------

## 6.2 Government / Regulatory Authority

### Needs

-   Monitor multiple projects
-   Identify high-risk projects
-   Review evidence
-   Track compliance
-   Compare baseline and current conditions
-   Prioritize inspections

------------------------------------------------------------------------

## 6.3 Environmental Consultant

### Needs

-   Conduct baseline assessment
-   Monitor environmental indicators
-   manage project evidence
-   perform field verification
-   generate assessments

------------------------------------------------------------------------

## 6.4 Field Officer / Inspector

### Needs

-   Receive assigned inspections
-   Navigate to monitoring locations
-   Capture photographs/GPS
-   Record observations
-   Verify plantation/restoration
-   Submit field evidence

------------------------------------------------------------------------

## 6.5 Project Administrator

### Needs

-   Configure project
-   Define monitoring areas
-   assign responsibilities
-   track tasks
-   manage evidence and users

------------------------------------------------------------------------

# 7. Core Product Concept

Vaanam is built around a **Project Environmental Digital Record**.

Each project maintains a continuously updated environmental record.

``` text
PROJECT
   │
   ├── Project Boundary
   │
   ├── Environmental Baseline
   │      ├── Vegetation
   │      ├── Green Cover
   │      ├── Water
   │      └── Land Use
   │
   ├── Project Activity
   │
   ├── Environmental Changes
   │
   ├── Environmental Obligations
   │
   ├── Mitigation / Restoration
   │
   ├── Field Verification
   │
   ├── Survival Monitoring
   │
   └── Compliance State
```

------------------------------------------------------------------------

# 8. Core User Journey

``` text
Create Project
      ↓
Define Project Boundary
      ↓
Collect / Generate Baseline
      ↓
Baseline Review
      ↓
Project Monitoring Begins
      ↓
Periodic Satellite Analysis
      ↓
Change Detection
      ↓
Human / Expert Review
      ↓
Impact Record
      ↓
Mitigation / Compensation Requirement
      ↓
Action Plan
      ↓
Implementation
      ↓
Field Verification
      ↓
Remote Monitoring
      ↓
Survival / Outcome Monitoring
      ↓
Compliance State
      ↓
Alerts / Decisions / Reports
```

------------------------------------------------------------------------

# 9. Product Modules

## Module 1 --- Project Management

### Purpose

Create and manage environmental monitoring projects.

### Requirements

-   Create project
-   Project name
-   Project type
-   Organization
-   Project description
-   Location
-   Project boundary
-   Start date
-   expected end date
-   project status
-   responsible team
-   monitoring frequency

### Project States

``` text
Draft
↓
Baseline Pending
↓
Monitoring Active
↓
Under Review
↓
Action Required
↓
Compliant / Partially Compliant / At Risk
↓
Completed / Archived
```

------------------------------------------------------------------------

# 10. Module 2 --- Baseline Environmental Assessment

### Purpose

Create a reference state against which future environmental change can
be measured.

### Baseline Inputs

-   Satellite imagery
-   GIS layers
-   Land-use information
-   Vegetation indicators
-   Water-body information
-   Existing tree/vegetation inventory where available
-   Project documents
-   Field observations

### Baseline Output

The system should create a baseline snapshot containing:

-   Baseline map
-   Baseline date/range
-   Green-cover estimate
-   Vegetation indicators
-   Land-use classes
-   Water-body information
-   Relevant environmental assets
-   Data confidence
-   Source/evidence references

### Requirement

Every monitoring project must have a clearly identifiable baseline
version.

------------------------------------------------------------------------

# 11. Module 3 --- Continuous Environmental Monitoring

### Purpose

Continuously compare new observations against the established baseline
and previous observations.

### Monitoring Sources

Potential sources include:

-   Satellite imagery APIs
-   Open geospatial datasets
-   GIS layers
-   Field observations
-   Uploaded imagery
-   Project data

### Initial Monitoring Indicators

MVP:

-   Vegetation/green-cover change
-   Land-cover change
-   Project-area change
-   Restoration-area change

Future:

-   Water-body change
-   Soil/land degradation indicators
-   Biodiversity proxies
-   Air-quality integrations
-   Weather/climate context

### Monitoring Frequency

Configurable:

-   Weekly
-   Biweekly
-   Monthly
-   Quarterly

Actual frequency depends on data availability, project type and
monitoring requirements.

------------------------------------------------------------------------

# 12. Module 4 --- Change Detection

### Purpose

Identify meaningful environmental changes automatically.

### Example

A baseline shows a vegetation-heavy area.

Later satellite observations show a significant reduction.

Vaanam creates:

``` text
Detected Change
Location: Zone A
Indicator: Vegetation
Change: Decrease
Severity: Medium
Confidence: 87%
Detected: 14 Aug 2026
Status: Requires Review
```

### Change Detection Requirements

The system should:

-   Compare baseline and current observations
-   Detect spatial changes
-   Calculate change magnitude
-   assign confidence
-   create map overlays
-   maintain historical observations
-   avoid creating compliance violations automatically
-   route significant changes for review

### Human-in-the-loop

Automated detection must be reviewable.

``` text
AI / Algorithm Detection
        ↓
Confidence Assessment
        ↓
Human Review
        ↓
Confirmed Change / False Positive
```

------------------------------------------------------------------------

# 13. Module 5 --- Environmental Impact Assessment Record

Each confirmed change can become an impact record.

### Impact Record

Fields:

-   Impact ID
-   Project ID
-   location
-   detection date
-   baseline reference
-   current observation
-   affected area
-   environmental indicator
-   estimated severity
-   confidence
-   evidence
-   reviewer
-   review status
-   linked obligation

### Impact Status

``` text
Detected
↓
Under Review
↓
Confirmed
↓
Rejected / False Positive
↓
Linked to Action
```

------------------------------------------------------------------------

# 14. Module 6 --- Mitigation & Compensation Management

### Purpose

Convert environmental obligations into trackable actions.

Examples:

-   Plantation
-   Restoration
-   Green-belt development
-   Water-body restoration
-   Replacement planting
-   Other project-specific mitigation actions

### Action Record

-   Action ID
-   Linked project
-   Linked impact/obligation
-   Action type
-   Target quantity/area
-   Location
-   Responsible organization
-   Responsible person
-   Start date
-   Deadline
-   Current progress
-   Evidence
-   Verification status

### Example

``` text
Impact:
Vegetation loss detected

        ↓

Requirement:
Restoration / plantation required

        ↓

Action:
Plant 10,000 saplings

        ↓

Target:
10,000

Completed:
8,700

Verified:
8,250

Survival:
7,900

Current Status:
At Risk
```

------------------------------------------------------------------------

# 15. Module 7 --- Plantation / Restoration Tracking

### Purpose

Track restoration from implementation to outcome.

### Plantation Record

-   Plantation ID
-   Site
-   Coordinates
-   Plantation date
-   Species
-   Planned quantity
-   Actual quantity
-   responsible organization
-   caretaker
-   supporting evidence
-   verification status

### Monitoring Lifecycle

``` text
Planned
↓
Site Prepared
↓
Planted
↓
Field Verified
↓
Survival Monitoring
↓
Surviving / Failed
↓
Replacement Required / Stable
```

------------------------------------------------------------------------

# 16. Module 8 --- Survival Monitoring

This is a major differentiator for Vaanam.

Plantation completion alone does not necessarily mean environmental
restoration succeeded.

### Metrics

-   Planned plants
-   Planted plants
-   Verified plants
-   Surviving plants
-   Survival percentage
-   Failed plants
-   Replacement requirement

### Formula

``` text
Survival Rate =
Verified Surviving Plants / Verified Planted Plants × 100
```

### Important Design Principle

Vaanam should distinguish:

**Claimed → Verified → Surviving**

This prevents the system from treating plantation paperwork as
equivalent to successful restoration.

------------------------------------------------------------------------

# 17. Module 9 --- Field Verification

### Purpose

Connect digital monitoring with real-world observations.

### Mobile Workflow

``` text
Assigned Inspection
       ↓
Navigate to Site
       ↓
Capture GPS
       ↓
Capture Photos
       ↓
Record Observation
       ↓
Complete Checklist
       ↓
Submit
       ↓
Reviewer Validation
```

### Evidence Metadata

Every field observation should store:

-   Timestamp
-   GPS location
-   User
-   Project
-   Observation type
-   Photographs
-   Notes
-   Device information where appropriate

### Offline Support

Future/mobile implementation should support offline field capture and
later synchronization where network connectivity is poor.

------------------------------------------------------------------------

# 18. Module 10 --- Evidence Management

Vaanam should maintain an evidence chain.

### Evidence Types

-   Satellite observation
-   GIS layer
-   Field photograph
-   GPS observation
-   Document
-   Inspection record
-   Plantation record
-   Verification record

### Evidence Requirements

Every major environmental claim should be traceable to one or more
evidence sources.

``` text
Claim
 ↓
Observation
 ↓
Evidence
 ↓
Source
 ↓
Timestamp
```

------------------------------------------------------------------------

# 19. Module 11 --- Compliance Intelligence

The platform should calculate an operational compliance state based on
configured project obligations.

### Example Inputs

-   Required action
-   Deadline
-   Completion
-   Verification
-   Survival
-   Pending evidence
-   Overdue actions
-   unresolved environmental changes

### Status Examples

-   Compliant
-   Partially Compliant
-   At Risk
-   Action Required
-   Overdue
-   Under Review

### Important

A Vaanam compliance status is a **decision-support indicator**, not a
replacement for statutory legal determination.

------------------------------------------------------------------------

# 20. Module 12 --- Alerts & Notifications

### Alert Types

#### Environmental

-   Significant vegetation loss
-   Unexpected land-cover change
-   Restoration-area degradation

#### Compliance

-   Action deadline approaching
-   Action overdue
-   Missing evidence
-   Verification pending

#### Restoration

-   Low survival
-   Replacement required
-   Monitoring overdue

### Priority

``` text
Info
Low
Medium
High
Critical
```

------------------------------------------------------------------------

# 21. Module 13 --- Dashboard

The dashboard should answer the user's most important questions
immediately.

### Project Overview

Display:

-   Overall project status
-   Environmental health indicators
-   Active alerts
-   Open actions
-   Monitoring coverage
-   Restoration progress
-   Survival rate
-   Recent changes

### Map

Primary visualization:

``` text
Project Boundary
+
Baseline Layer
+
Current Layer
+
Detected Changes
+
Restoration Sites
+
Field Observations
```

### Timeline

``` text
Baseline
   ↓
Project Started
   ↓
Change Detected
   ↓
Impact Confirmed
   ↓
Action Created
   ↓
Plantation Completed
   ↓
Field Verified
   ↓
Survival Monitoring
```

------------------------------------------------------------------------

# 22. Key Screens

## Screen 1 --- Landing / Login

Purpose:

-   Introduce platform
-   Authentication
-   Organization access

------------------------------------------------------------------------

## Screen 2 --- Organization Dashboard

Shows:

-   Total projects
-   Active monitoring
-   At-risk projects
-   Open actions
-   Recent alerts

------------------------------------------------------------------------

## Screen 3 --- Project List

Filters:

-   Project type
-   Location
-   Status
-   Risk
-   Organization
-   Date

------------------------------------------------------------------------

## Screen 4 --- Create Project

Form:

-   Project details
-   Boundary upload/drawing
-   Project timeline
-   Monitoring configuration

------------------------------------------------------------------------

## Screen 5 --- Project Overview

Sections:

-   Project status
-   Map
-   Environmental indicators
-   Alerts
-   Actions
-   Timeline

------------------------------------------------------------------------

## Screen 6 --- Baseline Explorer

Shows:

-   Baseline map
-   Historical imagery
-   Environmental layers
-   Baseline metrics
-   Evidence

------------------------------------------------------------------------

## Screen 7 --- Monitoring

Shows:

-   Current observations
-   Historical comparison
-   Monitoring status
-   Latest satellite observation
-   Detected changes

------------------------------------------------------------------------

## Screen 8 --- Change Review

Shows:

-   Before image
-   After image
-   Change map
-   affected area
-   confidence
-   reviewer decision

Actions:

-   Confirm
-   Reject
-   Request field verification

------------------------------------------------------------------------

## Screen 9 --- Impact Detail

Shows:

-   Impact information
-   Location
-   Evidence
-   Baseline comparison
-   linked obligations

------------------------------------------------------------------------

## Screen 10 --- Action / Compensation Plan

Shows:

-   Required action
-   Target
-   Deadline
-   Responsible party
-   Progress
-   Evidence

------------------------------------------------------------------------

## Screen 11 --- Restoration Site

Shows:

-   Site location
-   Plantation details
-   Target quantity
-   Verified quantity
-   Survival history
-   Photos

------------------------------------------------------------------------

## Screen 12 --- Field Verification

Mobile-first:

-   Assigned sites
-   Map
-   GPS
-   Camera
-   Checklist
-   Submit verification

------------------------------------------------------------------------

## Screen 13 --- Compliance

Shows:

-   Compliance status
-   fulfilled obligations
-   pending actions
-   overdue actions
-   evidence completeness
-   risk indicators

------------------------------------------------------------------------

## Screen 14 --- Evidence Timeline

A chronological record of:

-   observations
-   changes
-   decisions
-   actions
-   field visits
-   evidence

------------------------------------------------------------------------

## Screen 15 --- Reports / Export

Outputs:

-   Environmental summary
-   Monitoring report
-   Action status
-   Evidence package
-   Compliance summary

Reports are an **output**, not the core product.

------------------------------------------------------------------------

# 23. User Stories

## Project Administrator

-   As a project administrator, I want to create a project so that its
    environmental monitoring can begin.
-   As a project administrator, I want to define the project boundary so
    that monitoring is spatially constrained.
-   As a project administrator, I want to assign responsibilities so
    that actions have accountable owners.

## Environmental Analyst

-   As an analyst, I want to review baseline imagery so that I can
    establish the environmental reference state.
-   As an analyst, I want to inspect detected changes so that false
    positives can be rejected.
-   As an analyst, I want to link confirmed impact to mitigation
    actions.

## Field Officer

-   As a field officer, I want to see assigned inspection locations so
    that I know where to go.
-   As a field officer, I want to capture GPS-tagged photographs so that
    observations have spatial evidence.
-   As a field officer, I want to work offline so that field
    connectivity does not block data collection.

## Authority / Reviewer

-   As a reviewer, I want to see at-risk projects so that I can
    prioritize attention.
-   As a reviewer, I want to inspect evidence so that decisions are
    evidence-driven.
-   As a reviewer, I want to see the project timeline so that I can
    understand how environmental conditions evolved.

------------------------------------------------------------------------

# 24. Functional Requirements

## FR-01 Project Creation

The system shall allow authorized users to create projects.

## FR-02 Spatial Boundary

The system shall support drawing or uploading project boundaries.

## FR-03 Baseline

The system shall maintain a baseline record for each monitored project.

## FR-04 Historical Comparison

The system shall allow comparison between different observation dates.

## FR-05 Change Detection

The system shall detect configured environmental changes using supported
data sources.

## FR-06 Review

The system shall allow authorized users to review automated detections.

## FR-07 Impact Records

The system shall allow confirmed changes to be recorded as impact
events.

## FR-08 Action Tracking

The system shall allow mitigation/restoration actions to be created and
tracked.

## FR-09 Evidence

The system shall associate evidence with observations, impacts and
actions.

## FR-10 Field Verification

The system shall support field observations with location and media.

## FR-11 Survival Tracking

The system shall calculate and display restoration survival metrics.

## FR-12 Alerts

The system shall notify responsible users about configured events.

## FR-13 Compliance

The system shall display an operational compliance state based on
configured obligations.

## FR-14 Audit Trail

The system shall maintain a history of important changes and decisions.

## FR-15 Export

The system shall allow authorized users to export summaries and evidence
packages.

------------------------------------------------------------------------

# 25. Non-Functional Requirements

## Performance

-   Dashboard should load core project information quickly.
-   Map interactions should remain usable for normal project sizes.
-   Background satellite analysis may run asynchronously.

## Scalability

The architecture should support:

-   Multiple organizations
-   Multiple projects
-   Large geospatial datasets
-   Periodic imagery ingestion
-   Increasing evidence volume

## Security

-   Role-based access control
-   Authentication
-   Authorization
-   Encrypted data transmission
-   Secure file storage
-   Audit logging

## Reliability

-   Background processing should support retries.
-   Failed ingestion jobs should be visible.
-   Important data should not be lost during processing failures.

## Explainability

Environmental detections should expose:

-   Source
-   Observation date
-   Method/model where applicable
-   Confidence
-   Relevant imagery/layers
-   Human review status

------------------------------------------------------------------------

# 26. AI / Intelligence Layer

AI should be used as an **assistant to environmental monitoring**, not
as an unquestionable authority.

### Potential AI capabilities

-   Change detection
-   Image classification
-   Vegetation analysis
-   Anomaly detection
-   Evidence summarization
-   Document extraction
-   Risk prioritization
-   Natural-language project queries

### Example

User asks:

> "Why is this project marked at risk?"

Vaanam responds using structured evidence:

``` text
Project is marked At Risk because:

1. 2 monitoring zones show significant vegetation decline.
2. One mitigation action is overdue.
3. Restoration verification is incomplete.
4. Latest verified survival rate is below the configured threshold.

Evidence:
- Satellite observations
- Field verification
- Action records
```

------------------------------------------------------------------------

# 27. Data Architecture

Conceptual architecture:

``` text
                DATA SOURCES
                     │
        ┌────────────┼────────────┐
        │            │            │
     Satellite      GIS        Field Data
        │            │            │
        └────────────┼────────────┘
                     ↓
              DATA INGESTION
                     ↓
             GEOSPATIAL DATA
                     ↓
          ANALYTICS / AI ENGINE
                     ↓
        ┌────────────┼────────────┐
        │            │            │
    Baseline    Change Engine   Risk Engine
        │            │            │
        └────────────┼────────────┘
                     ↓
          ENVIRONMENTAL RECORD
                     ↓
       ┌─────────────┼─────────────┐
       │             │             │
   Actions       Verification    Evidence
       │             │             │
       └─────────────┼─────────────┘
                     ↓
              PRODUCT API
                     ↓
          WEB / MOBILE CLIENT
```

------------------------------------------------------------------------

# 28. Suggested Technology Stack

## Frontend

-   Next.js / React
-   TypeScript
-   Tailwind CSS
-   MapLibre GL / Mapbox-compatible mapping stack

## Backend

-   Python
-   FastAPI
-   Background task processing

## Database

-   PostgreSQL
-   PostGIS for geospatial data

## Object Storage

-   S3-compatible object storage

## Geospatial Processing

Potential tools:

-   GDAL
-   Rasterio
-   GeoPandas
-   Shapely
-   STAC-compatible imagery workflows

## Remote Sensing

Potential integrations:

-   Sentinel-2
-   Landsat
-   Other suitable satellite data providers/APIs

## AI / ML

-   Python ML ecosystem
-   PyTorch where required
-   Computer vision models
-   Geospatial ML models
-   LLM for document/evidence interaction

## Authentication

-   OAuth/OIDC compatible identity provider
-   Role-based access control

------------------------------------------------------------------------

# 29. Core Data Model

Conceptual entities:

``` text
Organization
User
Project
ProjectBoundary
Baseline
Observation
EnvironmentalIndicator
ChangeEvent
Impact
Obligation
Action
RestorationSite
PlantationBatch
FieldInspection
Evidence
Alert
ComplianceAssessment
AuditEvent
```

### Relationships

``` text
Organization
   └── Projects
         ├── Baseline
         ├── Observations
         ├── Change Events
         ├── Impacts
         │     └── Obligations
         │            └── Actions
         │                   └── Evidence
         ├── Restoration Sites
         │     └── Monitoring
         └── Compliance Assessments
```

------------------------------------------------------------------------

# 30. MVP Scope

The MVP should prove the central product loop without attempting to
build every environmental capability.

## MVP includes

### 1. Project Management

-   Create project
-   Define boundary
-   Basic project metadata

### 2. Baseline

-   Historical imagery
-   Basic vegetation/green-cover analysis
-   Baseline map

### 3. Monitoring

-   Periodic imagery ingestion
-   Baseline/current comparison
-   Basic change detection

### 4. Human Review

-   Change review
-   Confirm/reject
-   Evidence attachment

### 5. Action Tracking

-   Create mitigation/restoration action
-   Assign owner
-   Set target/deadline
-   Track progress

### 6. Restoration

-   Plantation site
-   Plantation target
-   Verification
-   Basic survival tracking

### 7. Field Verification

-   GPS
-   Photos
-   Checklist
-   Observation

### 8. Dashboard

-   Project status
-   Map
-   Alerts
-   Actions
-   Environmental changes
-   Restoration status

### 9. Evidence

-   Evidence timeline
-   Document/image upload
-   Source metadata

### 10. Export

-   Basic environmental summary
-   Evidence package

------------------------------------------------------------------------

# 31. Post-MVP Features

Future versions may include:

-   Individual tree-level identification
-   Advanced species recognition
-   Biodiversity indicators
-   Water-quality monitoring
-   Drone integration
-   IoT sensors
-   Weather intelligence
-   Predictive environmental risk
-   Automated inspection prioritization
-   Advanced regulatory integrations
-   Multi-agency dashboards
-   Public transparency portal
-   Digital signatures
-   Blockchain/notarization only if a real product requirement emerges

------------------------------------------------------------------------

# 32. MVP Success Metrics

## Product Metrics

### Monitoring Coverage

Percentage of active projects with recent monitoring data.

### Detection Quality

-   True positive rate
-   False positive rate
-   Human confirmation rate

### Action Completion

Percentage of required actions completed on time.

### Verification Coverage

Percentage of completed actions with verified evidence.

### Restoration Outcome

Verified survival rate of restoration/plantation activities.

### Evidence Completeness

Percentage of major project events supported by traceable evidence.

### User Engagement

-   Active projects
-   Monitoring reviews
-   Field inspections
-   Action updates

------------------------------------------------------------------------

# 33. Example End-to-End Scenario

## Scenario: Large Infrastructure Project

A railway project covers a large geographic area.

### Step 1 --- Project Creation

Organization uploads the project boundary.

### Step 2 --- Baseline

Vaanam analyzes historical imagery and establishes:

``` text
Project Area: 100 km²
Baseline Green Cover: 42%
Baseline Date: 2025
```

### Step 3 --- Project Begins

Monitoring becomes active.

### Step 4 --- Change Detection

A later observation indicates a vegetation decline in one zone.

``` text
Affected Area: 4.8 hectares
Change: Significant
Confidence: 89%
```

### Step 5 --- Human Review

An analyst reviews before/after imagery and confirms the change.

### Step 6 --- Impact Record

The change is recorded and linked to the relevant project obligation.

### Step 7 --- Restoration Action

A restoration target is created.

``` text
Target: 10,000 plants
Deadline: 31 Dec 2026
Owner: Assigned Organization
```

### Step 8 --- Implementation

The organization records plantation completion.

``` text
Claimed: 10,000
```

### Step 9 --- Field Verification

Field officer verifies:

``` text
Verified: 9,400
```

### Step 10 --- Survival Monitoring

Later monitoring shows:

``` text
Surviving: 7,900
Survival Rate: 84.0%
```

### Step 11 --- Vaanam Status

The system updates the restoration state and determines whether
additional action is required according to configured thresholds.

The entire history remains connected.

------------------------------------------------------------------------

# 34. Differentiation

Vaanam should differentiate through the **connection between lifecycle
stages**, not by claiming that every individual feature is unique.

  -----------------------------------------------------------------------
  Existing Approach       Typical Focus           Vaanam Difference
  ----------------------- ----------------------- -----------------------
  Environmental reports   Documentation           Continuous
                                                  environmental record

  Satellite monitoring    Detection               Detection + action +
                                                  verification

  GIS systems             Spatial visualization   Spatial + lifecycle
                                                  tracking

  Plantation tracking     Activity                Activity +
                                                  verification + survival

  Compliance portals      Submission/status       Evidence-backed
                                                  monitoring

  Field inspection tools  Field data              Field data connected to
                                                  remote observations
  -----------------------------------------------------------------------

### Core Differentiator

> **Vaanam connects environmental change to accountability and
> outcome.**

------------------------------------------------------------------------

# 35. Product Principles

## Principle 1 --- Evidence First

Every important claim should be traceable to evidence.

## Principle 2 --- Continuous, Not Periodic

Monitoring should create a timeline rather than isolated reports.

## Principle 3 --- Human-in-the-Loop

Automated detection assists experts; it does not silently make statutory
decisions.

## Principle 4 --- Impact to Outcome

Do not stop at detecting environmental damage. Track what happened
afterward.

## Principle 5 --- Claimed ≠ Verified

A submitted action should not automatically become a completed action.

## Principle 6 --- Completed ≠ Successful

Plantation completion should not automatically mean restoration success.

## Principle 7 --- Reports Are Outputs

The core product is the underlying environmental intelligence and
evidence system.

------------------------------------------------------------------------

# 36. Security & Governance

The system should support:

-   Organization-level isolation
-   Role-based permissions
-   Secure evidence storage
-   Audit history
-   Data provenance
-   Reviewer identity
-   Timestamped changes
-   Controlled administrative actions

Sensitive information should not be exposed publicly without
authorization.

------------------------------------------------------------------------

# 37. Risks & Mitigation

## Risk 1 --- Satellite limitations

Cloud cover, resolution and revisit frequency can affect monitoring.

**Mitigation:** combine multiple observations and field verification.

## Risk 2 --- False positives

Construction, seasonal changes and natural variation can resemble
environmental damage.

**Mitigation:** confidence scoring + temporal analysis + human review.

## Risk 3 --- Individual tree detection limitations

Satellite imagery may not reliably identify individual trees everywhere.

**Mitigation:** begin with area/cluster-level monitoring and use
field/mobile data where individual-level tracking is appropriate.

## Risk 4 --- Regulatory interpretation

Automated status could be mistaken for legal compliance.

**Mitigation:** clearly distinguish platform-generated operational
status from statutory decisions.

## Risk 5 --- Data availability

Some datasets may have restrictions, latency or inconsistent coverage.

**Mitigation:** abstraction layer for multiple data providers.

------------------------------------------------------------------------

# 38. Product Roadmap

## Phase 1 --- Foundation

-   Project management
-   GIS boundary
-   Baseline
-   Satellite integration
-   Basic dashboard

## Phase 2 --- Intelligence

-   Change detection
-   Environmental indicators
-   Review workflow
-   Alerts

## Phase 3 --- Accountability

-   Obligations
-   Action tracking
-   Restoration tracking
-   Field verification

## Phase 4 --- Outcome Monitoring

-   Survival monitoring
-   Long-term restoration monitoring
-   Risk scoring

## Phase 5 --- Ecosystem Platform

-   Multi-agency workflows
-   Advanced AI
-   Additional environmental indicators
-   Predictive analytics
-   Broader integrations

------------------------------------------------------------------------

# 39. Definition of Done --- MVP

The MVP is considered successful when a user can:

1.  Create a project.
2.  Define its geographic boundary.
3.  Generate/view a baseline.
4.  View current environmental observations.
5.  Compare baseline and current state.
6.  Identify a meaningful environmental change.
7.  Review and confirm/reject the change.
8.  Create an associated mitigation/restoration action.
9.  Assign the action to an owner.
10. Track progress.
11. Record field verification.
12. Track restoration survival.
13. View evidence connected to the lifecycle.
14. See the current operational compliance/risk state.
15. Export a summary/evidence package.

If this loop works reliably, Vaanam has demonstrated its core product
thesis.

------------------------------------------------------------------------

# 40. Final Product Definition

Vaanam is not:

> **"A platform that generates environmental reports."**

Vaanam is:

> **"A continuous environmental intelligence and compliance platform
> that creates a living, evidence-backed record of what existed, what
> changed, what action was required, what was done, and whether the
> environmental outcome was actually achieved."**

The product's strongest loop is:

``` text
BASELINE
   ↓
MONITOR
   ↓
DETECT
   ↓
VERIFY
   ↓
ACT
   ↓
MONITOR OUTCOME
   ↓
ASSESS
   ↓
REPEAT
```

That loop is the foundation of the Vaanam product.
