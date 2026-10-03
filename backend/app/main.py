import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from project root .env
_root_env = Path(__file__).resolve().parent.parent.parent / ".env"
if _root_env.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=str(_root_env), override=False)
    except ImportError:
        with open(_root_env, "r", encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    _key = _k.strip()
                    _val = _v.strip().strip("'\"")
                    if _key not in os.environ or not os.environ[_key]:
                        os.environ[_key] = _val

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="CodeCompass API",
    description="Navigate code. Find your contribution. Backend services for CodeCompass.",
    version="1.0.0",
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes (Repository Analyzer, AI Analysis, Skill Matching, etc.)
app.include_router(api_router)


@app.get("/health")
def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "ok"}


@app.get("/")
def root():
    """Root info endpoint."""
    return {
        "name": "CodeCompass API",
        "tagline": "Navigate code. Find your contribution.",
        "status": "operational",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
