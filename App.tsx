import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimetableTab } from './components/TimetableTab';
import { StudyPlannerTab } from './components/StudyPlannerTab';
import { HealthTrackerTab } from './components/HealthTrackerTab';
import { MotivationEngineTab } from './components/MotivationEngineTab';
import { StudySquadTab } from './components/StudySquadTab';
import { TimetableGeneratorModal } from './components/TimetableGeneratorModal';
import { AiStudyAdvisorModal } from './components/AiStudyAdvisorModal';

import {
  initialProfile,
  initialSubjects,
  initialTimetable,
  initialTasks,
  initialHealthLog,
  initialBadges,
  initialSquad,
  initialMotivationInsight,
} from './data/initialData';

import {
  StudentProfile,
  SubjectCourse,
  TimetableBlock,
  StudyTask,
  HealthLog,
  StudentBadge,
  StudySquad,
  MotivationInsight,
} from './types';

export default function App() {
  // 1. Core Persistent State
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('omnistudy_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [subjects, setSubjects] = useState<SubjectCourse[]>(() => {
    const saved = localStorage.getItem('omnistudy_subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [timetable, setTimetable] = useState<TimetableBlock[]>(() => {
    const saved = localStorage.getItem('omnistudy_timetable');
    return saved ? JSON.parse(saved) : initialTimetable;
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('omnistudy_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [healthLog, setHealthLog] = useState<HealthLog>(() => {
    const saved = localStorage.getItem('omnistudy_health');
    return saved ? JSON.parse(saved) : initialHealthLog;
  });

  const [badges, setBadges] = useState<StudentBadge[]>(() => {
    const saved = localStorage.getItem('omnistudy_badges');
    return saved ? JSON.parse(saved) : initialBadges;
  });

  const [squad, setSquad] = useState<StudySquad>(() => {
    const saved = localStorage.getItem('omnistudy_squad');
    return saved ? JSON.parse(saved) : initialSquad;
  });

  const [motivationInsight, setMotivationInsight] = useState<MotivationInsight>(() => {
    const saved = localStorage.getItem('omnistudy_motivation');
    return saved ? JSON.parse(saved) : initialMotivationInsight;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('timetable');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>(
    'Intelligent timetable structured for your peak focus window, ensuring active intervals and dedicated hydration.'
  );
  const [aiHighlights, setAiHighlights] = useState<string[]>([
    'Peak cognitive energy dedicated to CS 210 problem sets',
    'Mandatory eye relief & posture reset every 90 minutes',
    '8-hour restorative sleep window protected',
  ]);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('omnistudy_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('omnistudy_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('omnistudy_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('omnistudy_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('omnistudy_health', JSON.stringify(healthLog));
  }, [healthLog]);

  useEffect(() => {
    localStorage.setItem('omnistudy_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('omnistudy_squad', JSON.stringify(squad));
  }, [squad]);

  useEffect(() => {
    localStorage.setItem('omnistudy_motivation', JSON.stringify(motivationInsight));
  }, [motivationInsight]);

  // Derived metrics
  const studyMinutesToday = timetable
    .filter((b) => b.type === 'study' && b.completed)
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;

  // Dynamic balance score
  const waterPercent = Math.min(100, Math.round((healthLog.waterIntakeMl / healthLog.targetWaterMl) * 100));
  const mealsCount = Object.values(healthLog.mealsLogged).filter(Boolean).length;
  const balanceScore = Math.min(
    100,
    Math.round(
      waterPercent * 0.25 +
        Math.min(healthLog.sleepHours / 8, 1) * 25 +
        (mealsCount / 4) * 20 +
        Math.min(healthLog.screenBreaksTaken / healthLog.targetScreenBreaks, 1) * 15 +
        ((5 - healthLog.stressLevel) / 4) * 15
    )
  );

  // Handlers
  const handleToggleTimetable = (id: string) => {
    setTimetable((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const handleAddTimetableBlock = (block: TimetableBlock) => {
    setTimetable((prev) => [...prev, block].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const handleDeleteTimetableBlock = (id: string) => {
    setTimetable((prev) => prev.filter((b) => b.id !== id));
  };

  const handleApplySchedule = (
    newSchedule: TimetableBlock[],
    summary: string,
    highlights: string[]
  ) => {
    setTimetable(newSchedule);
    if (summary) setAiSummary(summary);
    if (highlights && highlights.length) setAiHighlights(highlights);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus: StudyTask['status'] =
            t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'todo';
          return {
            ...t,
            status: nextStatus,
            completedMinutes: nextStatus === 'done' ? t.estimatedMinutes : t.completedMinutes,
          };
        }
        return t;
      })
    );
  };

  const handleAddTask = (newTask: StudyTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleLogStudyMinutes = (subjectId: string, minutes: number) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, loggedMinutesThisWeek: s.loggedMinutesThisWeek + minutes }
          : s
      )
    );
  };

  const handleUpdateHealth = (updated: Partial<HealthLog>) => {
    setHealthLog((prev) => ({ ...prev, ...updated }));
  };

  const handleRefreshMotivationInsight = async () => {
    setIsRefreshingInsight(true);
    try {
      const res = await fetch('/api/motivation/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name.split(' ')[0],
          completedTasksCount,
          studyMinutesLogged: studyMinutesToday || 180,
          waterIntakeMl: healthLog.waterIntakeMl,
          targetWaterMl: healthLog.targetWaterMl,
          sleepHours: healthLog.sleepHours,
          stressLevel: healthLog.stressLevel,
          mood: healthLog.mood,
          streakDays: 5,
        }),
      });

      const data = await res.json();
      if (data.success && data.insight) {
        setMotivationInsight(data.insight);
      }
    } catch (err) {
      console.error('Failed to refresh motivation:', err);
    } finally {
      setIsRefreshingInsight(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header with identity, metrics & navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        streakDays={5}
        waterIntakeMl={healthLog.waterIntakeMl}
        targetWaterMl={healthLog.targetWaterMl}
        balanceScore={balanceScore}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'timetable' && (
          <TimetableTab
            timetable={timetable}
            onToggleComplete={handleToggleTimetable}
            onAddBlock={handleAddTimetableBlock}
            onDeleteBlock={handleDeleteTimetableBlock}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            aiSummary={aiSummary}
            aiHighlights={aiHighlights}
          />
        )}

        {activeTab === 'study' && (
          <StudyPlannerTab
            subjects={subjects}
            tasks={tasks}
            onToggleTaskStatus={handleToggleTaskStatus}
            onAddTask={handleAddTask}
            onLogStudyMinutes={handleLogStudyMinutes}
          />
        )}

        {activeTab === 'health' && (
          <HealthTrackerTab
            healthLog={healthLog}
            onUpdateHealth={handleUpdateHealth}
            studyMinutesToday={studyMinutesToday}
          />
        )}

        {activeTab === 'motivation' && (
          <MotivationEngineTab
            insight={motivationInsight}
            badges={badges}
            streakDays={5}
            studyMinutesToday={studyMinutesToday}
            completedTasksCount={completedTasksCount}
            healthLog={healthLog}
            onRefreshInsight={handleRefreshMotivationInsight}
            isRefreshingInsight={isRefreshingInsight}
          />
        )}

        {activeTab === 'squad' && (
          <StudySquadTab
            squad={squad}
            onUpdateSquad={setSquad}
            currentUserName={profile.name}
          />
        )}
      </main>

      {/* Intelligent Timetable Generator Modal */}
      <TimetableGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        profile={profile}
        subjects={subjects}
        tasks={tasks}
        onApplySchedule={handleApplySchedule}
      />

      {/* AI Academic & Wellness Advisor Modal */}
      <AiStudyAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        subjects={subjects}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Intelligent Daily Timetable, Study Planner & Student Health System</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini 3.8</span>
            <span>•</span>
            <span>Cognitive Ergonomics & Motivation Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
