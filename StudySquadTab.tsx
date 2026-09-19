import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Copy,
  Check,
  Calendar,
  FileText,
  Heart,
  Share2,
  Sparkles,
  Award,
  BookOpen,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { StudySquad, SquadTask, StudySession, SharedResource, SquadKudos } from '../types';
import { playChime } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface StudySquadTabProps {
  squad: StudySquad;
  onUpdateSquad: (updated: StudySquad) => void;
  currentUserName: string;
}

export const StudySquadTab: React.FC<StudySquadTabProps> = ({
  squad,
  onUpdateSquad,
  currentUserName,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(squad.members[0]?.name || currentUserName);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(squad.courseCode);

  // New resource state
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceType, setNewResourceType] = useState<'notes' | 'cheatsheet' | 'link' | 'slides'>('cheatsheet');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // New cheer state
  const [cheerTargetUser, setCheerTargetUser] = useState(squad.members[1]?.name || 'Maya Chen');
  const [cheerText, setCheerText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(squad.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Toggle group task status
  const handleToggleTaskStatus = (taskId: string) => {
    const updatedTasks = squad.tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus: SquadTask['status'] =
          t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'todo';
        if (nextStatus === 'completed') {
          playChime('success');
          triggerConfetti();
        }
        return { ...t, status: nextStatus };
      }
      return t;
    });

    onUpdateSquad({
      ...squad,
      tasks: updatedTasks,
    });
  };

  // Add task to squad board
  const handleCreateSquadTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignedMember = squad.members.find((m) => m.name === newTaskAssignee);
    const newTask: SquadTask = {
      id: `sqt-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignedToName: newTaskAssignee,
      assignedToAvatar:
        assignedMember?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      dueDate: newTaskDueDate || 'Tomorrow, 5:00 PM',
      status: 'todo',
      subject: newTaskSubject || squad.courseCode,
    };

    onUpdateSquad({
      ...squad,
      tasks: [newTask, ...squad.tasks],
    });

    setIsAddTaskModalOpen(false);
    setNewTaskTitle('');
    playChime('success');
  };

  // RSVP to group study session
  const handleToggleRsvp = (sessionId: string) => {
    const updatedSessions = squad.sessions.map((s) => {
      if (s.id === sessionId) {
        const joined = !s.isJoined;
        return {
          ...s,
          isJoined: joined,
          attendeesCount: joined ? s.attendeesCount + 1 : Math.max(1, s.attendeesCount - 1),
        };
      }
      return s;
    });

    onUpdateSquad({
      ...squad,
      sessions: updatedSessions,
    });
    playChime('success');
  };

  // Add resource
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim()) return;

    const newRes: SharedResource = {
      id: `res-${Date.now()}`,
      title: newResourceTitle.trim(),
      type: newResourceType,
      addedBy: currentUserName,
      downloadsCount: 1,
      sizeOrUrl: newResourceUrl.trim() || 'Shared Drive Link',
    };

    onUpdateSquad({
      ...squad,
      resources: [newRes, ...squad.resources],
    });

    setIsAddResourceModalOpen(false);
    setNewResourceTitle('');
    setNewResourceUrl('');
    playChime('success');
  };

  // Send Kudos / Cheer
  const handleSendKudos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheerText.trim()) return;

    const newKudos: SquadKudos = {
      id: `kd-${Date.now()}`,
      fromUser: currentUserName,
      toUser: cheerTargetUser,
      text: cheerText.trim(),
      time: 'Just now',
      likes: 1,
      emoji: selectedEmoji,
    };

    onUpdateSquad({
      ...squad,
      kudosFeed: [newKudos, ...squad.kudosFeed],
    });

    setCheerText('');
    playChime('success');
    triggerConfetti();
  };

  // Like a Kudos
  const handleLikeKudos = (kudosId: string) => {
    const updatedFeed = squad.kudosFeed.map((k) => {
      if (k.id === kudosId) {
        return { ...k, likes: k.likes + 1 };
      }
      return k;
    });
    onUpdateSquad({
      ...squad,
      kudosFeed: updatedFeed,
    });
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Squad Banner & Group Goals */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {squad.courseCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">Study Squad • {squad.members.length} Members</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{squad.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">{squad.description}</p>
          </div>

          {/* Invite Code & Action */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Squad Invite Code</span>
                <span className="font-mono text-xs font-bold text-slate-800">{squad.inviteCode}</span>
              </div>
              <button
                type="button"
                id="copy-invite-code-btn"
                onClick={handleCopyInvite}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition cursor-pointer"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              id="open-squad-task-modal-btn"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Group Task</span>
            </button>
          </div>
        </div>

        {/* Group Goal Progress Bar */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Shared Squad Sprint: {squad.groupGoal.title}</span>
              </span>
              <span className="text-indigo-600 font-bold">{squad.groupGoal.progressPercentage}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${squad.groupGoal.progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">Target Deadline: {squad.groupGoal.targetDate}</span>
        </div>
      </div>

      {/* SECTION 2: Active Members Presence & Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Study Squad Presence & Live Activity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {squad.members.map((member) => (
            <div
              key={member.id}
              className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition flex items-center gap-3"
            >
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    member.studyingNow ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  title={member.studyingNow ? 'Currently studying' : 'Offline / On break'}
                ></span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">{member.name}</span>
                  {member.role === 'lead' && (
                    <span className="text-[9px] font-bold px-1 rounded bg-amber-100 text-amber-800">Lead</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate" title={member.statusText}>
                  {member.statusText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Two Columns: Collaborative Task Board & Upcoming Group Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Collaborative Tasks (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shared Study Tasks & Deliverables</h3>
              <p className="text-[11px] text-slate-500">Coordinate prep questions, proofs, and review summaries</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {squad.tasks.filter((t) => t.status === 'completed').length} / {squad.tasks.length} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {squad.tasks.map((task) => {
              const isDone = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';

              return (
                <div
                  key={task.id}
                  id={`squad-task-${task.id}`}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer flex-shrink-0"
                      title="Click to cycle status"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-indigo-500" />
                      )}
                    </button>

                    <div>
                      <h4
                        className={`text-xs font-bold text-slate-900 ${
                          isDone ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {task.subject}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700'
                              : isInProgress
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>

                        <span className="text-[11px] text-slate-400">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignee pill */}
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80 flex-shrink-0">
                    <img
                      src={task.assignedToAvatar}
                      alt={task.assignedToName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[90px]">
                      {task.assignedToName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Study Meetups & Sessions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Group Study Sessions</h3>
              <p className="text-[11px] text-slate-500">Scheduled synchronous meetups</p>
            </div>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="space-y-3">
            {squad.sessions.map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {session.date} • {session.time}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {session.attendeesCount} RSVP'd
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-1">{session.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{session.topic}</p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-600 font-medium">📍 {session.location}</span>

                  <button
                    type="button"
                    onClick={() => handleToggleRsvp(session.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      session.isJoined
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {session.isJoined ? 'Joined ✓' : 'RSVP'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Shared Notes/Resources & Peer Kudos Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shared Resources (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shared Study Resources</h3>
              <p className="text-[11px] text-slate-500">Lecture notes, cheat-sheets & past exam keys</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddResourceModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {squad.resources.map((res) => (
              <div
                key={res.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 transition flex items-center justify-between gap-3 bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      Added by {res.addedBy} • {res.sizeOrUrl}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                  {res.downloadsCount} views
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Peer Cheers & High-Five Feed (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Study Squad Cheer & Kudos</h3>
            <p className="text-[11px] text-slate-500">Celebrate each other's study wins & exam breakthroughs</p>
          </div>

          {/* Send Cheer Form */}
          <form onSubmit={handleSendKudos} className="flex gap-2">
            <select
              value={cheerTargetUser}
              onChange={(e) => setCheerTargetUser(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {squad.members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name.split(' ')[0]}
                </option>
              ))}
            </select>

            <select
              value={selectedEmoji}
              onChange={(e) => setSelectedEmoji(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2 py-1.5 focus:outline-none"
            >
              <option value="🔥">🔥</option>
              <option value="🙌">🙌</option>
              <option value="👏">👏</option>
              <option value="⭐">⭐</option>
              <option value="💪">💪</option>
            </select>

            <input
              type="text"
              required
              placeholder="Send high-five message..."
              value={cheerText}
              onChange={(e) => setCheerText(e.target.value)}
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Cheer
            </button>
          </form>

          {/* Kudos Feed */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {squad.kudosFeed.map((kd) => (
              <div
                key={kd.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{kd.emoji}</span>
                  <div>
                    <span className="font-bold text-slate-800">{kd.fromUser}</span>
                    <span className="text-slate-500"> cheered </span>
                    <span className="font-bold text-slate-800">{kd.toUser}: </span>
                    <span className="text-slate-600">{kd.text}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLikeKudos(kd.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>{kd.likes}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">{kd.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Assign Group Deliverable</h3>
            <form onSubmit={handleCreateSquadTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Write Practice Midterm Solutions"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {squad.members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date / Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Friday, 4:00 PM"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Assign to Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Share Resource with Squad</h3>
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dijkstra vs A* Algorithm Comparison PDF"
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newResourceType}
                    onChange={(e) => setNewResourceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="cheatsheet">Cheatsheet</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="link">Website / Visualizer</option>
                    <option value="slides">Slides</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Link / File Size</label>
                  <input
                    type="text"
                    placeholder="e.g. drive.google.com/..."
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddResourceModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Post Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
