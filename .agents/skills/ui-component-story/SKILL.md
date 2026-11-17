---
name: ui-component-story
description: >-
  Guides building pure React components with Tailwind CSS v4, Storybook 8 CSF3 stories,
  and Vitest interaction tests in @repo/web. Activate this skill whenever creating or
  modifying UI components, pages, or design system primitives in apps/web.
---

# Pure UI Component + Storybook CSF3 Workflow

Design every React UI component so it renders deterministically in Storybook without a running backend or router.

## Steps

1. **Reuse Primitives First**: Check `apps/web/src/components/ui/` (`Button`, `Input`, `Card`, `Badge`) and semantic CSS tokens in `apps/web/src/styles/globals.css` before creating new elements. Never write inline `style={{...}}`.
2. **Keep Presentational Components Pure**:
   - Accept typed data (`@repo/contracts` types) and callbacks (`onSubmit`, `onStatusChange`, etc.) via explicit `Props` interface.
   - Keep TanStack Query hooks (`useQuery`, `useMutation`) inside companion `use-<domain>.ts` files, never inside the presentational `.tsx` component.
3. **Write CSF3 Storybook Stories (`<component>.stories.tsx`)**:
   - Type `meta` strictly with `satisfies Meta<typeof Component>` and `type Story = StoryObj<typeof meta>`.
   - Use `fn()` from `@storybook/test` for action callbacks.
   - Export stories for all relevant visual states: `Default`/`Populated`, `EmptyState`, `LoadingState`, and `ErrorState`.
4. **Write Focused Vitest Component Test (`<component>.test.tsx`)**:
   - Verify key user interactions (form submission, button clicks) and state rendering (`alert` role on error, empty state copy).
5. **Verify**: Run `./scripts/verify.sh` (and `pnpm storybook:build` when dependencies are installed) to confirm zero type or governance regressions.
