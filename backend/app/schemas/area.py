from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AreaBase(BaseModel):
    name: str
    population: Optional[int] = None

class AreaResponse(AreaBase):
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}  # Pydantic v2 ORM mode

class AreaListResponse(BaseModel):
    areas: list[AreaResponse]
    total: int