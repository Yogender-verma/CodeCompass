import React, { useState } from "react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { DashboardSection } from "../components/dashboard/DashboardSection";
import { RepositoryAnalyzerSection } from "../components/dashboard/RepositoryAnalyzerSection";
import { MySkillsSection } from "../components/dashboard/MySkillsSection";
import { ProfileSection } from "../components/dashboard/ProfileSection";
import { Menu, Compass } from "lucide-react";

export const Dashboard = () => {
  // Dashboard opens by default after login
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex relative selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-radial-glow opacity-60 pointer-events-none" />

      {/* Sidebar Navigation (4 sections: Dashboard, Repository Analyzer, My Skills, Profile) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 z-10">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 border-b border-slate-800/80 bg-[#080b12]/90 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">CodeCompass</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Section View */}
        <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto">
          {activeSection === "dashboard" && (
            <DashboardSection
              onNavigateToAnalyzer={() => setActiveSection("analyzer")}
            />
          )}

          {activeSection === "analyzer" && <RepositoryAnalyzerSection />}

          {activeSection === "skills" && <MySkillsSection />}

          {activeSection === "profile" && <ProfileSection />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
