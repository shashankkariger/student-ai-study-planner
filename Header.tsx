import React from 'react';
import {
  CalendarDays,
  BookOpen,
  HeartPulse,
  Sparkles,
  Users,
  Flame,
  Droplet,
  Bot,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  streakDays: number;
  waterIntakeMl: number;
  targetWaterMl: number;
  balanceScore: number;
  onOpenAdvisor: () => void;
  onOpenGenerator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  streakDays,
  waterIntakeMl,
  targetWaterMl,
  balanceScore,
  onOpenAdvisor,
  onOpenGenerator,
}) => {
  const tabs = [
    { id: 'timetable', label: 'Daily Timetable', icon: CalendarDays },
    { id: 'study', label: 'Study Planner', icon: BookOpen },
    { id: 'health', label: 'Health & Wellness', icon: HeartPulse },
    { id: 'motivation', label: 'Motivation Engine', icon: Sparkles },
    { id: 'squad', label: 'Study Squad', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Student identity & quick metrics */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {profile.semester}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {profile.major} • Focus window: {profile.peakFocusStart} - {profile.peakFocusEnd}
              </p>
            </div>
          </div>

          {/* Real-time Motivation & Health Vitals */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Streak */}
            <div
              id="streak-counter-pill"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold"
              title="Daily study & wellness streak"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streakDays} Day Streak</span>
            </div>

            {/* Quick Water */}
            <div
              id="header-water-pill"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-semibold"
              title="Hydration progress today"
            >
              <Droplet className="w-4 h-4 text-sky-500 fill-sky-500" />
              <span>
                {Math.round((waterIntakeMl / targetWaterMl) * 100)}% Water ({waterIntakeMl}ml)
              </span>
            </div>

            {/* Balance Score */}
            <div
              id="header-balance-score"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold"
              title="Study-Life Balance Score"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Balance: {balanceScore}%</span>
            </div>

            {/* AI Advisor Button */}
            <button
              id="open-advisor-btn"
              onClick={onOpenAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition cursor-pointer"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">AI Study Advisor</span>
            </button>

            {/* Quick Generate Schedule button */}
            <button
              id="quick-generate-schedule-btn"
              onClick={onOpenGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Schedule</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
