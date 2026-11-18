import "@testing-library/jest-dom/vitest";
import type { PaginationMeta, ReleaseRequest } from "@repo/contracts";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReleaseBoard } from "./release-board";

afterEach(cleanup);

const PENDING_RELEASE: ReleaseRequest = {
  id: "rel-pending-1",
  serviceName: "checkout-api",
  version: "v2.4.0",
  environment: "production",
  riskLevel: "high",
  changelog: "Add idempotency key validation on payment capture",
  status: "pending",
  requestedByEmail: "member@example.com",
  reviewedByEmail: null,
  reviewNote: null,
  createdAt: "2026-11-18T02:00:00.000Z",
  reviewedAt: null,
};

const DEFAULT_META: PaginationMeta = {
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1,
};

const EMPTY_META: PaginationMeta = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

describe("ReleaseBoard", () => {
  it("allows admin to approve or reject pending releases", () => {
    const onReview = vi.fn();
    render(
      <ReleaseBoard
        releases={[PENDING_RELEASE]}
        meta={DEFAULT_META}
        currentUserRole="admin"
        loading={false}
        error={null}
        onStatusFilterChange={vi.fn()}
        onEnvironmentFilterChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreate={vi.fn()}
        onReview={onReview}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Approve$/i }));
    expect(onReview).toHaveBeenCalledWith("rel-pending-1", { decision: "approved" });

    fireEvent.click(screen.getByRole("button", { name: /^Reject$/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/at least 3 characters/i);
    expect(onReview).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText(/Reject reason for checkout-api/i), {
      target: { value: "Missing rollback verification" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Reject$/i }));
    expect(onReview).toHaveBeenCalledWith("rel-pending-1", {
      decision: "rejected",
      reviewNote: "Missing rollback verification",
    });
  });

  it("hides Approve and Reject buttons for member role and shows read-only badge", () => {
    render(
      <ReleaseBoard
        releases={[PENDING_RELEASE]}
        meta={DEFAULT_META}
        currentUserRole="member"
        loading={false}
        error={null}
        onStatusFilterChange={vi.fn()}
        onEnvironmentFilterChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreate={vi.fn()}
        onReview={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /^Approve$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Reject$/i })).not.toBeInTheDocument();
    expect(screen.getByText("Pending Admin Approval")).toBeInTheDocument();
  });

  it("renders empty, loading, and error states and submits new release requests", () => {
    const onCreate = vi.fn();
    const { rerender } = render(
      <ReleaseBoard
        releases={[]}
        meta={EMPTY_META}
        currentUserRole="member"
        loading={false}
        error={null}
        onStatusFilterChange={vi.fn()}
        onEnvironmentFilterChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreate={onCreate}
        onReview={vi.fn()}
      />,
    );

    expect(screen.getByText(/No release requests match/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Service Name/i), {
      target: { value: "billing-service" },
    });
    fireEvent.change(screen.getByLabelText(/Version/i), {
      target: { value: "v1.2.0" },
    });
    fireEvent.change(screen.getByLabelText(/Changelog/i), {
      target: { value: "Upgrade Stripe webhook signature verifier" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Release Request/i }));

    expect(onCreate).toHaveBeenCalledWith({
      serviceName: "billing-service",
      version: "v1.2.0",
      environment: "staging",
      riskLevel: "medium",
      changelog: "Upgrade Stripe webhook signature verifier",
    });

    rerender(
      <ReleaseBoard
        releases={[]}
        meta={EMPTY_META}
        currentUserRole="member"
        loading={true}
        error="Release request already decided"
        onStatusFilterChange={vi.fn()}
        onEnvironmentFilterChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreate={onCreate}
        onReview={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Release request already decided");
    expect(screen.getByText(/Loading release requests/i)).toBeInTheDocument();
  });
});
