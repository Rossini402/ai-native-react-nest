import type { Meta, StoryObj } from "@storybook/react";
import { Button, Card, Input, Segmented, Select, Space, Statistic, Tag, Typography } from "antd";
import { BrandPresetSwitcher } from "./brand-preset-switcher";
import { useBrandPreset } from "./theme-provider";
import { toAntdThemeConfig } from "./tokens";

function AntdDesignSystemGallery() {
  const { preset } = useBrandPreset();
  const antdTheme = toAntdThemeConfig(preset.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <BrandPresetSwitcher />
        </div>
        <Card size="small" className="md:col-span-7" title={preset.name}>
          <Typography.Paragraph type="secondary" className="mb-2 text-xs">
            {preset.audience}
          </Typography.Paragraph>
          <Typography.Text code>
            colorPrimary={antdTheme.token.colorPrimary} · borderRadius=
            {antdTheme.token.borderRadius}px
          </Typography.Text>
        </Card>
      </div>

      <Card title="Ant Design v5 Enterprise Primitives (Bound to Unified Tokens)">
        <div className="flex flex-col gap-4">
          <Space wrap>
            <Button type="primary">Primary Action</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button danger>Reject / Danger</Button>
          </Space>

          <Space wrap>
            <Tag color="processing">Pending Approval</Tag>
            <Tag color="success">Approved</Tag>
            <Tag color="error">Rejected</Tag>
            <Statistic title="SLA Latency (ms)" value={14.8} precision={1} />
          </Space>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="Enterprise search query..." />
            <Select
              defaultValue="production"
              options={[
                { value: "staging", label: "Target: Staging" },
                { value: "production", label: "Target: Production" },
              ]}
            />
          </div>

          <Segmented options={["All Candidates", "Pending Gate", "Approved", "Rejected"]} />
        </div>
      </Card>
    </div>
  );
}

const meta = {
  title: "DesignSystem/AntdEnterpriseTokens",
  component: AntdDesignSystemGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof AntdDesignSystemGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveSwitcher: Story = {};
