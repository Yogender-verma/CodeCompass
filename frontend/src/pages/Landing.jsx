import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  Compass,
  ArrowRight,
  GitPullRequest,
  Search,
  Zap,
  Layers,
  ShieldCheck,
  ChevronDown,
  Cpu,
  FolderGit2,
  Sparkles,
  HelpCircle,
  Code2,
} from "lucide-react";

export const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0); // First FAQ open by default

  // If already authenticated, redirect to /dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Features List
  const features = [
    {
      title: "Repository Understanding",
      tagline: "Architecture & Dependency Mapping",
      description:
        "Parses codebases, submodule hierarchies, and module boundaries so you grasp large architectures in minutes instead of days.",
      icon: Layers,
      accent: "text-cyan-400",
      bgGradient: "from-cyan-500/10 to-blue-500/5",
      borderColor: "border-cyan-500/30",
    },
    {
      title: "Issue Discovery",
      tagline: "Contextual Opportunity Radar",
      description:
        "Scans open GitHub issues, unmaintained files, and tech debt hotspots to highlight issues maintainers actively need solved.",
      icon: Search,
      accent: "text-blue-400",
      bgGradient: "from-blue-500/10 to-indigo-500/5",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Skill Matching",
      tagline: "Tailored Contributor Alignment",
      description:
        "Evaluates your language proficiency, frameworks, and developer experience to surface tasks with the highest probability of success.",
      icon: Zap,
      accent: "text-indigo-400",
      bgGradient: "from-indigo-500/10 to-purple-500/5",
      borderColor: "border-indigo-500/30",
    },
    {
      title: "Contribution Guidance",
      tagline: "Precision PR Execution Blueprint",
      description:
        "Pinpoints exact files, relevant functions, and testing commands to craft a high-quality pull request maintainers eagerly merge.",
      icon: ShieldCheck,
      accent: "text-emerald-400",
      bgGradient: "from-emerald-500/10 to-cyan-500/5",
      borderColor: "border-emerald-500/30",
    },
  ];

  // How It Works 5-Step Pipeline
  const steps = [
    {
      num: "01",
      name: "Repository",
      description: "Select or input any public GitHub repository you want to explore.",
      icon: FolderGit2,
    },
    {
      num: "02",
      name: "Analyze",
      description: "CodeCompass unpacks the repository's tech stack, file tree, and architecture.",
      icon: Cpu,
    },
    {
      num: "03",
      name: "Match Skills",
      description: "Cross-references repository difficulty and languages against your skill set.",
      icon: Zap,
    },
    {
      num: "04",
      name: "Find Contribution",
      description: "Surfaces high-confidence issues with solvable scopes and clear context.",
      icon: Search,
    },
    {
      num: "05",
      name: "Contribute",
      description: "Follow the execution blueprint with target files, tests, and PR guidelines.",
      icon: GitPullRequest,
    },
  ];

  // FAQ List
  const faqs = [
    {
      question: "What is CodeCompass?",
      answer:
        "CodeCompass is an open-source intelligence platform designed to eliminate the intimidation factor of large codebases. It analyzes repository architecture, identifies solvable issues, and matches them to your developer strengths so you can contribute with confidence.",
    },
    {
      question: "How does skill matching work?",
      answer:
        "CodeCompass evaluates the languages, frameworks, and module complexity within a repository. It compares these characteristics with your developer background to compute a suitability score, ensuring you spend time on issues you can realistically solve.",
    },
    {
      question: "Do I need to be an expert developer to contribute?",
      answer:
        "Not at all. CodeCompass highlights contribution paths across every experience level—from beginner-friendly bug fixes and documentation polish to advanced algorithmic optimizations—all with exact file locations and context.",
    },
    {
      question: "How does authentication work?",
      answer:
        "CodeCompass offers both secure Email/Password and one-click Google authentication powered by Firebase. Your authentication state is securely persisted, granting you instant access to your protected dashboard.",
    },
    {
      question: "Which repositories are supported?",
      answer:
        "Any public GitHub repository can be analyzed. You can explore curated showcases or input your own target repository URL directly inside the protected dashboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col relative selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar />

      {/* Subtle Background Gradients and Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[600px] bg-radial-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col items-center">
        {/* Release Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 mb-8 backdrop-blur-md shadow-lg shadow-cyan-500/5 hover:border-cyan-400/50 transition cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">Open Source Navigator</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-300 font-mono">Firebase Auth &amp; Protected Dashboard</span>
        </div>

        {/* Project Name and Tagline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          <span className="block text-slate-100">CodeCompass</span>
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            “Navigate code. Find your contribution.”
          </span>
        </h1>

        {/* Short Description */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-normal">
          Tackle open-source codebases without the intimidation factor. CodeCompass breaks down complex architectures, detects solvable problems matching your developer profile, and charts your exact path to a merged pull request.
        </p>

        {/* Hero CTA: Only Sign In and Sign Up buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-16 z-10 w-full max-w-md justify-center">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 transition flex items-center justify-center gap-2 shadow-2xl shadow-cyan-500/20 active:scale-[0.98]"
          >
            <span>Sign Up</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* Developer Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-xs font-mono text-cyan-400 mb-1">01. FAST ONBOARDING</div>
            <div className="text-sm font-semibold text-white">Email &amp; Google</div>
            <div className="text-xs text-slate-400 mt-1">Firebase session persistence</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-xs font-mono text-cyan-400 mb-1">02. RESTRICTED ACCESS</div>
            <div className="text-sm font-semibold text-white">Protected Route</div>
            <div className="text-xs text-slate-400 mt-1">Zero unauthenticated exposure</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-xs font-mono text-cyan-400 mb-1">03. PYTHON BACKEND</div>
            <div className="text-sm font-semibold text-white">FastAPI Core</div>
            <div className="text-xs text-slate-400 mt-1">High-performance endpoints</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-xs font-mono text-cyan-400 mb-1">04. CLEAN ARCHITECTURE</div>
            <div className="text-sm font-semibold text-white">Isolated Apps</div>
            <div className="text-xs text-slate-400 mt-1">Production-ready structure</div>
          </div>
        </div>
      </section>

      {/* SECTION: Features */}
      <section id="features" className="py-24 relative border-t border-slate-900/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
              <Code2 className="w-3.5 h-3.5" />
              <span>CORE FEATURES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Developers Who Want to Ship
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              From demystifying architecture to delivering step-by-step contribution blueprints, CodeCompass replaces codebase anxiety with structured progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-7 backdrop-blur-xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bgGradient} border ${feature.borderColor} flex items-center justify-center ${feature.accent}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {feature.tagline}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <span>Learn how this accelerates your PR</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: How It Works */}
      <section id="how-it-works" className="py-24 relative border-t border-slate-900 bg-[#080b12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE 5-STEP PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Repository <span className="text-cyan-400">→</span> Analyze{" "}
              <span className="text-blue-400">→</span> Match Skills{" "}
              <span className="text-indigo-400">→</span> Find Contribution{" "}
              <span className="text-emerald-400">→</span> Contribute
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              A continuous developer workflow that removes friction between opening a repository and pushing your branch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.name}
                  className="group relative rounded-2xl bg-slate-900/50 border border-slate-800/80 p-5 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Arrow for large screens */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {step.num}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {step.name}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/40 text-[11px] font-mono text-slate-500">
                    Step {idx + 1} of 5
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: FAQ */}
      <section id="faq" className="py-24 relative border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Clear answers to common questions about CodeCompass navigation and authentication.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <span className="text-base font-semibold text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA on Landing Page: Sign Up & Sign In */}
          <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 flex flex-col items-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Ready to find your contribution?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-lg">
              Create an account or sign in to access your personal CodeCompass developer dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 transition flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
