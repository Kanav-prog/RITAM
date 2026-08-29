from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.project import Project
from app.models.mitigation_action import MitigationAction
from app.models.evidence_record import EvidenceRecord
from app.models.user import User
from app.services.compliance_engine import ComplianceEngine

router = APIRouter()

@router.get("/{project_id}/summary")
async def get_project_summary(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch Project
    result = await db.execute(
        select(Project)
        .filter(Project.id == project_id, Project.organization_id == current_user.organization_id)
    )
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch actions to calculate total targets and verified/surviving trees
    actions_result = await db.execute(
        select(MitigationAction).filter(MitigationAction.project_id == project_id)
    )
    actions = actions_result.scalars().all()
    
    target_trees = sum(action.target_quantity for action in actions if action.target_quantity)
    verified_trees = sum(action.verified_quantity for action in actions if action.verified_quantity)
    surviving_trees = sum(action.surviving_quantity for action in actions if action.surviving_quantity)
    
    survival_rate = ComplianceEngine.calculate_survival_rate(surviving_trees, verified_trees)
    compliance_status = ComplianceEngine.assess_compliance_status(target_trees, verified_trees, survival_rate)
    
    # Fetch latest evidence record
    evidence_result = await db.execute(
        select(EvidenceRecord)
        .filter(EvidenceRecord.entity_type == "TreeIdentity")  # We'll just fetch latest tree photo
        .order_by(EvidenceRecord.created_at.desc())
        .limit(1)
    )
    latest_evidence = evidence_result.scalars().first()
    
    return {
        "project_id": str(project.id),
        "name": project.name,
        "status": project.status,
        "area_hectares": project.area_hectares,
        "compliance": {
            "target_trees": target_trees,
            "verified_trees": verified_trees,
            "surviving_trees": surviving_trees,
            "survival_rate": survival_rate,
            "status": compliance_status
        },
        "latest_evidence": {
            "id": str(latest_evidence.id),
            "url": latest_evidence.url,
            "file_hash_sha256": latest_evidence.file_hash_sha256,
            "uploaded_at": latest_evidence.created_at
        } if latest_evidence else None
    }
