import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskBoard } from "./task-board";

afterEach(cleanup);

describe("TaskBoard", () => {
  it("renders explicit empty state when task list is empty", () => {
    render(
      <TaskBoard
        tasks={[]}
        loading={false}
        error={null}
        onCreate={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  it("renders tasks and triggers status transition callback", () => {
    const onStatusChange = vi.fn();
    render(
      <TaskBoard
        tasks={[
          {
            id: "task-1",
            title: "Freeze @repo/contracts schema",
            priority: "high",
            status: "todo",
            createdAt: "2026-11-18T00:00:00.000Z",
          },
        ]}
        loading={false}
        error={null}
        onCreate={vi.fn()}
        onStatusChange={onStatusChange}
      />,
    );

    expect(screen.getByText("Freeze @repo/contracts schema")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Move to in_progress/i }));
    expect(onStatusChange).toHaveBeenCalledWith("task-1", "in_progress");
  });
});
