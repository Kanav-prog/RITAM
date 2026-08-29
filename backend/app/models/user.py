import enum
from sqlalchemy import Column, String, Enum, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Role(str, enum.Enum):
    AUTHORITY = "AUTHORITY"
    DEVELOPER = "DEVELOPER"
    FIELD_OFFICER = "FIELD_OFFICER"
    ADMIN = "ADMIN"

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(Role), default=Role.DEVELOPER)
    is_active = Column(Boolean, default=True)
    organization_id = Column(ForeignKey("organizations.id"))
    
    organization = relationship("Organization", back_populates="users")
