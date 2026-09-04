from sqlalchemy import Column, String, ForeignKey, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class SatelliteScene(BaseModel):
    __tablename__ = "satellite_scenes"

    project_id = Column(ForeignKey("projects.id"), nullable=False)
    scene_id = Column(String, index=True, nullable=False)
    acquisition_date = Column(DateTime(timezone=True))
    cloud_cover_pct = Column(Float, default=0.0)
    source = Column(String, default="Sentinel-2 L2A")
    provider = Column(String, default="Copernicus Data Space")
    ndvi_mean = Column(Float)
    ndvi_min = Column(Float)
    ndvi_max = Column(Float)
    image_url = Column(String)
    metadata_json = Column(JSON)

    project = relationship("Project")
