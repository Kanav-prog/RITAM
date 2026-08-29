import enum
from sqlalchemy import Column, String, ForeignKey, Integer, Enum, DateTime
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .base import BaseModel

class ActionStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    VERIFIED = "VERIFIED"
    AT_RISK = "AT_RISK"

class MitigationAction(BaseModel):
    __tablename__ = "mitigation_actions"
    
    project_id = Column(ForeignKey("projects.id"), nullable=False)
    action_type = Column(String)
    target_quantity = Column(Integer)
    completed_quantity = Column(Integer, default=0)
    verified_quantity = Column(Integer, default=0)
    surviving_quantity = Column(Integer, default=0)
    location = Column(Geometry("POLYGON", srid=4326))
    status = Column(Enum(ActionStatus), default=ActionStatus.PLANNED)
    deadline = Column(DateTime(timezone=True))
    
    project = relationship("Project", back_populates="mitigation_actions")
    trees = relationship("TreeIdentity", back_populates="mitigation_action")
