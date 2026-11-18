---
name: ui-component-story
description: >-
  Guides building high-craft React UI components with unified design tokens, active
  UI kit discipline (shadcn/ui or Ant Design v5), Storybook 8 CSF3 stories, and Vitest
  interaction tests in @repo/web. Activate this skill whenever creating or modifying UI
  components or pages in apps/web.
---

# Unified Design-System Component + Storybook Workflow

Ensure 100% global brand color, font, and radius consistency across the entire frontend.

## 1. Global Token & Single-Track Rules

1. **Check Active UI Track First**: Read `ACTIVE_UI_KIT` in `apps/web/src/design-system/tokens.ts`:
   - When `ACTIVE_UI_KIT === "shadcn"`: Compose from `apps/web/src/components/ui/` (`Button`, `Input`, `Select`, `Tabs`, `Card`, `Badge`, `MetricCard`, `EmptyState`) and `lucide-react` icons. Pull additional primitives via `pnpm dlx shadcn@latest add <component>` if needed.
   - When `ACTIVE_UI_KIT === "antd"`: Compose from `antd` components governed by `<AntdDesignSystemProvider>` (`toAntdThemeConfig`). Never mix `antd` and `@radix-ui/*` in `src/features/`.
2. **Zero Hardcoded Brand Colors**:
   - NEVER write `bg-indigo-*`, `bg-blue-*`, `text-violet-*`, etc. inside `src/components/` or `src/features/` (`check-governance.sh` blocks this!).
   - Always bind brand emphasis to semantic CSS variables: `bg-[var(--color-primary)]`, `text-[var(--color-primary)]`, `bg-[var(--color-accent-subtle)]`, `rounded-[var(--radius-control)]`, `rounded-[var(--radius-card)]`.
   - Semantic status feedback (`emerald` for success, `amber` for warning, `rose` for error) is permitted exclusively for status badges and alerts.
3. **Typography & Spatial Craft**:
   - Body text uses bundled `Inter Variable` + CJK stack; numeric KPIs (`tabular-nums`), versions, and IDs use bundled `JetBrains Mono Variable` (`font-mono`).
   - Pair creation forms and data queues in a 12-column asymmetric split (`lg:grid-cols-12`) with a top 3-column `MetricCard` summary strip.

## 2. Verification Steps

1. Keep every `.tsx` file `<= 250` lines and pure (props in, callbacks out; keep `useQuery`/`useMutation` in `use-<domain>.ts`).
2. Add CSF3 `*.stories.tsx` covering `Populated`, `EmptyState`, `LoadingState`, and `ErrorState`.
3. Add `*.test.tsx` with `afterEach(cleanup)` and run `./scripts/verify.sh`.
