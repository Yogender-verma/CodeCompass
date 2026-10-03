import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Compass, LogOut, LayoutDashboard, ArrowRight } from "lucide-react";

export const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#080b12]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 transition-colors shadow-lg shadow-cyan-500/10">
            <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-base group-hover:text-cyan-300 transition-colors">
                CodeCompass
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Beta
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Navigate code. Find your contribution.
            </span>
          </div>
        </Link>

        {/* Center Navigation Links: Features, How It Works, FAQ */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <a
            href="#features"
            className="hover:text-cyan-300 transition-colors hover:scale-105"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-cyan-300 transition-colors hover:scale-105"
          >
            How It Works
          </a>
          <a
            href="#faq"
            className="hover:text-cyan-300 transition-colors hover:scale-105"
          >
            FAQ
          </a>
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {loading ? (
            <div className="w-24 h-8 bg-slate-800/50 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dashboard</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover"
                />
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Sign In Button -> /login */}
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 transition"
              >
                Sign In
              </Link>
              {/* Sign Up Button -> /signup */}
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
