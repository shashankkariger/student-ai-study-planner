import React, { useState } from 'react';
import { Sparkles, X, Sun, Moon, Clock, Brain, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Chronotype, StudentProfile, SubjectCourse, StudyTask, TimetableBlock } from '../types';
import { triggerConfetti } from '../utils/confetti';

interface TimetableGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  subjects: SubjectCourse[];
  tasks: StudyTask[];
  onApplySchedule: (newSchedule: TimetableBlock[], summary: string, highlights: string[]) => void;
}

export const TimetableGeneratorModal: React.FC<TimetableGeneratorModalProps> = ({
  isOpen,
  onClose,
  profile,
  subjects,
  tasks,
  onApplySchedule,
}) => {
  const [chronotype, setChronotype] = useState<Chronotype>(profile.chronotype);
  const [targetStudyHours, setTargetStudyHours] = useState(profile.targetStudyHoursDaily);
  const [targetSleepHours, setTargetSleepHours] = useState(profile.targetSleepHoursDaily);
  const [currentMood, setCurrentMood] = useState<'focused' | 'energized' | 'tired' | 'overwhelmed'>('focused');
  const [stressLevel, setStressLevel] = useState(2);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(subjects.map((s) => s.id));
  const [includeWorkout, setIncludeWorkout] = useState(true);
  const [includeSocialStudy, setIncludeSocialStudy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      if (selectedSubjectIds.length > 1) {
        setSelectedSubjectIds(selectedSubjectIds.filter((s) => s !== id));
      }
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const activeSubjects = subjects.filter((s) => selectedSubjectIds.includes(s.id));
    const pendingTasks = tasks.filter((t) => t.status !== 'done');

    try {
      const res = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chronotype,
          peakFocusStart: chronotype === 'morning_lark' ? '07:30' : chronotype === 'night_owl' ? '14:00' : '09:00',
          peakFocusEnd: chronotype === 'morning_lark' ? '12:00' : chronotype === 'night_owl' ? '20:00' : '13:30',
          targetStudyHours,
          targetSleepHours,
          subjects: activeSubjects.map((s) => ({ name: s.name, code: s.code, difficulty: s.difficulty })),
          pendingTasks: pendingTasks.map((t) => ({ title: t.title, subject: t.subjectCode, priority: t.priority })),
          fixedClasses: [
            { title: 'COG 105 Lecture', startTime: '10:30', endTime: '12:00', location: 'Hall 302' },
          ],
          currentMood,
          stressLevel,
          includeWorkout,
          includeSocialStudy,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Schedule generation failed');
      }

      const generatedBlocks: TimetableBlock[] = data.schedule.map((item: any, idx: number) => ({
        id: item.id || `gen-${Date.now()}-${idx}`,
        title: item.title,
        type: item.type || 'study',
        startTime: item.startTime,
        endTime: item.endTime,
        durationMinutes: item.durationMinutes || 60,
        subjectName: item.subjectCode,
        completed: false,
        priority: item.priority || 'medium',
        energyRequirement: item.energyRequirement || 'medium',
        notes: item.notes,
        isAiGenerated: true,
      }));

      triggerConfetti();
      onApplySchedule(generatedBlocks, data.summary, data.keyHighlights || []);
      onClose();
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to connect to timetable generator. Using optimized preset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        <button
          id="close-generator-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Intelligent Timetable Generator</h2>
            <p className="text-xs text-slate-500">
              Harmonizes peak cognitive hours, classes, meals, and recovery using student chronotype data.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Chronotype Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Student Chronotype (Peak Cognitive Window)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                id="chronotype-morning"
                onClick={() => setChronotype('morning_lark')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  chronotype === 'morning_lark'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className="w-4 h-4 text-amber-500" />
                  {chronotype === 'morning_lark' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <div className="text-xs font-bold">Morning Lark</div>
                <div className="text-[11px] text-slate-500">Peak: 7:30 AM - 12:00 PM</div>
              </button>

              <button
                type="button"
                id="chronotype-balanced"
                onClick={() => setChronotype('balanced')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  chronotype === 'balanced'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {chronotype === 'balanced' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <div className="text-xs font-bold">Balanced</div>
                <div className="text-[11px] text-slate-500">Peak: 9:00 AM - 1:30 PM</div>
              </button>

              <button
                type="button"
                id="chronotype-night"
                onClick={() => setChronotype('night_owl')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  chronotype === 'night_owl'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  {chronotype === 'night_owl' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <div className="text-xs font-bold">Night Owl</div>
                <div className="text-[11px] text-slate-500">Peak: 2:00 PM - 8:30 PM</div>
              </button>
            </div>
          </div>

          {/* Daily Study & Sleep Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Target Study Output</span>
                <span className="text-xs font-bold text-indigo-600">{targetStudyHours} Hours</span>
              </div>
              <input
                id="study-hours-range"
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={targetStudyHours}
                onChange={(e) => setTargetStudyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">Split into high-focus blocks and active pauses.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Target Restorative Sleep</span>
                <span className="text-xs font-bold text-indigo-600">{targetSleepHours} Hours</span>
              </div>
              <input
                id="sleep-hours-range"
                type="range"
                min="6"
                max="9"
                step="0.5"
                value={targetSleepHours}
                onChange={(e) => setTargetSleepHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">Essential for memory consolidation and focus.</p>
            </div>
          </div>

          {/* Current State & Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Energy State</label>
              <div className="grid grid-cols-2 gap-2">
                {(['focused', 'energized', 'tired', 'overwhelmed'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCurrentMood(m)}
                    className={`py-1.5 px-2.5 text-xs rounded-lg border capitalize text-center transition cursor-pointer ${
                      currentMood === m
                        ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Exam Stress Level</label>
                <span className="text-xs font-bold text-slate-700">{stressLevel}/5</span>
              </div>
              <input
                id="stress-level-slider"
                type="range"
                min="1"
                max="5"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {stressLevel >= 4
                  ? 'High stress detected: Will automatically schedule extra breaks and decompression.'
                  : 'Normal academic pressure: balanced study pacing.'}
              </p>
            </div>
          </div>

          {/* Priority Subjects */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Subjects to Prioritize Today
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub) => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubject(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }}></span>
                    <span>{sub.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wellness and Social Pacing Toggles */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWorkout}
                onChange={(e) => setIncludeWorkout(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include Physical Reset / Exercise</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSocialStudy}
                onChange={(e) => setIncludeSocialStudy(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include Study Squad Coordination Slot</span>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="run-generate-schedule-btn"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-100 transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Intelligent Timetable</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
