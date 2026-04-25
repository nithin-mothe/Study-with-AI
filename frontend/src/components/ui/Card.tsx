import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      className={cn("rounded-3xl border border-border bg-surface/80 p-6 shadow-glow backdrop-blur transition duration-300", className)}
      {...props}
    >
      {children}
    </section>
  );
}
