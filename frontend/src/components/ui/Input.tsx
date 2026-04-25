import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-medium text-muted">{label}</span> : null}
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/30",
          className
        )}
        {...props}
      />
    </label>
  );
}
