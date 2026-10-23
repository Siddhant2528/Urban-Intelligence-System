"""
UIS Database Seeding Script.
Populates:
1. Indicator definitions from benchmark_config.json
2. Standard test areas with valid PostGIS polygons and populations
3. Default user accounts (government & citizen)
4. Primary data sources registry
5. Initial observed values and standardized scores matching the PDF methodology document
"""
import json
import os
import sys
from pathlib import Path
from geoalchemy2.elements import WKTElement

# Ensure backend is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.area import Area
from app.models.facility import Facility
from app.models.indicator import IndicatorDefinition, IndicatorValue, IndicatorScore, IndicatorDirection
from app.models.user import User
from app.models.data_source import DataSource
from app.models.history import AreaScoreHistory, CityScoreHistory
from app.core.security import get_password_hash
from app.core.config import settings


def load_benchmark_config() -> dict:
    config_path = BASE_DIR / "data" / "seeds" / "benchmark_config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed():
    print("Connecting to database...")
    db = SessionLocal()

    try:
        # 1. Seed Indicator Definitions
        print("1. Seeding indicator definitions...")
        config = load_benchmark_config()
        methodology_version = config.get("methodology_version", "v1.0")

        indicator_map = {}
        for item in config.get("indicators", []):
            existing = db.query(IndicatorDefinition).filter(IndicatorDefinition.name == item["name"]).first()
            if not existing:
                direction_enum = IndicatorDirection.positive if item["direction"] == "positive" else IndicatorDirection.negative
                definition = IndicatorDefinition(
                    name=item["name"],
                    category=item["category"],
                    unit=item["unit"],
                    direction=direction_enum,
                    benchmark_min=float(item["benchmark_min"]),
                    benchmark_max=float(item["benchmark_max"]),
                    benchmark_source=item.get("benchmark_source"),
                    methodology_version=methodology_version,
                    active=True,
                )
                db.add(definition)
                db.flush()
                indicator_map[item["name"]] = definition
                print(f"   + Created indicator: {item['name']} ({item['category']})")
            else:
                indicator_map[item["name"]] = existing
                print(f"   * Indicator already exists: {item['name']}")

        # 2. Seed Default Users
        print("\n2. Seeding default user accounts...")
        if settings.ENVIRONMENT.lower() == "production":
            users = [{
                "username": settings.INITIAL_GOVERNMENT_USERNAME,
                "email": settings.INITIAL_GOVERNMENT_EMAIL,
                "password": settings.INITIAL_GOVERNMENT_PASSWORD,
                "role": "government",
            }]
        else:
            users = [
                {
                    "username": "gov_officer",
                    "email": "officer@city.gov.in",
                    "password": "GovernmentPassword123!",
                    "role": "government",
                },
                {
                    "username": "citizen_user",
                    "email": "citizen@example.com",
                    "password": "CitizenPassword123!",
                    "role": "citizen",
                },
            ]
        for u in users:
            existing = db.query(User).filter(User.username == u["username"]).first()
            if not existing:
                user = User(
                    username=u["username"],
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                    is_active=True,
                )
                db.add(user)
                print(f"   + Created user: {u['username']} (role: {u['role']})")
            else:
                print(f"   * User already exists: {u['username']}")

        # 3. Seed Data Sources
        print("\n3. Seeding data sources...")
        sources = [
            {
                "name": "OpenStreetMap Overpass API",
                "category": "Geospatial POI",
                "source_url": "https://overpass-api.de/api/interpreter",
                "update_frequency": "weekly",
                "quality_flag": "community_curated",
                "status": "active",
            },
            {
                "name": "Central Pollution Control Board (CPCB)",
                "category": "Environmental",
                "source_url": "https://cpcb.nic.in",
                "update_frequency": "daily",
                "quality_flag": "verified",
                "status": "active",
            },
            {
                "name": "National Crime Records Bureau (NCRB)",
                "category": "Safety",
                "source_url": "https://ncrb.gov.in",
                "update_frequency": "annual",
                "quality_flag": "verified",
                "status": "active",
            },
            {
                "name": "Municipal Census Bureau",
                "category": "Demographics",
                "source_url": "https://censusindia.gov.in",
                "update_frequency": "annual",
                "quality_flag": "verified",
                "status": "active",
            },
        ]
        for s in sources:
            existing = db.query(DataSource).filter(DataSource.name == s["name"]).first()
            if not existing:
                ds = DataSource(**s)
                db.add(ds)
                print(f"   + Created data source: {s['name']}")
            else:
                print(f"   * Data source already exists: {s['name']}")

        # 4. Seed Standard Sample Areas (Matching PDF Worked Example)
        print("\n4. Seeding sample areas...")
        # Polygons representing 3 distinct municipal wards (Indiranagar, Koramangala, Whitefield)
        sample_areas = [
            {
                "name": "Area A (Indiranagar)",
                "population": 50000,
                "population_source": "Municipal Projection 2024",
                "polygon_wkt": "POLYGON((77.635 12.975, 77.655 12.975, 77.655 12.960, 77.635 12.960, 77.635 12.975))",
            },
            {
                "name": "Area B (Koramangala)",
                "population": 30000,
                "population_source": "Municipal Projection 2024",
                "polygon_wkt": "POLYGON((77.615 12.935, 77.635 12.935, 77.635 12.920, 77.615 12.920, 77.615 12.935))",
            },
            {
                "name": "Area C (Whitefield)",
                "population": 20000,
                "population_source": "Municipal Projection 2024",
                "polygon_wkt": "POLYGON((77.730 12.980, 77.755 12.980, 77.755 12.955, 77.730 12.955, 77.730 12.980))",
            },
            {
                "name": "CIDCO",
                "population": 85000,
                "population_source": "Nashik Municipal Corporation",
                "polygon_wkt": "POLYGON((73.827 19.983, 73.847 19.983, 73.847 20.003, 73.827 20.003, 73.827 19.983))",
            },
            {
                "name": "Panchavati",
                "population": 72000,
                "population_source": "Nashik Municipal Corporation",
                "polygon_wkt": "POLYGON((73.760 20.000, 73.780 20.000, 73.780 20.019, 73.760 20.019, 73.760 20.000))",
            },
            {
                "name": "Satpur",
                "population": 65000,
                "population_source": "Nashik Municipal Corporation",
                "polygon_wkt": "POLYGON((73.770 20.015, 73.790 20.015, 73.790 20.035, 73.770 20.035, 73.770 20.015))",
            },
            {
                "name": "Gangapur",
                "population": 48000,
                "population_source": "Nashik Municipal Corporation",
                "polygon_wkt": "POLYGON((73.725 19.975, 73.745 19.975, 73.745 19.995, 73.725 19.995, 73.725 19.975))",
            },
            {
                "name": "Dwarka",
                "population": 90000,
                "population_source": "Nashik Municipal Corporation",
                "polygon_wkt": "POLYGON((73.807 20.003, 73.827 20.003, 73.827 20.023, 73.807 20.023, 73.807 20.003))",
            },
            {
                "name": "Deolali",
                "population": 54000,
                "population_source": "Nashik Municipal Corporation",
                "polygon_wkt": "POLYGON((73.840 19.917, 73.860 19.917, 73.860 19.937, 73.840 19.937, 73.840 19.917))",
            },
        ]

        area_records = []
        for a in sample_areas:
            existing = db.query(Area).filter(Area.name == a["name"]).first()
            if not existing:
                area = Area(
                    name=a["name"],
                    population=a["population"],
                    population_source=a["population_source"],
                    geometry=WKTElement(a["polygon_wkt"], srid=4326),
                )
                db.add(area)
                db.flush()
                area_records.append(area)
                print(f"   + Created area: {a['name']} (Pop: {a['population']})")
            else:
                area_records.append(existing)
                print(f"   * Area already exists: {a['name']}")

        # 5. Seed Facilities for Areas
        print("\n5. Seeding sample physical facilities (POIs)...")
        facility_types = ["hospital", "school", "police", "transit_stop"]
        for area in area_records:
            fac_count = db.query(Facility).filter(Facility.area_id == area.id).count()
            if fac_count == 0:
                # Derive sample facilities near area centroid
                for i, f_type in enumerate(facility_types, 1):
                    # Slight coordinate offsets
                    fac = Facility(
                        osm_id=f"seed-{area.id}-{f_type}-{i}",
                        facility_type=f_type,
                        name=f"{area.name} {f_type.replace('_', ' ').capitalize()} #{i}",
                        geometry=WKTElement(f"POINT(77.640 12.970)", srid=4326) if "Indiranagar" in area.name else WKTElement(f"POINT(73.837 19.993)", srid=4326),
                        area_id=area.id,
                    )
                    db.add(fac)
                print(f"   + Seeded POI facilities for: {area.name}")

        # 6. Seed Illustrative Baseline Indicator Values & Scores for Area A
        print("\n6. Seeding illustrative baseline scores for Area A (Indiranagar)...")
        area_a = area_records[0]
        # Illustrative measurements from Table 7 of PDF:
        # Healthcare: 8 hospitals, 50k pop -> 1.6 / 10k -> score = 8.0
        # Education: 25 schools, 50k pop -> 5 schools/10k -> score = 78.0 (on max 10 benchmark -> 5/10*100 = 50, or RTE calibrated score 78)
        # Safety: 90 crimes, 50k pop -> 180/100k -> score = 76.0 (negative)
        # Transport: road density 7.8 km/km2 -> score = 64.0
        # Environment: AQI = 85 -> score = 68.0 (negative)
        baseline_scores = [
            ("hospital_density", 8.0, 1.6, 8.0),
            ("school_density", 25.0, 5.0, 78.0),
            ("road_density", 390.0, 7.8, 64.0),
            ("aqi", 85.0, 85.0, 68.0),
            ("crime_rate", 90.0, 180.0, 76.0),
        ]

        for ind_name, raw_val, raw_metric, score_val in baseline_scores:
            def_obj = indicator_map.get(ind_name)
            if def_obj:
                # Check if score exists
                existing_score = db.query(IndicatorScore).filter(
                    IndicatorScore.area_id == area_a.id,
                    IndicatorScore.indicator_id == def_obj.id,
                ).first()
                if not existing_score:
                    score_rec = IndicatorScore(
                        area_id=area_a.id,
                        indicator_id=def_obj.id,
                        raw_metric=raw_metric,
                        score=score_val,
                        benchmark_min_used=def_obj.benchmark_min,
                        benchmark_max_used=def_obj.benchmark_max,
                        direction_used=def_obj.direction.value,
                        snapshot_id="seed-snapshot-v1",
                    )
                    db.add(score_rec)
                    print(f"   + Seeded baseline score for {ind_name}: {score_val}/100")

        # 6. Seed Sample History Records for Trend Charts
        print("\n6. Seeding historical score records for longitudinal charts...")
        history_entries = [
            {"period": "2023-Q4", "score": 56.40},
            {"period": "2024-Q1", "score": 57.80},
            {"period": "2024-Q2", "score": 58.90},
            {"period": "2024-Q3", "score": 59.99},
        ]
        for h in history_entries:
            existing_h = db.query(AreaScoreHistory).filter(
                AreaScoreHistory.area_id == area_a.id,
                AreaScoreHistory.evaluation_period == h["period"]
            ).first()
            if not existing_h:
                entry = AreaScoreHistory(
                    area_id=area_a.id,
                    score=h["score"],
                    evaluation_period=h["period"],
                    snapshot_id=f"history-{h['period']}",
                    indicators_breakdown={"healthcare": 42.2, "education": 78.0, "safety": 76.0, "transport": 64.0, "environment": 68.0},
                    weights_breakdown={"healthcare": 0.20, "education": 0.12, "safety": 0.10, "transport": 0.16, "environment": 0.15},
                    methodology_version="v1.0",
                )
                db.add(entry)
                print(f"   + Seeded Area A history: {h['period']} -> {h['score']}")

        db.commit()
        print("\n==============================================")
        print("Database seeding completed successfully!")
        if settings.ENVIRONMENT.lower() == "production":
            print("Production government account was initialized from environment configuration.")
        else:
            print("Local government login: officer@city.gov.in / GovernmentPassword123!")
            print("Local citizen login: citizen@example.com / CitizenPassword123!")
        print("==============================================")

    except Exception as e:
        db.rollback()
        print(f"\nError seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
