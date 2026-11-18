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

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

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
