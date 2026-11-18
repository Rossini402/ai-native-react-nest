import {
  type CreateTaskInput,
  type Task,
  type TaskPriority,
  TaskPrioritySchema,
  type TaskStatus,
} from "@repo/contracts";
import { AlertCircle, ArrowRight, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge, type BadgeVariant } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { MetricCard } from "../../components/ui/metric-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/cn";

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
  medium: "accent",
  high: "destructive",
};

export function TaskBoard({ tasks, loading, error, onCreate, onStatusChange }: TaskBoardProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    void onCreate({ title: trimmed, priority });
    setTitle("");
  };

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <section aria-label="Task Board" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Engineering Tasks</h1>
            <Badge variant="accent">{tasks.length} items</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Golden vertical slice powered by unified design tokens, shadcn/ui Radix primitives, and
            Zod contracts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Backlog · Todo" value={todoCount} />
        <MetricCard
          label="Active · In Progress"
          value={inProgressCount}
          labelClassName="text-amber-600"
        />
        <MetricCard label="Shipped · Done" value={doneCount} labelClassName="text-emerald-600" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-muted)]/60 p-2.5 sm:flex-row sm:items-center"
          >
            <Input
              aria-label="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Capture an engineering task (e.g. Lock API pagination contract)..."
              maxLength={120}
              className="flex-1 bg-[var(--color-card)]"
            />
            <div className="flex items-center gap-2">
              <Select
                value={priority}
                onValueChange={(val) => {
                  const parsed = TaskPrioritySchema.safeParse(val);
                  if (parsed.success) setPriority(parsed.data);
                }}
              >
                <SelectTrigger
                  aria-label="Priority"
                  className="w-36 bg-[var(--color-card)] text-xs"
                >
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Priority: Low</SelectItem>
                  <SelectItem value="medium">Priority: Medium</SelectItem>
                  <SelectItem value="high">Priority: High</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </Button>
            </div>
          </form>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2.5 py-4">
              <div className="h-14 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-muted)]" />
              <div className="h-14 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-muted)]" />
              <p className="text-center text-xs text-[var(--color-muted-foreground)]">
                Loading tasks...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet. Create your first task above."
              description="Tasks transition deterministically from todo → in_progress → done."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-card)]">
              {tasks.map((task) => {
                const next = NEXT_STATUS[task.status];
                return (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-muted)]/50"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          task.status === "done" &&
                            "text-[var(--color-muted-foreground)] line-through",
                        )}
                      >
                        {task.title}
                      </span>
                      <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
                      <Badge variant={STATUS_VARIANT[task.status]} dot>
                        {task.status}
                      </Badge>
                    </div>
                    {next && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void onStatusChange(task.id, next)}
                      >
                        <span>Move to {next}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
