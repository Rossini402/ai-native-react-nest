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
        "flex flex-col gap-3 rounded-xl border border-zinc-200/80 border-l-4 bg-white p-4 shadow-[0_1px_2px_rgba(9,9,11,0.02)] transition-shadow hover:shadow-xs",
        ACCENT_BORDER[item.status],
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-zinc-950">
            {item.serviceName}
          </span>
          <code className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-xs font-medium text-zinc-800">
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

      <p className="text-sm leading-relaxed text-zinc-700">{item.changelog}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
        <span>Requested by {item.requestedByEmail}</span>
        {item.reviewedByEmail && <span>· Reviewed by {item.reviewedByEmail}</span>}
        {item.reviewNote && (
          <span className="font-medium text-zinc-600">· Note: &ldquo;{item.reviewNote}&rdquo;</span>
        )}
      </div>

      {item.status === "pending" && currentUserRole === "admin" && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 p-2.5">
          <Button size="sm" disabled={isReviewing} onClick={onApprove}>
            Approve
          </Button>
          <Input
            aria-label={`Reject reason for ${item.serviceName}`}
            placeholder="Reject reason (min 3 chars)..."
            disabled={isReviewing}
            value={rejectNote}
            onChange={(e) => onRejectNoteChange(e.target.value)}
            className="h-8 flex-1 bg-white text-xs"
          />
          <Button size="sm" variant="destructive" disabled={isReviewing} onClick={onReject}>
            Reject
          </Button>
        </div>
      )}
    </li>
  );
}
