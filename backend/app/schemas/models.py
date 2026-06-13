from pydantic import BaseModel
from typing import List


class AnalyseRequest(BaseModel):
    code: str
    language: str = "python"


class AnalyseResponse(BaseModel):
    pattern: str
    confidence: str          # "high" | "medium" | "low"
    edge_cases: List[str]
    explanation: str


class HintRequest(BaseModel):
    code: str
    language: str = "python"
    hint_number: int = 1     # tracks how many hints already given


class HintResponse(BaseModel):
    hint: str
    should_reveal_more: bool