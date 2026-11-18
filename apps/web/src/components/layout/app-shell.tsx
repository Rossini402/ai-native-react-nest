import {
  CarryOutOutlined,
  DeploymentUnitOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { AuthSession } from "@repo/contracts";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Avatar, Button, Layout, Menu, Tag, Typography } from "antd";
import type { ReactNode } from "react";
import { BrandPresetSwitcher } from "../../design-system/brand-preset-switcher";
import { ACTIVE_UI_KIT } from "../../design-system/tokens";

export interface AppShellProps {
  session: AuthSession | null;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppShell({ session, onSignOut, children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="bg-dot-grid flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    );
  }

  const activeKey = location.pathname.startsWith("/releases") ? "/releases" : "/";

  return (
    <Layout className="min-h-screen">
      <Layout.Sider
        width={248}
        theme="light"
        breakpoint="md"
        collapsedWidth={0}
        className="border-r border-[var(--color-border)]"
      >
        <div className="flex h-full flex-col justify-between p-3.5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 px-2 pt-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
                <SafetyCertificateOutlined />
              </div>
              <div className="min-w-0">
                <Typography.Text strong className="block truncate text-sm">
                  ai-native-react-nest
                </Typography.Text>
                <Typography.Text type="secondary" className="font-mono text-xs">
                  kit: {ACTIVE_UI_KIT} · Enterprise
                </Typography.Text>
              </div>
            </div>

            <Menu
              mode="inline"
              selectedKeys={[activeKey]}
              onClick={({ key }) => {
                if (key === "/" || key === "/releases") {
                  void navigate({ to: key });
                }
              }}
              items={[
                {
                  key: "/",
                  icon: <CarryOutOutlined />,
                  label: "Engineering Tasks",
                },
                {
                  key: "/releases",
                  icon: <DeploymentUnitOutlined />,
                  label: "Release Governance",
                },
              ]}
            />
          </div>

          <div className="flex flex-col gap-3">
            <BrandPresetSwitcher />

            <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/50 p-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar size="small" className="shrink-0 bg-[var(--color-primary)]">
                  {session.user.email.slice(0, 2).toUpperCase()}
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{session.user.email}</div>
                  <Tag
                    color={session.user.role === "admin" ? "processing" : "default"}
                    className="m-0 mt-0.5 text-xs"
                  >
                    {session.user.role}
                  </Tag>
                </div>
              </div>
              <Button
                type="text"
                size="small"
                aria-label="Sign Out"
                icon={<LogoutOutlined />}
                onClick={onSignOut}
              />
            </div>
          </div>
        </div>
      </Layout.Sider>

      <Layout>
        <Layout.Header className="flex h-13 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-6 leading-none">
          <Typography.Text strong>Enterprise Release &amp; Change Control Center</Typography.Text>
          <Button size="small" icon={<LogoutOutlined />} onClick={onSignOut}>
            Sign Out
          </Button>
        </Layout.Header>
        <Layout.Content className="p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
