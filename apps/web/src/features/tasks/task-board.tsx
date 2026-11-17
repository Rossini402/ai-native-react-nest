import type { CreateTaskInput, Task, TaskPriority, TaskStatus } from "@repo/contracts";
import { type FormEvent, useState } from "react";
import { Badge, type BadgeVariant } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onCreate: (input: CreateTaskInput) => Promise<void> | void;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void> | void;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

const STATUS_VARIANT: Record<TaskStatus, BadgeVariant> = {
  todo: "secondary",
  in_progress: "warning",
  done: "success",
};

const PRIORITY_VARIANT: Record<TaskPriority, BadgeVariant> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

export function TaskBoard({
  tasks,
  loading,
  error,
  onCreate,
  onStatusChange,
}: TaskBoardProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    void onCreate({ title: trimmed, priority });
    setTitle("");
  };

  return (
    <Card aria-label="Task Board">
      <CardHeader>
        <CardTitle>Engineering Tasks</CardTitle>
        <CardDescription>
          Spec-driven delivery queue backed by `@repo/contracts` + TanStack Query
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <Input
            aria-label="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a spec-driven task..."
            maxLength={120}
            className="flex-1"
          />
          <select
            aria-label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <Button type="submit">Add Task</Button>
        </form>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted-foreground)]">
            No tasks yet. Create your first task above.
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {tasks.map((task) => {
              const next = NEXT_STATUS[task.status];
              return (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{task.title}</span>
                    <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
                    <Badge variant={STATUS_VARIANT[task.status]}>{task.status}</Badge>
                  </div>
                  {next && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void onStatusChange(task.id, next)}
                    >
                      Move to {next}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
