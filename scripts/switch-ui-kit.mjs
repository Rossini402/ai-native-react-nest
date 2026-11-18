#!/usr/bin/env node
/**
 * One-command UI Kit & Brand Preset switcher for new projects cloned from the mother template.
 * Usage:
 *   pnpm ui:use shadcn --preset=electric-blue
 *   pnpm ui:use antd   --preset=enterprise-navy
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const VALID_KITS = new Set(["shadcn", "antd"]);
const VALID_PRESETS = new Set(["obsidian", "electric-blue", "enterprise-navy", "emerald-forest"]);

const args = process.argv.slice(2);
const targetKit = args.find((a) => !a.startsWith("--"));
const presetArg = args.find((a) => a.startsWith("--preset="))?.split("=")[1];

if (!targetKit || !VALID_KITS.has(targetKit)) {
  process.stderr.write(
    "Usage: pnpm ui:use <shadcn|antd> [--preset=obsidian|electric-blue|enterprise-navy|emerald-forest]\n",
  );
  process.exit(1);
}

const defaultPresetForKit = targetKit === "antd" ? "enterprise-navy" : "obsidian";
const targetPreset = presetArg ?? defaultPresetForKit;

if (!VALID_PRESETS.has(targetPreset)) {
  process.stderr.write(
    `Invalid preset '${targetPreset}'. Choose one of: ${Array.from(VALID_PRESETS).join(", ")}\n`,
  );
  process.exit(1);
}

const rootDir = process.cwd();
const tokensPath = join(rootDir, "apps", "web", "src", "design-system", "tokens.ts");
const indexHtmlPath = join(rootDir, "apps", "web", "index.html");

const updatedTokens = readFileSync(tokensPath, "utf8")
  .replace(
    /export const ACTIVE_UI_KIT: UIKitTrack = "(shadcn|antd)";/,
    `export const ACTIVE_UI_KIT: UIKitTrack = "${targetKit}";`,
  )
  .replace(
    /export const DEFAULT_BRAND_PRESET: BrandPresetId = "[^"]+";/,
    `export const DEFAULT_BRAND_PRESET: BrandPresetId = "${targetPreset}";`,
  );
writeFileSync(tokensPath, updatedTokens, "utf8");

const indexHtml = readFileSync(indexHtmlPath, "utf8");
const updatedHtml = indexHtml.includes("data-brand-preset=")
  ? indexHtml.replace(/data-brand-preset="[^"]+"/, `data-brand-preset="${targetPreset}"`)
  : indexHtml.replace(
      '<html lang="zh-CN">',
      `<html lang="zh-CN" data-brand-preset="${targetPreset}">`,
    );
writeFileSync(indexHtmlPath, updatedHtml, "utf8");

if (targetKit === "antd") {
  const antdProviderPath = join(
    rootDir,
    "apps",
    "web",
    "src",
    "design-system",
    "antd-provider.tsx",
  );
  const providerSource = `import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { useBrandPreset } from "./theme-provider";
import { toAntdThemeConfig } from "./tokens";

export function AntdDesignSystemProvider({ children }: { children: ReactNode }) {
  const { presetId } = useBrandPreset();
  return <ConfigProvider theme={toAntdThemeConfig(presetId)}>{children}</ConfigProvider>;
}
`;
  writeFileSync(antdProviderPath, providerSource, "utf8");
  process.stdout.write(
    `Switched UI track to 'antd' with preset '${targetPreset}'.\nNext: run 'pnpm --filter @repo/web add antd @ant-design/icons' and wrap <App /> with <AntdDesignSystemProvider>.\n`,
  );
} else {
  process.stdout.write(
    `Switched UI track to 'shadcn' with preset '${targetPreset}'. Unified CSS variables & Radix primitives are active.\n`,
  );
}
