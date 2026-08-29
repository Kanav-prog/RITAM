from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.mitigation_action import MitigationAction
from app.models.project import Project
from app.models.user import User

router = APIRouter()

class ActionUpdate(BaseModel):
    completed_quantity: Optional[int] = None
    verified_quantity: Optional[int] = None
    surviving_quantity: Optional[int] = None
    deadline: Optional[datetime] = None

@router.get("/")
async def list_actions(
    project_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(MitigationAction).join(Project).filter(Project.organization_id == current_user.organization_id)
    if project_id:
        query = query.filter(MitigationAction.project_id == project_id)
        
    result = await db.execute(query)
    actions = result.scalars().all()
    return actions

@router.patch("/{action_id}")
async def update_action(
    action_id: str,
    update_data: ActionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(MitigationAction)
        .join(Project)
        .filter(MitigationAction.id == action_id, Project.organization_id == current_user.organization_id)
    )
    action = result.scalars().first()
    
    if not action:
        raise HTTPException(status_code=404, detail="Mitigation action not found")
        
    if update_data.completed_quantity is not None:
        action.completed_quantity = update_data.completed_quantity
    if update_data.verified_quantity is not None:
        action.verified_quantity = update_data.verified_quantity
    if update_data.surviving_quantity is not None:
        action.surviving_quantity = update_data.surviving_quantity
    if update_data.deadline is not None:
        action.deadline = update_data.deadline
        
    await db.commit()
    return {"message": "Action updated successfully"}
