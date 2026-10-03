import React, { useState, useEffect, useRef } from "react";
import {
  Wrench,
  Plus,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Heart,
  BookOpen,
  ChevronDown,
  Loader2,
  Trash2,
  Info,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────
   Suggested skill options (user can still type custom ones)
   ────────────────────────────────────────────────────────────── */
const SKILL_SUGGESTIONS = [
  "JavaScript", "TypeScript", "Python", "React", "Vue", "Angular",
  "Node.js", "FastAPI", "Django", "Flask", "Express", "Next.js",
  "HTML", "CSS", "Tailwind CSS", "SASS", "Java", "Kotlin", "Swift",
  "C++", "C", "C#", "Rust", "Go", "Ruby", "PHP", "SQL", "MongoDB",
  "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Git",
  "GraphQL", "REST API", "Linux", "Bash", "Svelte", "Flutter",
  "Dart", "R", "MATLAB", "TensorFlow", "PyTorch", "Machine Learning",
];

const INTEREST_OPTIONS = [
  { id: "bug_fixes", label: "Bug Fixes", icon: "🐛" },
  { id: "frontend", label: "Frontend", icon: "🎨" },
  { id: "backend", label: "Backend", icon: "⚙️" },
  { id: "documentation", label: "Documentation", icon: "📝" },
  { id: "testing", label: "Testing", icon: "🧪" },
  { id: "performance", label: "Performance", icon: "⚡" },
  { id: "ui_ux", label: "UI/UX", icon: "✨" },
  { id: "devops", label: "DevOps", icon: "🔧" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "accessibility", label: "Accessibility", icon: "♿" },
  { id: "refactoring", label: "Refactoring", icon: "🔄" },
  { id: "api_design", label: "API Design", icon: "🔌" },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to programming or open-source.", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
  { id: "intermediate", label: "Intermediate", desc: "Comfortable with at least one stack.", color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
  { id: "advanced", label: "Advanced", desc: "Deep experience, familiar with complex codebases.", color: "border-violet-500/40 text-violet-400 bg-violet-500/10" },
];

const STORAGE_KEY = "codecompass_skills";

/* ──────────────────────────────────────────────────────────────────
   Tag Input Component
   ────────────────────────────────────────────────────────────── */
const TagInput = ({ tags, setTags, suggestions, placeholder, accentColor = "cyan" }) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const colorMap = {
    cyan: { tag: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300", hover: "hover:bg-cyan-500/10 hover:text-cyan-300" },
    violet: { tag: "bg-violet-500/10 border-violet-500/30 text-violet-300", hover: "hover:bg-violet-500/10 hover:text-violet-300" },
    amber: { tag: "bg-amber-500/10 border-amber-500/30 text-amber-300", hover: "hover:bg-amber-500/10 hover:text-amber-300" },
  };
  const colors = colorMap[accentColor] || colorMap.cyan;

  const filtered = suggestions
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !tags.map((t) => t.toLowerCase()).includes(s.toLowerCase())
      ).slice(0, 8)
    : [];

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      setTags([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-cyan-400 transition min-h-[44px]">
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border ${colors.tag}`}>
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="ml-0.5 hover:text-white transition">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
        />
      </div>

      {/* Suggestion dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-20 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 shadow-xl divide-y divide-slate-800/50">
          {filtered.map((s) => (
            <button key={s} type="button" onClick={() => addTag(s)}
              className={`w-full text-left px-3 py-2 text-xs font-mono text-slate-300 ${colors.hover} transition`}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export const MySkillsSection = () => {
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState("beginner");
  const [interests, setInterests] = useState([]);
  const [toLearn, setToLearn] = useState([]);
  const [saved, setSaved] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.skills) setSkills(data.skills);
        if (data.experience) setExperience(data.experience);
        if (data.interests) setInterests(data.interests);
        if (data.to_learn) setToLearn(data.to_learn);
      }
    } catch (e) {
      console.warn("Failed to load skills from localStorage:", e);
    }
    setHasLoaded(true);
  }, []);

  const handleSave = () => {
    const payload = {
      skills,
      experience,
      interests,
      to_learn: toLearn,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setSkills([]);
    setExperience("beginner");
    setInterests([]);
    setToLearn([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const hasData = skills.length > 0 || toLearn.length > 0 || interests.length > 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono mb-2">
          <Wrench className="w-3.5 h-3.5" />
          <span>MY SKILLS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Skills & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tell CodeCompass about your skills, experience, and interests. This helps match you to the right contribution opportunities.
        </p>
      </div>

      {/* Info banner */}
      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Your skills are saved locally in your browser. After entering your skills, analyze a repository and click <strong className="text-cyan-300">"Match My Skills"</strong> to get personalized contribution recommendations.
        </p>
      </div>

      {/* ── Skills ────────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Technical Skills</h2>
        </div>
        <p className="text-xs text-slate-400">Add programming languages, frameworks, and tools you know.</p>
        <TagInput
          tags={skills}
          setTags={setSkills}
          suggestions={SKILL_SUGGESTIONS}
          placeholder="e.g., React, Python, TypeScript..."
          accentColor="cyan"
        />
      </div>

      {/* ── Experience Level ──────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Experience Level</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((lvl) => (
            <button key={lvl.id} type="button" onClick={() => setExperience(lvl.id)}
              className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                experience === lvl.id
                  ? `${lvl.color} shadow-lg`
                  : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
              }`}>
              <span className="text-sm font-bold block mb-0.5">
                {experience === lvl.id && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
                {lvl.label}
              </span>
              <span className="text-[11px] opacity-80">{lvl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Contribution Interests ────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-white">Contribution Interests</h2>
        </div>
        <p className="text-xs text-slate-400">Select the types of contributions that interest you.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {INTEREST_OPTIONS.map((opt) => {
            const selected = interests.includes(opt.id);
            return (
              <button key={opt.id} type="button" onClick={() => toggleInterest(opt.id)}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                  selected
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}>
                <span className="text-base">{opt.icon}</span>
                <span>{opt.label}</span>
                {selected && <CheckCircle2 className="w-3 h-3 ml-auto text-violet-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Skills to Learn ───────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Skills I Want to Learn</h2>
        </div>
        <p className="text-xs text-slate-400">
          CodeCompass will prioritize opportunities that help you learn these skills.
        </p>
        <TagInput
          tags={toLearn}
          setTags={setToLearn}
          suggestions={SKILL_SUGGESTIONS}
          placeholder="e.g., Rust, GraphQL, Testing..."
          accentColor="amber"
        />
      </div>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 transition cursor-pointer shadow-lg shadow-cyan-500/20">
          {saved ? (<><CheckCircle2 className="w-4 h-4" /><span>Saved!</span></>) : (<><Save className="w-4 h-4" /><span>Save Skills</span></>)}
        </button>
        {hasData && (
          <button type="button" onClick={handleClear}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer">
            <Trash2 className="w-4 h-4" /><span>Clear All</span>
          </button>
        )}
      </div>

      {/* ── Current Skills Summary ────────────────────────────── */}
      {hasData && hasLoaded && (
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Profile Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-mono">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {skills.length > 0 ? skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">{s}</span>
                )) : <span className="text-slate-600">None set</span>}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-mono">Experience:</span>
              <p className="text-white font-semibold mt-1 capitalize">{experience}</p>
            </div>
            <div>
              <span className="text-slate-500 font-mono">Interests:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {interests.length > 0 ? interests.map((i) => {
                  const opt = INTEREST_OPTIONS.find((o) => o.id === i);
                  return <span key={i} className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono text-[11px]">{opt?.label || i}</span>;
                }) : <span className="text-slate-600">None set</span>}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-mono">Want to learn:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {toLearn.length > 0 ? toLearn.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">{s}</span>
                )) : <span className="text-slate-600">None set</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySkillsSection;
