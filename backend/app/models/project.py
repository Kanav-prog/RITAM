import enum
from sqlalchemy import Column, String, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .base import BaseModel

class ProjectStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    BASELINE_PENDING = "BASELINE_PENDING"
    MONITORING_ACTIVE = "MONITORING_ACTIVE"
    UNDER_REVIEW = "UNDER_REVIEW"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    COMPLIANT = "COMPLIANT"
    AT_RISK = "AT_RISK"

class Project(BaseModel):
    __tablename__ = "projects"
    
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    organization_id = Column(ForeignKey("organizations.id"))
    boundary = Column(Geometry("MULTIPOLYGON", srid=4326))
    area_hectares = Column(Float)
    
    organization = relationship("Organization", back_populates="projects")
    baselines = relationship("Baseline", back_populates="project")
    mitigation_actions = relationship("MitigationAction", back_populates="project")
