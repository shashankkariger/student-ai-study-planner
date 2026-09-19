import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Brain, Lightbulb, Loader2 } from 'lucide-react';
import { SubjectCourse } from '../types';

interface AiStudyAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectCourse[];
}

export const AiStudyAdvisorModal: React.FC<AiStudyAdvisorModalProps> = ({
  isOpen,
  onClose,
  subjects,
}) => {
  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.code || 'General');
  const [loading, setLoading] = useState(false);
  const [adviceHistory, setAdviceHistory] = useState<
    { q: string; a: string; time: string; subject: string }[]
  >([
    {
      q: 'How can I conquer afternoon cognitive fatigue when studying algorithm problem sets?',
      a: 'Afternoon fatigue is typically circadian (the post-lunch dip). Instead of fighting it with excessive caffeine, switch from passive reading to active physical retrieval: stand up, solve one problem on a whiteboard, and drink 300ml cold water. Keep the session under 35 minutes, then take a 10-minute walk before sitting back down.',
      time: '11:15 AM',
      subject: 'CS 210',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I structure study for an exam in 5 days?',
    'I feel overwhelmed by back-to-back deadlines today.',
    'Best technique for memorizing complex neuroanatomy terms?',
    'How do I break procrastination on a 10-page essay?',
  ];

  const handleAsk = async (promptToUse?: string) => {
    const q = promptToUse || question;
    if (!q.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/study/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentSubject: selectedSubject,
          examDate: 'Upcoming',
          currentFeeling: 'Seeking guidance',
        }),
      });

      const data = await res.json();
      const answer = data.answer || 'Focus on breaking tasks into 20-minute chunks and practicing active recall!';

      setAdviceHistory([
        {
          q,
          a: answer,
          time: 'Just now',
          subject: selectedSubject,
        },
        ...adviceHistory,
      ]);
      setQuestion('');
    } catch (err) {
      console.error(err);
      setAdviceHistory([
        {
          q,
          a: 'Use the Pomodoro technique with interleaved practice: study 25 minutes of subject A, rest 5 minutes, then test yourself on subject B. This preserves working memory and strengthens retrieval cues.',
          time: 'Just now',
          subject: selectedSubject,
        },
        ...adviceHistory,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Student Academic & Wellness Advisor</h2>
              <p className="text-xs text-slate-500">
                Cognitive science-grounded guidance for study blocks, exam pacing, and stress relief.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Quick:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(p)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {adviceHistory.map((item, i) => (
            <div key={i} className="space-y-2">
              {/* Question from student */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-slate-900 text-white text-xs rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-xs">
                  <span className="text-[10px] text-slate-400 block mb-0.5">
                    [{item.subject}] • {item.time}
                  </span>
                  <p>{item.q}</p>
                </div>
              </div>

              {/* AI Answer */}
              <div className="flex justify-start">
                <div className="max-w-[90%] bg-indigo-50/70 border border-indigo-100 text-slate-800 text-xs rounded-2xl rounded-tl-xs p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px] mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Advisor Recommendation</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{item.a}</p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-indigo-700">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Formulating cognitive study strategy...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-2.5 focus:outline-none"
            >
              <option value="General">General</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Ask for revision strategies, pacing tips, or burnout relief..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
