# Phase 33 — Sidebar Gold Active State and User Profile Card

## Goal

Polish the organizer sidebar with the design-spec gold-tinted active navigation highlight and a user profile card pinned at the bottom.

## Why This Phase Matters

The sidebar is visible on every organizer screen. Currently the active nav item uses a neutral white/10 highlight that reads as generic. The approved design uses a warm gold-tinted background with gold text for the active item — a small but signature detail that makes the brand feel intentional. The user profile card at the bottom (gold avatar + name + role) ties the session to the organiser and is present on every screen in the design.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/components/layout/app-sidebar.tsx` — the file to modify
- `src/stores/auth-store.ts` — `useAuthStore` provides `user.name` and `user.email`
- Phase 32 completion — `src/components/shared/wedpass-wordmark.tsx` must exist

## Dependencies

- Phase 32 complete (WedPass wordmark component exists)
- Phase 05 complete (auth store has `user` with `name` and `email`)

## Scope

All changes are in `src/components/layout/app-sidebar.tsx`.

### 1. Active navigation state — gold tint

**Before:** active item has `bg-white/10 font-medium text-white`

**After:** active item has `bg-champagne/15 font-semibold text-champagne`

Inactive items remain `text-white/70 hover:bg-white/5 hover:text-white`.

In Tailwind v4 with the `--color-champagne` token defined, `bg-champagne/15` and `text-champagne` should resolve correctly. If the `/15` opacity shorthand does not work with the custom token in v4, use the inline style `backgroundColor: "rgba(200,164,93,0.16)"` with `color: "var(--color-champagne)"` for the active item only.

### 2. Navigation label renames

Update the `getNavItems` function label strings:

| Current label | New label |
|---|---|
| `"Gallery"` | `"Memories"` |
| `"Staff Access"` | `"Staff Devices"` |

All other labels (`"Dashboard"`, `"Guests"`, `"QR Codes"`, `"Event Mode"`, `"Check-Ins"`, `"Settings"`) remain unchanged.

### 3. User profile card — bottom of sidebar

Read `user` from `useAuthStore`. The sidebar is already `"use client"` so the hook call is straightforward.

Add the following as the last element inside `<aside>`, after `</nav>`:

```tsx
{user && (
  <div className="mt-auto pt-3">
    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2.5">
      {/* Gold avatar with initials */}
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-navy"
        style={{ background: "var(--color-champagne)" }}
      >
        {getInitials(user.name)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold leading-tight text-white">
          {user.name}
        </div>
        <div className="text-[11px] leading-tight text-white/55">Organizer</div>
      </div>
    </div>
  </div>
)}
```

Add a small helper above the component:

```ts
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
```

The `useAuthStore` already exposes `user` — check whether it has `name` and `email` fields. If the field is `fullName` or similar, adjust accordingly by reading `src/stores/auth-store.ts` before editing.

### 4. Sidebar flex layout

Ensure the `<aside>` uses `flex flex-col` and the `<nav>` does not have `flex-1` that would prevent the profile card from being pushed to the bottom. The profile card's wrapper uses `mt-auto` to push it down. Confirm the `<aside>` has `h-full` or `min-h-screen` so there is enough height for `mt-auto` to work. In the current layout the sidebar is inside a flex row whose sibling is the main content — it should already have full viewport height.

## Files to Modify

- `src/components/layout/app-sidebar.tsx`

## Explicitly Out of Scope

- No changes to routing, API, or auth logic
- No changes to the staff or guest sidebars
- No bilingual changes to the nav labels (that is a i18n concern handled separately)

## Implementation Tasks

1. Read `src/stores/auth-store.ts` to confirm the exact field names on the `user` object.
2. Update active nav item classes: replace `bg-white/10 font-medium text-white` with gold-tinted classes (see above).
3. Rename "Gallery" → "Memories" and "Staff Access" → "Staff Devices" in `getNavItems`.
4. Add `getInitials` helper function.
5. Add user profile card block after `</nav>` inside `<aside>`.
6. Run `npx tsc --noEmit` — fix any type errors.
7. Run `npm run lint` — fix any lint errors.
8. Update `PROGRESS.md`: move Phase 33 to Completed Phases, set Current Phase to Phase 34, record today's date.
9. Commit:
   ```
   git commit -m "feat: gold active nav state and user profile card in sidebar"
   ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual: open the organizer dashboard — the active nav item should glow gold, inactive items dim white. A user card should appear at the bottom of the sidebar showing initials in a gold circle, organizer's name, and "Organizer" role text.

## Acceptance Criteria

- [ ] Active nav item renders with gold tint background and gold text
- [ ] "Gallery" is labelled "Memories" in the sidebar
- [ ] "Staff Access" is labelled "Staff Devices" in the sidebar
- [ ] User profile card renders at the bottom of the sidebar when logged in
- [ ] TypeScript and lint pass

## Git Commit

```
feat: gold active nav state and user profile card in sidebar
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 33 to Completed Phases with today's date
- Set Current Phase to Phase 34
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 33: Sidebar Gold Active State and User Profile Card.

Before starting, read:
- CLAUDE.md
- src/components/layout/app-sidebar.tsx
- src/stores/auth-store.ts  (check exact user object field names)

Your task is to polish the organizer sidebar with three changes:

CHANGE 1 — Gold active state.
In the nav Link, find the active className that currently contains "bg-white/10 font-medium text-white".
Replace it with:  bg-champagne/15 font-semibold text-champagne
(In Tailwind v4 bg-champagne/15 uses the --color-champagne token with 15% opacity. If this doesn't compile, use style={{ backgroundColor: "rgba(200,164,93,0.16)", color: "var(--color-champagne)" }} inline on the active Link only.)
Inactive items keep: text-white/70 hover:bg-white/5 hover:text-white

CHANGE 2 — Rename two nav labels.
In getNavItems (or wherever labels are defined):
  "Gallery"      →  "Memories"
  "Staff Access" →  "Staff Devices"

CHANGE 3 — User profile card at bottom of sidebar.
Add a helper function above the component:
  function getInitials(name: string): string {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  }

Read src/stores/auth-store.ts to find the exact field name for the logged-in user's full name (likely "name" or "fullName"). Use that field below.

Inside <aside>, after </nav> and before </aside>, add:
  {user && (
    <div className="mt-auto pt-3">
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2.5">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-navy"
          style={{ background: "var(--color-champagne)" }}
        >
          {getInitials(user.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold leading-tight text-white">
            {user.name}
          </div>
          <div className="text-[11px] leading-tight text-white/55">Organizer</div>
        </div>
      </div>
    </div>
  )}

The sidebar already uses "use client" and reads from useAuthStore — get user from useAuthStore() at the top of the component.

After all changes:
1. Run: npx tsc --noEmit — fix all type errors before continuing.
2. Run: npm run lint — fix all lint errors before continuing.
3. Update PROGRESS.md:
   - Move Phase 33 to Completed Phases with today's date
   - Set Current Phase to Phase 34
   - Set Last Updated to today's date
   - Add Phase 33 completion entry
4. Stage and commit:
   git add src/components/layout/app-sidebar.tsx PROGRESS.md
   git commit -m "feat: gold active nav state and user profile card in sidebar"
```
