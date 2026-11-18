import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BrandPresetSwitcher } from "./brand-preset-switcher";
import { useBrandPreset } from "./theme-provider";
import { toAntdThemeConfig } from "./tokens";

function DesignSystemGallery() {
  const { preset } = useBrandPreset();
  const antdPreview = toAntdThemeConfig(preset.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <BrandPresetSwitcher />
        </div>
        <Card className="md:col-span-7">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{preset.name}</CardTitle>
              <Badge variant="accent">Recommended: {preset.recommendedKit}</Badge>
            </div>
            <CardDescription>{preset.audience}</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-[var(--color-muted-foreground)]">
            <code>
              primary={preset.colorPrimary} · radius={preset.radiusPx}px · antdToken.colorPrimary=
              {antdPreview.token.colorPrimary}
            </code>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unified Primitives Preview</CardTitle>
          <CardDescription>
            Every button, input, tab, select, and badge updates synchronously with zero hardcoded
            color classes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="accent" dot>
              Brand Accent
            </Badge>
            <Badge variant="success" dot>
              Approved
            </Badge>
            <Badge variant="warning" dot>
              Pending
            </Badge>
            <Badge variant="destructive" dot>
              Rejected
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="Inter Variable + PingFang CJK typography..." />
            <Select defaultValue="shadcn">
              <SelectTrigger aria-label="UI Track">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shadcn">Track A: shadcn/ui (Modern SaaS)</SelectItem>
                <SelectItem value="antd">Track B: Ant Design v5 (Enterprise Admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tokens">Semantic Tokens</TabsTrigger>
              <TabsTrigger value="typography">JetBrains Mono: v2.4.0</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const meta = {
  title: "DesignSystem/BrandPresetsAndTokens",
  component: DesignSystemGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof DesignSystemGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveSwitcher: Story = {};
