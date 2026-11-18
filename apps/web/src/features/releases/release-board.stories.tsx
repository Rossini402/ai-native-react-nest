import type { PaginationMeta, ReleaseRequest } from "@repo/contracts";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ReleaseBoard } from "./release-board";

const SAMPLE_RELEASES: ReleaseRequest[] = [
  {
    id: "rel-1",
    serviceName: "checkout-api",
    version: "v2.4.0",
    environment: "production",
    riskLevel: "high",
    changelog: "Add idempotency key validation on payment capture endpoint",
    status: "pending",
    requestedByEmail: "member@example.com",
    reviewedByEmail: null,
    reviewNote: null,
    createdAt: "2026-11-18T02:00:00.000Z",
    reviewedAt: null,
  },
  {
    id: "rel-2",
    serviceName: "identity-service",
    version: "v1.9.3",
    environment: "staging",
    riskLevel: "low",
    changelog: "Refresh JWKS rotation interval configuration",
    status: "approved",
    requestedByEmail: "member@example.com",
    reviewedByEmail: "admin@example.com",
    reviewNote: "Verified staging smoke suite green",
    createdAt: "2026-11-18T01:00:00.000Z",
    reviewedAt: "2026-11-18T01:15:00.000Z",
  },
  {
    id: "rel-3",
    serviceName: "ledger-worker",
    version: "v3.1.0",
    environment: "production",
    riskLevel: "medium",
    changelog: "Batch settlement reconciliation job concurrency tuning",
    status: "rejected",
    requestedByEmail: "member@example.com",
    reviewedByEmail: "admin@example.com",
    reviewNote: "Missing database index migration rollback steps",
    createdAt: "2026-11-18T00:20:00.000Z",
    reviewedAt: "2026-11-18T00:40:00.000Z",
  },
];

const POPULATED_META: PaginationMeta = {
  page: 1,
  pageSize: 10,
  total: 3,
  totalPages: 1,
};

const EMPTY_META: PaginationMeta = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

const meta = {
  title: "Features/Releases/ReleaseBoard",
  component: ReleaseBoard,
  tags: ["autodocs"],
  args: {
    releases: SAMPLE_RELEASES,
    meta: POPULATED_META,
    currentUserRole: "admin",
    loading: false,
    error: null,
    onStatusFilterChange: fn(),
    onEnvironmentFilterChange: fn(),
    onPageChange: fn(),
    onCreate: fn(),
    onReview: fn(),
  },
} satisfies Meta<typeof ReleaseBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AdminPendingQueue: Story = {};

export const MemberReadOnlyQueue: Story = {
  args: {
    currentUserRole: "member",
  },
};

export const EmptyState: Story = {
  args: {
    releases: [],
    meta: EMPTY_META,
  },
};

export const LoadingState: Story = {
  args: {
    releases: [],
    meta: EMPTY_META,
    loading: true,
  },
};

export const ErrorState: Story = {
  args: {
    error: "Release request rel-1 has already been decided",
  },
};
