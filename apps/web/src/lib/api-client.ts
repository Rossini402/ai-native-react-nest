import {
  ApiErrorEnvelopeSchema,
  type AuthSession,
  AuthSessionResponseSchema,
  type AuthUser,
  type CreateReleaseInput,
  type CreateTaskInput,
  type ListReleasesQuery,
  type LoginInput,
  MeResponseSchema,
  type PaginatedReleasesResponse,
  PaginatedReleasesResponseSchema,
  REQUEST_ID_HEADER,
  type ReleaseRequest,
  ReleaseResponseSchema,
  type ReviewReleaseInput,
  type Task,
  TaskListResponseSchema,
  TaskResponseSchema,
  type TaskStatus,
} from "@repo/contracts";

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

let currentAccessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}

export function onUnauthorizedResponse(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function generateClientRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `web-${Date.now()}`;
}

async function requestJson(input: string, init?: RequestInit): Promise<unknown> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has(REQUEST_ID_HEADER)) {
    headers.set(REQUEST_ID_HEADER, generateClientRequestId());
  }
  if (currentAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${currentAccessToken}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const headerRequestId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  const payload: unknown = await response.json();
  if (!response.ok) {
    if (response.status === 401 && !input.endsWith("/api/auth/login")) {
      unauthorizedHandler?.();
    }
    const parsedError = ApiErrorEnvelopeSchema.safeParse(payload);
    if (parsedError.success) {
      throw new ApiClientError(
        parsedError.data.error.code,
        parsedError.data.error.message,
        response.status,
        parsedError.data.error.requestId ?? headerRequestId,
      );
    }
    throw new ApiClientError(
      "INTERNAL_ERROR",
      `HTTP ${response.status}`,
      response.status,
      headerRequestId,
    );
  }
  return payload;
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthSession> {
    const raw = await requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const session = AuthSessionResponseSchema.parse(raw).data;
    setAccessToken(session.accessToken);
    return session;
  },

  async me(): Promise<AuthUser> {
    const raw = await requestJson("/api/auth/me");
    return MeResponseSchema.parse(raw).data;
  },
};

export const tasksApi = {
  async list(): Promise<Task[]> {
    const raw = await requestJson("/api/tasks");
    return TaskListResponseSchema.parse(raw).data;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const raw = await requestJson("/api/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return TaskResponseSchema.parse(raw).data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const raw = await requestJson(`/api/tasks/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return TaskResponseSchema.parse(raw).data;
  },
};

export const releasesApi = {
  async list(query: ListReleasesQuery): Promise<PaginatedReleasesResponse> {
    const params = new URLSearchParams({
      page: String(query.page),
      pageSize: String(query.pageSize),
    });
    if (query.status !== undefined) {
      params.set("status", query.status);
    }
    if (query.environment !== undefined) {
      params.set("environment", query.environment);
    }
    const raw = await requestJson(`/api/releases?${params.toString()}`);
    return PaginatedReleasesResponseSchema.parse(raw);
  },

  async create(input: CreateReleaseInput): Promise<ReleaseRequest> {
    const raw = await requestJson("/api/releases", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return ReleaseResponseSchema.parse(raw).data;
  },

  async review(id: string, input: ReviewReleaseInput): Promise<ReleaseRequest> {
    const raw = await requestJson(`/api/releases/${encodeURIComponent(id)}/review`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return ReleaseResponseSchema.parse(raw).data;
  },
};
