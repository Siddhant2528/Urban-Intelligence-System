from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AreaUISResponse(BaseModel):
    area_id: int
    area_name: str
    score: float
    methodology_version: str
    calculated_at: datetime
    
    model_config = {"from_attributes": True}

class CityUISResponse(BaseModel):
    score: float
    methodology_version: str
    calculated_at: datetime
    areas_count: int

class DevelopmentProfileResponse(BaseModel):
    area_id: int
    profile_name: str
    dominant_characteristics: list[str]
    strengths: list[str]
    constraints: list[str]
    contextual_priorities: list[str]
    evidence_indicators: list[str]
    limitations: Optional[str] = None

class PriorityResponse(BaseModel):
    area_id: int
    area_name: str
    indicator_name: str
    current_score: float
    target_score: float
    gap: float
    severity: str
    priority: float

class SimulationRequest(BaseModel):
    area_id: int
    intervention_type: str
    intervention_value: float
    budget: Optional[float] = None

class SimulationResponse(BaseModel):
    area_id: int
    intervention_type: str
    before_uis: float
    after_uis: float
    uis_change: float
    affected_indicators: list[dict]
    assumptions: list[str]
    limitations: list[str]