import type {
  CreateReleaseInput,
  ListReleasesQuery,
  PaginationMeta,
  ReleaseEnvironment,
  ReleaseRequest,
  ReleaseStatus,
  ReviewReleaseInput,
} from "@repo/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { releasesApi } from "../../lib/api-client";
import { queryKeys } from "../../lib/query-keys";

const DEFAULT_PAGE_SIZE = 10;

export interface UseReleasesState {
  releases: ReleaseRequest[];
  meta: PaginationMeta;
  statusFilter: ReleaseStatus | undefined;
  environmentFilter: ReleaseEnvironment | undefined;
  loading: boolean;
  error: string | null;
  setStatusFilter: (status?: ReleaseStatus) => void;
  setEnvironmentFilter: (environment?: ReleaseEnvironment) => void;
  setPage: (page: number) => void;
  createRelease: (input: CreateReleaseInput) => Promise<void>;
  reviewRelease: (id: string, input: ReviewReleaseInput) => Promise<void>;
}

export function useReleases(): UseReleasesState {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilterState] = useState<ReleaseStatus | undefined>(undefined);
  const [environmentFilter, setEnvironmentFilterState] = useState<ReleaseEnvironment | undefined>(
    undefined,
  );

  const queryParams: ListReleasesQuery = {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    status: statusFilter,
    environment: environmentFilter,
  };

  const listQuery = useQuery({
    queryKey: queryKeys.releases.list(queryParams),
    queryFn: () => releasesApi.list(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateReleaseInput) => releasesApi.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.releases.all() });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewReleaseInput }) =>
      releasesApi.review(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.releases.all() });
    },
  });

  const setStatusFilter = (next?: ReleaseStatus) => {
    setStatusFilterState(next);
    setPage(1);
  };

  const setEnvironmentFilter = (next?: ReleaseEnvironment) => {
    setEnvironmentFilterState(next);
    setPage(1);
  };

  const activeError = listQuery.error ?? createMutation.error ?? reviewMutation.error ?? null;

  const fallbackMeta: PaginationMeta = {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  };

  return {
    releases: listQuery.data?.data ?? [],
    meta: listQuery.data?.meta ?? fallbackMeta,
    statusFilter,
    environmentFilter,
    loading: listQuery.isLoading,
    error: activeError instanceof Error ? activeError.message : null,
    setStatusFilter,
    setEnvironmentFilter,
    setPage,
    createRelease: async (input) => {
      await createMutation.mutateAsync(input);
    },
    reviewRelease: async (id, input) => {
      await reviewMutation.mutateAsync({ id, input });
    },
  };
}
