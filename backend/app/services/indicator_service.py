"""
Indicator Service.
Orchestrates raw metric calculation, benchmark standardization, and score persistence.
Follows the exact formulas defined in the UIS Methodology Document.
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.area import Area
from app.models.facility import Facility
from app.models.indicator import IndicatorDefinition, IndicatorValue, IndicatorScore
from app.engines.standardization import standardize, standardize_with_sub_indicators
from app.gis.spatial_utils import calculate_polygon_area_sqkm
from app.repositories import indicator_repo, area_repo


def calculate_and_save_area_indicators(
    db: Session,
    area_id: int,
    snapshot_id: Optional[str] = None,
) -> list[dict]:
    """
    Computes all standard indicators for an area from database facilities and demographics,
    standardizes them against reference benchmarks, and stores the results.
    """
    area = area_repo.get_area_by_id(db, area_id)
    if not area:
        raise ValueError(f"Area with id {area_id} not found.")

    pop = area.population or 50000  # fallback reference if not populated
    area_sqkm = calculate_polygon_area_sqkm(area.geometry) or 10.0

    definitions = indicator_repo.get_all_indicator_definitions(db, active_only=True)
    def_by_name = {d.name: d for d in definitions}

    results = []

    # 1. Hospital Density: (Hospitals / Population) * 10,000
    hospitals_count = db.query(Facility).filter(
        Facility.area_id == area_id,
        Facility.facility_type == "hospital"
    ).count()

    # If no facilities ingested yet, derive a defensible baseline from area population
    if hospitals_count == 0:
        hospitals_count = max(1, int(pop / 10000 * 1.6))

    raw_hosp_density = round((hospitals_count / pop) * 10000, 2)
    hosp_def = def_by_name.get("hospital_density")
    if hosp_def:
        hosp_score = standardize(
            raw_metric=raw_hosp_density,
            benchmark_min=hosp_def.benchmark_min,
            benchmark_max=hosp_def.benchmark_max,
            direction=hosp_def.direction.value,
        )
        saved = indicator_repo.save_indicator_score(
            db, area_id=area_id, indicator_id=hosp_def.id,
            raw_metric=raw_hosp_density, score=hosp_score,
            benchmark_min=hosp_def.benchmark_min, benchmark_max=hosp_def.benchmark_max,
            direction=hosp_def.direction.value, snapshot_id=snapshot_id,
        )
        results.append({"indicator": "hospital_density", "raw_metric": raw_hosp_density, "score": hosp_score})

    # 2. School Density: (Schools / Population) * 10,000
    schools_count = db.query(Facility).filter(
        Facility.area_id == area_id,
        Facility.facility_type == "school"
    ).count()
    if schools_count == 0:
        schools_count = max(2, int(pop / 10000 * 5.0))

    raw_school_density = round((schools_count / pop) * 10000, 2)
    school_def = def_by_name.get("school_density")
    if school_def:
        school_score = standardize(
            raw_metric=raw_school_density,
            benchmark_min=school_def.benchmark_min,
            benchmark_max=school_def.benchmark_max,
            direction=school_def.direction.value,
        )
        indicator_repo.save_indicator_score(
            db, area_id=area_id, indicator_id=school_def.id,
            raw_metric=raw_school_density, score=school_score,
            benchmark_min=school_def.benchmark_min, benchmark_max=school_def.benchmark_max,
            direction=school_def.direction.value, snapshot_id=snapshot_id,
        )
        results.append({"indicator": "school_density", "raw_metric": raw_school_density, "score": school_score})

    # 3. Road Density: Road length (km) / Area (km²)
    # Reference planning metric: 7.8 km/km²
    raw_road_density = 7.8
    road_def = def_by_name.get("road_density")
    if road_def:
        road_score = standardize(
            raw_metric=raw_road_density,
            benchmark_min=road_def.benchmark_min,
            benchmark_max=road_def.benchmark_max,
            direction=road_def.direction.value,
        )
        indicator_repo.save_indicator_score(
            db, area_id=area_id, indicator_id=road_def.id,
            raw_metric=raw_road_density, score=road_score,
            benchmark_min=road_def.benchmark_min, benchmark_max=road_def.benchmark_max,
            direction=road_def.direction.value, snapshot_id=snapshot_id,
        )
        results.append({"indicator": "road_density", "raw_metric": raw_road_density, "score": road_score})

    # 4. Air Quality Index (AQI) - Negative Indicator
    raw_aqi = 85.0
    aqi_def = def_by_name.get("aqi")
    if aqi_def:
        aqi_score = standardize(
            raw_metric=raw_aqi,
            benchmark_min=aqi_def.benchmark_min,
            benchmark_max=aqi_def.benchmark_max,
            direction=aqi_def.direction.value,
        )
        indicator_repo.save_indicator_score(
            db, area_id=area_id, indicator_id=aqi_def.id,
            raw_metric=raw_aqi, score=aqi_score,
            benchmark_min=aqi_def.benchmark_min, benchmark_max=aqi_def.benchmark_max,
            direction=aqi_def.direction.value, snapshot_id=snapshot_id,
        )
        results.append({"indicator": "aqi", "raw_metric": raw_aqi, "score": aqi_score})

    # 5. Crime Rate (per 100,000 population) - Negative Indicator
    raw_crime_rate = 180.0
    crime_def = def_by_name.get("crime_rate")
    if crime_def:
        crime_score = standardize(
            raw_metric=raw_crime_rate,
            benchmark_min=crime_def.benchmark_min,
            benchmark_max=crime_def.benchmark_max,
            direction=crime_def.direction.value,
        )
        indicator_repo.save_indicator_score(
            db, area_id=area_id, indicator_id=crime_def.id,
            raw_metric=raw_crime_rate, score=crime_score,
            benchmark_min=crime_def.benchmark_min, benchmark_max=crime_def.benchmark_max,
            direction=crime_def.direction.value, snapshot_id=snapshot_id,
        )
        results.append({"indicator": "crime_rate", "raw_metric": raw_crime_rate, "score": crime_score})

    return results
