import { type AuthSession, AuthSessionSchema, type LoginInput } from "@repo/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { authApi, onUnauthorizedResponse, setAccessToken } from "../../lib/api-client";

const STORAGE_KEY = "ai_stage_auth_session";
const listeners = new Set<() => void>();

function readInitialSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = AuthSessionSchema.safeParse(JSON.parse(raw) as unknown);
    if (!parsed.success) return null;
    setAccessToken(parsed.data.accessToken);
    return parsed.data;
  } catch {
    return null;
  }
}

let currentSession: AuthSession | null = readInitialSession();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export const authStore = {
  getSession(): AuthSession | null {
    return currentSession;
  },

  isAuthenticated(): boolean {
    return currentSession !== null;
  },

  setSession(session: AuthSession | null): void {
    currentSession = session;
    setAccessToken(session?.accessToken ?? null);
    if (typeof window !== "undefined") {
      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    emitChange();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

onUnauthorizedResponse(() => {
  authStore.setSession(null);
});

export function useAuthSession(): AuthSession | null {
  return useSyncExternalStore(authStore.subscribe, authStore.getSession, () => null);
}

export function useLoginMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (session) => {
      authStore.setSession(session);
      queryClient.clear();
      onSuccessCallback?.();
    },
  });
}

export function signOut(): void {
  authStore.setSession(null);
}
