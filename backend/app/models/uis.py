from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, func
from app.db.base import Base

class DevelopmentProfile(Base):
    __tablename__ = "development_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    profile_json = Column(JSON, nullable=False)
    model_used = Column(String)
    prompt_version = Column(String)
    generated_at = Column(DateTime, server_default=func.now())

class AdaptiveWeight(Base):
    __tablename__ = "adaptive_weights"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    indicator_id = Column(Integer, ForeignKey("indicator_definitions.id"), nullable=False)
    weight = Column(Float, nullable=False)
    rationale = Column(String)
    methodology_version = Column(String)
    profile_id = Column(Integer, ForeignKey("development_profiles.id"), nullable=True)
    generated_at = Column(DateTime, server_default=func.now())

class AreaUIS(Base):
    __tablename__ = "area_uis"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    score = Column(Float, nullable=False)
    methodology_version = Column(String)
    snapshot_id = Column(String)
    calculated_at = Column(DateTime, server_default=func.now())

class CityUIS(Base):
    __tablename__ = "city_uis"
    
    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float, nullable=False)
    methodology_version = Column(String)
    area_snapshot_json = Column(JSON)
    calculated_at = Column(DateTime, server_default=func.now())

class PriorityScore(Base):
    __tablename__ = "priority_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    indicator_id = Column(Integer, ForeignKey("indicator_definitions.id"), nullable=False)
    current_score = Column(Float)
    target_score = Column(Float)
    gap = Column(Float)
    severity = Column(String)
    population_impact = Column(Float)
    contextual_factor = Column(Float, default=1.0)
    priority = Column(Float)
    calculated_at = Column(DateTime, server_default=func.now())

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    intervention_type = Column(String)
    input_json = Column(JSON)
    assumption_json = Column(JSON)
    output_json = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class AIInsight(Base):
    __tablename__ = "ai_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    insight_type = Column(String)  # "explanation", "report", "comparison"
    content = Column(String)
    model_used = Column(String)
    prompt_version = Column(String)
    generated_at = Column(DateTime, server_default=func.now())