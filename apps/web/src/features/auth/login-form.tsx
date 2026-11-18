import type { LoginInput } from "@repo/contracts";
import { AlertCircle, ArrowRight, Layers, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { BrandPresetSwitcher } from "../../design-system/brand-preset-switcher";
import { cn } from "../../lib/cn";

export interface LoginFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (input: LoginInput) => Promise<void> | void;
}

export function LoginForm({ loading, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("AdminPassword123!");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit({ email: email.trim(), password });
  };

  const isAdminSelected = email.trim().toLowerCase() === "admin@example.com";
  const isMemberSelected = email.trim().toLowerCase() === "member@example.com";

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_24px_60px_rgba(9,9,11,0.08)] md:grid-cols-12">
      <div className="flex flex-col justify-between border-b border-[var(--color-border)] bg-[var(--color-muted)]/65 p-8 md:col-span-5 md:border-r md:border-b-0">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">ai-native-react-nest</span>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <Badge variant="accent" className="w-fit">
              Track A · shadcn/ui SaaS
            </Badge>
            <h1 className="text-2xl font-semibold leading-snug tracking-tight">
              Release Approval Workbench
            </h1>
            <p className="text-xs leading-relaxed text-[var(--color-muted-foreground)]">
              End-to-end Spec 0006 demo featuring SemVer contracts, RBAC approval gates, and
              single-source brand presets.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <BrandPresetSwitcher />
          <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted-foreground)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
              <span>Admin vs Member RBAC Demo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center p-7 sm:p-10 md:col-span-7">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight">Sign in to Workspace</h2>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Switch between pre-seeded demo personas below to inspect RBAC approval controls
          </p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setEmail("admin@example.com");
              setPassword("AdminPassword123!");
            }}
            className={cn(
              "flex flex-col items-start gap-1 rounded-[var(--radius-control)] border p-3 text-left transition-all cursor-pointer",
              isAdminSelected
                ? "border-[var(--color-primary)] bg-[var(--color-accent-subtle)]"
                : "border-[var(--color-border)] bg-[var(--color-muted)]/40 hover:bg-[var(--color-muted)]",
            )}
          >
            <span className="text-xs font-semibold">Use Admin Demo</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Approve &amp; reject releases
            </span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setEmail("member@example.com");
              setPassword("MemberPassword123!");
            }}
            className={cn(
              "flex flex-col items-start gap-1 rounded-[var(--radius-control)] border p-3 text-left transition-all cursor-pointer",
              isMemberSelected
                ? "border-[var(--color-primary)] bg-[var(--color-accent-subtle)]"
                : "border-[var(--color-border)] bg-[var(--color-muted)]/40 hover:bg-[var(--color-muted)]",
            )}
          >
            <span className="text-xs font-semibold">Use Member Demo</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Submit &amp; read-only queue
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs font-medium">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-medium">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
