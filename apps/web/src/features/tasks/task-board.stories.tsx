import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { TaskBoard } from "./task-board";

const SAMPLE_TASKS = [
  {
    id: "t-1",
    title: "Freeze @repo/contracts Zod schema",
    priority: "high" as const,
    status: "done" as const,
    createdAt: "2026-11-18T01:00:00.000Z",
  },
  {
    id: "t-2",
    title: "Implement NestJS Drizzle dual-mode repository",
    priority: "high" as const,
    status: "in_progress" as const,
    createdAt: "2026-11-18T01:30:00.000Z",
  },
  {
    id: "t-3",
    title: "Verify CSF3 Storybook stories in CI",
    priority: "medium" as const,
    status: "todo" as const,
    createdAt: "2026-11-18T02:00:00.000Z",
  },
];

const meta = {
  title: "Features/Tasks/TaskBoard",
  component: TaskBoard,
  tags: ["autodocs"],
  args: {
    tasks: SAMPLE_TASKS,
    loading: false,
    error: null,
    onCreate: fn(),
    onStatusChange: fn(),
  },
} satisfies Meta<typeof TaskBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

export const EmptyState: Story = {
  args: {
    tasks: [],
  },
};

export const LoadingState: Story = {
  args: {
    tasks: [],
    loading: true,
  },
};

export const ErrorState: Story = {
  args: {
    tasks: SAMPLE_TASKS,
    error: "Completed tasks cannot transition directly back to 'todo'",
  },
};
