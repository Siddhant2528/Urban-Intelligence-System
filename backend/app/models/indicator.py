from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func, ForeignKey, Enum
from app.db.base import Base
import enum

class IndicatorDirection(str, enum.Enum):
    positive = "positive"
    negative = "negative"

class IndicatorDefinition(Base):
    __tablename__ = "indicator_definitions"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    name = Column(String, nullable=False, unique=True)
    unit = Column(String, nullable=False)
    direction = Column(Enum(IndicatorDirection), nullable=False)
    benchmark_min = Column(Float, nullable=False)
    benchmark_max = Column(Float, nullable=False)
    benchmark_source = Column(String, nullable=True)
    methodology_version = Column(String, default="v1.0")
    active = Column(Boolean, default=True)

class IndicatorValue(Base):
    __tablename__ = "indicator_values"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    indicator_id = Column(Integer, ForeignKey("indicator_definitions.id"), nullable=False)
    raw_value = Column(Float, nullable=True)
    raw_metric = Column(Float, nullable=True)
    unit = Column(String)
    quality_flag = Column(String, default="estimated")
    collected_at = Column(DateTime, server_default=func.now())

class IndicatorScore(Base):
    __tablename__ = "indicator_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    indicator_id = Column(Integer, ForeignKey("indicator_definitions.id"), nullable=False)
    raw_metric = Column(Float, nullable=False)
    score = Column(Float, nullable=False)
    benchmark_min_used = Column(Float)
    benchmark_max_used = Column(Float)
    direction_used = Column(String)
    snapshot_id = Column(String, nullable=True)
    calculated_at = Column(DateTime, server_default=func.now())