import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { useBrandPreset } from "./theme-provider";
import { toAntdThemeConfig } from "./tokens";

export function AntdDesignSystemProvider({ children }: { children: ReactNode }) {
  const { presetId } = useBrandPreset();
  return <ConfigProvider theme={toAntdThemeConfig(presetId)}>{children}</ConfigProvider>;
}
