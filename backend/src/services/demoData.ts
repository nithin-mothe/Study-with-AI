import type { ConceptExplanation, MicroLearningStep, QuizDifficulty, QuizQuestion } from "../types/learning";
import { normalizeTopic } from "../utils/text";

const topicAliases = new Set(["neural networks", "photosynthesis", "bayes theorem"]);

export function isDemoTopic(topic: string) {
  return topicAliases.has(normalizeTopic(topic));
}

export function getDemoExplanation(topic: string): ConceptExplanation {
  return {
    title: `${topic}: learn it like a builder`,
    simpleExplanation:
      "This concept becomes easier when you separate the goal, the parts involved, and the feedback loop that improves the result.",
    analogy:
      "Think of it like tuning a musical instrument: you try, listen for what is off, adjust, and repeat until the sound becomes clean.",
    example:
      "If you are studying neural networks, inputs flow through layers, each layer transforms the signal, and feedback helps improve future predictions.",
    keyPoints: [
      "Start with the purpose before memorizing terms.",
      "Break the concept into small moving parts.",
      "Use feedback to identify what needs another pass.",
      "Practice with one concrete example immediately."
    ]
  };
}

export function getDemoSteps(topic: string): MicroLearningStep[] {
  return [
    {
      id: "step-1",
      title: "Find the job of the concept",
      shortExplanation: `${topic} is easier when you first ask what problem it helps solve.`,
      example: "A neural network helps find patterns from examples instead of being hand-coded for every rule.",
      quickQuestion: {
        question: `What problem does ${topic} help solve?`,
        expectedAnswer: "Name the goal in one plain sentence."
      }
    },
    {
      id: "step-2",
      title: "Break it into parts",
      shortExplanation: "Most hard ideas are made of a few smaller pieces working together.",
      example: "In a neural network, inputs, weights, layers, activations, and feedback each play a role.",
      quickQuestion: {
        question: "Which part changes as learning improves?",
        expectedAnswer: "The adjustable parts, like weights, change based on feedback."
      }
    },
    {
      id: "step-3",
      title: "Use feedback",
      shortExplanation: "Learning improves when the system compares a result against what should have happened.",
      example: "If the prediction is wrong, the model adjusts so it is less wrong next time.",
      quickQuestion: {
        question: "Why is feedback useful?",
        expectedAnswer: "It shows what to adjust next."
      }
    }
  ];
}

export function getDemoQuiz(topic: string, difficulty: QuizDifficulty): QuizQuestion[] {
  return [
    {
      id: "q-1",
      question: `What is the best first move when learning ${topic}?`,
      options: ["Memorize every term", "Understand the goal", "Skip examples", "Start with formulas only"],
      correctAnswerIndex: 1,
      correctAnswer: "Understand the goal",
      explanation: "Knowing the goal gives every later detail a place to attach."
    },
    {
      id: "q-2",
      question: "Why do examples help with difficult concepts?",
      options: ["They replace understanding", "They make abstract ideas concrete", "They avoid practice", "They remove feedback"],
      correctAnswerIndex: 1,
      correctAnswer: "They make abstract ideas concrete",
      explanation: "Examples turn a vague idea into something you can inspect and reuse."
    },
    {
      id: "q-3",
      question: "What should happen after an incorrect answer?",
      options: ["Stop studying", "Review feedback and retry", "Ignore the mistake", "Increase difficulty immediately"],
      correctAnswerIndex: 1,
      correctAnswer: "Review feedback and retry",
      explanation: "A mistake is useful when it points to the next small adjustment."
    },
    {
      id: "q-4",
      question: `At ${difficulty} difficulty, what shows stronger mastery?`,
      options: ["Repeating a phrase", "Explaining the idea with an example", "Guessing quickly", "Avoiding questions"],
      correctAnswerIndex: 1,
      correctAnswer: "Explaining the idea with an example",
      explanation: "Transfer to examples is a reliable sign that understanding is becoming durable."
    },
    {
      id: "q-5",
      question: "When should difficulty increase?",
      options: ["After high accuracy", "After one wrong answer", "Before learning basics", "Randomly"],
      correctAnswerIndex: 0,
      correctAnswer: "After high accuracy",
      explanation: "High accuracy signals readiness for a harder challenge."
    }
  ];
}
