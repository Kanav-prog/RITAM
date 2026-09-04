from fastapi import APIRouter

from app.api.v1.endpoints import auth, projects, baselines, field, compliance, monitoring, actions, reports, satellite

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(baselines.router, prefix="/baselines", tags=["baselines"])
api_router.include_router(field.router, prefix="/field", tags=["field"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(satellite.router, prefix="/satellite", tags=["satellite"])
