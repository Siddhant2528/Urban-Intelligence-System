from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from geoalchemy2 import Geometry
from app.db.base import Base

class Facility(Base):
    __tablename__ = "facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, nullable=True)
    facility_type = Column(String, nullable=False)  # "hospital", "school", etc.
    name = Column(String, nullable=True)
    geometry = Column(Geometry("POINT", srid=4326))
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    collected_at = Column(DateTime, server_default=func.now())