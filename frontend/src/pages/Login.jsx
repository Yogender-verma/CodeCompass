import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleButton } from "../components/GoogleButton";
import { Compass, Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export const Login = () => {
  const { user, loginWithEmail, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearAuthError();

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      await loginWithEmail(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Failed to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 relative selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-96 bg-radial-glow pointer-events-none" />

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 mb-8 group z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 transition-colors shadow-lg shadow-cyan-500/10">
          <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-white tracking-tight text-lg group-hover:text-cyan-300 transition-colors">
            CodeCompass
          </span>
          <span className="text-[11px] text-slate-400">
            Navigate code. Find your contribution.
          </span>
        </div>
      </Link>

      {/* Login Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800/80 p-7 sm:p-8 backdrop-blur-xl shadow-2xl z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your contributor radar and dashboard
          </p>
        </div>

        {/* Error Notification */}
        {(localError || authError) && (
          <div className="mb-5 flex items-start gap-2.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{localError || authError}</span>
          </div>
        )}

        {/* Login with Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Login with Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 transition"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider relative">
            or continue with
          </span>
        </div>

        {/* Google Authentication Button */}
        <GoogleButton
          size="md"
          buttonText="Continue with Google"
          variant="outline"
          className="w-full"
          redirectTo="/dashboard"
        />

        {/* Switch to Sign Up */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
