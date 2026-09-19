import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Flame,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { StudyTask, SubjectCourse, PriorityLevel } from '../types';
import { playChime, startAmbientSound, stopAmbientSound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface StudyPlannerTabProps {
  subjects: SubjectCourse[];
  tasks: StudyTask[];
  onToggleTaskStatus: (taskId: string) => void;
  onAddTask: (task: StudyTask) => void;
  onLogStudyMinutes: (subjectId: string, minutes: number) => void;
}

export const StudyPlannerTab: React.FC<StudyPlannerTabProps> = ({
  subjects,
  tasks,
  onToggleTaskStatus,
  onAddTask,
  onLogStudyMinutes,
}) => {
  // Filter state
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskType, setTaskType] = useState<'assignment' | 'exam_prep' | 'reading' | 'revision'>('assignment');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstimatedMinutes, setTaskEstimatedMinutes] = useState(60);
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium');
  const [taskTags, setTaskTags] = useState('');

  // Pomodoro timer state
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [focusDurationMinutes, setFocusDurationMinutes] = useState<number>(25);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(5);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedTimerSubjectId, setSelectedTimerSubjectId] = useState(subjects[0]?.id || '');
  const [ambientSoundType, setAmbientSoundType] = useState<'none' | 'rain' | 'whitenoise' | 'binaural'>('none');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch interval duration
  const setPomodoroPreset = (focusMins: number, breakMins: number) => {
    setIsTimerRunning(false);
    setFocusDurationMinutes(focusMins);
    setBreakDurationMinutes(breakMins);
    setTimerMode('focus');
    setTimeLeftSeconds(focusMins * 60);
  };

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            // Timer expired
            playChime('complete');
            triggerConfetti();
            if (timerMode === 'focus') {
              // Log minutes to subject
              onLogStudyMinutes(selectedTimerSubjectId, focusDurationMinutes);
              setTimerMode('break');
              return breakDurationMinutes * 60;
            } else {
              setTimerMode('focus');
              return focusDurationMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode, focusDurationMinutes, breakDurationMinutes, selectedTimerSubjectId]);

  // Ambient sound management
  useEffect(() => {
    if (isTimerRunning && ambientSoundType !== 'none') {
      const stopFn = startAmbientSound(ambientSoundType);
      return () => {
        stopFn();
      };
    } else {
      stopAmbientSound();
    }
  }, [isTimerRunning, ambientSoundType]);

  const toggleTimer = () => {
    if (!isTimerRunning) {
      playChime('start');
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeftSeconds((timerMode === 'focus' ? focusDurationMinutes : breakDurationMinutes) * 60);
    stopAmbientSound();
  };

  // Formatting time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const subjectObj = subjects.find((s) => s.id === taskSubjectId) || subjects[0];
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      subjectId: subjectObj.id,
      subjectCode: subjectObj.code,
      type: taskType,
      dueDate: taskDueDate || 'In 3 days',
      estimatedMinutes: Number(taskEstimatedMinutes) || 60,
      completedMinutes: 0,
      status: 'todo',
      priority: taskPriority,
      tags: taskTags
        ? taskTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Study'],
    };

    onAddTask(newTask);
    setIsNewTaskModalOpen(false);
    setTaskTitle('');
    setTaskTags('');
    triggerConfetti();
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    return t.status === taskFilter;
  });

  return (
    <div className="space-y-8">
      {/* SECTION 1: Active Focus Timer & Soundscapes */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Timer Display */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
            {/* Mode selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-xl mb-4 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTimerMode('focus');
                  setTimeLeftSeconds(focusDurationMinutes * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  timerMode === 'focus' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Deep Focus ({focusDurationMinutes}m)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerMode('break');
                  setTimeLeftSeconds(breakDurationMinutes * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  timerMode === 'break' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Ergonomic Break ({breakDurationMinutes}m)
              </button>
            </div>

            {/* Huge Clock */}
            <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight mb-4 text-white drop-shadow-sm">
              {formatTime(timeLeftSeconds)}
            </div>

            {/* Timer controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="pomodoro-toggle-btn"
                onClick={toggleTimer}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition cursor-pointer ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Focus Sprint</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="pomodoro-reset-btn"
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer border border-white/10"
                title="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <span>💡 Pacing tip:</span>
              <span className="text-slate-300">
                {timerMode === 'focus'
                  ? 'Keep phone out of reach. Focus solely on one problem set.'
                  : 'Stand up, hydrate 250ml, gaze 20 feet away to rest ciliary eye muscles.'}
              </span>
            </p>
          </div>

          {/* Timer Settings & Linking */}
          <div className="lg:col-span-6 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Log Focus Minutes To Course:
              </label>
              <select
                value={selectedTimerSubjectId}
                onChange={(e) => setSelectedTimerSubjectId(e.target.value)}
                className="w-full bg-slate-800 text-white text-xs border border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pomodoro Cycle Pacing</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPomodoroPreset(25, 5)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition cursor-pointer ${
                    focusDurationMinutes === 25
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div>Standard 25 / 5 min</div>
                  <div className="text-[11px] text-slate-400">Classic high-frequency bursts</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPomodoroPreset(50, 10)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition cursor-pointer ${
                    focusDurationMinutes === 50
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div>Deep Work 50 / 10 min</div>
                  <div className="text-[11px] text-slate-400">Complex math & coding blocks</div>
                </button>
              </div>
            </div>

            {/* Ambient Sound Generator (Web Audio) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ambient Focus Soundscape (Synthesized in Browser)</span>
                </label>
                {ambientSoundType !== 'none' && (
                  <span className="text-[11px] text-emerald-400 font-medium animate-pulse">Playing</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'none', label: 'Mute' },
                  { id: 'rain', label: 'Rain' },
                  { id: 'binaural', label: '40Hz Gamma' },
                  { id: 'whitenoise', label: 'White Noise' },
                ].map((snd) => (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => setAmbientSoundType(snd.id as any)}
                    className={`py-1.5 text-xs rounded-lg border text-center font-medium transition cursor-pointer ${
                      ambientSoundType === snd.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {snd.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Course Modules & Weekly Targets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Courses & Exam Countdown</h3>
            <p className="text-xs text-slate-500">Track weekly study quotas and preparation milestones.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((sub) => {
            const loggedHours = (sub.loggedMinutesThisWeek / 60).toFixed(1);
            const progress = Math.min(100, Math.round((sub.loggedMinutesThisWeek / (sub.weeklyGoalHours * 60)) * 100));

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      sub.difficulty === 'challenging'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : sub.difficulty === 'moderate'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {sub.difficulty}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1" title={sub.name}>
                  {sub.name}
                </h4>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                    <span>Logged: {loggedHours}h</span>
                    <span>Goal: {sub.weeklyGoalHours}h ({progress}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: sub.color,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Exam Countdown */}
                {sub.nextExamDate && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Next Exam:</span>
                    <span className="font-semibold text-slate-700">{sub.nextExamDate}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Study Tasks & Assignments */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Assignment & Exam Study Tasks</h3>
            <p className="text-xs text-slate-500">
              Break semester workloads into manageable, high-retention study chunks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
              {[
                { id: 'all', label: 'All' },
                { id: 'todo', label: 'To Do' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'done', label: 'Done' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTaskFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    taskFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              id="open-new-task-modal-btn"
              onClick={() => setIsNewTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No tasks found under "{taskFilter}". Stay ahead of deadlines by adding new items!
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isDone = t.status === 'done';
              return (
                <div
                  key={t.id}
                  id={`task-item-${t.id}`}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleTaskStatus(t.id);
                        if (!isDone) {
                          playChime('success');
                          triggerConfetti();
                        }
                      }}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer flex-shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-indigo-500" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {t.subjectCode}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            t.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : t.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.priority}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          Due: <strong className="text-slate-700">{t.dueDate}</strong>
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>~{t.estimatedMinutes} mins</span>
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold text-slate-900 ${
                          isDone ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {t.title}
                      </h4>

                      {t.tags && t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Study Assignment or Goal</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task / Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Chapter 4 & Write Summary Notes"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={taskSubjectId}
                    onChange={(e) => setTaskSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={taskEstimatedMinutes}
                    onChange={(e) => setTaskEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Midterm, Flashcards, Coding"
                  value={taskTags}
                  onChange={(e) => setTaskTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
