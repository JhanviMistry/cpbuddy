import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app
from app.schemas.models import AnalyseResponse, HintResponse


MOCK_ANALYSE = AnalyseResponse(
    pattern="Dynamic Programming",
    confidence="high",
    edge_cases=["empty array", "single element", "all same values"],
    explanation="The problem has overlapping subproblems and optimal substructure."
)

MOCK_HINT = HintResponse(
    hint="Think about what information you need to carry forward from each step.",
    should_reveal_more=False
)


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_analyse():
    with patch("app.api.analyse.detect_pattern", return_value=MOCK_ANALYSE):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r = await client.post("/api/analyse", json={"code": "def solve(): pass", "language": "python"})
    assert r.status_code == 200
    data = r.json()
    assert data["pattern"] == "Dynamic Programming"
    assert len(data["edge_cases"]) == 3


@pytest.mark.asyncio
async def test_analyse_empty_code():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/analyse", json={"code": "  ", "language": "python"})
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_hint():
    with patch("app.api.hint.get_hint", return_value=MOCK_HINT):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r = await client.post("/api/hint", json={"code": "def solve(): pass", "hint_number": 1})
    assert r.status_code == 200
    assert "hint" in r.json()
