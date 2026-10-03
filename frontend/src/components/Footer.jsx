import React from "react";
import { Compass } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-[#06080e] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">CodeCompass</span>
            <span className="text-slate-500 ml-2">“Navigate code. Find your contribution.”</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-cyan-300 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">
            How It Works
          </a>
          <a href="#faq" className="hover:text-cyan-300 transition-colors">
            FAQ
          </a>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            FastAPI Backend: Ready
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
