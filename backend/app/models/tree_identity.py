import enum
from sqlalchemy import Column, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .base import BaseModel

class TreeStatus(str, enum.Enum):
    HEALTHY = "HEALTHY"
    AT_RISK = "AT_RISK"
    DEAD = "DEAD"
    MISSING = "MISSING"

class TreeIdentity(BaseModel):
    __tablename__ = "tree_identities"
    
    mitigation_action_id = Column(ForeignKey("mitigation_actions.id"), nullable=False)
    species = Column(String)
    status = Column(Enum(TreeStatus), default=TreeStatus.HEALTHY)
    location = Column(Geometry("POINT", srid=4326))
    last_verified = Column(DateTime(timezone=True))
    
    mitigation_action = relationship("MitigationAction", back_populates="trees")
