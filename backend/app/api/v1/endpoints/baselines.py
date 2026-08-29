from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import require_authority

router = APIRouter()

@router.get("/")
async def list_baselines(db: AsyncSession = Depends(get_db)):
    return {"message": "List of baselines"}

@router.post("/")
async def create_baseline(db: AsyncSession = Depends(get_db)):
    return {"message": "Baseline created"}
