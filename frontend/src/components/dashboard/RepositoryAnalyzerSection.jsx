import React, { useState, useEffect, useCallback } from "react";
import {
  FolderGit2,
  Search,
  ArrowRight,
  Sparkles,
  Terminal,
  Code2,
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  FolderOpen,
  FileText,
  RefreshCw,
  GitBranch,
  Layers,
  BookOpen,
  MessageSquare,
  Tag,
  Loader2,
  CheckCircle2,
  Brain,
  Target,
  Zap,
  Clock,
  Award,
  MapPin,
  ListChecks,
  Bot,
  ChevronUp,
  Shield,
  Compass,
  Lightbulb,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { GithubIcon } from "../GithubIcon";

/* ──────────────────────────────────────────────────────────────────
   Constants & Helpers
   ────────────────────────────────────────────────────────────── */
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", Ruby: "#701516", PHP: "#4F5D95", HTML: "#e34c26",
  CSS: "#563d7c", Vue: "#41b883", Svelte: "#ff3e00", Shell: "#89e051",
  Dart: "#00B4AB", Swift: "#F05138", Kotlin: "#A97BFF", Scala: "#c22d40",
  Lua: "#000080", R: "#198CE7", Perl: "#0298c3", Haskell: "#5e5086",
};
const getLangColor = (lang) => LANGUAGE_COLORS[lang] || "#38bdf8";

const TYPE_BADGES = {
  bug_fix: { label: "Bug Fix", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  feature: { label: "Feature", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  documentation: { label: "Docs", color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  testing: { label: "Testing", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  refactoring: { label: "Refactor", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" },
  performance: { label: "Performance", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  accessibility: { label: "Accessibility", color: "text-green-400 bg-green-500/10 border-green-500/30" },
};
const getTypeBadge = (type) => TYPE_BADGES[type] || { label: type || "Other", color: "text-slate-400 bg-slate-500/10 border-slate-500/30" };

const DIFF_COLORS = {
  beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  advanced: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};
const getDiffColor = (d) => DIFF_COLORS[d] || DIFF_COLORS.intermediate;

const loadUserSkills = () => {
  try { return JSON.parse(localStorage.getItem("codecompass_skills") || "null"); }
  catch { return null; }
};

const saveToHistory = (repoData, aiData) => {
  try {
    const history = JSON.parse(localStorage.getItem("codecompass_history") || "[]");
    const entry = {
      url: repoData.repository.html_url,
      name: repoData.repository.full_name,
      description: repoData.repository.description,
      languages: repoData.languages.slice(0, 3).map((l) => l.language),
      stars: repoData.repository.stars,
      analyzedAt: new Date().toISOString(),
      recommendation: aiData?.opportunities?.[0]?.title || null,
      opportunityCount: aiData?.opportunities?.length || 0,
    };
    const filtered = history.filter((h) => h.url !== entry.url);
    filtered.unshift(entry);
    localStorage.setItem("codecompass_history", JSON.stringify(filtered.slice(0, 20)));
  } catch (e) { console.warn("Failed to save history:", e); }
};

/* Small reusable copy-to-clipboard button */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button type="button" onClick={handle} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition" title="Copy">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export const RepositoryAnalyzerSection = () => {
  // ── State ──────────────────────────────────────────────────────
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);            // GitHub data
  const [aiAnalysis, setAiAnalysis] = useState(null); // AI understanding + opportunities
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Skill matching
  const [skillMatches, setSkillMatches] = useState(null);
  const [skillMatchLoading, setSkillMatchLoading] = useState(false);

  // Contribution plan
  const [contributionPlan, setContributionPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);

  // Tree state
  const [expandedFolders, setExpandedFolders] = useState(new Set(["", "src", "packages"]));
  const [treeSearch, setTreeSearch] = useState("");

  const userSkills = loadUserSkills();

  const sampleRepos = [
    "https://github.com/facebook/react",
    "https://github.com/fastapi/fastapi",
    "https://github.com/astral-sh/uv",
    "https://github.com/tailwindlabs/tailwindcss",
  ];

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // ── Handlers ───────────────────────────────────────────────────
  const handleAnalyze = useCallback(async (e, customUrl = null) => {
    if (e) e.preventDefault();
    const targetUrl = (customUrl || urlInput).trim();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    setData(null);
    setAiAnalysis(null);
    setAiError(null);
    setSkillMatches(null);
    setContributionPlan(null);
    setSelectedOpp(null);
    setLoadingStep("Connecting to CodeCompass backend & GitHub API...");

    try {
      setLoadingStep("Fetching repository overview, file tree & open issues...");
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Failed to analyze repository (Status ${res.status}).`);
      }
      const result = await res.json();
      setData(result);
      setActiveTab("overview");

      // Auto-expand root + first-level folders in tree
      if (result.tree && Array.isArray(result.tree)) {
        const initial = new Set([""]);
        result.tree.forEach((item) => {
          if (item.type === "folder" && item.depth <= 1) initial.add(item.path);
        });
        setExpandedFolders(initial);
      }

      // Auto-trigger AI analysis in background
      triggerAIAnalysis(result);
    } catch (err) {
      console.error("Repository analysis error:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Could not connect to FastAPI backend at http://localhost:8000. Please ensure the backend is running.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }, [urlInput, apiUrl]);

  const triggerAIAnalysis = async (githubData) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${apiUrl}/api/analyze/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository: githubData.repository,
          languages: githubData.languages,
          readme: githubData.readme,
          tree: githubData.tree,
          issues: githubData.issues,
        }),
      });
      if (!res.ok) throw new Error("AI analysis request failed.");
      const result = await res.json();
      setAiAnalysis(result);
      saveToHistory(githubData, result);
    } catch (err) {
      console.error("AI analysis error:", err);
      setAiError("AI analysis unavailable. GitHub data is still fully functional.");
      saveToHistory(githubData, null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleMatchSkills = async () => {
    if (!userSkills || !aiAnalysis?.opportunities?.length) return;
    setSkillMatchLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/match-skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunities: aiAnalysis.opportunities,
          skills: userSkills,
          repository: data.repository,
          languages: data.languages,
        }),
      });
      if (!res.ok) throw new Error("Skill matching failed.");
      const result = await res.json();
      setSkillMatches(result);
      setActiveTab("skill_match");
    } catch (err) {
      console.error("Skill match error:", err);
    } finally {
      setSkillMatchLoading(false);
    }
  };

  const handleCreatePlan = async (opportunity) => {
    setSelectedOpp(opportunity);
    setPlanLoading(true);
    setContributionPlan(null);
    try {
      const res = await fetch(`${apiUrl}/api/contribution-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity,
          repository: data.repository,
          languages: data.languages,
          skills: userSkills || {},
        }),
      });
      if (!res.ok) throw new Error("Plan generation failed.");
      const result = await res.json();
      setContributionPlan(result);
    } catch (err) {
      console.error("Plan error:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setAiAnalysis(null);
    setAiError(null);
    setError(null);
    setSkillMatches(null);
    setContributionPlan(null);
    setSelectedOpp(null);
  };

  const toggleFolder = (path) => {
    const next = new Set(expandedFolders);
    next.has(path) ? next.delete(path) : next.add(path);
    setExpandedFolders(next);
  };

  const filteredTree = data?.tree?.filter((item) => {
    if (!treeSearch.trim()) return true;
    return item.path.toLowerCase().includes(treeSearch.toLowerCase().trim());
  }) || [];

  // All opportunities (from AI or fallback)
  const opportunities = aiAnalysis?.opportunities || [];

  // ── Tab Definitions ────────────────────────────────────────────
  const tabs = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "tech_stack", label: `Tech Stack${data ? ` (${data.languages.length})` : ""}`, icon: Code2 },
    ...(aiAnalysis?.understanding || aiLoading ? [{ id: "understanding", label: "Understanding", icon: Brain }] : []),
    ...(opportunities.length > 0 || aiLoading ? [{ id: "opportunities", label: `Opportunities${opportunities.length ? ` (${opportunities.length})` : ""}`, icon: Target }] : []),
    { id: "issues", label: `Issues${data ? ` (${data.issues.length})` : ""}`, icon: AlertCircle },
    ...(skillMatches ? [{ id: "skill_match", label: `My Match (${skillMatches.matches?.length || 0})`, icon: Award }] : []),
    { id: "structure", label: `Structure${data ? ` (${data.tree.length})` : ""}`, icon: FolderGit2 },
    { id: "readme", label: "README", icon: BookOpen },
  ];

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* ── Section Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>REPOSITORY ANALYZER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Repository Analyzer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze any public GitHub repository — understand its architecture, discover contribution opportunities, and get a personalized plan.
          </p>
        </div>
        {data && (
          <button type="button" onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer self-start sm:self-auto shrink-0">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analyze Another</span>
          </button>
        )}
      </div>

      {/* ── URL Input Form ─────────────────────────────────────── */}
      {!data && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-2">GitHub Repository URL</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <GithubIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" required value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://github.com/facebook/react or owner/repo"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 transition" />
                </div>
                <button type="submit" disabled={loading}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                  {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing...</span></>) : (<><Search className="w-4 h-4" /><span>Analyze Repository</span></>)}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="text-slate-500 font-mono text-[11px]">Quick samples:</span>
              {sampleRepos.map((repo) => (
                <button key={repo} type="button"
                  onClick={() => { setUrlInput(repo); handleAnalyze(null, repo); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 font-mono text-[11px] text-slate-400 transition cursor-pointer">
                  {repo.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {/* ── Loading State ──────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-12 text-center flex flex-col items-center justify-center animate-fade-in space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
              <FolderGit2 className="w-8 h-8 animate-pulse" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-cyan-400/20 blur animate-ping opacity-25" />
          </div>
          <h3 className="text-lg font-bold text-white">Analyzing Repository</h3>
          <p className="text-xs text-cyan-300 font-mono">{loadingStep}</p>
          <div className="w-64 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-full animate-pulse" />
          </div>
        </div>
      )}

      {/* ── Error State ────────────────────────────────────────── */}
      {error && !loading && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-2 flex-1">
            <h4 className="text-sm font-semibold text-rose-200">Analysis Failed</h4>
            <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
            <button type="button" onClick={() => handleAnalyze()}
              className="text-xs font-mono font-medium underline underline-offset-4 text-rose-400 hover:text-rose-200 transition cursor-pointer">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────── */}
      {!data && !loading && !error && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-12 text-center flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
              <FolderGit2 className="w-10 h-10" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white max-w-md mb-2">
            Analyze a repository to understand its codebase and discover contribution opportunities.
          </h3>
          <p className="text-sm text-slate-400 max-w-lg mb-6 leading-relaxed">
            Paste any public GitHub repository above. CodeCompass will fetch its data, use AI to understand the codebase, and match you with the right contribution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
            {[
              { icon: Layers, label: "Overview & Stats", color: "text-cyan-400" },
              { icon: Brain, label: "AI Understanding", color: "text-violet-400" },
              { icon: Target, label: "Opportunities", color: "text-emerald-400" },
              { icon: Award, label: "Skill Matching", color: "text-amber-400" },
              { icon: ListChecks, label: "Contribution Plan", color: "text-sky-400" },
            ].map((f) => (
              <span key={f.label} className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         RESULTS DISPLAY
         ══════════════════════════════════════════════════════ */}
      {data && (
        <div className="space-y-6 animate-fade-in">

          {/* ── Repo Header Card ───────────────────────────────── */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border border-cyan-500/20 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img src={data.repository.owner.avatar_url} alt={data.repository.owner.login}
                  className="w-12 h-12 rounded-xl border border-cyan-500/30 object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{data.repository.full_name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{data.repository.visibility}</span>
                  </div>
                  <a href={data.repository.html_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5 font-mono">
                    <span>View on GitHub</span><ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{data.repository.stars.toLocaleString()}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-blue-400" />{data.repository.forks.toLocaleString()}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />{data.repository.open_issues_count.toLocaleString()} Issues
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-purple-400" />{data.repository.default_branch}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pt-1">{data.repository.description}</p>

            {/* AI loading indicator */}
            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono pt-1 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
                <span>AI is analyzing the codebase — understanding architecture & finding opportunities...</span>
              </div>
            )}
            {aiError && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-mono pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{aiError}</span>
              </div>
            )}
            {aiAnalysis?.ai_available === false && !aiLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pt-1">
                <Bot className="w-3.5 h-3.5" />
                <span>AI not configured — showing GitHub data only. Set AI_API_KEY for full analysis.</span>
              </div>
            )}
          </div>

          {/* ── Tab Navigation ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                  }`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Match Skills CTA in tab bar */}
            {userSkills && opportunities.length > 0 && !skillMatches && (
              <button type="button" onClick={handleMatchSkills} disabled={skillMatchLoading}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white transition cursor-pointer shadow-lg shadow-violet-500/20 disabled:opacity-50">
                {skillMatchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                <span>{skillMatchLoading ? "Matching..." : "Match My Skills"}</span>
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
             TAB CONTENT
             ══════════════════════════════════════════════════ */}

          {/* ── OVERVIEW TAB ───────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* AI project summary (if available) */}
              {aiAnalysis?.understanding?.project_summary && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/30 to-slate-900/60 border border-violet-500/20">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-violet-300 mb-2">
                    <Brain className="w-4 h-4" /><span>AI Project Summary</span>
                    {aiAnalysis.ai_available && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">AI Powered</span>}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{aiAnalysis.understanding.project_summary}</p>
                  {aiAnalysis.understanding.beginner_notes && (
                    <p className="text-xs text-slate-400 mt-3 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{aiAnalysis.understanding.beginner_notes}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Owner", value: data.repository.owner.login, href: data.repository.owner.html_url, color: "text-white" },
                  { label: "Stars", value: data.repository.stars.toLocaleString(), color: "text-amber-400" },
                  { label: "Forks", value: data.repository.forks.toLocaleString(), color: "text-blue-400" },
                  { label: "Open Issues", value: data.repository.open_issues_count.toLocaleString(), color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">{s.label}</span>
                    {s.href ? (
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className={`font-bold ${s.color} text-sm hover:text-cyan-300 flex items-center gap-1`}>
                        {s.value}<ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className={`font-bold ${s.color} font-mono text-base`}>{s.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Topics */}
              {data.repository.topics?.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" /><span>Topics</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.repository.topics.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links to other tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiAnalysis?.understanding && (
                  <div onClick={() => setActiveTab("understanding")} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/30 transition cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5"><Brain className="w-4 h-4 text-violet-400" />AI Understanding</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="text-xs text-slate-400">Architecture, important files, and navigation guide.</p>
                  </div>
                )}
                {opportunities.length > 0 && (
                  <div onClick={() => setActiveTab("opportunities")} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5"><Target className="w-4 h-4 text-emerald-400" />{opportunities.length} Contribution Opportunities</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="text-xs text-slate-400">Explore beginner-friendly issues and AI-detected opportunities.</p>
                  </div>
                )}
                <div onClick={() => setActiveTab("tech_stack")} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5"><Code2 className="w-4 h-4 text-cyan-400" />Primary Languages</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {data.languages.slice(0, 4).map((l) => (
                      <span key={l.language} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[11px]">{l.language}: {l.percentage}%</span>
                    ))}
                  </div>
                </div>
                <div onClick={() => setActiveTab("issues")} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-400" />{data.issues.length} Open Issues</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                  </div>
                  <p className="text-xs text-slate-400">Browse real GitHub issues for contribution.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── TECH STACK TAB ──────────────────────────────────── */}
          {activeTab === "tech_stack" && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Detected Programming Languages</h3>
                <p className="text-xs text-slate-400">Byte-weighted distribution of code files across the repository.</p>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex shadow-inner">
                {data.languages.map((l) => (
                  <div key={l.language} style={{ width: `${l.percentage}%`, backgroundColor: getLangColor(l.language) }}
                    title={`${l.language}: ${l.percentage}%`} className="h-full first:rounded-l-full last:rounded-r-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.languages.map((l) => (
                  <div key={l.language} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getLangColor(l.language) }} />
                      <span className="text-sm font-semibold text-white">{l.language}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-cyan-300">{l.percentage}%</span>
                      <span className="block text-[10px] font-mono text-slate-500">{(l.bytes / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI UNDERSTANDING TAB ───────────────────────────── */}
          {activeTab === "understanding" && (
            <div className="space-y-6 animate-fade-in">
              {aiLoading && (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-300 font-semibold">AI is analyzing the codebase...</p>
                  <p className="text-xs text-slate-500 mt-1">Understanding architecture, identifying important files, and mapping navigation.</p>
                </div>
              )}

              {aiAnalysis?.understanding && (
                <>
                  {/* Main Purpose */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />What This Project Does
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{aiAnalysis.understanding.project_summary}</p>
                    {aiAnalysis.understanding.main_purpose && (
                      <p className="text-xs text-cyan-300 mt-2 font-mono">Purpose: {aiAnalysis.understanding.main_purpose}</p>
                    )}
                  </div>

                  {/* Architecture */}
                  {aiAnalysis.understanding.architecture && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-violet-400" />Architecture
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono">
                          {aiAnalysis.understanding.architecture.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-4">{aiAnalysis.understanding.architecture.description}</p>
                      {aiAnalysis.understanding.architecture.components?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-mono text-slate-400 font-semibold">Components</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {aiAnalysis.understanding.architecture.components.map((c, i) => (
                              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                                <div className="flex items-center gap-2 mb-1">
                                  <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="text-xs font-bold text-white">{c.name}</span>
                                </div>
                                <p className="text-[11px] text-slate-400">{c.description}</p>
                                {c.path && <p className="text-[10px] font-mono text-slate-500 mt-1">{c.path}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiAnalysis.understanding.architecture.data_flow && (
                        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                          <span className="text-[11px] font-mono text-slate-500">Data Flow:</span>
                          <p className="text-xs text-slate-300 mt-1">{aiAnalysis.understanding.architecture.data_flow}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Important Files */}
                  {aiAnalysis.understanding.important_files?.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-400" />Important Files & Folders
                      </h3>
                      <div className="space-y-2">
                        {aiAnalysis.understanding.important_files.map((f, i) => (
                          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-950/60 transition">
                            <FileCode className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-mono font-semibold text-cyan-300">{f.path}</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">{f.role}</p>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${f.importance === "high" ? "bg-rose-500/10 text-rose-400" : "bg-slate-800 text-slate-400"}`}>
                              {f.importance}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Guide */}
                  {aiAnalysis.understanding.navigation_guide && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-emerald-400" />Codebase Navigation Guide
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(aiAnalysis.understanding.navigation_guide)
                          .filter(([, v]) => v)
                          .map(([area, path]) => (
                            <div key={area} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                              <span className="text-[11px] font-mono text-slate-500 uppercase">{area}</span>
                              <p className="text-xs font-mono text-cyan-300 mt-0.5">{path}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* README Summary */}
                  {aiAnalysis.readme_summary && (
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-sky-400" />README Summary
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{aiAnalysis.readme_summary}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── OPPORTUNITIES TAB ──────────────────────────────── */}
          {activeTab === "opportunities" && (
            <div className="space-y-4 animate-fade-in">
              {aiLoading && (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-300">Finding contribution opportunities...</p>
                </div>
              )}

              {opportunities.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Contribution Opportunities</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{opportunities.length} opportunities found from GitHub issues and AI analysis.</p>
                    </div>
                    {userSkills && !skillMatches && (
                      <button type="button" onClick={handleMatchSkills} disabled={skillMatchLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-400 transition cursor-pointer disabled:opacity-50">
                        {skillMatchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                        {skillMatchLoading ? "Matching..." : "Match My Skills"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {opportunities.map((opp) => {
                      const typeBadge = getTypeBadge(opp.type);
                      return (
                        <div key={opp.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/20 transition space-y-3 group">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="text-sm font-bold text-white">{opp.title}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${typeBadge.color}`}>{typeBadge.label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getDiffColor(opp.difficulty)}`}>{opp.difficulty}</span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{opp.description}</p>
                            </div>
                          </div>

                          {/* Source badge */}
                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            {opp.source === "github_issue" && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <GithubIcon className="w-3 h-3" />
                                <span>GitHub Issue</span>
                                {opp.github_issue_url && (
                                  <a href={opp.github_issue_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                                    View <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </span>
                            )}
                            {opp.source === "ai_detection" && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                <Bot className="w-3 h-3" />AI Detected — Needs Verification
                              </span>
                            )}
                            {opp.source === "repository_analysis" && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Eye className="w-3 h-3" />Repository Analysis
                              </span>
                            )}
                            {opp.estimated_time && opp.estimated_time !== "varies" && (
                              <span className="flex items-center gap-1 text-slate-500 ml-2">
                                <Clock className="w-3 h-3" />{opp.estimated_time}
                              </span>
                            )}
                          </div>

                          {/* Skills & files */}
                          <div className="flex flex-wrap items-center gap-4 text-[11px]">
                            {opp.required_skills?.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">Skills:</span>
                                {opp.required_skills.map((s) => (
                                  <span key={s} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">{s}</span>
                                ))}
                              </div>
                            )}
                            {opp.relevant_files?.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">Files:</span>
                                {opp.relevant_files.slice(0, 3).map((f) => (
                                  <span key={f} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono">{f}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Learning value */}
                          {opp.learning_value?.length > 0 && (
                            <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <span>Learn: {opp.learning_value.join(", ")}</span>
                            </div>
                          )}

                          {/* Action */}
                          <div className="flex items-center gap-2 pt-1">
                            <button type="button" onClick={() => handleCreatePlan(opp)}
                              disabled={planLoading && selectedOpp?.id === opp.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer disabled:opacity-50">
                              {planLoading && selectedOpp?.id === opp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ListChecks className="w-3 h-3" />}
                              Create Contribution Plan
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {!aiLoading && opportunities.length === 0 && (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
                  No contribution opportunities found. This may be because AI is not configured or the repository has no open issues.
                </div>
              )}
            </div>
          )}

          {/* ── ISSUES TAB ─────────────────────────────────────── */}
          {activeTab === "issues" && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">Open GitHub Issues</h3>
                  <p className="text-xs text-slate-400">Latest issues pulled directly from the repository.</p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">{data.issues.length} Issues</span>
              </div>
              {data.issues.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No open issues found.</div>
              ) : (
                <div className="space-y-3">
                  {data.issues.map((issue) => (
                    <div key={issue.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition space-y-2 group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <a href={issue.html_url} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-bold text-white hover:text-cyan-300 transition flex items-center gap-1.5">
                          <span className="text-slate-500 font-mono">#{issue.number}</span>
                          <span>{issue.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition shrink-0" />
                        </a>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
                          {issue.comments_count > 0 && (
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{issue.comments_count}</span>
                          )}
                          <span>by {issue.author}</span>
                        </div>
                      </div>
                      {issue.labels?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {issue.labels.map((lbl) => (
                            <span key={lbl.name} style={{ borderColor: `#${lbl.color}40`, color: `#${lbl.color}`, backgroundColor: `#${lbl.color}15` }}
                              className="px-2 py-0.5 rounded text-[10px] font-mono border font-medium">{lbl.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SKILL MATCH TAB ────────────────────────────────── */}
          {activeTab === "skill_match" && skillMatches && (
            <div className="space-y-6 animate-fade-in">
              {/* Overall readiness */}
              {skillMatches.overall_readiness && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/30 to-slate-900/60 border border-violet-500/20">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-violet-300 mb-2">
                    <Shield className="w-4 h-4" /><span>Contribution Readiness Assessment</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{skillMatches.overall_readiness}</p>
                </div>
              )}

              {/* Match cards */}
              <div className="space-y-4">
                {skillMatches.matches?.map((match, idx) => {
                  const opp = opportunities.find((o) => o.id === match.opportunity_id) || {};
                  const typeBadge = getTypeBadge(opp.type);
                  return (
                    <div key={match.opportunity_id || idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                      {/* Header with score */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-sm font-bold text-white">{opp.title || match.opportunity_id}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${typeBadge.color}`}>{typeBadge.label}</span>
                          </div>
                          <p className="text-xs text-slate-400">{match.why_it_matches}</p>
                        </div>
                        <div className="shrink-0 text-center">
                          <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg font-mono ${
                            match.match_score >= 80 ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" :
                            match.match_score >= 60 ? "border-amber-500/50 text-amber-400 bg-amber-500/10" :
                            "border-slate-700 text-slate-400 bg-slate-800/50"
                          }`}>
                            {match.match_score}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">match</span>
                        </div>
                      </div>

                      {/* Readiness breakdown */}
                      {match.readiness && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1 mb-1.5">
                              <CheckCircle2 className="w-3 h-3" />What You Know
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {match.readiness.what_you_know?.map((s) => (
                                <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">{s}</span>
                              ))}
                              {(!match.readiness.what_you_know || match.readiness.what_you_know.length === 0) && (
                                <span className="text-[10px] text-slate-500">No direct skill overlap detected</span>
                              )}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                            <span className="text-[11px] font-mono text-amber-400 font-semibold flex items-center gap-1 mb-1.5">
                              <Zap className="w-3 h-3" />What to Learn
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {match.readiness.what_to_learn?.map((s) => (
                                <span key={s} className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">{s}</span>
                              ))}
                              {(!match.readiness.what_to_learn || match.readiness.what_to_learn.length === 0) && (
                                <span className="text-[10px] text-slate-500">You're all set!</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next steps */}
                      {match.suggested_next_steps?.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                          <span className="text-[11px] font-mono text-slate-400 font-semibold">Suggested Next Steps</span>
                          <ol className="mt-1.5 space-y-1">
                            {match.suggested_next_steps.map((step, si) => (
                              <li key={si} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-cyan-400 font-mono text-[10px] mt-0.5 shrink-0">{si + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Create plan */}
                      <button type="button" onClick={() => handleCreatePlan(opp)}
                        disabled={planLoading && selectedOpp?.id === opp.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer disabled:opacity-50">
                        {planLoading && selectedOpp?.id === opp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ListChecks className="w-3 h-3" />}
                        Create Contribution Plan
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STRUCTURE TAB ──────────────────────────────────── */}
          {activeTab === "structure" && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">Repository File Tree</h3>
                  <p className="text-xs text-slate-400">
                    {data.tree.length} files and directories from <code className="text-cyan-300">{data.repository.default_branch}</code>.
                  </p>
                </div>
                <input type="text" value={treeSearch} onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="Filter files by name..."
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono w-full sm:w-64" />
              </div>
              <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-3 max-h-[500px] overflow-y-auto font-mono text-xs divide-y divide-slate-900">
                {filteredTree.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">No files matching "{treeSearch}".</div>
                ) : (
                  filteredTree.map((item) => {
                    const isFolder = item.type === "folder";
                    const isExpanded = expandedFolders.has(item.path);
                    return (
                      <div key={item.path} style={{ paddingLeft: `${item.depth * 18 + 8}px` }}
                        onClick={() => isFolder && toggleFolder(item.path)}
                        className={`py-1.5 flex items-center justify-between hover:bg-slate-900/80 rounded transition ${isFolder ? "cursor-pointer text-slate-200 font-semibold" : "text-slate-400"}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          {isFolder ? (
                            <>{isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                              {isExpanded ? <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" /> : <Folder className="w-4 h-4 text-amber-400 shrink-0" />}</>
                          ) : (
                            <><span className="w-3.5 h-3.5 shrink-0" /><FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" /></>
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        {!isFolder && item.size > 0 && (
                          <span className="text-[10px] text-slate-600 font-mono shrink-0 pl-3">{(item.size / 1024).toFixed(1)} KB</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── README TAB ─────────────────────────────────────── */}
          {activeTab === "readme" && (
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileText className="w-4 h-4 text-cyan-400" /><span>README.md</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{data.readme?.length || 0} characters</span>
              </div>
              {aiAnalysis?.readme_summary && (
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-violet-300 mb-1.5">
                    <Brain className="w-3 h-3" /><span>Quick Summary</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{aiAnalysis.readme_summary}</p>
                </div>
              )}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap font-mono">
                {data.readme || "No README content found."}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
             CONTRIBUTION PLAN PANEL
             ══════════════════════════════════════════════════ */}
          {(contributionPlan || planLoading) && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 border border-cyan-500/20 shadow-xl space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Contribution Plan</h3>
                  {selectedOpp && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{selectedOpp.title}</span>}
                </div>
                <button type="button" onClick={() => { setContributionPlan(null); setSelectedOpp(null); }}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer">✕ Close</button>
              </div>

              {planLoading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-300">Generating your personalized contribution plan...</p>
                </div>
              )}

              {contributionPlan && (
                <div className="space-y-5">
                  {/* Goal */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-mono text-cyan-400 font-semibold mb-1">🎯 Goal</h4>
                    <p className="text-sm text-white font-semibold">{contributionPlan.goal}</p>
                  </div>

                  {/* Why It Matters */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-mono text-emerald-400 font-semibold mb-1">💡 Why It Matters</h4>
                    <p className="text-sm text-slate-300">{contributionPlan.why_it_matters}</p>
                  </div>

                  {/* Where to Work */}
                  {contributionPlan.where_to_work && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="text-xs font-mono text-sky-400 font-semibold mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />Where to Work
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ml-1 ${
                          contributionPlan.where_to_work.confidence === "high" ? "bg-emerald-500/10 text-emerald-400" :
                          contributionPlan.where_to_work.confidence === "medium" ? "bg-amber-500/10 text-amber-400" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {contributionPlan.where_to_work.confidence} confidence
                        </span>
                      </h4>
                      {contributionPlan.where_to_work.primary_files?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {contributionPlan.where_to_work.primary_files.map((f) => (
                            <span key={f} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">{f}</span>
                          ))}
                        </div>
                      )}
                      {contributionPlan.where_to_work.note && (
                        <p className="text-[11px] text-slate-500 italic">{contributionPlan.where_to_work.note}</p>
                      )}
                    </div>
                  )}

                  {/* Prerequisites */}
                  {contributionPlan.prerequisites?.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="text-xs font-mono text-amber-400 font-semibold mb-2">📋 Prerequisites</h4>
                      <ul className="space-y-1">
                        {contributionPlan.prerequisites.map((p, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span><span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Steps */}
                  {contributionPlan.steps?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono text-cyan-400 font-semibold">🚀 Step-by-Step Plan</h4>
                      {contributionPlan.steps.map((step) => (
                        <div key={step.step} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xs font-bold font-mono">{step.step}</span>
                            <h5 className="text-sm font-bold text-white">{step.title}</h5>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed mb-2 ml-8">{step.description}</p>
                          {step.commands?.length > 0 && (
                            <div className="ml-8 space-y-1">
                              {step.commands.map((cmd, ci) => (
                                <div key={ci} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
                                  <Terminal className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <code className="text-emerald-300 flex-1">{cmd}</code>
                                  <CopyButton text={cmd} />
                                </div>
                              ))}
                            </div>
                          )}
                          {step.tips?.length > 0 && (
                            <div className="ml-8 mt-2 space-y-0.5">
                              {step.tips.map((tip, ti) => (
                                <p key={ti} className="text-[11px] text-slate-500 flex items-start gap-1">
                                  <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /><span>{tip}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Useful Commands */}
                  {contributionPlan.useful_commands && Object.values(contributionPlan.useful_commands).some((v) => v?.length > 0) && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="text-xs font-mono text-emerald-400 font-semibold mb-3">⌨️ Useful Commands</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(contributionPlan.useful_commands)
                          .filter(([, cmds]) => cmds?.length > 0)
                          .map(([cat, cmds]) => (
                            <div key={cat}>
                              <span className="text-[10px] font-mono text-slate-500 uppercase">{cat}</span>
                              {cmds.map((cmd, ci) => (
                                <div key={ci} className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-300">
                                  <code className="flex-1 truncate">{cmd}</code><CopyButton text={cmd} />
                                </div>
                              ))}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* PR Checklist */}
                  {contributionPlan.pr_checklist?.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="text-xs font-mono text-violet-400 font-semibold mb-2">✅ PR Checklist</h4>
                      <ul className="space-y-1">
                        {contributionPlan.pr_checklist.map((item, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-slate-600" /><span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Estimated time & common mistakes */}
                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
                    {contributionPlan.estimated_time && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Estimated: {contributionPlan.estimated_time}</span>
                    )}
                  </div>
                  {contributionPlan.common_mistakes?.length > 0 && (
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <h4 className="text-xs font-mono text-rose-400 font-semibold mb-2">⚠️ Common Mistakes to Avoid</h4>
                      <ul className="space-y-1">
                        {contributionPlan.common_mistakes.map((m, i) => (
                          <li key={i} className="text-xs text-rose-300/80 flex items-start gap-2">
                            <span className="text-rose-400 mt-0.5">•</span><span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryAnalyzerSection;
