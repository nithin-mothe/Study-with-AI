import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const DashboardPanel = dynamic(
  () => import("@/components/dashboard/DashboardPanel").then((mod) => mod.DashboardPanel),
  {
    loading: () => <DashboardLoading />
  }
);

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-72" />
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPanel />
    </Suspense>
  );
}
