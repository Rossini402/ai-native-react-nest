import type {
  ReleaseEnvironment,
  ReleaseRequest,
  ReleaseRiskLevel,
  ReleaseStatus,
  UserRole,
} from "@repo/contracts";
import { Badge, type BadgeVariant } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/cn";

const ENV_VARIANT: Record<ReleaseEnvironment, BadgeVariant> = {
  staging: "secondary",
  production: "accent",
};
const RISK_VARIANT: Record<ReleaseRiskLevel, BadgeVariant> = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
};
const STATUS_VARIANT: Record<ReleaseStatus, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};
const ACCENT_BORDER: Record<ReleaseStatus, string> = {
  pending: "border-l-amber-400",
  approved: "border-l-emerald-500",
  rejected: "border-l-rose-500",
};

export interface ReleaseListItemProps {
  item: ReleaseRequest;
  currentUserRole: UserRole;
  isReviewing: boolean;
  rejectNote: string;
  onRejectNoteChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ReleaseListItem({
  item,
  currentUserRole,
  isReviewing,
  rejectNote,
  onRejectNoteChange,
  onApprove,
  onReject,
}: ReleaseListItemProps) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] border-l-4 bg-[var(--color-card)] p-4 shadow-2xs transition-shadow hover:shadow-xs",
        ACCENT_BORDER[item.status],
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">{item.serviceName}</span>
          <code className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-0.5 font-mono text-xs font-medium">
            {item.version}
          </code>
          <Badge variant={ENV_VARIANT[item.environment]}>{item.environment}</Badge>
          <Badge variant={RISK_VARIANT[item.riskLevel]}>risk: {item.riskLevel}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[item.status]} dot>
            {item.status}
          </Badge>
          {item.status === "pending" && currentUserRole === "member" && (
            <Badge variant="secondary">Pending Admin Approval</Badge>
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed">{item.changelog}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted-foreground)]">
        <span>Requested by {item.requestedByEmail}</span>
        {item.reviewedByEmail && <span>· Reviewed by {item.reviewedByEmail}</span>}
        {item.reviewNote && (
          <span className="font-medium text-[var(--color-foreground)]">
            · Note: &ldquo;{item.reviewNote}&rdquo;
          </span>
        )}
      </div>

      {item.status === "pending" && currentUserRole === "admin" && (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-muted)]/70 p-2.5">
          <Button size="sm" disabled={isReviewing} onClick={onApprove}>
            Approve
          </Button>
          <Input
            aria-label={`Reject reason for ${item.serviceName}`}
            placeholder="Reject reason (min 3 chars)..."
            disabled={isReviewing}
            value={rejectNote}
            onChange={(e) => onRejectNoteChange(e.target.value)}
            className="h-8 flex-1 bg-[var(--color-card)] text-xs"
          />
          <Button size="sm" variant="destructive" disabled={isReviewing} onClick={onReject}>
            Reject
          </Button>
        </div>
      )}
    </li>
  );
}
