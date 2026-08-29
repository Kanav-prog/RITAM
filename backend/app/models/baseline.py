from sqlalchemy import Column, String, ForeignKey, Integer, Float
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .base import BaseModel

class Baseline(BaseModel):
    __tablename__ = "baselines"
    
    project_id = Column(ForeignKey("projects.id"), nullable=False)
    estimated_trees = Column(Integer)
    green_cover_percentage = Column(Float)
    vegetation_condition = Column(String)
    sensitive_zones_count = Column(Integer)
    spatial_data = Column(Geometry("MULTIPOLYGON", srid=4326))
    
    project = relationship("Project", back_populates="baselines")
