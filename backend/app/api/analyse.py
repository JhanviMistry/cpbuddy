from fastapi import APIRouter, HTTPException
from app.schemas.models import AnalyseRequest, AnalyseResponse
from app.services.gemini import detect_pattern

router = APIRouter()


@router.post("/analyse", response_model=AnalyseResponse)
async def analyse(body: AnalyseRequest):
    if not body.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    if len(body.code) > 10_000:
        raise HTTPException(status_code=400, detail="Code too long (max 10,000 chars)")
    return await detect_pattern(body.code, body.language)