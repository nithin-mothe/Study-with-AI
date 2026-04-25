import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const QuizPanel = dynamic(() => import("@/components/quiz/QuizPanel").then((mod) => mod.QuizPanel), {
  loading: () => <QuizLoading />
});

function QuizLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
      <Skeleton className="h-96" />
      <Skeleton className="h-[32rem]" />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizPanel />
    </Suspense>
  );
}
