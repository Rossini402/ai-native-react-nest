import type { ReleaseRequest, ReleaseRiskLevel, ReleaseStatus, UserRole } from "@repo/contracts";
import { Badge, Button, Input, Space, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const RISK_COLOR: Record<ReleaseRiskLevel, string> = {
  low: "default",
  medium: "warning",
  high: "error",
};

const STATUS_BADGE: Record<ReleaseStatus, "warning" | "success" | "error"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export interface ReleaseColumnsOptions {
  currentUserRole: UserRole;
  reviewingId: string | null;
  rejectNotes: Record<string, string>;
  onSelectRelease: (item: ReleaseRequest) => void;
  onRejectNoteChange: (id: string, value: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function buildReleaseTableColumns({
  currentUserRole,
  reviewingId,
  rejectNotes,
  onSelectRelease,
  onRejectNoteChange,
  onApprove,
  onReject,
}: ReleaseColumnsOptions): ColumnsType<ReleaseRequest> {
  return [
    {
      title: "Service / Version",
      key: "service",
      width: 210,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Button
            type="link"
            size="small"
            className="p-0 font-semibold"
            onClick={() => onSelectRelease(record)}
          >
            {record.serviceName}
          </Button>
          <Typography.Text code className="text-xs">
            {record.version}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Env & Risk",
      key: "env",
      width: 170,
      render: (_, r) => (
        <Space size={4} wrap>
          <Tag color={r.environment === "production" ? "processing" : "default"}>
            {r.environment}
          </Tag>
          <Tag color={RISK_COLOR[r.riskLevel]}>{r.riskLevel}</Tag>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: ReleaseStatus) => <Badge status={STATUS_BADGE[status]} text={status} />,
    },
    {
      title: "Changelog & Audit",
      key: "changelog",
      render: (_, r) => (
        <div className="flex flex-col gap-0.5 text-xs">
          <Typography.Text>{r.changelog}</Typography.Text>
          <Typography.Text type="secondary">
            By {r.requestedByEmail}
            {r.reviewedByEmail ? ` · Reviewed by ${r.reviewedByEmail}` : ""}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Approval Gate",
      key: "actions",
      width: 340,
      render: (_, item) => {
        if (item.status !== "pending") {
          return (
            <Typography.Text type="secondary" className="text-xs">
              {item.reviewNote ? `Note: ${item.reviewNote}` : "Finalized"}
            </Typography.Text>
          );
        }
        if (currentUserRole !== "admin") {
          return <Tag>Pending Admin Approval</Tag>;
        }
        const busy = reviewingId === item.id;
        return (
          <Space size={6} wrap>
            <Button type="primary" size="small" disabled={busy} onClick={() => onApprove(item.id)}>
              Approve
            </Button>
            <Input
              size="small"
              aria-label={`Reject reason for ${item.serviceName}`}
              placeholder="Reject reason..."
              disabled={busy}
              value={rejectNotes[item.id] ?? ""}
              onChange={(e) => onRejectNoteChange(item.id, e.target.value)}
              className="w-36"
            />
            <Button danger size="small" disabled={busy} onClick={() => onReject(item.id)}>
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];
}
