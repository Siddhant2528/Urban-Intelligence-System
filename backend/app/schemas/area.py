from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AreaBase(BaseModel):
    name: str
    population: Optional[int] = None
    population_source: Optional[str] = None


class AreaCreate(AreaBase):
    polygon_wkt: Optional[str] = None  # e.g. "POLYGON((77.63 12.97, ...))"
    geojson: Optional[dict[str, Any]] = None  # GeoJSON Polygon geometry


class AreaResponse(AreaBase):
    id: int
    geometry: Optional[Any] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AreaListResponse(BaseModel):
    areas: list[AreaResponse]
    total: int