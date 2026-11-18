import { useSyncExternalStore } from "react";
import {
  BRAND_PRESETS,
  type BrandPreset,
  type BrandPresetId,
  DEFAULT_BRAND_PRESET,
  applyBrandPresetToDocument,
} from "./tokens";

const PRESET_STORAGE_KEY = "ai_native_react_nest_brand_preset";
const listeners = new Set<() => void>();

function isBrandPresetId(val: string | null): val is BrandPresetId {
  return val !== null && Object.hasOwn(BRAND_PRESETS, val);
}

function loadInitialPreset(): BrandPresetId {
  if (typeof window === "undefined") return DEFAULT_BRAND_PRESET;
  const saved = window.localStorage.getItem(PRESET_STORAGE_KEY);
  const resolved = isBrandPresetId(saved) ? saved : DEFAULT_BRAND_PRESET;
  applyBrandPresetToDocument(resolved);
  return resolved;
}

let activePresetId: BrandPresetId = loadInitialPreset();

export const designSystemStore = {
  getPresetId(): BrandPresetId {
    return activePresetId;
  },

  setPresetId(next: BrandPresetId): void {
    activePresetId = next;
    applyBrandPresetToDocument(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PRESET_STORAGE_KEY, next);
    }
    for (const listener of listeners) {
      listener();
    }
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useBrandPreset(): {
  presetId: BrandPresetId;
  preset: BrandPreset;
  setPresetId: (id: BrandPresetId) => void;
} {
  const presetId = useSyncExternalStore(
    designSystemStore.subscribe,
    designSystemStore.getPresetId,
    () => DEFAULT_BRAND_PRESET,
  );
  return {
    presetId,
    preset: BRAND_PRESETS[presetId],
    setPresetId: designSystemStore.setPresetId,
  };
}
