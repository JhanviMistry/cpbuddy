from fastapi import APIRouter, HTTPException
from app.schemas.models import HintRequest, HintResponse
from app.services.gemini import get_hint

router = APIRouter()


@router.post("/hint", response_model=HintResponse)
async def hint(body: HintRequest):
    if not body.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    return await get_hint(body.code, body.language, body.hint_number)