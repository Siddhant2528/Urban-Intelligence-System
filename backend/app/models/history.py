"""
Historical Scores Models.
Captures longitudinal snapshots of Area UIS and City UIS across quarters/years,
enabling trend analysis and progression tracking over time.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, func
from app.db.base import Base


class AreaScoreHistory(Base):
    __tablename__ = "area_score_history"

    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    evaluation_period = Column(String, nullable=False, index=True)  # e.g. "2024-Q1", "2024-Q2", "2023-Annual"
    snapshot_id = Column(String, nullable=True)
    indicators_breakdown = Column(JSON, nullable=True)  # {"healthcare": 42.2, "education": 78.0, ...}
    weights_breakdown = Column(JSON, nullable=True)     # {"healthcare": 0.20, "education": 0.12, ...}
    methodology_version = Column(String, default="v1.0")
    recorded_at = Column(DateTime, server_default=func.now())


class CityScoreHistory(Base):
    __tablename__ = "city_score_history"

    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float, nullable=False)
    evaluation_period = Column(String, nullable=False, index=True)
    snapshot_id = Column(String, nullable=True)
    area_breakdown = Column(JSON, nullable=True)        # [{"area_name": "A", "score": 60, "pop": 50000}, ...]
    methodology_version = Column(String, default="v1.0")
    recorded_at = Column(DateTime, server_default=func.now())
