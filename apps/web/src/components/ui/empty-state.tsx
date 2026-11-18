import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/40 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] shadow-2xs">
        <Inbox className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-[var(--color-foreground)]">{title}</p>
      <p className="text-xs text-[var(--color-muted-foreground)]">{description}</p>
    </div>
  );
}
