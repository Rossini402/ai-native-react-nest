import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none tracking-tight",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        accent:
          "border-[var(--color-border)] bg-[var(--color-accent-subtle)] text-[var(--color-accent-text)]",
        secondary:
          "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-foreground)]",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        destructive: "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const DOT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-primary-foreground)]",
  accent: "bg-[var(--color-primary)]",
  secondary: "bg-[var(--color-muted-foreground)]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-rose-500",
};

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant = "secondary",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const resolvedVariant = variant ?? "secondary";
  return (
    <span className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[resolvedVariant])} />}
      {children}
    </span>
  );
}
