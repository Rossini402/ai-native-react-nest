import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer active:scale-[0.99] rounded-[var(--radius-control)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-xs hover:bg-[var(--color-primary-hover)]",
        secondary: "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:opacity-85",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] shadow-2xs hover:bg-[var(--color-muted)]",
        ghost:
          "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        destructive:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] shadow-xs hover:opacity-90",
      },
      size: {
        sm: "h-8 gap-1.5 px-3 text-xs",
        md: "h-9 gap-2 px-4 text-sm",
        lg: "h-10 gap-2 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
