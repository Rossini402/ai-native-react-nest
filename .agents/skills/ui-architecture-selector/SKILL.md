---
name: ui-architecture-selector
description: >-
  Advises and configures the project's single-track UI component library (shadcn/ui vs
  Ant Design v5) and global brand/typography preset based on product domain and target
  users. Activate this skill when bootstrapping a new project from the template or when
  the user asks to choose/switch UI style, brand colors, or component libraries.
---

# Dual-Track UI Architecture & Brand Preset Selector

Never mix `shadcn/ui` and `Ant Design v5` in the same business application. At project inception, guide the user to lock **one UI track** and **one global brand preset** fed by `apps/web/src/design-system/tokens.ts`.

## 1. Decision Matrix (Recommend Based on Product & Audience)

| Product Archetype & Target Users | Recommended UI Track | Recommended Brand Preset | Rationale |
| :--- | :--- | :--- | :--- |
| **AI-Native SaaS / Developer Tools / Productivity** | `shadcn` (`Radix + CVA + Lucide`) | `obsidian` | Crisp Linear/Vercel minimal craft, full white-box JSX control |
| **Modern B2B Cloud / Collaboration / Analytics** | `shadcn` (`Radix + CVA + Lucide`) | `electric-blue` | High-clarity modern SaaS hierarchy with tactile `10px` controls |
| **Enterprise ERP / Finance / Heavy Data-Table Admin** | `antd` (`Ant Design v5 ConfigProvider`) | `enterprise-navy` | Dense `6px` enterprise controls, built-in complex `Table`/`DatePicker`/`TreeSelect` |
| **Consumer / Healthcare / Retail / Sustainability** | `shadcn` (`Radix + CVA + Lucide`) | `emerald-forest` | Warm stone canvas (`#fafaf9`) with approachable `12px` rounded surfaces |

## 2. Switching & Locking Workflow

1. Confirm the user's target audience and product density via `ask_question` if not yet stated.
2. Execute the deterministic switcher script from the repository root:
   ```sh
   # Option A: Modern SaaS / Consumer (default lightweight track)
   pnpm ui:use shadcn --preset=electric-blue

   # Option B: Heavy Enterprise Backoffice
   pnpm ui:use antd --preset=enterprise-navy
   ```
3. **If `antd` is selected**:
   - Install Ant Design packages: `pnpm --filter @repo/web add antd @ant-design/icons`
   - Wrap `<RouterProvider />` inside `apps/web/src/App.tsx` with `<AntdDesignSystemProvider>` (auto-generated at `apps/web/src/design-system/antd-provider.tsx`, which binds `toAntdThemeConfig()` from `tokens.ts`).
4. **Verify**: Run `./scripts/verify.sh` to ensure single-track purity and zero hardcoded brand color leaks.
