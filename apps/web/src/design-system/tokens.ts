export type UIKitTrack = "shadcn" | "antd";

export type BrandPresetId = "obsidian" | "electric-blue" | "enterprise-navy" | "emerald-forest";

/**
 * Canonical single-track UI kit lock for this repository.
 * Switch deterministically via: `pnpm ui:use <shadcn|antd> --preset=<id>`
 */
export const ACTIVE_UI_KIT: UIKitTrack = "antd";
export const DEFAULT_BRAND_PRESET: BrandPresetId = "enterprise-navy";

export const FONT_STACK_SANS =
  '"Inter Variable", "Inter", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif';

export const FONT_STACK_MONO =
  '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

export interface BrandPreset {
  id: BrandPresetId;
  name: string;
  audience: string;
  recommendedKit: UIKitTrack;
  colorPrimary: string;
  colorPrimaryHover: string;
  colorPrimaryForeground: string;
  colorAccentSubtle: string;
  colorAccentText: string;
  colorBackground: string;
  colorSurface: string;
  colorMuted: string;
  colorBorder: string;
  radiusPx: number;
}

export const BRAND_PRESETS: Record<BrandPresetId, BrandPreset> = {
  obsidian: {
    id: "obsidian",
    name: "曜石极简 (Obsidian Minimal)",
    audience: "AI 产品 / 开发者工具 / 现代效率 SaaS",
    recommendedKit: "shadcn",
    colorPrimary: "#18181b",
    colorPrimaryHover: "#27272a",
    colorPrimaryForeground: "#fafafa",
    colorAccentSubtle: "#f4f4f5",
    colorAccentText: "#18181b",
    colorBackground: "#fafafa",
    colorSurface: "#ffffff",
    colorMuted: "#f4f4f5",
    colorBorder: "#e4e4e7",
    radiusPx: 10,
  },
  "electric-blue": {
    id: "electric-blue",
    name: "科技电光蓝 (Electric SaaS)",
    audience: "云原生平台 / 现代协作 SaaS / 数据分析产品",
    recommendedKit: "shadcn",
    colorPrimary: "#2563eb",
    colorPrimaryHover: "#1d4ed8",
    colorPrimaryForeground: "#ffffff",
    colorAccentSubtle: "#eff6ff",
    colorAccentText: "#1d4ed8",
    colorBackground: "#f8fafc",
    colorSurface: "#ffffff",
    colorMuted: "#f1f5f9",
    colorBorder: "#e2e8f0",
    radiusPx: 10,
  },
  "enterprise-navy": {
    id: "enterprise-navy",
    name: "企业政务蓝 (Enterprise Navy)",
    audience: "ERP / 财务风控 / 政企内管与重表格后台",
    recommendedKit: "antd",
    colorPrimary: "#165dff",
    colorPrimaryHover: "#0e42d2",
    colorPrimaryForeground: "#ffffff",
    colorAccentSubtle: "#e8f3ff",
    colorAccentText: "#0e42d2",
    colorBackground: "#f7f8fa",
    colorSurface: "#ffffff",
    colorMuted: "#f2f3f5",
    colorBorder: "#e5e6eb",
    radiusPx: 6,
  },
  "emerald-forest": {
    id: "emerald-forest",
    name: "现代森系绿 (Emerald Craft)",
    audience: "新零售商业 / 医疗健康 / 可持续发展与C端产品",
    recommendedKit: "shadcn",
    colorPrimary: "#059669",
    colorPrimaryHover: "#047857",
    colorPrimaryForeground: "#ffffff",
    colorAccentSubtle: "#ecfdf5",
    colorAccentText: "#047857",
    colorBackground: "#fafaf9",
    colorSurface: "#ffffff",
    colorMuted: "#f5f5f4",
    colorBorder: "#e7e5e4",
    radiusPx: 12,
  },
};

export const BRAND_PRESET_LIST: BrandPreset[] = Object.values(BRAND_PRESETS);

/**
 * Structural match for Ant Design v5 `ConfigProvider` `theme` prop,
 * guaranteeing 100% brand color, typography, and border-radius parity
 * when a project switches to the `antd` track.
 */
export interface AntdCompatibleThemeConfig {
  token: {
    colorPrimary: string;
    colorInfo: string;
    colorBgLayout: string;
    colorBgContainer: string;
    colorBorderSecondary: string;
    borderRadius: number;
    fontFamily: string;
    fontFamilyCode: string;
  };
}

export function toAntdThemeConfig(
  presetId: BrandPresetId = DEFAULT_BRAND_PRESET,
): AntdCompatibleThemeConfig {
  const preset = BRAND_PRESETS[presetId];
  return {
    token: {
      colorPrimary: preset.colorPrimary,
      colorInfo: preset.colorPrimary,
      colorBgLayout: preset.colorBackground,
      colorBgContainer: preset.colorSurface,
      colorBorderSecondary: preset.colorBorder,
      borderRadius: preset.radiusPx,
      fontFamily: FONT_STACK_SANS,
      fontFamilyCode: FONT_STACK_MONO,
    },
  };
}

export function applyBrandPresetToDocument(presetId: BrandPresetId): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.brandPreset = presetId;
}
