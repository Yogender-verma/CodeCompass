import os
import re
import json
import base64
from typing import Dict, Any, Tuple, List, Optional
from urllib.parse import urlparse
from fastapi import HTTPException

def _get_headers() -> Dict[str, str]:
    """
    Constructs HTTP headers for GitHub API requests.
    Reads GITHUB_TOKEN dynamically from the backend environment.
    If GITHUB_TOKEN exists, sends: Authorization: Bearer <GITHUB_TOKEN>
    If no token exists, sends standard headers for unauthenticated public repository requests.
    """
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if not token:
        # Check if .env has it and load into environment
        try:
            from pathlib import Path
            candidate_paths = [
                Path(__file__).resolve().parent.parent.parent.parent / ".env",
                Path(__file__).resolve().parent.parent.parent / ".env",
                Path.cwd() / ".env",
            ]
            for env_path in candidate_paths:
                if env_path.is_file():
                    with open(env_path, "r", encoding="utf-8") as _f:
                        for _line in _f:
                            _line = _line.strip()
                            if _line.startswith("GITHUB_TOKEN="):
                                _val = _line.split("=", 1)[1].strip().strip("'\"")
                                if _val:
                                    token = _val
                                    os.environ["GITHUB_TOKEN"] = token
                                break
                if token:
                    break
        except Exception:
            pass

    headers: Dict[str, str] = {
        "User-Agent": "CodeCompass-App/1.0",
        "Accept": "application/vnd.github.v3+json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def parse_github_url(url: str) -> Tuple[str, str]:
    """
    Parses a GitHub repository URL or shorthand string into (owner, repo).
    Supports:
      - https://github.com/owner/repo
      - https://github.com/owner/repo.git
      - github.com/owner/repo
      - owner/repo
    """
    cleaned = url.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Repository URL cannot be empty.")

    # Remove trailing slashes and .git
    cleaned = re.sub(r"\.git$", "", cleaned)
    cleaned = cleaned.rstrip("/")

    # If it's a full URL
    if "github.com" in cleaned:
        parsed = urlparse(cleaned if cleaned.startswith("http") else f"https://{cleaned}")
        path_parts = [p for p in parsed.path.strip("/").split("/") if p]
        if len(path_parts) >= 2:
            return path_parts[0], path_parts[1]
    else:
        # Check if shorthand owner/repo format
        parts = [p for p in cleaned.split("/") if p]
        if len(parts) == 2 and not any(c in cleaned for c in [":", " ", "\\"]):
            return parts[0], parts[1]

    raise HTTPException(
        status_code=400,
        detail="Invalid GitHub repository URL format. Example: https://github.com/facebook/react or owner/repo",
    )


async def _make_github_request(url: str) -> Tuple[int, Any]:
    """
    Makes an asynchronous HTTP GET request to GitHub API using httpx with urllib fallback.
    Returns (status_code, json_or_text_data).
    """
    headers = _get_headers()
    try:
        import httpx

        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(url, headers=headers)
            try:
                data = response.json()
            except Exception:
                data = response.text
            return response.status_code, data
    except ImportError:
        # Fallback to standard library urllib if httpx is not yet installed
        import urllib.request
        import urllib.error

        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=12.0) as resp:
                status = resp.getcode()
                raw = resp.read().decode("utf-8")
                try:
                    data = json.loads(raw)
                except Exception:
                    data = raw
                return status, data
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8")
            try:
                data = json.loads(raw)
            except Exception:
                data = raw
            return e.code, data
        except Exception as e:
            return 500, {"message": str(e)}


async def fetch_repository_data(owner: str, repo: str) -> Dict[str, Any]:
    """
    Fetches comprehensive public GitHub data for a repository:
      - Core metadata (name, owner, description, stars, forks, open issues count, branch)
      - Detected languages & percentage breakdown
      - README content
      - Repository file and folder tree
      - Recent open issues
    """
    # 1. Fetch Repository Details
    repo_url = f"https://api.github.com/repos/{owner}/{repo}"
    status, repo_data = await _make_github_request(repo_url)

    if status == 404:
        raise HTTPException(
            status_code=404,
            detail=f"GitHub repository '{owner}/{repo}' was not found. Please verify the URL or ensure it is a public repository.",
        )
    elif status == 403:
        rate_msg = repo_data.get("message", "GitHub API rate limit exceeded.") if isinstance(repo_data, dict) else "Rate limit reached."
        raise HTTPException(
            status_code=429,
            detail=f"GitHub API notice: {rate_msg}. Please try again shortly or configure a GITHUB_TOKEN.",
        )
    elif status != 200:
        err_msg = repo_data.get("message", "Failed to fetch repository from GitHub.") if isinstance(repo_data, dict) else str(repo_data)
        raise HTTPException(status_code=status, detail=f"GitHub error: {err_msg}")

    default_branch = repo_data.get("default_branch", "main")

    # 2. Fetch Languages
    lang_url = f"https://api.github.com/repos/{owner}/{repo}/languages"
    _, lang_data = await _make_github_request(lang_url)
    languages_breakdown = []
    if isinstance(lang_data, dict) and lang_data:
        total_bytes = sum(lang_data.values())
        if total_bytes > 0:
            for lang, byte_count in sorted(lang_data.items(), key=lambda x: x[1], reverse=True):
                pct = round((byte_count / total_bytes) * 100, 1)
                languages_breakdown.append({
                    "language": lang,
                    "bytes": byte_count,
                    "percentage": pct,
                })

    # 3. Fetch README
    readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
    readme_status, readme_data = await _make_github_request(readme_url)
    readme_content = ""
    if readme_status == 200 and isinstance(readme_data, dict):
        raw_encoded = readme_data.get("content", "")
        encoding = readme_data.get("encoding", "")
        if encoding == "base64" and raw_encoded:
            try:
                readme_content = base64.b64decode(raw_encoded).decode("utf-8", errors="replace")
            except Exception:
                readme_content = raw_encoded
        else:
            readme_content = raw_encoded
    elif readme_status == 404:
        readme_content = "# No README.md found\nThis repository does not have a top-level README file."

    # 4. Fetch File/Folder Tree
    tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
    tree_status, tree_data = await _make_github_request(tree_url)
    file_tree: List[Dict[str, Any]] = []

    if tree_status == 200 and isinstance(tree_data, dict) and "tree" in tree_data:
        raw_tree = tree_data.get("tree", [])
        # Take up to 250 items to keep payload efficient while showing deep structure
        for item in raw_tree[:250]:
            path = item.get("path", "")
            item_type = "folder" if item.get("type") == "tree" else "file"
            file_tree.append({
                "path": path,
                "name": path.split("/")[-1],
                "type": item_type,
                "size": item.get("size", 0),
                "depth": path.count("/"),
            })
    else:
        # Fallback to contents API for root if git tree is unavailable
        contents_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
        c_status, c_data = await _make_github_request(contents_url)
        if c_status == 200 and isinstance(c_data, list):
            for item in c_data:
                file_tree.append({
                    "path": item.get("path", ""),
                    "name": item.get("name", ""),
                    "type": "folder" if item.get("type") == "dir" else "file",
                    "size": item.get("size", 0),
                    "depth": 0,
                })

    # 5. Fetch Open Issues (excluding Pull Requests)
    issues_url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=30&sort=updated"
    _, issues_data = await _make_github_request(issues_url)
    clean_issues = []

    if isinstance(issues_data, list):
        for issue in issues_data:
            # GitHub's issues API returns both issues and PRs; exclude PRs
            if "pull_request" in issue:
                continue

            labels = []
            for lbl in issue.get("labels", []):
                if isinstance(lbl, dict):
                    labels.append({
                        "name": lbl.get("name", ""),
                        "color": lbl.get("color", "3b82f6"),
                        "description": lbl.get("description", ""),
                    })

            clean_issues.append({
                "id": issue.get("id"),
                "number": issue.get("number"),
                "title": issue.get("title"),
                "html_url": issue.get("html_url"),
                "created_at": issue.get("created_at"),
                "updated_at": issue.get("updated_at"),
                "comments_count": issue.get("comments", 0),
                "author": issue.get("user", {}).get("login", "unknown"),
                "author_avatar": issue.get("user", {}).get("avatar_url", ""),
                "labels": labels,
                "body_preview": (issue.get("body") or "")[:200],
            })

    # 6. Compose clean JSON response
    return {
        "repository": {
            "name": repo_data.get("name", repo),
            "full_name": repo_data.get("full_name", f"{owner}/{repo}"),
            "owner": {
                "login": repo_data.get("owner", {}).get("login", owner),
                "avatar_url": repo_data.get("owner", {}).get("avatar_url", ""),
                "html_url": repo_data.get("owner", {}).get("html_url", f"https://github.com/{owner}"),
            },
            "description": repo_data.get("description") or "No description provided for this repository.",
            "stars": repo_data.get("stargazers_count", 0),
            "forks": repo_data.get("forks_count", 0),
            "open_issues_count": repo_data.get("open_issues_count", 0),
            "default_branch": default_branch,
            "html_url": repo_data.get("html_url", f"https://github.com/{owner}/{repo}"),
            "topics": repo_data.get("topics", []),
            "license": repo_data.get("license", {}).get("name") if repo_data.get("license") else None,
            "visibility": repo_data.get("visibility", "public"),
        },
        "languages": languages_breakdown,
        "readme": readme_content,
        "tree": file_tree,
        "issues": clean_issues,
    }
