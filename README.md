# Urban Intelligence System (UIS)

> **A Reproducible, Data-Driven Urban Development Assessment & Simulation Platform**

---

## 1. Overview

The **Urban Intelligence System (UIS)** is a data-driven urban assessment, planning, and simulation platform designed to evaluate infrastructure readiness, environmental quality, and service equity across city subdivisions (wards/neighbourhoods) and aggregate metropolitan regions.

### The Fundamental Design Principle
Unlike traditional black-box ranking indices or hallucinated AI estimates, UIS strictly separates **deterministic mathematical computing** from **qualitative AI interpretation**:
* **Deterministic Code:** Computes all spatial distances, reference standardizations ($0–100$), constraint bounds, weighted contributions, priority rankings, and population aggregations.
* **AI / Large Language Models (Gemini):** Restricted to classifying development constraints (e.g. `healthcare_constraint`, `infrastructure_constraint`) and producing executive narrative briefings.

```
RAW URBAN DATA (e.g. 8 hospitals, 50k population, AQI 85)
     │
     ▼
RAW DERIVED METRICS (e.g. 1.6 hospitals / 10k capita)
     │
     ▼
REFERENCE-BASED STANDARDIZATION (0–100 Indicator Score)
     │
     ▼
AI-ASSISTED DEVELOPMENT PROFILING (Identifies localized constraints)
     │
     ▼
CONSTRAINED ADAPTIVE WEIGHT ENGINE (Deterministic, bounded, sums to 1.0)
     │
     ▼
AREA UIS (Weighted sum of indicator scores)
     │
     ├──► ISSUE PRIORITY & GAP ENGINE (Urgency = Gap × Severity × Population Impact)
     │
     └──► POPULATION-WEIGHTED CITY UIS (Aggregate metropolitan performance)
```

---

## 2. Technology Stack

* **Backend Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12, Asynchronous, High Performance)
* **Data Validation & Settings:** [Pydantic v2](https://docs.pydantic.dev/) & `pydantic-settings`
* **Database & Spatial Engine:** [PostgreSQL 16](https://www.postgresql.org/) + [PostGIS 3.4](https://postgis.net/)
* **ORM & Spatial Drivers:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/), [GeoAlchemy2](https://geoalchemy-2.readthedocs.io/), [Shapely 2.0](https://shapely.readthedocs.io/)
* **Database Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
* **AI & LLM Services:** Google Gemini 1.5 Flash (Async Client with deterministic fallbacks)
* **GIS & OpenStreetMap Integration:** Overpass API & OpenStreetMap POI Extractors
* **Containerization:** Docker & Docker Compose

---

## 3. Repository Structure

```text
Urban-Intelligence-System/
├── frontend/                     # Citizen Dashboard & Visualization (React + Vite)
│   └── citizen-dashboard/
│
├── backend/                      # Python FastAPI Core Backend
│   ├── app/
│   │   ├── main.py              # Application entrypoint & CORS middleware
│   │   ├── api/                 # REST Transport Layer
│   │   │   ├── deps.py          # Session injection & JWT role guards
│   │   │   └── v1/
│   │   │       ├── auth.py      # Registration & JWT login
│   │   │       ├── areas.py     # Ward details, UIS scores, compare, history
│   │   │       ├── city.py      # City UIS, city gaps, policy briefing
│   │   │       ├── indicators.py# Definitions, benchmarks, score breakdowns
│   │   │       ├── simulation.py# What-if capital budget simulations
│   │   │       ├── government.py# Priority matrix, rankings, budget advice
│   │   │       └── ingestion.py # OSM Overpass spatial ingestion trigger
│   │   ├── core/                # Configuration, security, custom exceptions
│   │   ├── db/                  # Engine session & Base declarative models
│   │   ├── models/              # SQLAlchemy & GeoAlchemy2 models
│   │   ├── schemas/             # Pydantic request & response contracts
│   │   ├── repositories/        # Clean data-access queries (CRUD & PostGIS joins)
│   │   ├── services/            # Business orchestration pipeline
│   │   ├── engines/             # Pure deterministic math & standardization engines
│   │   ├── gis/                 # GeoJSON, Haversine, bounds, Overpass client
│   │   └── ai/                  # Gemini client & narrative insight generators
│   ├── tests/                   # Pytest automated test suite (29+ tests)
│   ├── alembic/                 # Database schema migrations
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── data/
│   ├── seeds/
│   │   ├── benchmark_config.json# Approved indicator benchmarks & planning norms
│   │   └── seed_db.py           # Comprehensive database seed script
│   └── osm_cache/               # Cached Overpass API responses
│
├── docker-compose.yml           # Multi-container orchestration (PostGIS + FastAPI)
└── README.md
```

---

## 4. Getting Started

### Prerequisites
* Python 3.12+
* Docker Desktop (for PostgreSQL + PostGIS)

### Step 1: Clone and Configure Environment
Copy `.env.example` to `.env` inside `backend/`:
```bash
cd backend
cp .env.example .env
```
Ensure your database credentials and `GEMINI_API_KEY` are populated in `backend/.env`.

### Step 2: Start PostgreSQL with PostGIS
Launch the spatial database container:
```bash
docker compose up -d db
```

### Step 3: Set Up Python Virtual Environment
```bash
cd backend
python -m venv .venv

# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1

# On Linux / macOS:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
```

### Step 4: Run Migrations and Seed Data
```bash
# Run schema migrations
alembic upgrade head

# Seed indicator definitions, sample wards, default users, and baseline scores:
python scripts/seed.py
```

### Step 5: Start the Backend Dev Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive OpenAPI documentation will be accessible at:
* **Swagger UI:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
* **ReDoc:** [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

---

## 5. Seed Accounts & Roles

| Role | Username / Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Government** | `officer@city.gov.in` | `GovernmentPassword123!` | Access `/government/*` priority matrices, budget distribution, and trigger OSM ingestions. |
| **Citizen** | `citizen@example.com` | `CitizenPassword123!` | Inspect ward scores, view GIS maps, compare areas, run simulations. |

---

## 6. Core API Endpoints

### Authentication
* `POST /api/v1/auth/register` — Register a citizen or government account
* `POST /api/v1/auth/login` — Authenticate and receive signed JWT token
* `GET /api/v1/auth/me` — Inspect authenticated user profile and role

### Area / Ward Analytics
* `GET /api/v1/areas/` — List all wards with PostGIS boundary GeoJSON polygons
* `GET /api/v1/areas/{id}` — Single ward boundary and demographics
* `GET /api/v1/areas/{id}/uis` — Latest calculated Area UIS score ($0–100$)
* `POST /api/v1/areas/{id}/calculate` — Trigger the full UIS mathematical and profiling pipeline
* `GET /api/v1/areas/compare?area_ids=1,2` — Side-by-side indicator comparison and AI equity brief
* `GET /api/v1/areas/{id}/history` — Longitudinal score timeline across quarters/years
* `GET /api/v1/areas/{id}/insights` — Ward executive narrative explaining performance

### City Aggregation & Gaps
* `GET /api/v1/city/uis` — Population-weighted metropolitan UIS score
* `POST /api/v1/city/calculate` — Recalculate City UIS from current area scores
* `GET /api/v1/city/gaps` — Citywide benchmark deficits ranked by urgency and affected population
* `GET /api/v1/city/history` — Citywide historical score progression

### Government Decision Support
* `GET /api/v1/government/priority-matrix` — Indicator priorities ranked by gap and severity
* `GET /api/v1/government/ward-rankings` — Wards ranked by performance and active constraints
* `GET /api/v1/government/budget-allocation?total_budget=100000000` — Need-based capital budget optimization

### Urban Simulation & Ingestion
* `POST /api/v1/simulation/` — What-if intervention simulation (e.g. adding clinics) with budget feasibility and ROI
* `POST /api/v1/ingestion/trigger?city=Bengaluru` — Ingest OSM POIs and link to wards using PostGIS `ST_Contains`
* `GET /api/v1/ingestion/status` — Inspect ingested facility counts and data source sync states

---

## 7. Running Tests

The test suite covers deterministic engines, GIS utilities, and API authentication:
```bash
cd backend
pytest
```
*Current test suite passing status: **29 passed, 100% green**.*