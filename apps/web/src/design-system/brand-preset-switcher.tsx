import { Palette } from "lucide-react";
import { cn } from "../lib/cn";
import { useBrandPreset } from "./theme-provider";
import { BRAND_PRESET_LIST, type BrandPresetId } from "./tokens";

const SWATCH_CLASS: Record<BrandPresetId, string> = {
  obsidian: "bg-[#18181b]",
  "electric-blue": "bg-[#2563eb]",
  "enterprise-navy": "bg-[#165dff]",
  "emerald-forest": "bg-[#059669]",
};

export function BrandPresetSwitcher() {
  const { presetId, setPresetId } = useBrandPreset();

  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-muted)]/60 p-2.5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)]">
        <Palette className="h-3.5 w-3.5 text-[var(--color-primary)]" />
        <span>Brand Theme Preset</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {BRAND_PRESET_LIST.map((item) => {
          const active = item.id === presetId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPresetId(item.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs font-medium transition-all cursor-pointer",
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-card)] text-[var(--color-foreground)] shadow-2xs"
                  : "border-transparent text-[var(--color-muted-foreground)] hover:bg-[var(--color-card)]/70 hover:text-[var(--color-foreground)]",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full border border-black/10",
                  SWATCH_CLASS[item.id],
                )}
              />
              <span className="truncate">{item.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
