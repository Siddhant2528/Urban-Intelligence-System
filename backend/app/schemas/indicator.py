from pydantic import BaseModel
from typing import Optional

class IndicatorScoreResponse(BaseModel):
    indicator_id: int
    indicator_name: str
    category: str
    score: float
    raw_metric: Optional[float] = None
    unit: str
    direction: str
    
    model_config = {"from_attributes": True}

class AreaIndicatorBreakdownResponse(BaseModel):
    area_id: int
    area_name: str
    indicators: list[IndicatorScoreResponse]