import { describe, expect, it } from "vitest";
import {
  BRAND_PRESETS,
  BRAND_PRESET_LIST,
  FONT_STACK_MONO,
  FONT_STACK_SANS,
  toAntdThemeConfig,
} from "./tokens";

describe("Design System Unified Tokens", () => {
  it("defines all 4 curated industry presets with valid hex colors and radii", () => {
    expect(BRAND_PRESET_LIST).toHaveLength(4);
    for (const preset of BRAND_PRESET_LIST) {
      expect(preset.colorPrimary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.radiusPx).toBeGreaterThanOrEqual(4);
      expect(preset.radiusPx).toBeLessThanOrEqual(16);
    }
  });

  it("maps BrandPreset losslessly into Ant Design v5 ConfigProvider SeedTokens", () => {
    const antdTheme = toAntdThemeConfig("enterprise-navy");
    expect(antdTheme.token).toEqual({
      colorPrimary: BRAND_PRESETS["enterprise-navy"].colorPrimary,
      colorInfo: BRAND_PRESETS["enterprise-navy"].colorPrimary,
      colorBgLayout: BRAND_PRESETS["enterprise-navy"].colorBackground,
      colorBgContainer: BRAND_PRESETS["enterprise-navy"].colorSurface,
      colorBorderSecondary: BRAND_PRESETS["enterprise-navy"].colorBorder,
      borderRadius: 6,
      fontFamily: FONT_STACK_SANS,
      fontFamilyCode: FONT_STACK_MONO,
    });
  });
});
