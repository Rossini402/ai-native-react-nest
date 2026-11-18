import {
  type CreateReleaseInput,
  type PaginationMeta,
  type ReleaseEnvironment,
  ReleaseEnvironmentSchema,
  type ReleaseRequest,
  type ReleaseStatus,
  ReleaseStatusSchema,
  type ReviewReleaseInput,
  ReviewReleaseInputSchema,
  type UserRole,
} from "@repo/contracts";
import { Alert, Card, Col, Row, Segmented, Select, Space, Statistic, Table } from "antd";
import { useState } from "react";
import { ReleaseCreateForm } from "./release-create-form";
import { ReleaseDetailDrawer } from "./release-detail-drawer";
import { buildReleaseTableColumns } from "./release-table-columns";

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
  const [activeDrawerItem, setActiveDrawerItem] = useState<ReleaseRequest | null>(null);

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
        .then(() => setRejectNotes((prev) => ({ ...prev, [id]: "" })))
        .catch(() => undefined)
        .finally(() => setReviewingId((cur) => (cur === id ? null : cur)));
      return;
    }
    setRejectNotes((prev) => ({ ...prev, [id]: "" }));
  };

  const columns = buildReleaseTableColumns({
    currentUserRole,
    reviewingId,
    rejectNotes,
    onSelectRelease: setActiveDrawerItem,
    onRejectNoteChange: (id, value) => {
      setReviewValidationError(null);
      setRejectNotes((prev) => ({ ...prev, [id]: value }));
    },
    onApprove: (id) => handleReview(id, "approved"),
    onReject: (id) => handleReview(id, "rejected"),
  });

  const activeAlert = error ?? reviewValidationError;

  return (
    <div className="flex flex-col gap-4">
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="Total Release Orders" value={meta.total} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Pending Review (Page)"
              value={releases.filter((r) => r.status === "pending").length}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Production Scope (Page)"
              value={releases.filter((r) => r.environment === "production").length}
            />
          </Card>
        </Col>
      </Row>

      <ReleaseCreateForm disabled={loading} onSubmit={onCreate} />

      <Card
        size="small"
        title={`Release Governance Ledger (Role: ${currentUserRole})`}
        extra={
          <Space wrap>
            <Segmented
              size="small"
              value={statusFilter ?? "all"}
              onChange={(val) => {
                setReviewValidationError(null);
                const parsed = ReleaseStatusSchema.safeParse(val);
                onStatusFilterChange(parsed.success ? parsed.data : undefined);
              }}
              options={[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
            />
            <Select
              size="small"
              value={environmentFilter ?? "all"}
              onChange={(val) => {
                setReviewValidationError(null);
                const parsed = ReleaseEnvironmentSchema.safeParse(val);
                onEnvironmentFilterChange(parsed.success ? parsed.data : undefined);
              }}
              options={[
                { value: "all", label: "All Envs" },
                { value: "staging", label: "Staging" },
                { value: "production", label: "Production" },
              ]}
              className="w-28"
            />
          </Space>
        }
      >
        {activeAlert && (
          <Alert role="alert" type="error" showIcon message={activeAlert} className="mb-3" />
        )}

        {loading && (
          <div className="mb-2 text-xs text-[var(--color-muted-foreground)]">
            Loading release requests...
          </div>
        )}

        <Table<ReleaseRequest>
          rowKey="id"
          size="small"
          bordered
          loading={loading}
          columns={columns}
          dataSource={releases}
          locale={{ emptyText: "No release requests match the current filters." }}
          pagination={{
            current: meta.page,
            pageSize: meta.pageSize,
            total: meta.total,
            onChange: (page) => {
              setReviewValidationError(null);
              onPageChange(page);
            },
          }}
        />
      </Card>

      <ReleaseDetailDrawer release={activeDrawerItem} onClose={() => setActiveDrawerItem(null)} />
    </div>
  );
}
