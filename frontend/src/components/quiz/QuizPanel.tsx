"use client";

import { useRef, useState } from "react";
import { generateQuiz, submitQuizAnswer } from "@/lib/api/learningApi";
import { useLearningStore } from "@/store/learningStore";
import type { QuizDifficulty } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { getNowMs } from "@/utils/time";

export function QuizPanel() {
  const currentTopic = useLearningStore((state) => state.currentTopic);
  const quiz = useLearningStore((state) => state.quiz);
  const selectedAnswers = useLearningStore((state) => state.selectedAnswers);
  const feedback = useLearningStore((state) => state.quizFeedback);
  const progress = useLearningStore((state) => state.progress);
  const setCurrentTopic = useLearningStore((state) => state.setCurrentTopic);
  const setQuiz = useLearningStore((state) => state.setQuiz);
  const answerQuestion = useLearningStore((state) => state.answerQuestion);
  const setQuizFeedback = useLearningStore((state) => state.setQuizFeedback);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const questionStartedAtRef = useRef<Record<string, number>>({});

  async function handleGenerateQuiz() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateQuiz(currentTopic, difficulty);
      setQuiz(result);
      const startedAt = getNowMs();
      questionStartedAtRef.current = Object.fromEntries(result.questions.map((question) => [question.id, startedAt]));
    } catch (quizError) {
      setError(quizError instanceof Error ? quizError.message : "Unable to generate quiz");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnswer(questionId: string, optionIndex: number, option: string) {
    if (!quiz) return;

    const existingFeedback = feedback[questionId];
    if (existingFeedback?.isCorrect) return;

    answerQuestion(questionId, optionIndex);
    setSubmittingQuestionId(questionId);
    setError(null);

    try {
      const now = getNowMs();
      const startedAt = questionStartedAtRef.current[questionId] ?? now;
      const result = await submitQuizAnswer({
        quizId: quiz.id,
        questionId,
        userAnswer: option,
        speedSeconds: Math.round((now - startedAt) / 1000)
      });
      setQuizFeedback(questionId, result);
      questionStartedAtRef.current[questionId] = getNowMs();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit answer");
    } finally {
      setSubmittingQuestionId(null);
    }
  }

  const answeredCount = quiz ? Object.keys(feedback).filter((questionId) => feedback[questionId]?.isCorrect).length : 0;
  const progressPercent = quiz ? Math.round((answeredCount / quiz.questions.length) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
      <Card>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">Adaptive quiz</p>
        <h2 className="mb-4 text-3xl font-bold">Practice with instant feedback</h2>
        <div className="space-y-4">
          <Input label="Topic" value={currentTopic} onChange={(event) => setCurrentTopic(event.target.value)} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted">Starting difficulty</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as QuizDifficulty)}
              className="h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <Button onClick={handleGenerateQuiz} isLoading={isLoading} disabled={!currentTopic.trim()}>
            Generate quiz
          </Button>
          {progress ? (
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted">Current rewards</p>
              <p className="mt-2 text-2xl font-bold">{progress.xp} XP</p>
              <p className="text-xs text-primary">
                {progress.level} / {progress.streakDays} day streak
              </p>
            </div>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      </Card>

      <Card className="min-h-[32rem] transition-all duration-300">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : quiz ? (
          <div className="space-y-5">
            <div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">
                {quiz.difficulty} / {answeredCount} of {quiz.questions.length} mastered
              </p>
              <h2 className="mt-2 text-2xl font-bold">{quiz.topic} quiz</h2>
            </div>
            {quiz.questions.map((question, index) => {
              const questionFeedback = feedback[question.id];
              const isSubmitting = submittingQuestionId === question.id;

              return (
                <div key={question.id} className="rounded-3xl border border-border bg-background/50 p-4">
                  <h3 className="mb-4 font-semibold">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        type="button"
                        className={cn(
                          "rounded-xl border border-border p-3 text-left text-sm text-muted transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70",
                          selectedAnswers[question.id] === optionIndex && "border-primary bg-primary/10 text-foreground",
                          questionFeedback?.isCorrect &&
                            option === question.correctAnswer &&
                            "border-success bg-success/10 text-foreground",
                          questionFeedback &&
                            !questionFeedback.isCorrect &&
                            selectedAnswers[question.id] === optionIndex &&
                            "border-danger bg-danger/10 text-foreground"
                        )}
                        disabled={isSubmitting || questionFeedback?.isCorrect}
                        onClick={() => void handleAnswer(question.id, optionIndex, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {isSubmitting ? <p className="mt-3 text-sm text-muted">Checking answer...</p> : null}
                  {questionFeedback ? (
                    <div
                      className={cn(
                        "mt-4 animate-soft-pop rounded-2xl border p-4 text-sm leading-6",
                        questionFeedback.isCorrect
                          ? "border-success/40 bg-success/10 text-foreground"
                          : "border-danger/40 bg-danger/10 text-foreground"
                      )}
                    >
                      <p className="font-semibold">{questionFeedback.isCorrect ? "Correct" : "Try again"}</p>
                      <p className="mt-1 text-muted">{questionFeedback.explanation}</p>
                      <p className="mt-2 text-primary">{questionFeedback.suggestedNextStep}</p>
                      {!questionFeedback.isCorrect ? (
                        <p className="mt-2 text-muted">{questionFeedback.followUpExplanation}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-[28rem] items-center justify-center text-center">
            <div>
              <p className="mb-2 text-lg font-semibold">Generate a quiz when you are ready.</p>
              <p className="text-sm text-muted">Each answer is evaluated immediately with XP, streaks, and retry guidance.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
