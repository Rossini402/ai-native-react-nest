import { SendOutlined } from "@ant-design/icons";
import {
  type CreateReleaseInput,
  CreateReleaseInputSchema,
  type ReleaseEnvironment,
  type ReleaseRiskLevel,
} from "@repo/contracts";
import { Alert, Button, Card, Input, Segmented } from "antd";
import { type FormEvent, useState } from "react";

export interface ReleaseCreateFormProps {
  disabled?: boolean;
  onSubmit: (input: CreateReleaseInput) => Promise<void> | void;
}

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
        .then(() => resetFields())
        .catch(() => undefined)
        .finally(() => setIsSubmitting(false));
      return;
    }
    resetFields();
  };

  const formDisabled = disabled || isSubmitting;

  return (
    <Card size="small" title="Submit Release Order">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="flex flex-col gap-1 md:col-span-3">
          <label htmlFor="release-service-name" className="text-xs font-medium">
            Service Name
          </label>
          <Input
            id="release-service-name"
            placeholder="checkout-api"
            maxLength={60}
            disabled={formDisabled}
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="release-version" className="text-xs font-medium">
            Version (SemVer)
          </label>
          <Input
            id="release-version"
            placeholder="v1.4.2"
            disabled={formDisabled}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-3">
          <span className="text-xs font-medium">Environment</span>
          <Segmented<ReleaseEnvironment>
            block
            disabled={formDisabled}
            value={environment}
            onChange={(val) => setEnvironment(val)}
            options={[
              { label: "Staging", value: "staging" },
              { label: "Production", value: "production" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-4">
          <span className="text-xs font-medium">Risk Assessment</span>
          <Segmented<ReleaseRiskLevel>
            block
            disabled={formDisabled}
            value={riskLevel}
            onChange={(val) => setRiskLevel(val)}
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-9">
          <label htmlFor="release-changelog" className="text-xs font-medium">
            Changelog &amp; Rollback Plan
          </label>
          <Input
            id="release-changelog"
            placeholder="Describe DB migrations, feature flags, and verification steps..."
            maxLength={500}
            disabled={formDisabled}
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
          />
        </div>

        <div className="flex items-end md:col-span-3">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={isSubmitting}
            disabled={formDisabled}
            block
          >
            Submit Release Request
          </Button>
        </div>

        {validationError && (
          <div className="md:col-span-12">
            <Alert role="alert" type="error" showIcon message={validationError} />
          </div>
        )}
      </form>
    </Card>
  );
}
