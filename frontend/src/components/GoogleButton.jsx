import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, ArrowRight, Loader2, Sparkles, X, Key } from "lucide-react";

export const GoogleButton = ({
  size = "md",
  className = "",
  buttonText = "Continue with Google",
  redirectTo = "/dashboard",
  variant = "default",
  showIcon = true,
  showArrow = true,
}) => {
  const { loginWithGoogle, loginWithDemo, isConfigured, loading, authError, clearAuthError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const handleClick = async () => {
    setLocalError("");
    clearAuthError();

    // If Firebase credentials are placeholders or missing, show developer prompt modal
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }

    try {
      setSubmitting(true);
      await loginWithGoogle();
      navigate(redirectTo);
    } catch (err) {
      if (err.message === "FIREBASE_NOT_CONFIGURED") {
        setShowConfigModal(true);
      } else {
        setLocalError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    loginWithDemo({
      displayName: "Open Source Builder",
      email: "developer@codecompass.dev",
    });
    setShowConfigModal(false);
    navigate(redirectTo);
  };

  const sizeClasses = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-3 text-sm font-medium",
    lg: "px-7 py-3.5 text-base font-semibold",
  };

  const variantClasses = {
    default:
      "bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-cyan-500/50 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.35)]",
    primary:
      "bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 border border-cyan-400/40",
    outline:
      "bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 hover:text-white",
    ghost:
      "bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent hover:border-slate-700",
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading || submitting}
          className={`group relative inline-flex items-center justify-center gap-2.5 rounded-xl transition-all duration-300 font-sans cursor-pointer
            active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeClasses[size] || sizeClasses.md}
            ${variantClasses[variant] || variantClasses.default}
            ${className}`}
        >
          {/* Subtle gradient highlight line for default/outline variants */}
          {variant !== "primary" && (
            <div className="absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}

          {submitting || loading ? (
            <Loader2 className={`w-4 h-4 animate-spin ${variant === "primary" ? "text-slate-950" : "text-cyan-400"}`} />
          ) : showIcon ? (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          ) : null}

          <span>{submitting ? "Signing in..." : buttonText}</span>

          {showArrow && (
            <ArrowRight
              className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform ${
                variant === "primary" ? "text-slate-950" : "text-slate-400 group-hover:text-cyan-400"
              }`}
            />
          )}
        </button>

        {localError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg max-w-sm">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{localError}</span>
          </div>
        )}
      </div>

      {/* Developer Modal if Firebase is still awaiting production credentials */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Firebase Authentication</h3>
                <p className="text-xs text-slate-400">Google Sign-In configuration</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p>
                To enable live Google Sign-In with your own Firebase project:
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
                <p className="text-slate-400"># In CodeCompass/.env:</p>
                <p>VITE_FIREBASE_API_KEY=AIzaSy...</p>
                <p>VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com</p>
                <p>VITE_FIREBASE_PROJECT_ID=your-project-id</p>
              </div>
              <p className="text-xs text-slate-400">
                Enable <strong>Google</strong> as a Sign-In provider in Firebase Console under Authentication &gt; Sign-in method, and ensure <code className="text-slate-300">localhost</code> is in Authorized Domains.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
              >
                I'll configure .env
              </button>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enter Protected Dashboard (Demo Session)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleButton;
