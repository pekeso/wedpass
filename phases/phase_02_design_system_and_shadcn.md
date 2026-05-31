# Phase 02 — Tailwind, shadcn/ui, and Design Tokens

## Goal

Install and configure TailwindCSS with the WedPass design token system, install shadcn/ui and required primitives, and add the base global styles. The result is a working design system that all subsequent UI phases build on.

## Why This Phase Matters

Every UI component in WedPass depends on Tailwind tokens and shadcn/ui primitives. Getting the design system right now prevents visual inconsistency and rework in all later phases.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/ui_ux.md`
- `docs/components.md`

## Dependencies

- Phase 01 complete

## Scope

- Install TailwindCSS and configure it
- Define WedPass design tokens in Tailwind config:
  - `navy` — organizer dashboard primary
  - `champagne` — accent color
  - `ivory` — background
  - `blush` — warm accent
  - `terracotta` — warm accent
  - `success` — green for check-in confirmed
  - `warning` — amber for pending/sync
  - `danger` — red for errors
  - `sync` — blue for sync indicator
  - `offline` — gray/amber for offline state
- Install shadcn/ui
- Install required shadcn/ui components:
  - Button, Input, Label, Card, Badge, Dialog, DropdownMenu
  - Table, Tabs, Toast, Progress, Alert, Sheet, Separator, Skeleton
  - Form, Select, Checkbox, Textarea
- Install Lucide React
- Configure base global CSS
- Create a simple design token showcase page for visual verification (optional dev utility)

## Explicitly Out of Scope

- No layout components yet (Phase 03)
- No product-specific components yet
- No Prisma or backend
- No feature logic

## Implementation Tasks

1. Install TailwindCSS:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
2. Configure `tailwind.config.ts` with:
   - `content` paths covering all `src/**/*.{ts,tsx}`
   - Custom `colors` extending the default palette with WedPass tokens
   - Custom `fontFamily` — include Playfair Display for wedding headings
   - `darkMode` — set to `class` for future support if needed
3. Example token definitions in config:
   ```ts
   colors: {
     navy: { DEFAULT: '#1a2744', 50: '#e8ebf4', ... },
     champagne: { DEFAULT: '#c8a96e', light: '#e8d5b0', ... },
     ivory: { DEFAULT: '#faf8f3', dark: '#f0ece2' },
     blush: { DEFAULT: '#e8b4b8' },
     terracotta: { DEFAULT: '#c4714c' },
     success: { DEFAULT: '#16a34a', light: '#dcfce7' },
     warning: { DEFAULT: '#d97706', light: '#fef3c7' },
     danger: { DEFAULT: '#dc2626', light: '#fee2e2' },
     sync: { DEFAULT: '#2563eb', light: '#dbeafe' },
     offline: { DEFAULT: '#6b7280', light: '#f3f4f6' },
   }
   ```
4. Install and initialize shadcn/ui:
   ```bash
   npx shadcn@latest init
   ```
   - Set base color to neutral or slate
   - Set CSS variables mode
5. Install required shadcn components:
   ```bash
   npx shadcn@latest add button input label card badge dialog dropdown-menu table tabs toast progress alert sheet separator skeleton form select checkbox textarea
   ```
6. Install Lucide React:
   ```bash
   npm install lucide-react
   ```
7. Update `src/app/globals.css` with:
   - Tailwind base/components/utilities directives
   - Font imports (Google Fonts or local): Inter for body, Playfair Display for wedding headers
   - CSS custom properties for design tokens
8. Verify styles load correctly with a simple test by updating the public landing placeholder to use Tailwind classes and a shadcn Button.

## Files and Folders Likely to Be Created or Modified

- `tailwind.config.ts`
- `postcss.config.js`
- `src/app/globals.css`
- `src/components/ui/` (populated by shadcn/ui)
- `package.json`

## Testing Requirements

- `npm run dev` — app loads with Tailwind styles applied
- `npm run build` — passes
- `npm run lint` — passes
- Visual check: shadcn Button renders correctly on landing placeholder

## Manual QA Checklist

- [ ] `http://localhost:3000` shows Tailwind styles applied
- [ ] shadcn Button component renders correctly
- [ ] Custom color tokens are accessible (e.g., `bg-navy`, `bg-champagne`, `text-ivory`)
- [ ] Playfair Display font loads for wedding headings
- [ ] No TypeScript or lint errors
- [ ] `src/components/ui/` contains shadcn primitives

## Acceptance Criteria

- [ ] Tailwind is installed and configured
- [ ] WedPass design tokens are defined
- [ ] shadcn/ui is initialized with required primitives
- [ ] Lucide React is installed
- [ ] Fonts are configured
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

## Git Commit Recommendation

```
chore: configure tailwind shadcn and design tokens
```

## PROGRESS.md Update Instructions

After completing this phase, update `PROGRESS.md`:
- Move Phase 02 to Completed Phases
- Set Current Phase to Phase 03
- Record tailwind config and shadcn components installed
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 02: Tailwind, shadcn/ui, and Design Tokens.

Before starting, read:
- CLAUDE.md
- docs/ui_ux.md
- docs/components.md

Your task is to install and configure the design system.

1. Install TailwindCSS and configure tailwind.config.ts with:
   - All content paths for src/**
   - Custom color tokens: navy, champagne, ivory, blush, terracotta, success, warning, danger, sync, offline
   - Custom fontFamily including Playfair Display and Inter
   Refer to docs/ui_ux.md for the color values and design direction.

2. Initialize shadcn/ui and install these primitives:
   button, input, label, card, badge, dialog, dropdown-menu, table, tabs, toast, progress, alert, sheet, separator, skeleton, form, select, checkbox, textarea

3. Install lucide-react.

4. Update src/app/globals.css with Tailwind directives and font setup.

5. Apply a few Tailwind classes and use a shadcn Button on the public landing placeholder to visually confirm styles work.

Do NOT:
- Build layout components (that is Phase 03)
- Add any feature logic
- Add API routes or Prisma

After completing:
- Run npm run build — must pass
- Run npm run lint — must pass

Update PROGRESS.md: Phase 02 completed, Current Phase → Phase 03.

Commit with:
git commit -m "chore: configure tailwind shadcn and design tokens"

Report: what was installed, token definitions added, confirmation that build and lint pass.
```
