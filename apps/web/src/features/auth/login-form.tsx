import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import type { LoginInput } from "@repo/contracts";
import { Alert, Button, Card, Input, Space, Tag, Typography } from "antd";
import { type FormEvent, useState } from "react";
import { BrandPresetSwitcher } from "../../design-system/brand-preset-switcher";

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

  return (
    <Card className="mx-auto w-full max-w-4xl overflow-hidden p-0 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="flex flex-col justify-between border-b border-[var(--color-border)] bg-[var(--color-muted)]/70 p-7 md:col-span-5 md:border-r md:border-b-0">
          <div className="flex flex-col gap-4">
            <Space>
              <SafetyCertificateOutlined className="text-lg text-[var(--color-primary)]" />
              <Typography.Text strong>ai-native-react-nest</Typography.Text>
            </Space>
            <div>
              <Tag color="processing" className="mb-2">
                Track B · Ant Design v5 Enterprise
              </Tag>
              <Typography.Title level={4} className="m-0">
                Enterprise Change &amp; Release Governance
              </Typography.Title>
              <Typography.Paragraph type="secondary" className="mt-2 mb-0 text-xs">
                Powered by the exact same Zod contracts, NestJS RBAC backend, and unified brand
                tokens as Track A, rendered in high-density Ant Design v5 tables and drawers.
              </Typography.Paragraph>
            </div>
          </div>

          <div className="mt-6">
            <BrandPresetSwitcher />
          </div>
        </div>

        <div className="p-7 sm:p-9 md:col-span-7">
          <Typography.Title level={4} className="m-0">
            Sign in to Admin Console
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="mt-1 mb-4 text-xs">
            Select a pre-configured RBAC account to inspect enterprise table permissions
          </Typography.Paragraph>

          <Space wrap className="mb-5">
            <Button
              size="small"
              type={email === "admin@example.com" ? "primary" : "default"}
              disabled={loading}
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("AdminPassword123!");
              }}
            >
              Use Admin Demo
            </Button>
            <Button
              size="small"
              type={email === "member@example.com" ? "primary" : "default"}
              disabled={loading}
              onClick={() => {
                setEmail("member@example.com");
                setPassword("MemberPassword123!");
              }}
            >
              Use Member Demo
            </Button>
          </Space>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="login-email" className="text-xs font-medium">
                Email
              </label>
              <Input
                id="login-email"
                prefix={<UserOutlined />}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-xs font-medium">
                Password
              </label>
              <Input
                id="login-password"
                prefix={<LockOutlined />}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <Alert role="alert" type="error" showIcon message={error} />}

            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
