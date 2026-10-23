# Urban Intelligence System (UIS) — Government Dashboard
## Comprehensive In-Depth Functional Specification & Architecture Guide

---

## 1. Executive Summary & Purpose

The **UIS Government Dashboard** is an executive-grade municipal decision-support and spatial intelligence platform engineered for urban administrators, Municipal Commissioners, Chief Planning Officers, and Department Heads (Nashik Municipal Corporation / Nashik Smart City Development Corporation Limited).

While the Citizen Dashboard focuses on transparency and accessibility, the Government Dashboard is designed for **actionable civic intervention, budget optimization, deficit prioritization, and project execution monitoring**. It converts localized indicator deficits into prioritized capital deployment strategies.

### Core Objectives
- **Data-Driven Capital Budgeting:** Allocate municipal funds based on quantified developmental deficits rather than political lobbying.
- **Dynamic What-If Civic Simulator:** Model the projected score uplift, municipal ROI, and beneficiary reach of capital infrastructure projects before committing real-world public funds.
- **Municipal Gap & Priority Matrix:** Rank urban challenges across 7 domains by urgency, factoring in gap severity and impacted population size.
- **Spatial GIS Operations Center:** Visualize cross-ward disparities, infrastructure coverage, and facility density through high-resolution GIS layers.
- **Active Project Portfolio Governance:** Track ongoing infrastructure deliverables, budget burn rates, progress milestones, and executing agencies.
- **Official Administrative Reporting:** Generate municipal executive briefings, CSV datasets, and JSON GIS feeds for departmental reviews.

---

## 2. Technology Stack & System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 + VITE + TAILWIND 4             │
├─────────────────────────────────────────────────────────────┤
│  Authentication Layer: SessionStorage Guard (RBAC)          │
│  State Management: Reactive Hooks, Memoized Aggregators     │
├──────────────────────────────┬──────────────────────────────┤
│    ANALYTICS & VISUALIZATION │       GEOSPATIAL ENGINE      │
│  • Chart.js Donut Charts     │  • Leaflet Multi-Layer GIS   │
│  • Dynamic SVG Gauges        │  • Google Maps JS Loader API │
│  • Lucide Administrative Icons│ • Indicator Density Heatmaps│
├──────────────────────────────┴──────────────────────────────┤
│  Calculation Engine: Deterministic Simulation & Prioritization│
└─────────────────────────────────────────────────────────────┘
```

| Technology | Version / Spec | Functional Role |
| :--- | :--- | :--- |
| **React** | `19.2.8` | High-frequency reactive dashboard updates and state sync |
| **TypeScript** | `~6.0.2` | Strong type contracts for municipal budgets, deficits, and projects |
| **Vite** | `^8.3.0` | Ultra-fast build and HMR development environment |
| **Tailwind CSS** | `^4.3.3` | Professional administrative styling and dark/light color schemes |
| **Chart.js & React-Chartjs-2** | `4.5.1` / `5.3.1` | Dynamic rotational donut chart with responsive cursor hover |
| **Lucide React** | `^1.48.0` | Municipal and civic icon system |
| **Leaflet & Google Maps API** | `1.9.4` / `3.66.7` | Ward boundary rendering, GIS spatial polygons, and heatmaps |

---

## 3. Core Functional Modules & Feature Deep-Dive

### 3.1 Authentication & Role-Based Access Control (`LoginPage.tsx`)
A secure administrative gateway preventing unauthorized access to municipal decision tools.

#### Features:
- **Officer Credentials Validation:** Default access via authorized municipal credentials (`officer@city.gov.in` / `GovernmentPassword123!`).
- **Session Persistence:** Secure browser session token management (`uis_gov_auth`).
- **Role Identity Display:** Officer badge, administrative rank, and assigned department shown in top bar.
- **Single-Click Signout:** Clears active session states and securely returns to the login portal.

---

### 3.2 Executive Metric & KPI Cards (`MetricCard.tsx`)
High-level operational overview summarizing the health of the entire urban territory.

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  CITYWIDE UIS   │ │ WEAKEST SECTOR  │ │ CAPITAL POOL    │ │ CRITICAL ZONE   │
│   73.8 / 100    │ │   HEALTHCARE    │ │    ₹182.0 Cr    │ │     SATPUR      │
│  (Pop-Weighted) │ │   (-18.4% Gap)  │ │ (Deployable)    │ │   (UIS: 63.4)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

1. **Metropolitan Composite UIS:** Population-weighted average score across all 6 Nashik zones.
2. **Weakest Municipal Sector:** Automatically identifies the indicator with the steepest citywide deficit below national benchmarks.
3. **Deployable Capital Budget Pool:** Live total capital expenditure budget (configurable from ₹50 Cr to ₹500 Cr).
4. **Primary Intervention Target:** Automatically flags the lowest-performing zone requiring immediate resource allocation.

---

### 3.3 Dynamic What-If Civic Intervention Simulator
A core innovation of UIS: Allows administrators to test hypothetical urban investments before budget commitment.

```
[ Step 1: Select Ward ] ────────► [ Step 2: Choose Project ] ────────► [ Step 3: Enter Budget ]
 (e.g., Satpur / CIDCO)            (e.g., Electric Bus Fleet)            (e.g., ₹25 Crores)
                                                                                  │
                                                                                  ▼
                                                                     [ Live Simulation Engine ]
                                                                      • Deterministic Math Model
                                                                      • Sector Delta (+Δ Score)
                                                                      • Composite UIS Uplift
                                                                      • Municipal ROI Metric
                                                                      • Direct Beneficiaries
```

#### Simulation Engine Parameters:
- **Target Zones:** Satpur, Panchavati, CIDCO, Nashik Road, Gangapur, Deolali.
- **Curated Civic Improvement Catalog:**
  - *Electric Bus Fleet Expansion (Transport)*
  - *Primary Healthcare Centers & Clinics (Healthcare)*
  - *LED Smart Streetlighting & CCTV Mesh (Safety)*
  - *Underground Stormwater Drainage & Separation (Infrastructure)*
  - *Solid Waste Decentralized Biomethanation (Environment)*
  - *Digital Smart Classrooms in Municipal Schools (Education)*
  - *Universal Sidewalks & Pedestrian Ramps (Accessibility)*
- **Capital Input:** Number input (₹1 Cr to ₹100 Cr) with quick preset triggers (₹5 Cr, ₹10 Cr, ₹25 Cr, ₹50 Cr).

#### Mathematical Simulation Formulation:
The score gain $\Delta S$ in the targeted sector is calculated using a logarithmic diminishing returns model:

$$\Delta S = \alpha \times \ln(1 + \beta \times \text{InvestmentCr})$$

*Where $\alpha$ is the sector responsiveness factor, and $\beta$ accounts for baseline deficit severity.*

The revised composite Area UIS is then dynamically recalculated:

$$Area\ UIS_{\text{new}} = \sum_{i=1}^{7} w_i \times S_{i,\text{new}}$$

#### Output Diagnostics:
- **Sector Delta Badge:** Visual $+\Delta$ points gain in the targeted sector.
- **New Area UIS:** Updated composite score reflecting municipal uplift.
- **Municipal ROI Index:**
  $$ROI = \frac{\Delta UIS \times Population}{\text{Investment in Crores}}$$
- **Beneficiaries Reached:** Estimated population directly impacted by the intervention.
- **Payback & Execution Feasibility:** Timeline estimation based on municipal project scale.

---

### 3.4 Interactive GIS Spatial Map (`MapCard.tsx`)
A real-time command-center map providing spatial context to numerical metrics.

#### Capabilities:
1. **Zonal Boundary Polygons:** Color-coded boundaries of all 6 Nashik administrative divisions:
   - Green (UIS $\ge 70$)
   - Amber ($40 \le \text{UIS} < 70$)
   - Red ($\text{UIS} < 40$)
2. **Indicator Heatmaps:** Real-time intensity overlay toggles for:
   - Healthcare accessibility (clinic density)
   - Transport connectivity (transit coverage)
   - Safety infrastructure (lighting and emergency services)
   - Environmental quality (vegetation and air sensors)
3. **Inspect on Click:** Clicking any zone automatically updates the simulation inputs and highlights ward-specific gap analyses.
4. **Basemap Controls:** Seamless switching between Street Map and High-Resolution Satellite view.

---

### 3.5 Municipal Gap & Priority Matrix (`cityGapAnalysis`)
Identifies and ranks deficits across municipal indicators to guide policy interventions.

#### Features:
- **Severity Classification:**
  - **Critical Deficit:** Gap $> 25\%$ below benchmark.
  - **High Deficit:** Gap between $15\%$ and $25\%$.
  - **Moderate Gap:** Gap between $5\%$ and $15\%$.
  - **Stable:** Within $5\%$ of national benchmark.
- **Filter Controls:** Toggle between `All Gaps`, `Critical Deficits`, and `Moderate Gaps`.
- **View Modes:**
  - *City Aggregate View:* Citywide benchmark deficit percentage.
  - *Ward Specific View:* Localized deficit analysis for the selected zone.
- **"Simulate This Gap" CTA:** Directly loads the affected zone and corresponding improvement package into the What-If Simulator with a single click.

---

### 3.6 Dynamic Capital Budget Allocation & Deployment Planner
Transforms abstract budget figures into tangible sector-by-sector and zone-by-zone expenditure roadmaps.

```
  TOTAL BUDGET SLIDER [ ₹182 Cr ] 
               │
               ▼
   [ Chart.js Donut Chart ]
    • Transport:     ₹36.4 Cr (20%)
    • Healthcare:    ₹32.8 Cr (18%)
    • Infrastructure:₹27.3 Cr (15%)
    • Environment:   ₹25.5 Cr (14%)
    • Safety:        ₹21.8 Cr (12%)
    • Education:     ₹20.0 Cr (11%)
    • Accessibility: ₹18.2 Cr (10%)
               │
               ▼
  [ Deep-Dive Deployment Drawer ]
    ├── Target Wards (% and ₹ Cr per ward)
    ├── Execution Pillars (Infrastructure, Procurement, Operations)
    └── Direct Action: "Simulate This Budget Deployment"
```

#### Key Capabilities:
- **Real-Time Budget Scaling:** Adjusting the total budget pool instantly recalculates absolute Crore allocations across all 7 sectors.
- **Interactive Segment Selection:** Clicking any donut chart slice opens a detailed **Sector Deployment Plan**.
- **Zonal Distribution Breakdown:** Shows exact rupee amounts earmarked for Satpur, CIDCO, Panchavati, etc., prioritized by local deficit.
- **Execution Pillars:** Details deliverables (e.g., 50 Electric AC Buses, 12 Charging Depots, ITS System Integration).
- **Direct Link to Simulation:** Pre-fills the What-If Simulator with the sector's highest-need ward and budget allocation.

---

### 3.7 Ward Performance & Priority League Table
An administrative ranking of all zones sorted in ascending order of UIS (lowest-scoring first) to ensure equity-focused governance.

| Ward Name | Population | Land Area | Composite UIS | Assigned Priority | Key Deficit | Action |
| :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| **Satpur** | 185,000 | $28.4\ km^2$ | **63.4** | `High Priority` | Healthcare & Transport | `Simulate` |
| **Panchavati** | 240,000 | $34.1\ km^2$ | **68.2** | `High Priority` | Environment & Waste | `Simulate` |
| **CIDCO** | 310,000 | $31.8\ km^2$ | **71.5** | `Medium Priority`| Accessibility | `Simulate` |
| **Nashik Road**| 220,000 | $26.5\ km^2$ | **74.1** | `Medium Priority`| Safety Infrastructure| `Simulate` |
| **Gangapur** | 165,000 | $22.0\ km^2$ | **78.6** | `Monitor` | Public Transit | `Simulate` |
| **Deolali** | 145,000 | $29.7\ km^2$ | **82.3** | `Monitor` | Digital Services | `Simulate` |

---

### 3.8 Active Civic Project Portfolio Tracker (`demoProjects`)
A PMO (Project Management Office) dashboard tracking live infrastructure execution.

#### Features:
- **Instant Search:** Fuzzy search by project title, ward location, implementing agency, or milestone deliverable.
- **Sector Filter:** Filter by Transport, Healthcare, Safety, Environment, etc.
- **Project Cards:**
  - *Project Name & Ward Location*
  - *Budget Allocation (in ₹ Crores)*
  - *Implementing Agency:* NMC Civil Engineering Dept, Nashik Smart City Development Corp (NMSCDCL), MSEDCL.
  - *Progress Bar & Status:* `On track` (Green), `In review` (Amber), `Delayed` (Red).
  - *Deficit Addressed:* Clear linkage back to the indicator deficit the project is solving.
- **Portfolio Summary Statistics:**
  - Total Committed Capital (e.g., ₹142.5 Cr)
  - Average Delivery Progress (e.g., 68%)
  - On-Track Delivery Ratio (e.g., 85%)

---

### 3.9 Executive Reporting & Data Export (`Header.tsx`)
Enables inter-departmental collaboration and formal municipal filing.

- **PDF Municipal Briefing:** Compiles executive summaries, top deficits, recommended budget allocations, and simulated intervention impacts into a formatted briefing.
- **CSV Raw Data Export:** Dumps ward-level indicator scores, raw measurements, and population data for external spreadsheet analysis.
- **JSON Data Pipeline:** Standardized schema feed for integration with municipal GIS and command center systems.

---

## 4. Directory Structure & Key Files

```text
uis-government-dashboard/
├── public/                      # Government emblems, smart city logos, map previews
│   ├── national-emblem.png
│   ├── smart-city-logo.png
│   └── nashik-map-preview.png
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Officer session, reporting exports, live clock
│   │   ├── LoginPage.tsx        # Officer authentication portal
│   │   ├── MapCard.tsx          # Multi-layer Leaflet & Google Maps spatial view
│   │   └── MetricCard.tsx       # KPI tiles with variance indicators
│   ├── data/
│   │   └── dashboard.ts         # Complete municipal data models, budget engine,
│   │                            # gap analysis, and simulation algorithms
│   ├── utils/
│   │   └── googleMapsLoader.ts  # Dynamic Google Maps script loader
│   ├── App.tsx                  # Core application logic, simulation state,
│   │                            # dynamic budget calculations, project filters
│   ├── main.tsx                 # React entry point
│   ├── styles.css               # Comprehensive municipal design system
│   └── vite-env.d.ts
├── package.json
└── vite.config.ts
```

---

## 5. Administrative Decision-Making Workflow

```
[ 1. Officer Login ]
        │
        ▼
[ 2. Review Citywide Health (73.8 UIS) ] ──► Identify Weakest Sector (Healthcare)
        │
        ▼
[ 3. Inspect Gap Matrix ] ──────────────────► Satpur Ward: 22.4% Clinic Deficit
        │
        ▼
[ 4. Launch What-If Simulator ] ────────────► Input: Satpur + Healthcare Clinics + ₹15 Cr
        │
        ▼
[ 5. Evaluate Simulated Outcomes ] ─────────► • Sector Uplift: +14.2 Points
                                             • Composite Ward UIS: 63.4 ──► 66.8
                                             • Municipal ROI: 18.5 (High Feasibility)
                                             • Beneficiaries: 185,000 citizens
        │
        ▼
[ 6. Allocate Budget in Deployment Plan ] ──► Earmark ₹15 Cr in Healthcare Pool
        │
        ▼
[ 7. Track Implementation in Project PMO ] ─► Monitor NMC delivery milestones
        │
        ▼
[ 8. Export Municipal Briefing (PDF) ] ────► Submit to Municipal Commissioner
```

---
*Created for the Urban Intelligence System (UIS) Project.*
