export const queryKeys = {
  auth: {
    all: () => ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
  tasks: {
    all: () => ["tasks"] as const,
    list: () => ["tasks", "list"] as const,
  },
} as const;
