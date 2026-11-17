import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  authStore,
  signOut,
  useAuthSession,
  useLoginMutation,
} from "./features/auth/auth-store";
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
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold tracking-tight">
              ai-native-react-nest
            </span>
            <Badge variant="secondary">React + NestJS + Zod</Badge>
          </div>
          {session && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {session.user.email} ({session.user.role})
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
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
    <div className="py-8">
      <LoginForm
        loading={loginMutation.isPending}
        error={loginMutation.error instanceof Error ? loginMutation.error.message : null}
        onSubmit={async (input) => {
          await loginMutation.mutateAsync(input);
        }}
      />
    </div>
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
