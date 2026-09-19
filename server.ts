import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Intelligent Timetable Generation Endpoint
app.post('/api/timetable/generate', async (req, res) => {
  try {
    const {
      chronotype = 'balanced',
      peakFocusStart = '09:00',
      peakFocusEnd = '13:00',
      targetStudyHours = 5,
      targetSleepHours = 8,
      subjects = [],
      pendingTasks = [],
      fixedClasses = [],
      currentMood = 'focused',
      stressLevel = 2,
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are an expert student productivity and neuro-ergonomics scheduler.
Generate a structured, healthy, and highly effective daily timetable for a university/college student.

Student Parameters:
- Chronotype: ${chronotype} (Peak focus window: ${peakFocusStart} - ${peakFocusEnd})
- Daily study target: ${targetStudyHours} hours
- Daily sleep target: ${targetSleepHours} hours
- Current Mood: ${currentMood} (Stress level: ${stressLevel}/5)
- Active Courses/Subjects: ${JSON.stringify(subjects)}
- Pending Critical Deadlines/Tasks: ${JSON.stringify(pendingTasks)}
- Fixed Classes/Lectures already scheduled: ${JSON.stringify(fixedClasses)}

Rules:
1. Schedule high-energy demanding study (problem sets, coding, proof writing) during peak focus hours.
2. Intersperse Pomodoro intervals or 10-15 minute screen-free/hydration/stretch breaks between intense sessions.
3. Incorporate regular meal breaks (breakfast, lunch, dinner) so the student does not skip nutrition during study.
4. If stress level is high (>=3), insert a 30-45 min physical activity or mindful walk block.
5. Provide realistic start and end times in 24-hour format "HH:MM" (e.g. "08:30").
6. Provide a strategic rationale explaining how this timetable maximizes cognitive retention while protecting mental and physical health.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A 2-3 sentence overview of why this timetable fits the student chronotype and workload.',
              },
              keyHighlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 key cognitive pacing tips for today.',
              },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      description: 'Must be one of: class, study, exam, health, meal, break, personal',
                    },
                    startTime: { type: Type.STRING, description: 'HH:MM format' },
                    endTime: { type: Type.STRING, description: 'HH:MM format' },
                    durationMinutes: { type: Type.INTEGER },
                    subjectCode: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      description: 'low, medium, high, or urgent',
                    },
                    energyRequirement: {
                      type: Type.STRING,
                      description: 'low, medium, or high',
                    },
                    notes: { type: Type.STRING },
                  },
                  required: ['title', 'type', 'startTime', 'endTime', 'durationMinutes', 'priority', 'energyRequirement'],
                },
              },
            },
            required: ['summary', 'keyHighlights', 'schedule'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, ...parsed });
    }

    // High quality programmatic fallback if Gemini key is not configured
    const fallbackSchedule = [
      {
        id: `ai-gen-1-${Date.now()}`,
        title: 'Morning Hydration & High-Protein Breakfast',
        type: 'meal',
        startTime: '08:00',
        endTime: '08:45',
        durationMinutes: 45,
        priority: 'medium',
        energyRequirement: 'low',
        notes: 'Drink 500ml water to counteract nocturnal dehydration, balanced fuel for brain.',
      },
      {
        id: `ai-gen-2-${Date.now()}`,
        title: 'Deep Focus Sprint: Priority Academic Project',
        type: 'study',
        startTime: '09:00',
        endTime: '10:30',
        durationMinutes: 90,
        subjectCode: subjects[0]?.code || 'CORE',
        priority: 'high',
        energyRequirement: 'high',
        notes: 'Tackle the hardest conceptual topics during morning peak focus window.',
      },
      {
        id: `ai-gen-3-${Date.now()}`,
        title: 'Screen-Free Walk & Posture Decompression',
        type: 'break',
        startTime: '10:30',
        endTime: '10:50',
        durationMinutes: 20,
        priority: 'low',
        energyRequirement: 'low',
        notes: 'Look at distant objects (20-20-20 rule), refill water, neck stretches.',
      },
      {
        id: `ai-gen-4-${Date.now()}`,
        title: 'Secondary Subject Problem Sets & Practice',
        type: 'study',
        startTime: '11:00',
        endTime: '12:30',
        durationMinutes: 90,
        subjectCode: subjects[1]?.code || 'STUDY',
        priority: 'high',
        energyRequirement: 'medium',
        notes: 'Active recall and practice exercises.',
      },
      {
        id: `ai-gen-5-${Date.now()}`,
        title: 'Mindful Lunch & Mental Reset',
        type: 'meal',
        startTime: '12:30',
        endTime: '13:30',
        durationMinutes: 60,
        priority: 'medium',
        energyRequirement: 'low',
        notes: 'Nutrient-rich lunch away from study desk to reset attention span.',
      },
      {
        id: `ai-gen-6-${Date.now()}`,
        title: 'Study Squad Task Sync & Collaborative Review',
        type: 'study',
        startTime: '14:00',
        endTime: '15:15',
        durationMinutes: 75,
        subjectCode: 'SQUAD',
        priority: 'medium',
        energyRequirement: 'medium',
        notes: 'Coordinate with study group on problem sets and peer explanations.',
      },
      {
        id: `ai-gen-7-${Date.now()}`,
        title: 'Cardio & Strength Campus Workout',
        type: 'health',
        startTime: '16:00',
        endTime: '17:00',
        durationMinutes: 60,
        priority: 'medium',
        energyRequirement: 'medium',
        notes: 'Aerobic exercise triggers BDNF, improving memory consolidation.',
      },
      {
        id: `ai-gen-8-${Date.now()}`,
        title: 'Spaced Repetition & Flashcard Wrap-Up',
        type: 'study',
        startTime: '17:30',
        endTime: '18:15',
        durationMinutes: 45,
        subjectCode: 'REVISION',
        priority: 'low',
        energyRequirement: 'low',
        notes: 'Low cognitive load review of today’s key takeaways before dinner.',
      },
    ];

    res.json({
      success: true,
      summary: `Optimized timetable calibrated for your ${chronotype} profile, targeting ${targetStudyHours}h focused study with built-in ergonomic breaks and consistent meals.`,
      keyHighlights: [
        'Cognitive heavy-lifting scheduled during peak energy window',
        'Mandatory hydration and eye rests integrated between study sprints',
        'Balanced evening buffer to ensure 8 hours restorative sleep',
      ],
      schedule: fallbackSchedule,
    });
  } catch (error: any) {
    console.error('Error generating timetable:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate timetable',
    });
  }
});

// 2. Motivation Engine Insight Generator
app.post('/api/motivation/insight', async (req, res) => {
  try {
    const {
      name = 'Student',
      completedTasksCount = 3,
      studyMinutesLogged = 240,
      waterIntakeMl = 1750,
      targetWaterMl = 2500,
      sleepHours = 7.5,
      stressLevel = 2,
      mood = 'focused',
      streakDays = 5,
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are an empathetic, scientifically grounded student performance and wellness motivation coach.
Analyze the following student day and provide genuine, inspiring positive reinforcement and intelligent guidance:

Student Name: ${name}
- Completed study tasks: ${completedTasksCount}
- Study minutes logged today: ${studyMinutesLogged} min (${(studyMinutesLogged / 60).toFixed(1)} hours)
- Hydration: ${waterIntakeMl} ml / ${targetWaterMl} ml goal
- Last night sleep: ${sleepHours} hours
- Self-reported stress level: ${stressLevel}/5
- Current Mood: ${mood}
- Current active streak: ${streakDays} days

Provide:
1. An encouraging, positive headline.
2. A timeless, relevant quote on discipline, resilience, or learning.
3. An empathetic message acknowledging both study effort and health/wellness balance.
4. One realistic, micro-actionable wellness or study tip.
5. A calculated Balance Score (0-100) reflecting how well they balanced academic output with sleep, water, and stress management.
6. Burnout risk assessment ("low", "moderate", or "high").`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              quote: { type: Type.STRING },
              message: { type: Type.STRING },
              actionableTip: { type: Type.STRING },
              balanceScore: { type: Type.INTEGER },
              burnoutRisk: {
                type: Type.STRING,
                description: 'low, moderate, or high',
              },
              category: {
                type: Type.STRING,
                description: 'study, wellness, mindset, or balance',
              },
            },
            required: ['title', 'quote', 'message', 'actionableTip', 'balanceScore', 'burnoutRisk', 'category'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        insight: {
          ...parsed,
          createdAt: 'Just now',
        },
      });
    }

    // Programmatic fallback
    const balanceScore = Math.min(
      100,
      Math.round(
        (Math.min(studyMinutesLogged / 300, 1) * 35) +
        (Math.min(waterIntakeMl / targetWaterMl, 1) * 25) +
        (Math.min(sleepHours / 8, 1) * 25) +
        ((5 - stressLevel) / 4 * 15)
      )
    );

    res.json({
      success: true,
      insight: {
        title: stressLevel > 3 ? 'Protecting Your Mental Reserve' : 'Remarkable Cognitive Rhythm',
        quote: '“It does not matter how slowly you go as long as you do not stop.” — Confucius',
        message: `Great discipline today, ${name}! You have logged ${(studyMinutesLogged / 60).toFixed(1)} hours of focused study while keeping your streak alive at ${streakDays} days.`,
        actionableTip: 'Remember to take a 5-minute deep breathing or water break between subjects. Your working memory recharges during pauses.',
        balanceScore,
        burnoutRisk: stressLevel >= 4 ? 'high' : stressLevel === 3 ? 'moderate' : 'low',
        category: 'balance',
        createdAt: 'Just now',
      },
    });
  } catch (error: any) {
    console.error('Error generating motivation insight:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate motivation insight',
    });
  }
});

// 3. Quick Student AI Study Advisor
app.post('/api/study/advisor', async (req, res) => {
  try {
    const { question, currentSubject, examDate, currentFeeling } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are a world-class academic advisor and cognitive learning coach for university students.
The student asks: "${question}"
Context:
- Subject: ${currentSubject || 'General Studies'}
- Next Exam: ${examDate || 'Upcoming'}
- Current emotional state: ${currentFeeling || 'Normal'}

Provide a structured, encouraging, highly pragmatic answer in under 150 words with:
- Direct actionable strategy
- One cognitive science memory or focus technique (e.g. Feynman technique, interleaving, Leitner box, blurting, active recall)
- A brief motivating closing sentence.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({
        success: true,
        answer: response.text || 'Keep consistent and break difficult concepts into manageable 20-minute chunks!',
      });
    }

    res.json({
      success: true,
      answer: `When tackling ${currentSubject || 'challenging topics'}, use the Feynman Technique: explain the core theorem or concept out loud in plain language without looking at notes. Once you hit a gap in your explanation, review only that section. This preserves focus and reinforces active neural pathways!`,
    });
  } catch (error: any) {
    console.error('Error in study advisor:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get advice',
    });
  }
});

// Vite Middleware for development & static serving for production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Planner Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
