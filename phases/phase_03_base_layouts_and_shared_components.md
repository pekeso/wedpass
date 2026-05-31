# Phase 03 — Base Layouts and Shared Components

## Goal

Build the reusable layout shells and shared UI components that all feature phases will use. No feature logic — only presentational and structural components.

## Why This Phase Matters

Consistent, reusable components prevent duplication and enable faster feature phases. Getting the layout shells right ensures a professional, mobile-first appearance from the first feature implemented.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/components.md`
- `docs/ui_ux.md`
- `docs/routes.md`

## Dependencies

- Phase 02 complete (design system and shadcn installed)

## Scope

### Layout Components

- `PublicLayout` — header + footer for landing, login, register pages
- `DashboardLayout` — sidebar + header for organizer dashboard
- `StaffLayout` — mobile-first shell for staff event mode screens (always shows sync status bar placeholder)
- `GuestLayout` — warm, minimal shell for guest-facing pages

### Shared Components

- `PageHeader` — title, subtitle, optional breadcrumb
- `SectionCard` — content section with optional title and description
- `StatCard` — shows a number label and trend indicator
- `StatusBadge` — renders colored badges for statuses (DRAFT, ACTIVE, EVENT_MODE, etc.)
- `EmptyState` — shows an icon, message, and optional CTA when a list is empty
- `ConfirmDialog` — wraps shadcn Dialog for destructive action confirmations
- `LoadingState` — full-page or inline spinner/skeleton
- `ErrorState` — shows an error message with optional retry
- `SyncStatusBar` — shows online/offline state, pending count, last synced time (for staff mode, props only at this stage)
- `OfflineWarningBanner` — dismissible banner shown when offline

### Navigation

- `AppSidebar` — sidebar nav for the organizer dashboard (links only, no routing logic)
- `AppHeader` — top bar with user name, logout placeholder

## Explicitly Out of Scope

- No API calls from any component
- No auth logic
- No IndexedDB
- No real data — all components use typed props or mock data

## Implementation Tasks

1. Create `src/components/layout/` with:
   - `public-layout.tsx`
   - `dashboard-layout.tsx`
   - `staff-layout.tsx`
   - `guest-layout.tsx`
2. Create `src/components/shared/` with:
   - `page-header.tsx`
   - `section-card.tsx`
   - `stat-card.tsx`
   - `status-badge.tsx`
   - `empty-state.tsx`
   - `confirm-dialog.tsx`
   - `loading-state.tsx`
   - `error-state.tsx`
   - `sync-status-bar.tsx`
   - `offline-warning-banner.tsx`
3. Create `src/components/layout/app-sidebar.tsx`
4. Create `src/components/layout/app-header.tsx`
5. Wire up layouts in `src/app/`:
   - `src/app/(public)/layout.tsx` — uses PublicLayout
   - `src/app/dashboard/layout.tsx` — uses DashboardLayout
   - Create a staff layout group if needed
6. All components must:
   - Use TypeScript typed props interfaces
   - Use shadcn/ui primitives where appropriate
   - Use Tailwind design tokens (no hardcoded hex values)
   - Be presentational (no business logic, no API calls)
   - Have sensible default props
7. `StaffLayout` must:
   - Be mobile-first (max-w for desktop, full width mobile)
   - Include placeholder `SyncStatusBar` at the top
   - Have minimum button height of `h-14`
8. Verify layouts by updating placeholder pages to use them.

## Files and Folders Likely to Be Created or Modified

- `src/components/layout/*.tsx`
- `src/components/shared/*.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/staff/[weddingId]/layout.tsx` (if applicable)

## Testing Requirements

- `npm run build` — passes
- `npm run lint` — passes
- `npx tsc --noEmit` — passes
- Visual: each layout renders on its corresponding placeholder pages

## Manual QA Checklist

- [ ] Public layout renders on `/login`, `/register`
- [ ] Dashboard layout renders on `/dashboard/wedding/new`
- [ ] Staff layout renders on `/staff/[weddingId]/login`
- [ ] Guest layout renders on `/w/[slug]`
- [ ] `SyncStatusBar` is visible in staff layout
- [ ] All components are strongly typed (no `any`)
- [ ] No hardcoded hex colors (only Tailwind tokens)
- [ ] Mobile viewport looks correct for staff layout (375px width)
- [ ] Dashboard layout has sidebar and header structure

## Acceptance Criteria

- [ ] Layout shells exist for all four experiences
- [ ] Shared UI components are built and typed
- [ ] Layouts are wired into route groups
- [ ] No business logic inside components
- [ ] Build and lint pass

## Git Commit Recommendation

```
feat: add shared layout and base components
```

## PROGRESS.md Update Instructions

After completing this phase, update `PROGRESS.md`:
- Move Phase 03 to Completed Phases
- Set Current Phase to Phase 04 and Phase 05 (can run in parallel after this)
- Record components built
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 03: Base Layouts and Shared Components.

Before starting, read:
- CLAUDE.md
- docs/components.md
- docs/ui_ux.md
- docs/routes.md

Your task is to build the reusable layout shells and shared UI components.

Build these layouts in src/components/layout/:
- public-layout.tsx — for landing, login, register pages
- dashboard-layout.tsx — sidebar + header for organizer dashboard
- staff-layout.tsx — mobile-first shell with SyncStatusBar placeholder, h-14 minimum buttons
- guest-layout.tsx — warm minimal shell for guest pages
- app-sidebar.tsx — sidebar nav links for the dashboard
- app-header.tsx — top bar with user name and logout placeholder

Build these shared components in src/components/shared/:
- page-header.tsx — title, subtitle, breadcrumb
- section-card.tsx — content section
- stat-card.tsx — stat number with label
- status-badge.tsx — colored badge for statuses (DRAFT, ACTIVE, EVENT_MODE, COMPLETED, etc.)
- empty-state.tsx — empty list state with icon and CTA
- confirm-dialog.tsx — destructive action confirmation dialog
- loading-state.tsx — spinner or skeleton
- error-state.tsx — error message with retry
- sync-status-bar.tsx — online/offline/pending state bar (props-only, no logic)
- offline-warning-banner.tsx — dismissible offline banner

Wire layouts into route group layouts:
- src/app/(public)/layout.tsx
- src/app/dashboard/layout.tsx

Rules:
- All components must be strongly typed (TypeScript interfaces for props)
- Use shadcn/ui primitives
- Use Tailwind tokens only (no hardcoded hex values)
- No API calls inside components
- No business logic inside components
- Staff layout must be mobile-first with min button height h-14

After completing:
- Run npm run build — must pass
- Run npm run lint — must pass

Update PROGRESS.md: Phase 03 completed, Current Phase → Phase 04.

Commit with:
git commit -m "feat: add shared layout and base components"

Report: list of components created, layout structure.
```
