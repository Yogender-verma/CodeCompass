"""
CodeCompass AI Service — Qwen3-Coder Integration

Provides AI-powered analysis for:
  • Project understanding and architecture mapping
  • Contribution opportunity detection
  • Skill-to-opportunity matching
  • Step-by-step contribution plans

Uses any OpenAI-compatible inference API (default: OpenRouter with Qwen3-Coder).
Gracefully degrades when AI is unavailable — GitHub data still works.
"""

import os
import json
import asyncio
import logging
import re
from typing import Dict, Any, Optional, List, Tuple

logger = logging.getLogger("codecompass.ai")

# ── Configuration (loaded from .env via dotenv in main.py) ──────────
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://openrouter.ai/api/v1")
AI_MODEL_NAME = os.getenv("AI_MODEL_NAME", "qwen/qwen3-coder")
AI_TIMEOUT = float(os.getenv("AI_TIMEOUT", "90"))


def _reload_config():
    """Re-read env vars (useful after dotenv load in main or changes to .env)."""
    global AI_API_KEY, AI_BASE_URL, AI_MODEL_NAME, AI_TIMEOUT
    try:
        from dotenv import load_dotenv
        from pathlib import Path
        root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
        if root_env.exists():
            load_dotenv(dotenv_path=str(root_env), override=True)
    except Exception:
        try:
            from pathlib import Path
            root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
            if root_env.exists():
                with open(root_env, "r", encoding="utf-8") as _f:
                    for _l in _f:
                        _l = _l.strip()
                        if _l and not _l.startswith("#") and "=" in _l:
                            _k, _v = _l.split("=", 1)
                            os.environ[_k.strip()] = _v.strip().strip("'\"")
        except Exception:
            pass
    AI_API_KEY = os.getenv("AI_API_KEY", "")
    AI_BASE_URL = os.getenv("AI_BASE_URL", "https://openrouter.ai/api/v1")
    AI_MODEL_NAME = os.getenv("AI_MODEL_NAME", "qwen/qwen3-coder")
    AI_TIMEOUT = float(os.getenv("AI_TIMEOUT", "90"))


def is_ai_configured() -> bool:
    """Check if AI service is properly configured."""
    _reload_config()
    return bool(AI_API_KEY and len(AI_API_KEY) > 5)


# ═══════════════════════════════════════════════════════════════════
#  INTERNAL HELPERS
# ═══════════════════════════════════════════════════════════════════

def _prepare_tree_summary(tree: List[Dict], max_items: int = 80) -> str:
    """Condense file tree into a readable summary for AI context."""
    if not tree:
        return "No file tree available."
    lines = []
    for item in tree[:max_items]:
        indent = "  " * item.get("depth", 0)
        icon = "📁" if item.get("type") == "folder" else "📄"
        lines.append(f"{indent}{icon} {item.get('path', item.get('name', '?'))}")
    if len(tree) > max_items:
        lines.append(f"... and {len(tree) - max_items} more items")
    return "\n".join(lines)


def _prepare_issues_summary(issues: List[Dict], max_issues: int = 20) -> str:
    """Condense issues into a readable summary for AI context."""
    if not issues:
        return "No open issues."
    lines = []
    for issue in issues[:max_issues]:
        labels = ", ".join([lbl.get("name", "") for lbl in issue.get("labels", [])])
        label_str = f" [{labels}]" if labels else ""
        lines.append(
            f"#{issue.get('number', '?')}: {issue.get('title', 'Untitled')}{label_str}"
        )
        preview = issue.get("body_preview", "")
        if preview:
            lines.append(f"  → {preview[:150]}")
    if len(issues) > max_issues:
        lines.append(f"... and {len(issues) - max_issues} more issues")
    return "\n".join(lines)


def _extract_json(text: str) -> Optional[Dict]:
    """Extract JSON from AI response, handling code fences, thinking tags, etc."""
    if not text:
        return None
    text = text.strip()

    # Strip <think>…</think> blocks (Qwen thinking mode)
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    # Strip markdown code fences
    if "```" in text:
        match = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.DOTALL)
        if match:
            text = match.group(1).strip()

    # Attempt direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find outermost { … }
    brace_start = text.find("{")
    if brace_start >= 0:
        depth = 0
        for i in range(brace_start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[brace_start : i + 1])
                    except json.JSONDecodeError:
                        break
    return None


async def _call_ai(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> Optional[Dict[str, Any]]:
    """Make an async call to the AI inference API (OpenAI-compatible)."""
    _reload_config()
    if not is_ai_configured():
        logger.warning("AI not configured — set AI_API_KEY in .env")
        return None

    try:
        import httpx
    except ImportError:
        logger.error("httpx not installed — run: pip install httpx")
        return None

    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://codecompass.dev",
        "X-Title": "CodeCompass",
    }

    payload = {
        "model": AI_MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            resp = await client.post(
                f"{AI_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
            )
            if resp.status_code != 200:
                logger.error("AI API %d: %s", resp.status_code, resp.text[:500])
                return None

            result = resp.json()
            content = (
                result.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )
            parsed = _extract_json(content)
            if parsed is None:
                logger.warning("Could not parse AI JSON — raw: %s", content[:400])
                return {"raw_response": content}
            return parsed

    except Exception as exc:
        logger.error("AI call failed: %s", exc)
        return None


# ═══════════════════════════════════════════════════════════════════
#  PUBLIC API
# ═══════════════════════════════════════════════════════════════════

async def analyze_project_with_ai(repo_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run AI-powered project understanding **and** opportunity detection
    concurrently.  Falls back to GitHub-only data when AI is unavailable.
    """
    repository = repo_data.get("repository", {})
    languages = repo_data.get("languages", [])
    readme = repo_data.get("readme", "")
    tree = repo_data.get("tree", [])
    issues = repo_data.get("issues", [])

    lang_str = ", ".join(
        [f"{l['language']} ({l['percentage']}%)" for l in languages[:15]]
    )
    tree_summary = _prepare_tree_summary(tree)
    issues_summary = _prepare_issues_summary(issues)
    readme_excerpt = (readme or "")[:4000] or "No README available."

    repo_context = (
        f"Repository: {repository.get('full_name', 'unknown')}\n"
        f"Description: {repository.get('description', 'No description')}\n"
        f"Stars: {repository.get('stars', 0)} | "
        f"Forks: {repository.get('forks', 0)} | "
        f"Open Issues: {repository.get('open_issues_count', 0)}\n"
        f"Default Branch: {repository.get('default_branch', 'main')}\n"
        f"Languages: {lang_str}\n"
    )

    if not is_ai_configured():
        return _build_fallback_analysis(repository, languages, readme, issues)

    # Run both AI tasks concurrently
    understanding_coro = _get_project_understanding(
        repo_context, tree_summary, readme_excerpt
    )
    opportunities_coro = _get_contribution_opportunities(
        repo_context, tree_summary, issues_summary, readme_excerpt
    )

    results = await asyncio.gather(
        understanding_coro, opportunities_coro, return_exceptions=True
    )
    understanding = results[0] if not isinstance(results[0], Exception) else None
    opportunities = results[1] if not isinstance(results[1], Exception) else None

    if isinstance(results[0], Exception):
        logger.error("Understanding failed: %s", results[0])
    if isinstance(results[1], Exception):
        logger.error("Opportunities failed: %s", results[1])

    return {
        "understanding": understanding
        or _fallback_understanding(repository, languages, readme),
        "opportunities": (
            opportunities.get("opportunities", [])
            if isinstance(opportunities, dict)
            else _fallback_opportunities(issues)
        ),
        "readme_summary": (understanding or {}).get(
            "readme_summary", _fallback_readme_summary(readme)
        ),
        "ai_available": understanding is not None,
    }


async def match_skills_to_opportunities(
    opportunities: List[Dict],
    skills: Dict[str, Any],
    repository: Dict[str, Any],
    languages: List[Dict],
) -> Dict[str, Any]:
    """Match user skills against contribution opportunities using AI."""
    if not is_ai_configured() or not opportunities:
        return _fallback_skill_match(opportunities, skills)

    lang_str = ", ".join([l.get("language", "") for l in languages[:10]])
    skills_str = ", ".join(skills.get("skills", []))
    experience = skills.get("experience", "beginner")
    interests = ", ".join(skills.get("interests", []))
    to_learn = ", ".join(skills.get("to_learn", []))
    opps_json = json.dumps(opportunities[:15], indent=2, ensure_ascii=False)

    system_prompt = (
        "You are CodeCompass, an AI that matches developer skills to open-source "
        "contribution opportunities.\n"
        "Respond ONLY with a valid JSON object. No markdown, no thinking tags.\n"
    )

    user_prompt = f"""Match this developer to the best opportunities.

Developer Profile:
- Skills: {skills_str}
- Experience Level: {experience}
- Contribution Interests: {interests}
- Wants to Learn: {to_learn}

Repository: {repository.get('full_name', 'unknown')}
Technologies: {lang_str}

Available Opportunities:
{opps_json}

Return JSON:
{{
  "matches": [
    {{
      "opportunity_id": "the opportunity id",
      "match_score": 85,
      "why_it_matches": "1-2 sentence explanation",
      "matched_skills": ["skills the developer already has"],
      "skills_to_learn": ["new skills needed"],
      "readiness": {{
        "what_you_know": ["relevant existing skills"],
        "what_to_learn": ["skills to pick up"],
        "estimated_difficulty": "easy or moderate or challenging",
        "confidence": "high or medium or low"
      }},
      "suggested_next_steps": ["Step 1", "Step 2", "Step 3"]
    }}
  ],
  "overall_readiness": "1-2 sentence readiness assessment"
}}

Rules:
- Rank by match_score (highest first).  90+ great, 70-89 good, 50-69 stretch.
- Be honest about skill gaps.
- Prioritize opportunities that help the developer learn desired skills.
"""

    result = await _call_ai(system_prompt, user_prompt, temperature=0.3, max_tokens=4096)
    if result and "matches" in result:
        return result
    return _fallback_skill_match(opportunities, skills)


async def generate_contribution_plan(
    opportunity: Dict[str, Any],
    repository: Dict[str, Any],
    languages: List[Dict],
    skills: Dict[str, Any],
) -> Dict[str, Any]:
    """Generate a beginner-friendly, step-by-step contribution plan."""
    if not is_ai_configured():
        return _fallback_contribution_plan(opportunity, repository)

    lang_str = ", ".join([l.get("language", "") for l in languages[:10]])
    skills_str = (
        ", ".join(skills.get("skills", [])) if skills.get("skills") else "Not specified"
    )
    experience = skills.get("experience", "beginner")
    repo_name = repository.get("full_name", "unknown")
    default_branch = repository.get("default_branch", "main")

    system_prompt = (
        "You are CodeCompass, creating a beginner-friendly contribution plan.\n"
        "Respond ONLY with a valid JSON object. No markdown, no thinking tags.\n"
    )

    user_prompt = f"""Create a contribution plan.

Repository: {repo_name}
Technologies: {lang_str}
Default Branch: {default_branch}

Opportunity:
- Title: {opportunity.get('title', 'Unknown')}
- Description: {opportunity.get('description', '')}
- Type: {opportunity.get('type', 'unknown')}
- Difficulty: {opportunity.get('difficulty', 'unknown')}
- Required Skills: {', '.join(opportunity.get('required_skills', []))}
- Relevant Files: {', '.join(opportunity.get('relevant_files', []))}
- Source: {opportunity.get('source', 'unknown')}

Developer Skills: {skills_str}
Experience: {experience}

Return JSON:
{{
  "goal": "What should be accomplished",
  "why_it_matters": "Why this contribution is valuable",
  "where_to_work": {{
    "primary_files": ["file paths if identifiable"],
    "related_files": ["related paths"],
    "confidence": "high or medium or low",
    "note": "caveats about file identification"
  }},
  "prerequisites": ["things to understand first"],
  "steps": [
    {{
      "step": 1,
      "title": "Step title",
      "description": "Detailed description",
      "commands": ["shell commands if applicable"],
      "tips": ["helpful tips"]
    }}
  ],
  "useful_commands": {{
    "setup": ["project setup commands"],
    "test": ["test commands"],
    "lint": ["lint/format commands"]
  }},
  "common_mistakes": ["mistakes to avoid"],
  "estimated_time": "rough time estimate",
  "pr_checklist": ["things to check before PR"]
}}

Rules:
- Only suggest commands compatible with {lang_str}.
- Only reference files that are plausibly in the repository.
- If unsure about paths, say so in the note field.
- Include fork → clone → branch → code → commit → PR flow.
- Keep steps beginner-friendly with both "what" and "why".
"""

    result = await _call_ai(system_prompt, user_prompt, temperature=0.3, max_tokens=4096)
    if result and "goal" in result:
        return result
    return _fallback_contribution_plan(opportunity, repository)


# ═══════════════════════════════════════════════════════════════════
#  INTERNAL AI PROMPTS
# ═══════════════════════════════════════════════════════════════════

async def _get_project_understanding(
    repo_context: str, tree_summary: str, readme_excerpt: str
) -> Optional[Dict]:
    """AI call: understand the project structure and purpose."""
    system_prompt = (
        "You are CodeCompass, an expert open-source code analyst.\n"
        "Help beginners understand a GitHub repository.\n"
        "Respond ONLY with a valid JSON object. No markdown fences, no thinking tags.\n"
    )

    user_prompt = f"""{repo_context}

File Structure:
{tree_summary}

README (excerpt):
{readme_excerpt}

Return JSON:
{{
  "project_summary": "2-3 sentence beginner-friendly explanation of the project",
  "main_purpose": "One clear sentence about the core purpose",
  "main_technologies": ["tech1", "tech2"],
  "architecture": {{
    "type": "monolith or library or CLI or full-stack or microservices or framework or other",
    "description": "Brief architecture description",
    "components": [
      {{"name": "Name", "description": "What it does", "path": "relevant/path"}}
    ],
    "data_flow": "How data flows (1-2 sentences)"
  }},
  "important_files": [
    {{"path": "actual/path", "role": "What this does", "importance": "high or medium"}}
  ],
  "navigation_guide": {{
    "frontend": "path or null",
    "backend": "path or null",
    "api": "path or null",
    "tests": "path or null",
    "config": "path or null",
    "docs": "path or null"
  }},
  "readme_summary": "3-4 sentence README summary for beginners",
  "beginner_notes": "1-2 sentences of advice for first-time contributors"
}}

Rules:
- Only reference paths from the File Structure above.
- If uncertain, say "Could not be determined from available data".
- Keep explanations beginner-friendly and jargon-free.
- Never fabricate technologies or files not in the data.
"""

    return await _call_ai(system_prompt, user_prompt, temperature=0.2, max_tokens=3500)


async def _get_contribution_opportunities(
    repo_context: str,
    tree_summary: str,
    issues_summary: str,
    readme_excerpt: str,
) -> Optional[Dict]:
    """AI call: detect contribution opportunities."""
    system_prompt = (
        "You are CodeCompass, finding beginner-friendly open-source contribution "
        "opportunities.\n"
        "Respond ONLY with a valid JSON object. No markdown fences, no thinking tags.\n"
    )

    user_prompt = f"""{repo_context}

File Structure:
{tree_summary}

Open GitHub Issues:
{issues_summary}

README (excerpt):
{readme_excerpt}

Return JSON:
{{
  "opportunities": [
    {{
      "id": "opp-1",
      "title": "Short descriptive title",
      "description": "2-3 sentence description",
      "type": "bug_fix or feature or documentation or testing or refactoring or performance or accessibility",
      "difficulty": "beginner or intermediate or advanced",
      "required_skills": ["skill1", "skill2"],
      "relevant_files": ["path/to/file"],
      "source": "github_issue or repository_analysis or ai_detection",
      "source_detail": "Issue #N title, or description of detection source",
      "github_issue_url": "URL if from GitHub issue, else null",
      "estimated_time": "1-2 hours or half day or full day or multi-day",
      "learning_value": ["what the contributor learns"]
    }}
  ]
}}

Rules:
- Include real GitHub issues with actual numbers/titles.
- AI-detected items MUST have source "ai_detection".
- Never fabricate issue numbers or URLs.
- Only reference files from the File Structure.
- Provide 5-12 opportunities with mixed difficulties.
- Prioritize beginner-friendly items.
"""

    return await _call_ai(system_prompt, user_prompt, temperature=0.3, max_tokens=4096)


# ═══════════════════════════════════════════════════════════════════
#  FALLBACKS — when AI is unavailable
# ═══════════════════════════════════════════════════════════════════

def _build_fallback_analysis(repository, languages, readme, issues):
    return {
        "understanding": _fallback_understanding(repository, languages, readme),
        "opportunities": _fallback_opportunities(issues),
        "readme_summary": _fallback_readme_summary(readme),
        "ai_available": False,
    }


def _fallback_understanding(repository, languages, readme):
    lang_names = [l.get("language", "") for l in languages[:5]]
    desc = repository.get("description", "")
    return {
        "project_summary": desc or "No description available.",
        "main_purpose": desc or "AI analysis unavailable — configure AI_API_KEY.",
        "main_technologies": lang_names,
        "architecture": {
            "type": "Could not be determined — AI analysis unavailable",
            "description": "Enable AI for architecture insights.",
            "components": [],
            "data_flow": "AI analysis needed.",
        },
        "important_files": [],
        "navigation_guide": {
            "frontend": None,
            "backend": None,
            "api": None,
            "tests": None,
            "config": None,
            "docs": None,
        },
        "readme_summary": _fallback_readme_summary(readme),
        "beginner_notes": "Configure AI_API_KEY for detailed analysis.",
    }


def _fallback_opportunities(issues):
    opportunities = []
    for i, issue in enumerate(issues[:10]):
        labels = [lbl.get("name", "") for lbl in issue.get("labels", [])]
        difficulty = "intermediate"
        beginner_kw = {"good first issue", "beginner", "easy", "starter", "help wanted"}
        if any(lb.lower() in beginner_kw for lb in labels):
            difficulty = "beginner"
        advanced_kw = {"complex", "hard", "expert"}
        if any(lb.lower() in advanced_kw for lb in labels):
            difficulty = "advanced"

        opportunities.append(
            {
                "id": f"opp-{i + 1}",
                "title": issue.get("title", "Untitled Issue"),
                "description": (issue.get("body_preview") or "")[:200]
                or "See GitHub issue for details.",
                "type": _guess_type_from_labels(labels),
                "difficulty": difficulty,
                "required_skills": [],
                "relevant_files": [],
                "source": "github_issue",
                "source_detail": f"Issue #{issue.get('number', '?')}: {issue.get('title', '')}",
                "github_issue_url": issue.get("html_url", ""),
                "estimated_time": "varies",
                "learning_value": [],
            }
        )
    return opportunities


def _guess_type_from_labels(labels):
    low = [lb.lower() for lb in labels]
    if any("bug" in l for l in low):
        return "bug_fix"
    if any("doc" in l for l in low):
        return "documentation"
    if any("test" in l for l in low):
        return "testing"
    if any("feature" in l or "enhancement" in l for l in low):
        return "feature"
    if any("refactor" in l for l in low):
        return "refactoring"
    return "feature"


def _fallback_readme_summary(readme):
    if not readme or len(readme.strip()) < 50:
        return "No README content available."
    lines = readme.strip().split("\n")
    summary_lines = []
    for line in lines:
        s = line.strip()
        if s.startswith("#") or s.startswith("![") or s.startswith("[!") or not s:
            if summary_lines:
                break
            continue
        if s.startswith("```"):
            break
        summary_lines.append(s)
        if len(" ".join(summary_lines)) > 300:
            break
    summary = " ".join(summary_lines)[:400]
    return (summary + "...") if summary and len(summary) >= 395 else (summary or "Enable AI for a better README summary.")


def _fallback_skill_match(opportunities, skills):
    user_skills = set(s.lower() for s in skills.get("skills", []))
    matches = []
    for opp in opportunities[:10]:
        required = set(s.lower() for s in opp.get("required_skills", []))
        matched = user_skills & required
        score = (
            int((len(matched) / max(len(required), 1)) * 100) if required else 50
        )
        matches.append(
            {
                "opportunity_id": opp.get("id", ""),
                "match_score": min(score, 100),
                "why_it_matches": (
                    f"You have {len(matched)} of {len(required)} required skills."
                    if required
                    else "General opportunity — all skill levels welcome."
                ),
                "matched_skills": list(matched),
                "skills_to_learn": list(required - user_skills),
                "readiness": {
                    "what_you_know": list(matched),
                    "what_to_learn": list(required - user_skills),
                    "estimated_difficulty": opp.get("difficulty", "intermediate"),
                    "confidence": "low",
                },
                "suggested_next_steps": [
                    "Read the issue or opportunity description",
                    "Explore the relevant files",
                    "Set up the development environment",
                ],
            }
        )
    matches.sort(key=lambda m: m["match_score"], reverse=True)
    return {
        "matches": matches,
        "overall_readiness": "Basic matching — enable AI for personalized recommendations.",
    }


def _fallback_contribution_plan(opportunity, repository=None):
    repo_name = (repository or {}).get("full_name", "OWNER/REPO")
    return {
        "goal": opportunity.get("title", "Contribute to this opportunity"),
        "why_it_matters": opportunity.get(
            "description", "This contribution improves the project."
        ),
        "where_to_work": {
            "primary_files": opportunity.get("relevant_files", []),
            "related_files": [],
            "confidence": "low",
            "note": "Enable AI for precise file identification.",
        },
        "prerequisites": [
            "Familiarity with the project's technology stack",
            "Git and GitHub basics",
            "Local development environment",
        ],
        "steps": [
            {
                "step": 1,
                "title": "Fork the Repository",
                "description": f"Go to https://github.com/{repo_name} and click Fork.",
                "commands": [],
                "tips": ["This creates your own copy of the repository."],
            },
            {
                "step": 2,
                "title": "Clone Your Fork",
                "description": "Clone the forked repository to your machine.",
                "commands": [
                    f"git clone https://github.com/YOUR_USERNAME/{repo_name.split('/')[-1] if '/' in repo_name else repo_name}.git",
                    f"cd {repo_name.split('/')[-1] if '/' in repo_name else repo_name}",
                ],
                "tips": ["Replace YOUR_USERNAME with your GitHub username."],
            },
            {
                "step": 3,
                "title": "Create a Branch",
                "description": "Create a feature branch for your changes.",
                "commands": ["git checkout -b your-feature-branch"],
                "tips": ["Use a descriptive branch name."],
            },
            {
                "step": 4,
                "title": "Make Your Changes",
                "description": "Implement the required changes.",
                "commands": [],
                "tips": ["Make small, focused changes.", "Test as you go."],
            },
            {
                "step": 5,
                "title": "Commit and Push",
                "description": "Commit with a clear message and push.",
                "commands": [
                    "git add .",
                    "git commit -m 'Your descriptive commit message'",
                    "git push origin your-feature-branch",
                ],
                "tips": ["Write clear commit messages."],
            },
            {
                "step": 6,
                "title": "Open a Pull Request",
                "description": "Open a PR against the original repository.",
                "commands": [],
                "tips": [
                    "Link the relevant issue in your PR description.",
                    "Be clear about what you changed and why.",
                ],
            },
        ],
        "useful_commands": {"setup": [], "test": [], "lint": []},
        "common_mistakes": [
            "Not reading contribution guidelines",
            "Changing the wrong branch",
            "Not testing before submitting",
        ],
        "estimated_time": opportunity.get("estimated_time", "Varies"),
        "pr_checklist": [
            "Changes are tested",
            "Code follows project conventions",
            "PR description references the issue",
        ],
    }
