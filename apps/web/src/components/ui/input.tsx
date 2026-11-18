import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-sm text-[var(--color-foreground)] shadow-2xs transition-all placeholder:text-[var(--color-muted-foreground)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:bg-[var(--color-muted)] disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
