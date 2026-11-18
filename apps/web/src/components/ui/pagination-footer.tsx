import type { PaginationMeta } from "@repo/contracts";
import { Button } from "./button";

export interface PaginationFooterProps {
  meta: PaginationMeta;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationFooter({ meta, disabled = false, onPageChange }: PaginationFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted-foreground)]">
      <span className="tabular-nums">
        Page {meta.page} of {Math.max(meta.totalPages, 1)} · {meta.total} total
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
