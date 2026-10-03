import React from "react";
import { Compass, GitPullRequest, Search, Zap, Code2, ArrowRight } from "lucide-react";

export const WorkflowSection = () => {
  const steps = [
    {
      step: "01",
      name: "Understand",
      title: "Deep Repository Intelligence",
      description:
        "CodeCompass automatically unpacks the repository's architecture, dependency tree, and core module hierarchy in seconds.",
      icon: Compass,
      color: "from-cyan-500/20 to-blue-500/10",
      accent: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      chip: "AST & Tech-Stack Parse",
    },
    {
      step: "02",
      name: "Discover",
      title: "Contextual Issue Extraction",
      description:
        "Scans open GitHub issues, unmaintained modules, and tech debt to pinpoint high-value contribution opportunities.",
      icon: Search,
      color: "from-blue-500/20 to-indigo-500/10",
      accent: "text-blue-400",
      borderColor: "border-blue-500/30",
      chip: "Issue & Need Detection",
    },
    {
      step: "03",
      name: "Match",
      title: "Exact Skill-to-Task Alignment",
      description:
        "Correlates your language proficiency, frameworks, and developer profile directly to tailored difficulty ratings.",
      icon: Zap,
      color: "from-indigo-500/20 to-purple-500/10",
      accent: "text-indigo-400",
      borderColor: "border-indigo-500/30",
      chip: "Personalized Match Score",
    },
    {
      step: "04",
      name: "Contribute",
      title: "Precision Execution Blueprint",
      description:
        "Identifies exact files, functions, test suites, and step-by-step guidance to draft a PR maintainers will eagerly merge.",
      icon: GitPullRequest,
      color: "from-purple-500/20 to-emerald-500/10",
      accent: "text-purple-400",
      borderColor: "border-purple-500/30",
      chip: "File & Line Plan",
    },
  ];

  return (
    <section id="workflow" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>THE CONTRIBUTION ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Understand <span className="text-cyan-400">→</span> Discover{" "}
            <span className="text-blue-400">→</span> Match{" "}
            <span className="text-indigo-400">→</span> Contribute
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            Stop wandering massive monolithic repositories. CodeCompass builds a clear navigational beacon from first clone to accepted pull request.
          </p>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between"
              >
                {/* Connecting arrow indicator for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border ${item.borderColor} flex items-center justify-center ${item.accent}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-bold text-slate-700 group-hover:text-slate-500 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                      {item.chip}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">
                  <span>{item.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
