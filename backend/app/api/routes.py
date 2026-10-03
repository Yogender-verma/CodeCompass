"""
CodeCompass API Routes

Endpoints:
  POST /api/analyze          — Fetch GitHub data for a public repository
  GET  /api/analyze          — Same (GET variant)
  POST /api/analyze/ai       — AI-powered repository understanding + opportunities
  POST /api/match-skills     — Match user skills to contribution opportunities
  POST /api/contribution-plan— Generate step-by-step contribution plan
  GET  /api/ai/status        — Check AI service configuration status
"""

import os
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.github_service import parse_github_url, fetch_repository_data
from app.services.ai_service import (
    is_ai_configured,
    analyze_project_with_ai,
    match_skills_to_opportunities,
    generate_contribution_plan,
)

router = APIRouter(prefix="/api", tags=["CodeCompass"])


# ── Request Models ──────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    url: str


class AIAnalyzeRequest(BaseModel):
    repository: Dict[str, Any]
    languages: List[Dict[str, Any]] = []
    readme: str = ""
    tree: List[Dict[str, Any]] = []
    issues: List[Dict[str, Any]] = []


class SkillMatchRequest(BaseModel):
    opportunities: List[Dict[str, Any]]
    skills: Dict[str, Any]
    repository: Dict[str, Any]
    languages: List[Dict[str, Any]] = []


class ContributionPlanRequest(BaseModel):
    opportunity: Dict[str, Any]
    repository: Dict[str, Any]
    languages: List[Dict[str, Any]] = []
    skills: Dict[str, Any] = {}


# ── GitHub Data Endpoints ───────────────────────────────────────────

@router.post("/analyze")
async def analyze_repository_post(request: AnalyzeRequest):
    """
    Analyzes a public GitHub repository given its URL.
    Fetches overview, languages, README, tree, and open issues via GitHub's public REST API.
    """
    owner, repo = parse_github_url(request.url)
    return await fetch_repository_data(owner, repo)


@router.get("/analyze")
async def analyze_repository_get(url: str = Query(..., description="GitHub repository URL or owner/repo")):
    """
    GET endpoint for repository analysis.
    """
    owner, repo = parse_github_url(url)
    return await fetch_repository_data(owner, repo)


# ── AI-Powered Endpoints ───────────────────────────────────────────

@router.post("/analyze/ai")
async def analyze_with_ai(request: AIAnalyzeRequest):
    """
    AI-powered repository understanding and contribution opportunity detection.
    Accepts GitHub data (already fetched) and runs it through Qwen3-Coder.
    Returns project understanding, opportunities, and README summary.
    Falls back gracefully when AI is unavailable.
    """
    return await analyze_project_with_ai(request.model_dump())


@router.post("/match-skills")
async def match_skills(request: SkillMatchRequest):
    """
    Match user skills to contribution opportunities using AI.
    Returns ranked matches with readiness assessment.
    """
    return await match_skills_to_opportunities(
        request.opportunities,
        request.skills,
        request.repository,
        request.languages,
    )


@router.post("/contribution-plan")
async def create_contribution_plan(request: ContributionPlanRequest):
    """
    Generate a beginner-friendly, step-by-step contribution plan
    for a selected opportunity.
    """
    return await generate_contribution_plan(
        request.opportunity,
        request.repository,
        request.languages,
        request.skills,
    )


@router.get("/ai/status")
async def ai_status():
    """Check if AI service is configured and available."""
    return {
        "configured": is_ai_configured(),
        "model": os.getenv("AI_MODEL_NAME", "qwen/qwen3-coder"),
        "provider": os.getenv("AI_BASE_URL", "https://openrouter.ai/api/v1"),
    }
