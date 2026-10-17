"""
Data Sources Model.
Tracks provenance, source systems, sync status, and reliability flags
for all data feeds powering the UIS indicator calculations.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from app.db.base import Base


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)  # "Geospatial POI", "Environmental", "Demographics", "Crime"
    source_url = Column(String, nullable=True)
    update_frequency = Column(String, default="monthly")  # "realtime", "daily", "monthly", "annual"
    quality_flag = Column(String, default="verified")     # "verified", "estimated", "community_curated"
    status = Column(String, default="active")             # "active", "syncing", "degraded", "offline"
    records_count = Column(Integer, default=0)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
