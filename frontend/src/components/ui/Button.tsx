import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-primary text-white shadow-[0_12px_30px_rgb(12_12_12_/_0.18)] hover:bg-primary/90"
      : "border border-border bg-surface text-foreground hover:bg-elevated/80";

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/70 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        variantClass,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Working..." : children}
    </button>
  );
}
