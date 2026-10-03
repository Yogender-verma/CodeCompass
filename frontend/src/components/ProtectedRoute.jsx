import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Compass, Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex flex-col items-center justify-center text-slate-300">
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute w-16 h-16 rounded-full bg-cyan-500/20 animate-ping opacity-30" />
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
            <Compass className="w-6 h-6 animate-spin text-cyan-400 [animation-duration:3s]" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-400 tracking-wide">
          Verifying developer session...
        </p>
      </div>
    );
  }

  if (!user) {
    // Unauthenticated users are redirected to landing page /
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
