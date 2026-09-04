from sqlalchemy import Column, String, ForeignKey, JSON
from .base import BaseModel

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    user_id = Column(ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    changes = Column(JSON)
