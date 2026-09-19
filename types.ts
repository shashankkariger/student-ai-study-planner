export type Chronotype = 'morning_lark' | 'night_owl' | 'balanced';

export type ActivityType = 'class' | 'study' | 'exam' | 'health' | 'meal' | 'break' | 'personal';

export type PriorityLevel = 'low' | 'normal' | 'medium' | 'high' | 'urgent';

export interface StudentProfile {
  name: string;
  major: string;
  semester: string;
  chronotype: Chronotype;
  peakFocusStart: string; // e.g. "09:00"
  peakFocusEnd: string;   // e.g. "13:00"
  targetStudyHoursDaily: number;
  targetSleepHoursDaily: number;
  targetWaterMlDaily: number;
}

export interface SubjectCourse {
  id: string;
  name: string;
  code: string;
  color: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  weeklyGoalHours: number;
  loggedMinutesThisWeek: number;
  nextExamDate?: string;
}

export interface TimetableBlock {
  id: string;
  title: string;
  type: ActivityType;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  durationMinutes: number;
  subjectId?: string;
  subjectName?: string;
  location?: string;
  completed: boolean;
  priority: PriorityLevel;
  notes?: string;
  energyRequirement: 'low' | 'medium' | 'high';
  isAiGenerated?: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  subjectCode: string;
  type: 'assignment' | 'exam_prep' | 'reading' | 'project' | 'revision';
  dueDate: string;
  estimatedMinutes: number;
  completedMinutes: number;
  status: 'todo' | 'in_progress' | 'done';
  priority: PriorityLevel;
  tags: string[];
}

export interface HealthLog {
  date: string; // YYYY-MM-DD
  waterIntakeMl: number;
  targetWaterMl: number;
  sleepHours: number;
  sleepQuality: number; // 1-5
  bedtime: string;
  wakeTime: string;
  mealsLogged: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    healthySnack: boolean;
  };
  screenBreaksTaken: number;
  targetScreenBreaks: number;
  physicalActivityMinutes: number;
  stressLevel: number; // 1 (peaceful) to 5 (overwhelmed)
  mood: 'energized' | 'calm' | 'focused' | 'tired' | 'overwhelmed' | 'anxious';
  reflectionNote?: string;
}

export interface StudentBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'focus' | 'health' | 'consistency' | 'squad';
  unlockedAt?: string;
}

export interface MotivationInsight {
  title: string;
  quote: string;
  message: string;
  actionableTip: string;
  balanceScore: number; // 0-100
  burnoutRisk: 'low' | 'moderate' | 'high';
  category: 'study' | 'wellness' | 'mindset' | 'balance';
  createdAt: string;
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  role: 'lead' | 'member';
  statusText: string;
  studyingNow?: boolean;
  currentSubject?: string;
}

export interface SquadTask {
  id: string;
  title: string;
  assignedToName: string;
  assignedToAvatar: string;
  dueDate: string;
  status: 'todo' | 'in_progress' | 'completed';
  subject: string;
}

export interface StudySession {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  isJoined?: boolean;
  topic: string;
}

export interface SharedResource {
  id: string;
  title: string;
  type: 'notes' | 'cheatsheet' | 'link' | 'slides';
  addedBy: string;
  downloadsCount: number;
  sizeOrUrl: string;
}

export interface SquadKudos {
  id: string;
  fromUser: string;
  toUser: string;
  text: string;
  time: string;
  likes: number;
  emoji: string;
}

export interface StudySquad {
  id: string;
  name: string;
  courseCode: string;
  description: string;
  inviteCode: string;
  members: SquadMember[];
  tasks: SquadTask[];
  sessions: StudySession[];
  resources: SharedResource[];
  kudosFeed: SquadKudos[];
  groupGoal: {
    title: string;
    targetDate: string;
    progressPercentage: number;
  };
}
