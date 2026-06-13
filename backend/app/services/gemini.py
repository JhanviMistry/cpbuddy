import os
import json
import google.generativeai as genai
from app.schemas.models import AnalyseResponse, HintResponse

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")


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


HINT_PROMPT = """You are a Socratic competitive programming coach. Your job is to guide, never to give away the answer.

This is hint number {hint_number} the user has requested. Earlier hints should be more abstract; later hints can be slightly more concrete — but NEVER show code or name the exact algorithm directly.

Code so far:
{code}

Give a single, concise Socratic question or nudge (1-2 sentences max) that helps them think in the right direction.
Also respond with should_reveal_more: true if hint_number >= 3, else false.

Respond ONLY with valid JSON:
{{
  "hint": "your Socratic nudge here",
  "should_reveal_more": true or false
}}"""


async def detect_pattern(code: str, language: str) -> AnalyseResponse:
    prompt = ANALYSE_PROMPT.format(code=code, language=language)
    response = model.generate_content(prompt)
    raw = response.text.strip()
    # strip any accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    data = json.loads(raw.strip())
    return AnalyseResponse(**data)


async def get_hint(code: str, language: str, hint_number: int) -> HintResponse:
    prompt = HINT_PROMPT.format(code=code, language=language, hint_number=hint_number)
    response = model.generate_content(prompt)
    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    data = json.loads(raw.strip())
    return HintResponse(**data)