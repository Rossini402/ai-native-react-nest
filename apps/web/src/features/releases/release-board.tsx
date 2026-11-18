import {
  type CreateReleaseInput,
  type PaginationMeta,
  type ReleaseEnvironment,
  ReleaseEnvironmentSchema,
  type ReleaseRequest,
  type ReleaseStatus,
  type ReviewReleaseInput,
  ReviewReleaseInputSchema,
  type UserRole,
} from "@repo/contracts";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { MetricCard } from "../../components/ui/metric-card";
import { PaginationFooter } from "../../components/ui/pagination-footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/cn";
import { ReleaseCreateForm } from "./release-create-form";
import { ReleaseListItem } from "./release-list-item";

export interface ReleaseBoardProps {
  releases: ReleaseRequest[];
  meta: PaginationMeta;
  currentUserRole: UserRole;
  statusFilter?: ReleaseStatus;
  environmentFilter?: ReleaseEnvironment;
  loading: boolean;
  error: string | null;
  onStatusFilterChange: (status?: ReleaseStatus) => void;
  onEnvironmentFilterChange: (environment?: ReleaseEnvironment) => void;
  onPageChange: (page: number) => void;
  onCreate: (input: CreateReleaseInput) => Promise<void> | void;
  onReview: (id: string, input: ReviewReleaseInput) => Promise<void> | void;
}

const STATUS_TABS: { value: ReleaseStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function ReleaseBoard({
  releases,
  meta,
  currentUserRole,
  statusFilter,
  environmentFilter,
  loading,
  error,
  onStatusFilterChange,
  onEnvironmentFilterChange,
  onPageChange,
  onCreate,
  onReview,
}: ReleaseBoardProps) {
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [reviewValidationError, setReviewValidationError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const handleReview = (id: string, decision: "approved" | "rejected") => {
    if (reviewingId === id) return;
    const note = (rejectNotes[id] ?? "").trim();
    const raw = note ? { decision, reviewNote: note } : { decision };
    const parsed = ReviewReleaseInputSchema.safeParse(raw);
    if (!parsed.success) {
      setReviewValidationError(parsed.error.issues[0]?.message ?? "Invalid review input");
      return;
    }
    setReviewValidationError(null);
    const result = onReview(id, parsed.data);
    if (result instanceof Promise) {
      setReviewingId(id);
      void result
        .then(() => {
          setRejectNotes((prev) => ({ ...prev, [id]: "" }));
        })
        .catch(() => undefined)
        .finally(() => {
          setReviewingId((cur) => (cur === id ? null : cur));
        });
      return;
    }
    setRejectNotes((prev) => ({ ...prev, [id]: "" }));
  };

  const pendingOnPage = releases.filter((r) => r.status === "pending").length;
  const prodOnPage = releases.filter((r) => r.environment === "production").length;
  const activeAlert = error ?? reviewValidationError;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight">Release Approvals</h1>
            <Badge variant={currentUserRole === "admin" ? "accent" : "secondary"}>
              role: {currentUserRole}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Governed deployment gate powered by shadcn/ui Radix primitives and unified brand tokens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Total Matching" value={meta.total} />
        <MetricCard label="Pending on Page" value={pendingOnPage} labelClassName="text-amber-600" />
        <MetricCard
          label="Production Candidates"
          value={prodOnPage}
          labelClassName="text-[var(--color-primary)]"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ReleaseCreateForm disabled={loading} onSubmit={onCreate} />
        </div>

        <Card aria-label="Release Approval Queue" className="lg:col-span-7">
          <CardHeader className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Release Approval Queue</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Filter by status"
                className="flex rounded-[var(--radius-control)] bg-[var(--color-muted)] p-0.5"
              >
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === tab.value}
                    onClick={() => {
                      setReviewValidationError(null);
                      onStatusFilterChange(tab.value);
                    }}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                      statusFilter === tab.value
                        ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-2xs"
                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <Select
                value={environmentFilter ?? "all"}
                onValueChange={(val) => {
                  setReviewValidationError(null);
                  const parsed = ReleaseEnvironmentSchema.safeParse(val);
                  onEnvironmentFilterChange(parsed.success ? parsed.data : undefined);
                }}
              >
                <SelectTrigger aria-label="Filter by environment" className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Envs</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-5">
            {activeAlert && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{activeAlert}</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col gap-3 py-4">
                <div className="h-24 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-muted)]" />
                <div className="h-24 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-muted)]" />
                <p className="text-center text-xs text-[var(--color-muted-foreground)]">
                  Loading release requests...
                </p>
              </div>
            ) : releases.length === 0 ? (
              <EmptyState
                title="No release requests match the current filters."
                description="Submit a SemVer candidate on the left to start an approval cycle."
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {releases.map((item) => (
                  <ReleaseListItem
                    key={item.id}
                    item={item}
                    currentUserRole={currentUserRole}
                    isReviewing={reviewingId === item.id}
                    rejectNote={rejectNotes[item.id] ?? ""}
                    onRejectNoteChange={(value) => {
                      setReviewValidationError(null);
                      setRejectNotes((prev) => ({ ...prev, [item.id]: value }));
                    }}
                    onApprove={() => handleReview(item.id, "approved")}
                    onReject={() => handleReview(item.id, "rejected")}
                  />
                ))}
              </ul>
            )}

            <PaginationFooter
              meta={meta}
              disabled={loading}
              onPageChange={(nextPage) => {
                setReviewValidationError(null);
                onPageChange(nextPage);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
