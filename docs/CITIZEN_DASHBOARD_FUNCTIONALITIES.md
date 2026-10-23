# Urban Intelligence System (UIS) — Citizen Dashboard
## Comprehensive In-Depth Functional Specification & Architecture Guide

---

## 1. Executive Summary & Purpose

The **UIS Citizen Dashboard** is a civic engagement and urban assessment web application engineered to democratize municipal data. Designed specifically for residents, researchers, civic activists, students, and urban journalists, the dashboard transforms complex urban sensor measurements, geospatial records, and administrative indicators into intuitive, transparent, and interpretable insights.

### Core Objectives
- **Civic Transparency:** Provide citizens with unrestricted access to localized quality-of-life and infrastructure scores across Nashik's administrative zones.
- **Explainable Methodology:** Demystify urban scoring by presenting exact formulas, benchmark reference ranges, and transparent weighting rather than opaque "black-box" ratings.
- **Granular Ward Exploration:** Allow users to explore specific zones down to individual indicator categories (Healthcare, Education, Transport, Environment, Safety, Infrastructure, and Accessibility).
- **Cross-Area Equity Comparison:** Enable citizens to compare two distinct zones side-by-side to understand territorial disparities and infrastructure distribution.
- **Geospatial Facility Discovery:** Map civic amenities (hospitals, schools, transit stops, parks, police stations) with interactive filtering and geographic context.

---

## 2. Technology Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 + VITE + TAILWIND 4             │
├─────────────────────────────────────────────────────────────┤
│  Routing (React Router v7)                                  │
│  ├── /                     → HomePage                       │
│  ├── /city                 → CityOverviewPage               │
│  ├── /area/:id             → AreaAnalysisPage               │
│  ├── /area/:id/indicator/:iid → IndicatorDetailPage         │
│  └── /about                → AboutPage                      │
├──────────────────────────────┬──────────────────────────────┤
│      VISUALIZATION ENGINE    │       GEOSPATIAL ENGINE      │
│  • Chart.js & react-chartjs-2│  • Leaflet & React-Leaflet   │
│  • Lucide React Icons        │  • Leaflet.heat (Heatmaps)   │
│  • Custom SVG Score Rings    │  • Google Maps JS Loader API │
├──────────────────────────────┴──────────────────────────────┤
│  Data Layer: Typesafe Models, Deterministic Math & GIS JSON │
└─────────────────────────────────────────────────────────────┘
```

| Technology | Version / Spec | Functional Role |
| :--- | :--- | :--- |
| **React** | `19.2.8` | Core UI library for reactive component rendering |
| **TypeScript** | `~6.0.2` | Strict compile-time typing across models, metrics, and props |
| **Vite** | `^8.3.0` | Ultra-fast build tool and development server |
| **Tailwind CSS** | `^4.3.3` | Utility-first CSS styling with customized color palette |
| **React Router** | `^7.18.4` | Client-side routing with parameter handling and hash navigation |
| **Leaflet & React-Leaflet** | `1.9.4` / `5.0.0` | Interactive maps, boundary polygons, and marker clustering |
| **Leaflet.heat** | `^0.2.0` | Real-time density and facility heatmap overlay rendering |
| **@react-google-maps/api** | `^2.20.8` | High-definition satellite and terrain mapping support |
| **Chart.js** | `^4.5.1` | Canvas-based score distributions and radar charts |

---

## 3. Seven Core Urban Indicators & Mathematical Framework

The dashboard normalizes all raw municipal measurements into a uniform **0–100 scale** using documented planning standards.

```
                  ┌─────────────────────────────────────────┐
                  │          RAW METRIC ACQUISITION         │
                  │  (e.g., AQI: 82, Hospital Beds: 2.1)    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       STANDARDIZATION & DIRECTION       │
                  │  Higher-is-Better vs Lower-is-Better    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       NORMALIZED INDICATOR SCORE        │
                  │           (Bounded [0, 100])            │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          WEIGHTED AREA UIS SCORE        │
                  │        Area UIS = Σ (Weight × Score)    │
                  └─────────────────────────────────────────┘
```

### 3.1 Indicator Categories & Default Weights

| Indicator | Category | Default Weight | Reference Standard / Benchmark | Direction |
| :--- | :--- | :---: | :--- | :---: |
| **Air & Green Quality** | Environment | 15% | CPCB Clean Air Standards, Tree Canopy Cover % | Lower AQI is Better |
| **Healthcare Access** | Healthcare | 18% | WHO Standards (Beds per 1,000 population, Clinic Proximity) | Higher is Better |
| **Educational Coverage**| Education | 15% | NEP Planning Norms (Schools per sq km, Pupil-Teacher Ratio) | Higher is Better |
| **Public Safety** | Safety | 15% | Streetlighting density, emergency response times | Higher is Better |
| **Transit Connectivity** | Transport | 15% | Distance to public transit, frequency of city buses | Higher is Better |
| **Basic Civic Works** | Infrastructure | 12% | Piped water coverage, storm sewer separation, waste collection | Higher is Better |
| **Universal Accessibility** | Accessibility | 10% | Barrier-free footpaths, wheelchair ramps, transit accessibility | Higher is Better |

### 3.2 Standardization Formulas

#### Higher-is-Better Metric (e.g. Healthcare, Green Spaces)
$$Score = 100 \times \left( \frac{x - RefMin}{RefMax - RefMin} \right)$$

#### Lower-is-Better Metric (e.g. Air Pollution AQI, Noise Level)
$$Score = 100 \times \left( \frac{RefMax - x}{RefMax - RefMin} \right)$$

*Where $x$ is the measured value, and scores are clamped between $0$ and $100$.*

### 3.3 Score Classification Bands
- **Strong (70 – 100):** Green `#10b981` — High developmental maturity; exceeds national benchmarks.
- **Moderate (40 – 69):** Amber `#f59e0b` — Acceptable service delivery; localized improvements needed.
- **Weak (0 – 39):** Rose `#ef4444` — Critical development deficit; requires immediate municipal intervention.

---

## 4. In-Depth Page & Component Breakdown

### 4.1 Home Page (`HomePage.tsx`)
- **Hero Banner:** Immersive civic backdrop featuring city imagery, system vision, and mission statement.
- **Core Value Highlights:**
  - *Area Analysis:* Instant deep-dive into localized ward performance.
  - *Unified Indicators:* 7 core dimensions displayed in a cohesive framework.
  - *Area Comparison:* Side-by-side equity gap analyzer.
- **Indicator Category Carousel:** Interactive badges representing each of the 7 indicator domains with associated Lucide icons.
- **Quick-Start CTAs:** Direct action links routing citizens to `/city` or specific wards (`/area/cidco`).

---

### 4.2 City Overview Page (`CityOverviewPage.tsx`)
The macro-level lens of the municipal territory.

#### Key Features:
1. **Metropolitan Score Badge:**
   - Displays the **Population-Weighted City UIS** (e.g., `73.8 / 100`).
   - Formula:
     $$City\ UIS = \frac{\sum (Area\ UIS_i \times Population_i)}{\sum Population_i}$$
   - Includes official "Demo Data" badge to ensure academic transparency.
2. **Interactive City GIS Map (`CityMapCard.tsx`):**
   - Renders 6 primary Nashik administrative zones: **CIDCO, Satpur, Nashik Road, Panchavati, Gangapur, and Deolali**.
   - Custom GeoJSON boundary polygons shaded according to composite UIS scores.
   - Click-to-Inspect functionality: Selecting a polygon triggers an analytical preview card with ward demographics, land area, and top constraints.
   - Heatmap toggle displaying transit and health facility density.
3. **Cross-Area Comparison Tool:**
   - Dual dropdown selectors (`Area A` vs `Area B`).
   - Dynamic comparison rendering utilizing three specialized subcomponents:
     - **`AreaUisSpotlight.tsx`:** Side-by-side score cards with differential delta badges ($\Delta +10.4$ points).
     - **`PairedIndicatorScores.tsx`:** Horizontal comparative progress bars across all 7 indicators, color-coded by performance.
     - **`LogicalComparisonSummary.tsx`:** Algorithmic narrative summary generated by `areaComparisonInsights.ts`, highlighting which area leads in each sector and explaining the underlying equity gap.

---

### 4.3 Area Analysis Page (`AreaAnalysisPage.tsx`)
The microscopic ward-level diagnostic tool (`/area/:id`).

#### Key Sections:
1. **Area UIS Hero Card (`AreaUisHeroCard.tsx`):**
   - Prominent numerical score display with animated circular gauge.
   - Zone metadata: Population count, geographic area ($km^2$), and municipal ward zone.
2. **AI-Assisted Development Profile Classification:**
   - Powered by `developmentProfileClassification.ts`.
   - Evaluates indicator distributions and classifies the area into one of five structured development archetypes:
     - **Well-Developed Urban Area:** All indicators $\ge 70$, no weak bands.
     - **Developing Urban Area:** Mixed scores with a solid moderate base.
     - **Infrastructure-Developing Area:** Weak infrastructure and transit indicators.
     - **Environmentally Stressed Area:** Low environmental score coupled with strong industrial activity.
     - **Emerging Urban Area:** Majority of indicators in the weak band.
   - Provides clear, non-technical explanatory narratives justifying the classification.
3. **Strengths & Constraints Diagnostic Cards:**
   - **Key Strengths:** Automatically extracts the top 2 highest-scoring indicators in the area.
   - **Priority Constraints:** Automatically extracts the 2 lowest-scoring indicators, highlighting immediate civic concerns.
4. **Geospatial Amenity Explorer (`AreaFacilitiesMap.tsx` & `AreaLocationMap.tsx`):**
   - High-resolution interactive Leaflet map centered on the ward centroid.
   - **Category Filter Tabs:**
     - `All Facilities`
     - `Healthcare` (Hospitals, Urban Health Clinics, Pharmacies)
     - `Education` (Primary Schools, Secondary Schools, Colleges)
     - `Transport` (City Bus Stops, Railway Stations, Auto Stands)
     - `Safety` (Police Stations, Fire Sub-stations)
     - `Environment` (Public Parks, Gardens, Green Belts)
   - Interactive markers featuring custom category icons and pins.
   - Clickable popups detailing: Amenity name, street address, operating hours, and capacity.
5. **Indicator Scorecard Grid:**
   - Detailed cards for each of the 7 dimensions.
   - Features raw physical values (e.g. `1.8 clinics / 10k pop`) alongside the normalized $0–100$ score.
   - Direct link to drill down into the dedicated indicator page (`/area/:id/indicator/:iid`).

---

### 4.4 Indicator Detail Page (`IndicatorDetailPage.tsx`)
- Detailed examination of a single urban indicator within a specific ward.
- Displays the reference min/max normalization limits used in calculation.
- Explains why the indicator matters for daily citizen well-being.
- Historical trend timeline showing score trajectory over past measurement intervals.

---

### 4.5 About & Methodology Page (`AboutPage.tsx`)
- **System Methodology:** Complete mathematical documentation of the scoring framework.
- **Data Governance:** Explains sources (OpenStreetMap POIs, CPCB Air Quality feeds, Municipal GIS shapefiles).
- **Academic Disclaimer:** Explicitly clarifies prototype status and responsible-use guidelines.

---

## 5. Directory Structure & Key Files

```text
uis-citizen-dashboard/
├── public/                      # Static SVG icons and favicons
├── src/
│   ├── assets/                  # High-res zone maps and imagery
│   │   └── images/Maps/         # CIDCO, Satpur, Panchavati, etc.
│   ├── components/
│   │   ├── area/
│   │   │   ├── AreaFacilitiesMap.tsx    # Leaflet POI amenity explorer
│   │   │   ├── AreaInteractiveMap.tsx   # Google Maps integration
│   │   │   ├── AreaLocationMap.tsx      # Ward boundary visualizer
│   │   │   └── AreaUisHeroCard.tsx      # Circular score gauge & metadata
│   │   ├── city/
│   │   │   └── CityMapCard.tsx          # Metropolitan map & ward selector
│   │   ├── common/                      # Reusable atomic UI components
│   │   │   ├── Badge.tsx, Button.tsx, Card.tsx, ProgressBar.tsx, Select.tsx, Tabs.tsx
│   │   ├── comparison/                  # Cross-area comparison engine
│   │   │   ├── AreaUisSpotlight.tsx
│   │   │   ├── LogicalComparisonSummary.tsx
│   │   │   └── PairedIndicatorScores.tsx
│   │   └── layout/
│   │       └── DashboardLayout.tsx      # Header, navigation drawer, footer
│   ├── data/
│   │   └── demoData.ts                  # Comprehensive Nashik civic dataset
│   ├── pages/                           # Main route views
│   ├── routes/
│   │   └── AppRoutes.tsx                # Client-side router configuration
│   ├── types/                           # Strict TypeScript interfaces
│   └── utils/
│       ├── areaComparisonInsights.ts    # Algorithmic comparative narrative engine
│       ├── developmentProfileClassification.ts # Classification rules
│       ├── googleMapsLoader.ts          # Safe async script loader
│       └── scoreColor.ts                # Hex code and tone mappings
├── package.json
└── vite.config.ts
```

---

## 6. How Citizens Interact with the Dashboard

```
   [ Visit Citizen Dashboard ]
                │
                ▼
      [ City Overview (/city) ] ──────────────┐
                │                             │
       (Select Target Ward)          (Compare Two Wards)
                │                             │
                ▼                             ▼
    [ Area Analysis (/area/:id) ]   [ Comparison Spotlight ]
     • Overall Ward Score (UIS)      • Delta Score Analysis
     • Development Classification    • Paired Indicator Bars
     • Strengths & Constraints       • Analytical Equity Brief
     • Geospatial Amenity Map
     • Filter POIs (Clinics, Parks)
                │
                ▼
 [ Drill-down to Indicator Detail ]
```

---
*Created for the Urban Intelligence System (UIS) Project.*
