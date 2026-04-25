import { create } from "zustand";
import type {
  AnswerEvaluation,
  ExplanationResponse,
  LearningSession,
  ProgressRecord,
  QuizQuestion,
  QuizResponse
} from "@/types";

interface LearningState {
  currentTopic: string;
  explanation: ExplanationResponse | null;
  learningSession: LearningSession | null;
  activeStepIndex: number;
  quiz: QuizResponse | null;
  selectedAnswers: Record<string, number>;
  quizFeedback: Record<string, AnswerEvaluation>;
  progress: ProgressRecord | null;
  setCurrentTopic: (topic: string) => void;
  setExplanation: (explanation: ExplanationResponse | null) => void;
  setLearningSession: (session: LearningSession | null) => void;
  setActiveStepIndex: (index: number) => void;
  setQuiz: (quiz: QuizResponse | null) => void;
  answerQuestion: (questionId: string, answerIndex: number) => void;
  setQuizFeedback: (questionId: string, feedback: AnswerEvaluation) => void;
  setProgress: (progress: ProgressRecord | null) => void;
  resetQuizState: () => void;
  getScore: () => number;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  currentTopic: "Neural Networks",
  explanation: null,
  learningSession: null,
  activeStepIndex: 0,
  quiz: null,
  selectedAnswers: {},
  quizFeedback: {},
  progress: null,
  setCurrentTopic: (currentTopic) => set({ currentTopic }),
  setExplanation: (explanation) => set({ explanation }),
  setLearningSession: (learningSession) => set({ learningSession, activeStepIndex: learningSession?.currentStepIndex ?? 0 }),
  setActiveStepIndex: (activeStepIndex) => set({ activeStepIndex }),
  setQuiz: (quiz) => set({ quiz, selectedAnswers: {}, quizFeedback: {} }),
  answerQuestion: (questionId, answerIndex) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: answerIndex
      }
    })),
  setQuizFeedback: (questionId, feedback) =>
    set((state) => ({
      quizFeedback: {
        ...state.quizFeedback,
        [questionId]: feedback
      },
      progress: feedback.progress
    })),
  setProgress: (progress) => set({ progress }),
  resetQuizState: () => set({ quiz: null, selectedAnswers: {}, quizFeedback: {} }),
  getScore: () => {
    const { quiz, selectedAnswers } = get();
    if (!quiz) return 0;

    const correctCount = quiz.questions.reduce((count: number, question: QuizQuestion) => {
      return selectedAnswers[question.id] === question.correctAnswerIndex ? count + 1 : count;
    }, 0);

    return Math.round((correctCount / quiz.questions.length) * 100);
  }
}));
