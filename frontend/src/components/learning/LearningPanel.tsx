"use client";

import { useEffect, useRef, useState } from "react";
import { completeLearningStep, startLearning } from "@/lib/api/learningApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLearningStore } from "@/store/learningStore";
import type { ConceptLevel } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { getNowMs } from "@/utils/time";

export function LearningPanel() {
  const currentTopic = useLearningStore((state) => state.currentTopic);
  const learningSession = useLearningStore((state) => state.learningSession);
  const activeStepIndex = useLearningStore((state) => state.activeStepIndex);
  const setCurrentTopic = useLearningStore((state) => state.setCurrentTopic);
  const setLearningSession = useLearningStore((state) => state.setLearningSession);
  const setActiveStepIndex = useLearningStore((state) => state.setActiveStepIndex);
  const setProgress = useLearningStore((state) => state.setProgress);
  const [topicInput, setTopicInput] = useState(currentTopic);
  const debouncedTopic = useDebouncedValue(topicInput, 350);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helperMode, setHelperMode] = useState<"overview" | "simpler" | "example">("overview");
  const stepStartedAtRef = useRef<number>(0);

  useEffect(() => {
    setCurrentTopic(debouncedTopic);
  }, [debouncedTopic, setCurrentTopic]);

  async function handleStart(level?: ConceptLevel) {
    setIsLoading(true);
    setError(null);
    setHelperMode(level === "beginner" ? "simpler" : "overview");

    try {
      const session = await startLearning(debouncedTopic.trim(), level);
      setLearningSession(session);
      stepStartedAtRef.current = getNowMs();
    } catch (learningError) {
      setError(learningError instanceof Error ? learningError.message : "Unable to start learning session");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNextStep() {
    if (!learningSession) return;

    const currentStep = learningSession.steps[activeStepIndex];
    const startedAt = stepStartedAtRef.current || getNowMs();
    const speedSeconds = Math.round((getNowMs() - startedAt) / 1000);
    const result = await completeLearningStep({
      topic: learningSession.topic,
      completedStepId: currentStep.id,
      currentStepIndex: activeStepIndex,
      speedSeconds
    });

    setProgress(result.progress);
    setActiveStepIndex(Math.min(result.nextStepIndex, learningSession.steps.length - 1));
    stepStartedAtRef.current = getNowMs();
  }

  const activeStep = learningSession?.steps[activeStepIndex];
  const progressPercent = learningSession ? Math.round(((activeStepIndex + 1) / learningSession.steps.length) * 100) : 0;
  const isLastStep = learningSession ? activeStepIndex >= learningSession.steps.length - 1 : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-secondary">Micro-learning engine</p>
        <h2 className="mb-4 text-3xl font-bold">Learn in focused steps</h2>
        <div className="space-y-4">
          <Input
            label="Topic"
            value={topicInput}
            placeholder="Example: Photosynthesis, JWT auth, Bayes theorem"
            onChange={(event) => setTopicInput(event.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => void handleStart()} isLoading={isLoading} disabled={!debouncedTopic.trim()}>
              Start lesson
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleStart("beginner")}
              disabled={!debouncedTopic.trim() || isLoading}
            >
              Explain simpler
            </Button>
          </div>
          <Button variant="secondary" onClick={() => setHelperMode("example")} disabled={!learningSession}>
            Give example
          </Button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {learningSession ? (
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              <p className="text-sm text-muted">Adaptive settings</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
                {learningSession.level} / {learningSession.difficulty}
              </p>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="min-h-[32rem] transition-all duration-300">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-28" />
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
          </div>
        ) : learningSession && activeStep ? (
          <article className="space-y-6">
            <div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                Step {activeStepIndex + 1} of {learningSession.steps.length}
              </p>
              <h2 className="mt-2 text-3xl font-bold">{activeStep.title}</h2>
            </div>

            <div className="rounded-3xl border border-border bg-background/50 p-5">
              <h3 className="mb-2 font-semibold">
                {helperMode === "example" ? "Concrete example" : helperMode === "simpler" ? "Simpler explanation" : "Short lesson"}
              </h3>
              <p className="text-sm leading-7 text-muted">
                {helperMode === "example"
                  ? activeStep.example
                  : helperMode === "simpler"
                    ? learningSession.explanation.simpleExplanation
                    : activeStep.shortExplanation}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5">
                <h3 className="mb-2 font-semibold">Quick question</h3>
                <p className="text-sm leading-6 text-muted">{activeStep.quickQuestion.question}</p>
              </div>
              <div className="rounded-3xl border border-secondary/20 bg-secondary/10 p-5">
                <h3 className="mb-2 font-semibold">Expected thinking</h3>
                <p className="text-sm leading-6 text-muted">{activeStep.quickQuestion.expectedAnswer}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-elevated/50 p-5">
              <h3 className="mb-2 font-semibold">{learningSession.explanation.title}</h3>
              <p className="text-sm leading-7 text-muted">{learningSession.explanation.analogy}</p>
            </div>

            <Button onClick={() => void handleNextStep()}>{isLastStep ? "Save progress" : "Next step"}</Button>
          </article>
        ) : (
          <div className="flex h-full min-h-[28rem] items-center justify-center text-center">
            <div>
              <p className="mb-2 text-lg font-semibold">Structured learning starts here.</p>
              <p className="text-sm text-muted">
                Enter a topic and Groq will build a predictable lesson with steps, examples, and checks.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
