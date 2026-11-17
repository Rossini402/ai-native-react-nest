import type { CreateTaskInput, Task, TaskStatus } from "@repo/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../../lib/api-client";
import { queryKeys } from "../../lib/query-keys";

export interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (input: CreateTaskInput) => Promise<void>;
  changeStatus: (id: string, status: TaskStatus) => Promise<void>;
}

export function useTasks(): UseTasksState {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: () => tasksApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
    },
  });

  const activeError =
    listQuery.error ?? createMutation.error ?? statusMutation.error ?? null;

  return {
    tasks: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: activeError instanceof Error ? activeError.message : null,
    createTask: async (input) => {
      await createMutation.mutateAsync(input);
    },
    changeStatus: async (id, status) => {
      await statusMutation.mutateAsync({ id, status });
    },
  };
}
