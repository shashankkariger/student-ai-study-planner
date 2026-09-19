import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  ShieldCheck,
  Droplet,
  Sun,
  Users,
  CheckCircle2,
  RefreshCw,
  HeartHandshake,
  TrendingUp,
  Quote,
  Target,
  Zap,
} from 'lucide-react';
import { MotivationInsight, StudentBadge, HealthLog } from '../types';
import { triggerGoalCelebration } from '../utils/confetti';
import { playChime } from '../utils/audio';

interface MotivationEngineTabProps {
  insight: MotivationInsight;
  badges: StudentBadge[];
  streakDays: number;
  studyMinutesToday: number;
  completedTasksCount: number;
  healthLog: HealthLog;
  onRefreshInsight: () => Promise<void>;
  isRefreshingInsight: boolean;
}

export const MotivationEngineTab: React.FC<MotivationEngineTabProps> = ({
  insight,
  badges,
  streakDays,
  studyMinutesToday,
  completedTasksCount,
  healthLog,
  onRefreshInsight,
  isRefreshingInsight,
}) => {
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const handleCelebrate = () => {
    playChime('success');
    triggerGoalCelebration();
    setCelebrationMessage('🎉 Fantastic effort! Every micro-session rewires neural pathways for mastery!');
    setTimeout(() => setCelebrationMessage(null), 5000);
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplet':
        return Droplet;
      case 'Flame':
        return Flame;
      case 'Sun':
        return Sun;
      case 'Users':
        return Users;
      case 'ShieldCheck':
        return ShieldCheck;
      default:
        return Award;
    }
  };

  const studyHours = (studyMinutesToday / 60).toFixed(1);
  const unlockedBadgesCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <div className="space-y-6">
      {/* SECTION 1: Performance-Driven Positive Reinforcement Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Performance-Calibrated Motivation Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {insight.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {insight.message}
            </p>

            {/* Cognitive Quote */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3 mt-4">
              <Quote className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                {insight.quote}
              </p>
            </div>

            {/* Actionable Micro-Tip */}
            <div className="flex items-start gap-2.5 pt-2 text-xs text-indigo-200">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-semibold">Scientifically Proven Focus Nudge: </strong>
                {insight.actionableTip}
              </span>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col items-stretch sm:items-end gap-3 flex-shrink-0">
            {/* Balance Score Dial */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[170px]">
              <span className="text-[11px] font-semibold text-slate-300 block uppercase tracking-wider">
                Daily Balance Score
              </span>
              <div className="text-3xl font-extrabold text-white my-1">
                {insight.balanceScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  insight.burnoutRisk === 'low'
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : insight.burnoutRisk === 'moderate'
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'bg-rose-400/20 text-rose-300'
                }`}
              >
                Burnout Risk: {insight.burnoutRisk}
              </span>
            </div>

            {/* Refresh Insight Button */}
            <button
              type="button"
              id="refresh-motivation-btn"
              onClick={onRefreshInsight}
              disabled={isRefreshingInsight}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInsight ? 'animate-spin' : ''}`} />
              <span>{isRefreshingInsight ? 'Analyzing Performance...' : 'Regenerate Pep Talk'}</span>
            </button>

            {/* Celebrate with confetti */}
            <button
              type="button"
              id="celebrate-progress-btn"
              onClick={handleCelebrate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Celebrate Wins</span>
            </button>
          </div>
        </div>

        {celebrationMessage && (
          <div className="mt-4 p-3 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-medium text-center animate-fade-in">
            {celebrationMessage}
          </div>
        )}
      </div>

      {/* SECTION 2: Daily Activity & Academic Performance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{streakDays} Days</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Continuous study discipline</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedTasksCount} Today</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Milestones checked off</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Focus Hours</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{studyHours} hrs</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{studyMinutesToday} focus minutes</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Hydration Logged</span>
            <Droplet className="w-4 h-4 text-sky-500 fill-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{healthLog.waterIntakeMl} ml</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Goal: {healthLog.targetWaterMl} ml</p>
        </div>
      </div>

      {/* SECTION 3: Badges of Honor & Student Milestones */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Student Achievement Badges</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Reinforcing healthy balance and consistent academic momentum through dopamine-driven rewards.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {unlockedBadgesCount} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const Icon = getBadgeIcon(badge.icon);
            const isUnlocked = Boolean(badge.unlockedAt);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-indigo-50/50 to-white border-indigo-200/80 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-55'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUnlocked
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{badge.name}</h4>
                    {isUnlocked ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Locked</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{badge.description}</p>
                  {badge.unlockedAt && (
                    <span className="text-[10px] text-slate-400 block mt-1.5">Earned: {badge.unlockedAt}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Daily Cognitive Growth Reminders */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Daily Cognitive Reframes for Academic Resilience
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="block text-slate-900 font-bold mb-1">Overcoming Procrastination</strong>
            <span>Lower the barrier to entry. Commit to working for just 5 minutes without judging output quality.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="block text-slate-900 font-bold mb-1">Active Recall Over Re-reading</strong>
            <span>Close your notebook and write what you remember from memory. Effortful retrieval triggers synaptic LTP.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="block text-slate-900 font-bold mb-1">Rest as an Academic Weapon</strong>
            <span>Sleep is not lost study time; it is when your brain compiles and indexes your memories for long-term retention.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
