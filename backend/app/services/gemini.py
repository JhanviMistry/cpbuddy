import os
import json
import httpx
from dotenv import load_dotenv
from app.schemas.models import AnalyseResponse, HintResponse

load_dotenv()

API_KEY = os.environ["GEMINI_API_KEY"]
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent"

async def _call_gemini(prompt: str) -> str:
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 500, "temperature": 0.3}
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(f"{BASE_URL}?key={API_KEY}", json=payload)
        r.raise_for_status()
    raw = r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


ANALYSE_PROMPT = """You are a competitive programming coach. Analyse this {language} solution and respond ONLY with valid JSON — no markdown, no explanation outside the JSON.

Code:
{code}

Return exactly this structure:
{{
  "pattern": "the primary algorithmic pattern (e.g. Dynamic Programming, Sliding Window, BFS, Two Pointers, Greedy, Backtracking, Binary Search, Union-Find)",
  "confidence": "high | medium | low",
  "edge_cases": ["edge case 1", "edge case 2", "edge case 3"],
  "explanation": "one sentence explaining why this pattern fits"
}}"""


HINT_PROMPT = """You are a Socratic competitive programming coach. Never give away the answer.

This is hint number {hint_number}. Earlier hints should be abstract; later hints slightly more concrete — but NEVER show code or name the exact algorithm.

Code:
{code}

Give a single Socratic nudge (1-2 sentences). Respond ONLY with valid JSON:
{{
  "hint": "your nudge here",
  "should_reveal_more": true or false
}}

should_reveal_more is true only if hint_number >= 3."""


async def detect_pattern(code: str, language: str) -> AnalyseResponse:
    raw = await _call_gemini(ANALYSE_PROMPT.format(code=code, language=language))
    return AnalyseResponse(**json.loads(raw))


async def get_hint(code: str, language: str, hint_number: int) -> HintResponse:
    raw = await _call_gemini(HINT_PROMPT.format(code=code, language=language, hint_number=hint_number))
    return HintResponse(**json.loads(raw))