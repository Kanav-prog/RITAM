from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from .base import BaseModel

class EvidenceRecord(BaseModel):
    __tablename__ = "evidence_records"
    
    entity_id = Column(String, index=True)
    entity_type = Column(String, index=True) # e.g., 'TreeIdentity', 'MitigationAction'
    evidence_type = Column(String) # 'Photo', 'Satellite', 'Document'
    url = Column(String)
    file_hash_sha256 = Column(String)
    metadata_json = Column(JSON)
    location = Column(Geometry("POINT", srid=4326))
    uploaded_by = Column(ForeignKey("users.id"))
    
    uploader = relationship("User")
