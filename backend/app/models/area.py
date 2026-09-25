from sqlalchemy import Column, Integer, String, Float, DateTime, func
from geoalchemy2 import Geometry
from app.db.base import Base

class Area(Base):
    __tablename__ = "areas"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    geometry = Column(Geometry("POLYGON", srid=4326), nullable=False)
    population = Column(Integer, nullable=True)
    population_source = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())