import React, { useState, useEffect } from "react";
import {
  Compass,
  FolderGit2,
  ArrowRight,
  Star,
  Code2,
  Target,
  Award,
  Clock,
  BarChart3,
  Sparkles,
  ExternalLink,
  ListChecks,
  Brain,
  Zap,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD SECTION
   The landing section after login — overview, recent repos, stats.
   ══════════════════════════════════════════════════════════════ */
export const DashboardSection = ({ onNavigateToAnalyzer }) => {
  const [history, setHistory] = useState([]);
  const [hasSkills, setHasSkills] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("codecompass_history");
      if (raw) setHistory(JSON.parse(raw).slice(0, 5));
    } catch {}
    try {
      const skills = JSON.parse(localStorage.getItem("codecompass_skills") || "null");
      setHasSkills(skills && skills.skills?.length > 0);
    } catch {}
  }, []);

  // Derived stats
  const totalRepos = history.length;
  const totalOpportunities = history.reduce((sum, h) => sum + (h.opportunityCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* ── Welcome Header ─────────────────────────────────────── */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>DASHBOARD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          Welcome to CodeCompass
        </h1>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          Navigate code. Find your contribution. Analyze any public GitHub repository, understand its architecture, and discover exactly where you can contribute.
        </p>
      </div>

      {/* ── Analyze CTA ────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-violet-950/30 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-0.5">Analyze a Repository</h2>
              <p className="text-xs text-slate-400">Paste any public GitHub URL to get started.</p>
            </div>
          </div>
          <button type="button" onClick={onNavigateToAnalyzer}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 transition cursor-pointer shadow-lg shadow-cyan-500/20 shrink-0">
            <FolderGit2 className="w-4 h-4" />
            <span>Analyze Repository</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">{totalRepos}</span>
            <p className="text-xs text-slate-400">Repositories Analyzed</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">{totalOpportunities}</span>
            <p className="text-xs text-slate-400">Opportunities Discovered</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white font-mono">{hasSkills ? "✓" : "—"}</span>
            <p className="text-xs text-slate-400">Skills Profile {hasSkills ? "Complete" : "Not Set"}</p>
          </div>
        </div>
      </div>

      {/* ── How It Works ───────────────────────────────────────── */}
      {history.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />How CodeCompass Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { step: "1", title: "Paste a GitHub URL", desc: "Any public repository", icon: FolderGit2, color: "text-cyan-400" },
              { step: "2", title: "AI Understands", desc: "Architecture & tech stack", icon: Brain, color: "text-violet-400" },
              { step: "3", title: "Match Your Skills", desc: "Personalized recommendations", icon: Award, color: "text-amber-400" },
              { step: "4", title: "Get a Plan", desc: "Step-by-step contribution guide", icon: ListChecks, color: "text-emerald-400" },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-[10px] font-mono text-slate-500">Step {item.step}</span>
                <h4 className="text-xs font-bold text-white mt-0.5">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recently Analyzed Repositories ─────────────────────── */}
      {history.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />Recently Analyzed
            </h3>
            <button type="button" onClick={onNavigateToAnalyzer}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition cursor-pointer">
              Analyze New <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {history.map((repo, i) => (
              <div key={repo.url || i}
                onClick={onNavigateToAnalyzer}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/30 transition cursor-pointer group flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">{repo.name}</h4>
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-mono text-amber-400 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />{repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{repo.description || "No description"}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {repo.languages?.map((lang) => (
                      <span key={lang} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">{lang}</span>
                    ))}
                    {repo.analyzedAt && (
                      <span className="text-[10px] text-slate-600 font-mono">
                        {new Date(repo.analyzedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 transition" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Latest Recommendation ──────────────────────────────── */}
      {history.length > 0 && history[0].recommendation && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900/60 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Latest Recommended Contribution</span>
          </div>
          <p className="text-sm text-white font-semibold">{history[0].recommendation}</p>
          <p className="text-xs text-slate-400 mt-1">
            From <span className="text-cyan-300 font-mono">{history[0].name}</span>
          </p>
          <button type="button" onClick={onNavigateToAnalyzer}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer">
            <ArrowRight className="w-3 h-3" />View Details
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardSection;
