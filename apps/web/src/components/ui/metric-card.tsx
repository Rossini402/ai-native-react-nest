import { cn } from "../../lib/cn";
import { Card } from "./card";

export interface MetricCardProps {
  label: string;
  value: number | string;
  labelClassName?: string;
}

export function MetricCard({ label, value, labelClassName }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div
        className={cn("text-xs font-medium text-[var(--color-muted-foreground)]", labelClassName)}
      >
        {label}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
        {value}
      </div>
    </Card>
  );
}
