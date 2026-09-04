from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.gemini_service import gemini_service

router = APIRouter()

class ReportInterpretRequest(BaseModel):
    report_text: str

class SpatialQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

@router.post("/interpret-report")
async def interpret_report(payload: ReportInterpretRequest):
    """
    Interpret raw plantation, forestry, or project clearance reports into structured JSON using Gemini AI.
    """
    try:
        result = await gemini_service.interpret_plantation_report(payload.report_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI interpretation error: {str(e)}")

@router.post("/query")
async def ask_spatial_ai(payload: SpatialQueryRequest):
    """
    Ask natural language questions about project boundaries, tree survival, and satellite passes.
    """
    try:
        answer = await gemini_service.answer_spatial_query(payload.query, payload.context)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI query error: {str(e)}")
