export interface ExplanationResult {
  topic: string;
  summary: string;
  keyPoints: string[];
  analogy: string;
  microLesson: string;
  nextSteps: string[];
}

export type QuizDifficulty = "easy" | "medium" | "hard";
export type ConceptLevel = "beginner" | "intermediate" | "advanced";
export type LearnerLevel = "Beginner" | "Intermediate" | "Pro" | "Titan";

export interface ConceptExplanation {
  title: string;
  simpleExplanation: string;
  analogy: string;
  example: string;
  keyPoints: string[];
}

export interface QuickQuestion {
  question: string;
  expectedAnswer: string;
}

export interface MicroLearningStep {
  id: string;
  title: string;
  shortExplanation: string;
  example: string;
  quickQuestion: QuickQuestion;
}

export interface LearningSession {
  sessionId: string;
  topic: string;
  level: ConceptLevel;
  difficulty: QuizDifficulty;
  currentStepIndex: number;
  explanation: ConceptExplanation;
  steps: MicroLearningStep[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  topic: string;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface TopicPerformance {
  attempts: number;
  correct: number;
  totalSpeedSeconds: number;
  lastAccuracy: number;
  accuracyTrend: number[];
  currentDifficulty: QuizDifficulty;
  weakCount: number;
  updatedAt: string;
}

export interface DailyActivity {
  answers: number;
  correct: number;
  xp: number;
  timeSpentSeconds: number;
}

export interface ProgressRecord {
  userId: string;
  completedTopics: string[];
  currentTopic?: string;
  quizScores: Record<string, number>;
  topicPerformance: Record<string, TopicPerformance>;
  dailyActivity?: Record<string, DailyActivity>;
  xp: number;
  level: LearnerLevel;
  lastActiveDate?: string;
  streakDays: number;
  updatedAt: string;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  explanation: string;
  suggestedNextStep: string;
  followUpExplanation: string;
  xpAwarded: number;
  streakBonusAwarded: number;
  updatedDifficulty: QuizDifficulty;
  progress: ProgressRecord;
}

export interface DashboardData {
  progress: ProgressRecord;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  focusAreas: string[];
  recommendations: string[];
  achievements: Achievement[];
  dailyGoal: {
    targetAnswers: number;
    completedAnswers: number;
    isComplete: boolean;
  };
  suggestedDifficulty: QuizDifficulty;
  nextTopic?: string;
}

export interface Achievement {
  id: "fast-learner" | "consistency-king" | "quiz-master";
  label: string;
  description: string;
  unlocked: boolean;
}
