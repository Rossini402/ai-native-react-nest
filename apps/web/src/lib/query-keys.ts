import type { ListReleasesQuery } from "@repo/contracts";

export const queryKeys = {
  auth: {
    all: () => ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
  tasks: {
    all: () => ["tasks"] as const,
    list: () => ["tasks", "list"] as const,
  },
  releases: {
    all: () => ["releases"] as const,
    list: (params: ListReleasesQuery) => ["releases", "list", params] as const,
  },
} as const;
