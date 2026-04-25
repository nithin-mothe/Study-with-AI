import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const LearningPanel = dynamic(() => import("@/components/learning/LearningPanel").then((mod) => mod.LearningPanel), {
  loading: () => <LearningLoading />
});

function LearningLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Skeleton className="h-96" />
      <Skeleton className="h-[32rem]" />
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense fallback={<LearningLoading />}>
      <LearningPanel />
    </Suspense>
  );
}
