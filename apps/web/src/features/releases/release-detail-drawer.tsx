import type { ReleaseRequest } from "@repo/contracts";
import { Descriptions, Drawer, Tag, Typography } from "antd";

export interface ReleaseDetailDrawerProps {
  release: ReleaseRequest | null;
  onClose: () => void;
}

export function ReleaseDetailDrawer({ release, onClose }: ReleaseDetailDrawerProps) {
  return (
    <Drawer
      title={
        release ? `Release Audit · ${release.serviceName} (${release.version})` : "Release Audit"
      }
      width={520}
      open={release !== null}
      onClose={onClose}
    >
      {release && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Release ID">
            <Typography.Text code>{release.id}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Service">{release.serviceName}</Descriptions.Item>
          <Descriptions.Item label="SemVer">
            <Typography.Text code>{release.version}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Environment">
            <Tag color={release.environment === "production" ? "processing" : "default"}>
              {release.environment}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Risk Level">
            <Tag color={release.riskLevel === "high" ? "error" : "warning"}>
              {release.riskLevel}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Approval Status">
            <Tag
              color={
                release.status === "approved"
                  ? "success"
                  : release.status === "rejected"
                    ? "error"
                    : "warning"
              }
            >
              {release.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Requested By">{release.requestedByEmail}</Descriptions.Item>
          <Descriptions.Item label="Created At">{release.createdAt}</Descriptions.Item>
          <Descriptions.Item label="Reviewed By">
            {release.reviewedByEmail ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Review Note">{release.reviewNote ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Changelog">{release.changelog}</Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  );
}
