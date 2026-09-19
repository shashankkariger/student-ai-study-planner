import React from 'react';
import {
  Droplet,
  Moon,
  Sun,
  Eye,
  Utensils,
  Smile,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  Heart,
  Activity,
  Flame,
} from 'lucide-react';
import { HealthLog } from '../types';
import { playChime } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface HealthTrackerTabProps {
  healthLog: HealthLog;
  onUpdateHealth: (updated: Partial<HealthLog>) => void;
  studyMinutesToday: number;
}

export const HealthTrackerTab: React.FC<HealthTrackerTabProps> = ({
  healthLog,
  onUpdateHealth,
  studyMinutesToday,
}) => {
  // Quick water adjustments
  const addWater = (amount: number) => {
    const newVal = Math.max(0, healthLog.waterIntakeMl + amount);
    onUpdateHealth({ waterIntakeMl: newVal });
    if (newVal >= healthLog.targetWaterMl && healthLog.waterIntakeMl < healthLog.targetWaterMl) {
      playChime('success');
      triggerConfetti();
    }
  };

  // Toggle meals
  const toggleMeal = (mealKey: keyof HealthLog['mealsLogged']) => {
    const updatedMeals = {
      ...healthLog.mealsLogged,
      [mealKey]: !healthLog.mealsLogged[mealKey],
    };
    onUpdateHealth({ mealsLogged: updatedMeals });
    if (!healthLog.mealsLogged[mealKey]) {
      playChime('success');
    }
  };

  // Screen break counter
  const incrementScreenBreak = () => {
    const newVal = healthLog.screenBreaksTaken + 1;
    onUpdateHealth({ screenBreaksTaken: newVal });
    playChime('success');
  };

  // Calculate Balance & Burnout Risk
  const waterPercent = Math.min(100, Math.round((healthLog.waterIntakeMl / healthLog.targetWaterMl) * 100));
  const studyHours = studyMinutesToday / 60;
  const isSleepDeprived = healthLog.sleepHours < 6.5;
  const isHighStress = healthLog.stressLevel >= 4;
  const isBurnoutRisk = (studyHours > 7 && healthLog.screenBreaksTaken < 3) || (isSleepDeprived && isHighStress);

  // Overall wellness score
  const mealsCount = Object.values(healthLog.mealsLogged).filter(Boolean).length;
  const wellnessScore = Math.min(
    100,
    Math.round(
      (waterPercent * 0.25) +
      (Math.min(healthLog.sleepHours / 8, 1) * 25) +
      ((mealsCount / 4) * 20) +
      (Math.min(healthLog.screenBreaksTaken / healthLog.targetScreenBreaks, 1) * 15) +
      (((5 - healthLog.stressLevel) / 4) * 15)
    )
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Student Wellness Score & Burnout Shield */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-rose-100 text-rose-500" />
            <span>Student Neuro-Ergonomics & Well-Being</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Mind, Body & Vitality Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Addressing exam fatigue, sleep deficits, dehydration, and posture strain to maximize cognitive performance.
          </p>
        </div>

        {/* Burnout Status Card */}
        <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${wellnessScore >= 80 ? 'text-emerald-500' : wellnessScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}
                strokeDasharray={`${wellnessScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-900">{wellnessScore}%</span>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs font-bold">
              {isBurnoutRisk ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High Burnout Risk
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Burnout Shield Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 max-w-[210px] leading-tight mt-0.5">
              {isBurnoutRisk
                ? 'High workload with low recovery. Schedule a 30-min offline break.'
                : 'Balanced study-to-rest ratio. Cognitive retention is optimal.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Student Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PILLAR 1: Hydration Station */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4 fill-sky-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hydration Station</h3>
                  <p className="text-[11px] text-slate-500">2% dehydration reduces focus by up to 20%</p>
                </div>
              </div>
              <span className="text-xs font-black text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                {healthLog.waterIntakeMl} / {healthLog.targetWaterMl} ml
              </span>
            </div>

            {/* Progress Visual */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${waterPercent}%` }}
              ></div>
            </div>

            {/* Visual 8 Glasses representation */}
            <div className="grid grid-cols-8 gap-1.5 mb-4">
              {Array.from({ length: 8 }).map((_, idx) => {
                const isFull = healthLog.waterIntakeMl >= (idx + 1) * (healthLog.targetWaterMl / 8);
                return (
                  <div
                    key={idx}
                    className={`h-9 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      isFull
                        ? 'bg-sky-500 border-sky-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-300'
                    }`}
                    title={`Glass ${idx + 1} (${Math.round(healthLog.targetWaterMl / 8)}ml)`}
                  >
                    <Droplet className={`w-3.5 h-3.5 ${isFull ? 'fill-white' : ''}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Log Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              id="water-add-250"
              onClick={() => addWater(250)}
              className="flex-1 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> +250ml Glass
            </button>
            <button
              type="button"
              id="water-add-500"
              onClick={() => addWater(500)}
              className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs shadow-sky-100"
            >
              <Plus className="w-3.5 h-3.5" /> +500ml Bottle
            </button>
            <button
              type="button"
              id="water-minus-250"
              onClick={() => addWater(-250)}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Undo 250ml"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PILLAR 2: Sleep & Memory Consolidation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sleep & Memory Consolidation</h3>
                  <p className="text-[11px] text-slate-500">REM sleep solidifies lecture notes & problem concepts</p>
                </div>
              </div>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                  healthLog.sleepHours >= 7.5
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {healthLog.sleepHours} hrs logged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">Bedtime</span>
                <input
                  type="time"
                  value={healthLog.bedtime}
                  onChange={(e) => onUpdateHealth({ bedtime: e.target.value })}
                  className="text-xs font-bold text-slate-800 bg-transparent mt-0.5 focus:outline-none"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">Wake Time</span>
                <input
                  type="time"
                  value={healthLog.wakeTime}
                  onChange={(e) => onUpdateHealth({ wakeTime: e.target.value })}
                  className="text-xs font-bold text-slate-800 bg-transparent mt-0.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Sleep duration slider */}
            <div className="mb-3">
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Total Sleep Duration</span>
                <span className="font-bold text-indigo-600">{healthLog.sleepHours} Hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={healthLog.sleepHours}
                onChange={(e) => onUpdateHealth({ sleepHours: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Sleep Restorativeness:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onUpdateHealth({ sleepQuality: star })}
                  className="p-1 hover:scale-110 transition cursor-pointer text-amber-400"
                >
                  ★
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-1">({healthLog.sleepQuality}/5)</span>
            </div>
          </div>
        </div>

        {/* PILLAR 3: Meals & Nutrient Pacing */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Nourishment Checklist</h3>
                  <p className="text-[11px] text-slate-500">
                    Prevent blood sugar crashes during intense study sessions
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {mealsCount}/4 Fuel Logged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2">
              {[
                { key: 'breakfast', label: 'Breakfast Fuel', desc: 'Brain glucose startup' },
                { key: 'lunch', label: 'Midday Lunch', desc: 'Protein & complex carbs' },
                { key: 'dinner', label: 'Evening Dinner', desc: 'Sustained recovery' },
                { key: 'healthySnack', label: 'Healthy Snack', desc: 'Nuts, fruit, yogurt' },
              ].map((m) => {
                const checked = healthLog.mealsLogged[m.key as keyof HealthLog['mealsLogged']];
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleMeal(m.key as any)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                      checked
                        ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        checked ? 'text-amber-600 fill-amber-500' : 'text-slate-300'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-slate-500">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            💡 Pro tip: Avoid heavy processed foods within 45 mins of problem sets to prevent post-prandial lethargy.
          </p>
        </div>

        {/* PILLAR 4: Eye Ergonomics, Movement & Stress Check-in */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ergonomics & Mental Pulse</h3>
                  <p className="text-[11px] text-slate-500">20-20-20 screen relief & stress management</p>
                </div>
              </div>

              {/* +1 break button */}
              <button
                type="button"
                onClick={incrementScreenBreak}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> +1 Screen Break
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">Screen Breaks Taken</span>
                <span className="text-lg font-black text-slate-800">
                  {healthLog.screenBreaksTaken} / {healthLog.targetScreenBreaks}
                </span>
                <span className="text-[10px] text-slate-500 block">Eye rests & stretches</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium block">Physical Movement</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={healthLog.physicalActivityMinutes}
                    onChange={(e) => onUpdateHealth({ physicalActivityMinutes: Number(e.target.value) })}
                    className="w-12 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded px-1"
                  />
                  <span className="text-xs text-slate-500">mins walk/gym</span>
                </div>
              </div>
            </div>

            {/* Stress level selector */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Current Exam Stress Level:</span>
                <span
                  className={`font-bold ${
                    healthLog.stressLevel >= 4
                      ? 'text-rose-600'
                      : healthLog.stressLevel === 3
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {healthLog.stressLevel === 1
                    ? '1 - Serene'
                    : healthLog.stressLevel === 2
                    ? '2 - Manageable'
                    : healthLog.stressLevel === 3
                    ? '3 - Moderate'
                    : healthLog.stressLevel === 4
                    ? '4 - Strained'
                    : '5 - Overwhelmed'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={healthLog.stressLevel}
                onChange={(e) => onUpdateHealth({ stressLevel: Number(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Reflection note input */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              End-of-Day Gratitude & Mental Unload
            </label>
            <input
              type="text"
              placeholder="e.g. Cleared math concept today, proud of keeping hydration up."
              value={healthLog.reflectionNote || ''}
              onChange={(e) => onUpdateHealth({ reflectionNote: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
