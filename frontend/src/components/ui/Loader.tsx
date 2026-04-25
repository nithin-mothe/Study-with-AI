import { cn } from "@/utils/cn";

interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = "Loading", className }: LoaderProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-muted", className)} role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
