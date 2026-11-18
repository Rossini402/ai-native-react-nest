import {
  type CreateReleaseInput,
  CreateReleaseInputSchema,
  type ReleaseEnvironment,
  type ReleaseRiskLevel,
} from "@repo/contracts";
import { AlertCircle, Rocket } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/cn";

export interface ReleaseCreateFormProps {
  disabled?: boolean;
  onSubmit: (input: CreateReleaseInput) => Promise<void> | void;
}

const ENVIRONMENTS: { value: ReleaseEnvironment; label: string }[] = [
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
];

const RISK_LEVELS: { value: ReleaseRiskLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ReleaseCreateForm({ disabled = false, onSubmit }: ReleaseCreateFormProps) {
  const [serviceName, setServiceName] = useState("");
  const [version, setVersion] = useState("");
  const [environment, setEnvironment] = useState<ReleaseEnvironment>("staging");
  const [riskLevel, setRiskLevel] = useState<ReleaseRiskLevel>("medium");
  const [changelog, setChangelog] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFields = () => {
    setServiceName("");
    setVersion("");
    setChangelog("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || isSubmitting) return;
    const rawInput = { serviceName, version, environment, riskLevel, changelog };
    const parsed = CreateReleaseInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? "Invalid release request");
      return;
    }
    setValidationError(null);
    const result = onSubmit(parsed.data);
    if (result instanceof Promise) {
      setIsSubmitting(true);
      void result
        .then(() => {
          resetFields();
        })
        .catch(() => undefined)
        .finally(() => {
          setIsSubmitting(false);
        });
      return;
    }
    resetFields();
  };

  const formDisabled = disabled || isSubmitting;

  return (
    <Card aria-label="Create Release Request" className="lg:sticky lg:top-8">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent-text)]">
            <Rocket className="h-4 w-4" />
          </div>
          <CardTitle>New Release Request</CardTitle>
        </div>
        <CardDescription>
          Propose a SemVer release candidate for staging or production gate review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="release-service-name" className="text-xs font-medium">
              Service Name
            </label>
            <Input
              id="release-service-name"
              placeholder="e.g. payment-gateway"
              maxLength={60}
              disabled={formDisabled}
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="release-version" className="text-xs font-medium">
              Version (SemVer)
            </label>
            <Input
              id="release-version"
              placeholder="v1.4.2"
              disabled={formDisabled}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Target Environment</span>
            <div className="grid grid-cols-2 gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-muted)] p-1">
              {ENVIRONMENTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={formDisabled}
                  onClick={() => setEnvironment(opt.value)}
                  className={cn(
                    "rounded-md py-1.5 text-xs font-medium transition-all cursor-pointer",
                    environment === opt.value
                      ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-2xs"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Risk Level</span>
            <div className="grid grid-cols-3 gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-muted)] p-1">
              {RISK_LEVELS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={formDisabled}
                  onClick={() => setRiskLevel(opt.value)}
                  className={cn(
                    "rounded-md py-1.5 text-xs font-medium transition-all cursor-pointer",
                    riskLevel === opt.value
                      ? "bg-[var(--color-card)] text-[var(--color-foreground)] shadow-2xs"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="release-changelog" className="text-xs font-medium">
              Changelog &amp; Rollback Plan
            </label>
            <textarea
              id="release-changelog"
              rows={3}
              placeholder="Summarize scope, schema migrations, and rollback verification..."
              maxLength={500}
              disabled={formDisabled}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-2xs transition-all placeholder:text-[var(--color-muted-foreground)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-ring)] disabled:opacity-60"
            />
          </div>

          {validationError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <Button type="submit" disabled={formDisabled} className="mt-1 w-full">
            {isSubmitting ? "Submitting..." : "Submit Release Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
