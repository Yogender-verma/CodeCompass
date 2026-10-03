import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  LogOut,
  Shield,
  ExternalLink,
  Save,
  CheckCircle2,
  Camera,
  Loader2,
} from "lucide-react";
import { GithubIcon } from "../GithubIcon";
import { useAuth } from "../../contexts/AuthContext";

/* ══════════════════════════════════════════════════════════════════
   PROFILE SECTION
   Shows authenticated user info + optional GitHub username + sign out.
   ══════════════════════════════════════════════════════════════ */
export const ProfileSection = () => {
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [saved, setSaved] = useState(false);

  // Load saved GitHub username from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("codecompass_profile");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.githubUsername) setGithubUsername(data.githubUsername);
      }
    } catch {}
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setSigningOut(false);
    }
  };

  const handleSaveProfile = () => {
    const payload = { githubUsername: githubUsername.trim() };
    localStorage.setItem("codecompass_profile", JSON.stringify(payload));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Determine provider display
  const getProviderLabel = () => {
    if (!user) return "Unknown";
    if (user.isDemo) return "Demo Session";
    if (user.providerId === "google.com") return "Google Account";
    if (user.providerId === "password") return "Email & Password";
    return user.providerId || "Unknown";
  };

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        <p>No user information available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono mb-2">
          <User className="w-3.5 h-3.5" />
          <span>PROFILE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Your Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Account details and preferences.
        </p>
      </div>

      {/* ── Profile Card ─────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
              alt={user.displayName || "User"}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-xl shadow-cyan-500/10"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white">{user.displayName || "Developer"}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 mt-0.5">
                <Mail className="w-3 h-3" />
                <span className="font-mono">{user.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-950 border border-slate-800 text-slate-300">
                <Shield className="w-3 h-3 text-cyan-400" />
                {getProviderLabel()}
              </span>
              {user.uid && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-500" title={user.uid}>
                  UID: {user.uid.slice(0, 12)}…
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── GitHub Username ───────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <GithubIcon className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white">GitHub Username</h3>
          <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">Optional</span>
        </div>
        <p className="text-xs text-slate-400">
          Link your GitHub profile. This can be used for future features like contribution tracking.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <GithubIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g., octocat"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
          <button type="button" onClick={handleSaveProfile}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/40 transition cursor-pointer shrink-0">
            {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Saved!" : "Save"}</span>
          </button>
        </div>
        {githubUsername.trim() && (
          <a href={`https://github.com/${githubUsername.trim()}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition">
            <span>github.com/{githubUsername.trim()}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* ── Account Details ───────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white">Account Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Display Name</span>
            <span className="text-sm text-white font-semibold">{user.displayName || "Not set"}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Email</span>
            <span className="text-sm text-white font-mono">{user.email}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Auth Provider</span>
            <span className="text-sm text-white">{getProviderLabel()}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Session Type</span>
            <span className="text-sm text-white">{user.isDemo ? "Demo (Temporary)" : "Authenticated"}</span>
          </div>
        </div>
      </div>

      {/* ── Sign Out ──────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-rose-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Sign Out</h3>
            <p className="text-xs text-slate-400">End your current session. Your skills and analysis history are saved locally.</p>
          </div>
          <button type="button" onClick={handleSignOut} disabled={signingOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer disabled:opacity-50 shrink-0">
            {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
