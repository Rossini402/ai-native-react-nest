import {
  Navigate,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { AppShell } from "./components/layout/app-shell";
import { authStore, signOut, useAuthSession, useLoginMutation } from "./features/auth/auth-store";
import { LoginForm } from "./features/auth/login-form";
import { ReleaseBoard } from "./features/releases/release-board";
import { useReleases } from "./features/releases/use-releases";
import { TaskBoard } from "./features/tasks/task-board";
import { useTasks } from "./features/tasks/use-tasks";

export interface RouterAuthContext {
  isAuthenticated: () => boolean;
}

function RootLayout() {
  const session = useAuthSession();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    void navigate({ to: "/login" });
  };

  return (
    <AppShell session={session} onSignOut={handleSignOut}>
      <Outlet />
    </AppShell>
  );
}

function WorkspacePage() {
  const session = useAuthSession();
  const { tasks, loading, error, createTask, changeStatus } = useTasks();

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <TaskBoard
      tasks={tasks}
      loading={loading}
      error={error}
      onCreate={createTask}
      onStatusChange={changeStatus}
    />
  );
}

function ReleasesPage() {
  const session = useAuthSession();
  const {
    releases,
    meta,
    statusFilter,
    environmentFilter,
    loading,
    error,
    setStatusFilter,
    setEnvironmentFilter,
    setPage,
    createRelease,
    reviewRelease,
  } = useReleases();

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <ReleaseBoard
      releases={releases}
      meta={meta}
      currentUserRole={session.user.role}
      statusFilter={statusFilter}
      environmentFilter={environmentFilter}
      loading={loading}
      error={error}
      onStatusFilterChange={setStatusFilter}
      onEnvironmentFilterChange={setEnvironmentFilter}
      onPageChange={setPage}
      onCreate={createRelease}
      onReview={reviewRelease}
    />
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation(() => {
    void navigate({ to: "/" });
  });

  return (
    <LoginForm
      loading={loginMutation.isPending}
      error={loginMutation.error instanceof Error ? loginMutation.error.message : null}
      onSubmit={async (input) => {
        await loginMutation.mutateAsync(input);
      }}
    />
  );
}

const rootRoute = createRootRouteWithContext<RouterAuthContext>()({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: WorkspacePage,
});

const releasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/releases",
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: ReleasesPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([indexRoute, releasesRoute, loginRoute]);

export const appRouter = createRouter({
  routeTree,
  context: {
    isAuthenticated: () => authStore.isAuthenticated(),
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof appRouter;
  }
}
