import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Compass,
  LayoutDashboard,
  FolderGit2,
  Zap,
  User,
  LogOut,
  X,
} from "lucide-react";

export const Sidebar = ({ activeSection, onSelectSection, mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & welcome",
    },
    {
      id: "analyzer",
      name: "Repository Analyzer",
      icon: FolderGit2,
      description: "Codebase discovery",
    },
    {
      id: "skills",
      name: "My Skills",
      icon: Zap,
      description: "Developer profile",
    },
    {
      id: "profile",
      name: "Profile",
      icon: User,
      description: "Account settings",
    },
  ];

  const handleNavClick = (id) => {
    onSelectSection(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#060910] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-slate-800/60 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 transition-colors shadow-lg shadow-cyan-500/10">
                <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white tracking-tight text-base leading-tight group-hover:text-cyan-300 transition-colors">
                  CodeCompass
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Navigate code.
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Exactly 4 Sections) */}
          <div className="px-3 py-6">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2.5">
              Workspace
            </div>

            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/5 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-cyan-400" : "text-slate-400"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="leading-tight">{item.name}</span>
                      <span
                        className={`text-[10px] leading-tight mt-0.5 ${
                          isActive ? "text-cyan-400/80" : "text-slate-400"
                        }`}
                      >
                        {item.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => handleNavClick("profile")}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition cursor-pointer flex-1"
            >
              <img
                src={user?.photoURL}
                alt={user?.displayName || "User avatar"}
                className="w-8 h-8 rounded-lg border border-cyan-500/40 object-cover shrink-0"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.email || "dev"}`;
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.displayName || "Developer"}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </span>
              </div>
            </button>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
