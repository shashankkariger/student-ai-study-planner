import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  Plus,
  BookOpen,
  Coffee,
  Heart,
  Utensils,
  GraduationCap,
  Zap,
  Trash2,
  Tag,
  Info,
} from 'lucide-react';
import { ActivityType, TimetableBlock } from '../types';
import { playChime } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface TimetableTabProps {
  timetable: TimetableBlock[];
  onToggleComplete: (id: string) => void;
  onAddBlock: (block: TimetableBlock) => void;
  onDeleteBlock: (id: string) => void;
  onOpenGenerator: () => void;
  aiSummary?: string;
  aiHighlights?: string[];
}

export const TimetableTab: React.FC<TimetableTabProps> = ({
  timetable,
  onToggleComplete,
  onAddBlock,
  onDeleteBlock,
  onOpenGenerator,
  aiSummary,
  aiHighlights,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New block form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ActivityType>('study');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('15:00');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const filteredBlocks = timetable.filter((block) => {
    if (filter === 'all') return true;
    if (filter === 'study') return block.type === 'study' || block.type === 'class';
    if (filter === 'health') return block.type === 'health' || block.type === 'break';
    if (filter === 'meal') return block.type === 'meal';
    return true;
  });

  const completedCount = timetable.filter((b) => b.completed).length;
  const totalCount = timetable.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (id: string, currentStatus: boolean) => {
    onToggleComplete(id);
    if (!currentStatus) {
      playChime('success');
      triggerConfetti();
    }
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Calculate duration
    const [sh, sm] = newStartTime.split(':').map(Number);
    const [eh, em] = newEndTime.split(':').map(Number);
    let dur = (eh * 60 + em) - (sh * 60 + sm);
    if (dur <= 0) dur = 60;

    const block: TimetableBlock = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      startTime: newStartTime,
      endTime: newEndTime,
      durationMinutes: dur,
      completed: false,
      priority: newPriority,
      notes: newNotes.trim() || undefined,
      energyRequirement: newType === 'study' ? 'high' : 'low',
    };

    onAddBlock(block);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  const getTypeStyle = (type: ActivityType) => {
    switch (type) {
      case 'study':
        return {
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          border: 'border-l-4 border-l-indigo-500',
          icon: BookOpen,
          iconColor: 'text-indigo-600',
        };
      case 'class':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          border: 'border-l-4 border-l-blue-500',
          icon: GraduationCap,
          iconColor: 'text-blue-600',
        };
      case 'break':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          border: 'border-l-4 border-l-emerald-500',
          icon: Coffee,
          iconColor: 'text-emerald-600',
        };
      case 'health':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          border: 'border-l-4 border-l-rose-500',
          icon: Heart,
          iconColor: 'text-rose-600',
        };
      case 'meal':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          border: 'border-l-4 border-l-amber-500',
          icon: Utensils,
          iconColor: 'text-amber-600',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          border: 'border-l-4 border-l-slate-400',
          icon: Clock,
          iconColor: 'text-slate-600',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Date, AI Highlights & Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today’s Intelligent Academic Routine</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Daily Timetable & Energy Flow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interleaves demanding focus sprints with required eye breaks, hydration, and nutrition.
          </p>
        </div>

        {/* Action buttons & Progress */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="text-right">
              <div className="font-bold text-slate-800">
                {completedCount} / {totalCount} Done
              </div>
              <div className="text-[11px] text-slate-500">{progressPercent}% completion</div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-xs text-indigo-600">
              {progressPercent}%
            </div>
          </div>

          <button
            id="open-add-block-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>

          <button
            id="trigger-ai-generator-tab-btn"
            onClick={onOpenGenerator}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Reshuffle with AI</span>
          </button>
        </div>
      </div>

      {/* AI Strategy Summary Card */}
      {(aiSummary || aiHighlights) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white border border-indigo-100 flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-indigo-950 mb-1">AI Cognitive Scheduling Insights</h4>
            {aiSummary && <p className="text-slate-700 leading-relaxed mb-2">{aiSummary}</p>}
            {aiHighlights && aiHighlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {aiHighlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-indigo-200/70 text-indigo-900 font-medium text-[11px]"
                  >
                    <Zap className="w-3 h-3 text-amber-500" />
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Full Day' },
            { id: 'study', label: 'Deep Study & Lectures' },
            { id: 'health', label: 'Breaks & Recovery' },
            { id: 'meal', label: 'Nutrition & Meals' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === item.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Showing {filteredBlocks.length} planned blocks
        </span>
      </div>

      {/* Timetable List */}
      <div className="space-y-3">
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">No items found for this filter.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
            >
              Reset to Full Day
            </button>
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const style = getTypeStyle(block.type);
            const Icon = style.icon;

            return (
              <div
                key={block.id}
                id={`block-${block.id}`}
                className={`bg-white rounded-xl p-4 border transition-all duration-200 ${
                  style.border
                } ${
                  block.completed
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : 'border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Checkbox and Time */}
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(block.id, block.completed)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer flex-shrink-0"
                      title={block.completed ? 'Mark as incomplete' : 'Mark completed'}
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-indigo-500" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Time range */}
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {block.startTime} - {block.endTime} ({block.durationMinutes}m)
                        </span>

                        {/* Category badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${style.badge}`}
                        >
                          <Icon className={`w-3 h-3 ${style.iconColor}`} />
                          <span className="capitalize">{block.type}</span>
                        </span>

                        {/* Subject tag if exists */}
                        {block.subjectName && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                            {block.subjectName}
                          </span>
                        )}

                        {/* AI generated tag */}
                        {block.isAiGenerated && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI Calibrated</span>
                          </span>
                        )}

                        {/* Priority / Energy requirement */}
                        {block.energyRequirement === 'high' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Zap className="w-2.5 h-2.5 text-amber-600" />
                            Peak Focus
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-bold text-slate-900 ${
                          block.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {block.title}
                      </h3>

                      {block.notes && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{block.notes}</p>
                      )}

                      {block.location && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <span>📍 Location:</span>
                          <span className="font-medium text-slate-600">{block.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDeleteBlock(block.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Block Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Event to Timetable</h3>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Practice Questions"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ActivityType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="study">Study / Deep Work</option>
                    <option value="class">Class / Lecture</option>
                    <option value="break">Short Break / Walk</option>
                    <option value="health">Exercise / Wellness</option>
                    <option value="meal">Meal / Nutrition</option>
                    <option value="personal">Personal / Wind-down</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Objectives (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes, specific problems, or hydration target"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
