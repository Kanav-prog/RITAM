from sqlalchemy import Column, String, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .base import BaseModel

class ChangeEvent(BaseModel):
    __tablename__ = "change_events"
    
    project_id = Column(ForeignKey("projects.id"), nullable=False)
    indicator = Column(String) # e.g. "Vegetation"
    change_type = Column(String) # e.g. "Decrease"
    severity = Column(String) # e.g. "Medium"
    confidence = Column(Float)
    status = Column(String)
    location = Column(Geometry("POLYGON", srid=4326))
    evidence_data = Column(JSON)
    
    project = relationship("Project")
