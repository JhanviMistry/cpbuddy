from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analyse, hint

app = FastAPI(title="CPBuddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyse.router, prefix="/api")
app.include_router(hint.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}