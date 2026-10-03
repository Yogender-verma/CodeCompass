import React, { useState } from "react";
import {
  GitBranch,
  FolderGit2,
  Code2,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  FileCode,
  Sliders,
  ChevronRight,
} from "lucide-react";

export const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState("match");

  return (
    <section id="preview" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE PRODUCT PREVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The CodeCompass Intelligence Cockpit
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            A real-time navigational radar for open-source repositories. Peek into the future dashboard interface.
          </p>
        </div>

        {/* Mock Window Container */}
        <div className="relative mx-auto rounded-2xl bg-slate-950/90 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400 flex items-center gap-2">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                codecompass // astral-sh / uv
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Analysis Cached
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                v0.4.18
              </span>
            </div>
          </div>

          {/* Sub Navigation Bar inside Preview */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-900/40 border-b border-slate-800/60 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">Target Repository:</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-cyan-300">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                <span>astral-sh/uv:main</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab("match")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "match"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Match Radar (96%)
              </button>
              <button
                onClick={() => setActiveTab("architecture")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "architecture"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Architecture Map
              </button>
              <button
                onClick={() => setActiveTab("blueprint")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "blueprint"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                PR Blueprint
              </button>
            </div>
          </div>

          {/* Preview Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/60">
            {/* Left Column: Repository & Stack Diagnostics */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Detected Tech Stack
                  </span>
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 text-xs font-mono font-medium">
                    Rust (92%)
                  </span>
                  <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono font-medium">
                    Python (8%)
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                    Tokio
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                    Clap CLI
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                    PyO3
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Contributor Match Index
                  </span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">96 / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 w-[96%]" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on your demonstrated proficiency in Rust async I/O and CLI argument parsing, 3 actionable issues match your skills.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Maintainer Velocity
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Avg PR Response</span>
                    <span className="text-emerald-400 font-semibold font-mono">3.4 hours</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Merge Ratio</span>
                    <span className="text-cyan-400 font-semibold font-mono">89%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Tab Content */}
            <div className="lg:col-span-8">
              {activeTab === "match" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-cyan-500/30 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Recommended Match #1
                        </span>
                        <span className="text-xs font-mono text-slate-400">Issue #6142</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        Confidence: 96%
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2">
                      Improve error messages when wheel tag resolution fails for custom platform targets
                    </h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      CodeCompass identified an isolated function in the wheel cache resolver with missing platform diagnostic hints. Great first issue with zero cross-module side effects.
                    </p>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1 mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-cyan-300">crates/uv-resolver/src/resolver.rs</span>
                        <span className="text-slate-400">:: resolve_wheel_tag()</span>
                      </div>
                      <div className="text-[11px] text-slate-400 pl-5">
                        Target range: Lines 342 - 389 (47 lines context)
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">
                        Estimated effort: <strong className="text-slate-200">1.5 - 2 hrs</strong>
                      </span>
                      <button
                        onClick={() => setActiveTab("blueprint")}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
                      >
                        <span>View PR Blueprint</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Secondary Match */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">Match #2 • Issue #5890</span>
                      <span className="text-slate-400 font-mono">Match: 91%</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Add verbose telemetry timing flag to <code className="text-cyan-400">uv pip sync</code> subcommand.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "architecture" && (
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Repository Architecture Topology
                    </h4>
                    <span className="text-xs font-mono text-slate-400">4 Crates Analyzed</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-cyan-300 font-semibold">crates/uv (CLI Shell)</span>
                        <span className="text-slate-400 text-[11px]">Command line dispatch &amp; exit codes</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-cyan-400 font-semibold">crates/uv-resolver (Target)</span>
                        <span className="text-cyan-200 text-[11px]">PubGrub dependency constraint solver</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300 font-semibold">crates/uv-client (HTTP / PyPI)</span>
                        <span className="text-slate-400 text-[11px]">Network requests &amp; cache headers</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "blueprint" && (
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Automated Contribution Execution Plan
                  </h4>

                  <ol className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong>Locate function:</strong> Open <code className="text-cyan-300">crates/uv-resolver/src/resolver.rs:342</code>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong>Patch error variant:</strong> Implement custom display formatter for <code className="text-cyan-300">WheelTagMismatchError</code>.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong>Execute verification tests:</strong> Run <code className="text-emerald-400">cargo test -p uv-resolver</code>.
                      </div>
                    </li>
                  </ol>

                  <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-slate-300 flex items-center justify-between border border-slate-800 mt-2">
                    <span className="text-slate-400">$ cargo test -p uv-resolver test_wheel_tag_mismatch</span>
                    <span className="text-emerald-400 font-semibold">pass (0.42s)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Cockpit Status Bar */}
          <div className="px-6 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              CodeCompass Engine: AI Ast Parser Ready
            </span>
            <span>Target Confidence: Optimal</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
