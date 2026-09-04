from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from .base import BaseModel

class Organization(BaseModel):
    __tablename__ = "organizations"
    
    name = Column(String, index=True, nullable=False)
    org_type = Column(String)
    contact_email = Column(String)
    
    users = relationship("User", back_populates="organization")
    projects = relationship("Project", back_populates="organization")
