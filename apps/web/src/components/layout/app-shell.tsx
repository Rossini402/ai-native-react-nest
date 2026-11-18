import type { AuthSession } from "@repo/contracts";
import { Link } from "@tanstack/react-router";
import { CheckSquare, Layers, LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { BrandPresetSwitcher } from "../../design-system/brand-preset-switcher";
import { ACTIVE_UI_KIT } from "../../design-system/tokens";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface AppShellProps {
  session: AuthSession | null;
  onSignOut: () => void;
  children: ReactNode;
}

function getInitials(email: string): string {
  const local = email.split("@")[0] ?? "U";
  return local.slice(0, 2).toUpperCase();
}

export function AppShell({ session, onSignOut, children }: AppShellProps) {
  if (!session) {
    return (
      <div className="bg-dot-grid flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-card)] p-4 md:flex">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">
                ai-native-react-nest
              </div>
              <div className="font-mono text-xs text-[var(--color-muted-foreground)]">
                kit: {ACTIVE_UI_KIT}
              </div>
            </div>
          </div>

          <nav aria-label="Main navigation" className="flex flex-col gap-1">
            <div className="px-2.5 pb-1 text-xs font-medium text-[var(--color-muted-foreground)]">
              Workspace
            </div>
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{
                className:
                  "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-xs hover:opacity-95",
              }}
              className="flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              <CheckSquare className="h-4 w-4" />
              <span>Engineering Tasks</span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <BrandPresetSwitcher />

          <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-muted)]/60 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
              <span>Harness Active</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
              Unified Tokens · Zod Contracts · Global JWT Guard
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-card)] p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-subtle)] text-xs font-semibold text-[var(--color-accent-text)]">
                {getInitials(session.user.email)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">{session.user.email}</div>
                <Badge
                  variant={session.user.role === "admin" ? "accent" : "secondary"}
                  className="mt-0.5"
                >
                  {session.user.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Sign Out"
              title="Sign Out"
              onClick={onSignOut}
              className="px-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 md:hidden">
          <span className="text-sm font-semibold tracking-tight">ai-native-react-nest</span>
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Sign Out
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
