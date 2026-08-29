from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.change_event import ChangeEvent
from app.models.mitigation_action import MitigationAction, ActionStatus
from app.models.project import Project
from app.models.user import User

router = APIRouter()

class ReviewDecision(BaseModel):
    status: str # CONFIRMED or REJECTED
    target_trees: Optional[int] = 0

@router.get("/")
async def list_change_events(
    project_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(ChangeEvent).join(Project).filter(Project.organization_id == current_user.organization_id)
    if project_id:
        query = query.filter(ChangeEvent.project_id == project_id)
        
    result = await db.execute(query)
    events = result.scalars().all()
    return events

@router.post("/{change_id}/review")
async def review_change_event(
    change_id: str,
    decision: ReviewDecision,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ChangeEvent)
        .join(Project)
        .filter(ChangeEvent.id == change_id, Project.organization_id == current_user.organization_id)
    )
    change_event = result.scalars().first()
    
    if not change_event:
        raise HTTPException(status_code=404, detail="Change event not found")
        
    if decision.status not in ["CONFIRMED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be CONFIRMED or REJECTED")
        
    change_event.status = decision.status
    
    if decision.status == "CONFIRMED":
        if not decision.target_trees or decision.target_trees <= 0:
            raise HTTPException(status_code=400, detail="target_trees must be provided and > 0 when confirming")
            
        action = MitigationAction(
            project_id=change_event.project_id,
            action_type="Restoration",
            target_quantity=decision.target_trees,
            status=ActionStatus.PLANNED,
            deadline=datetime.now(timezone.utc) + timedelta(days=90)
        )
        db.add(action)
    
    await db.commit()
    return {"message": "Review submitted successfully", "status": decision.status}
