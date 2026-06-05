# Phase 42 — My Weddings Cards Polish

## Goal

Upgrade the wedding list cards on the dashboard home page (`/dashboard`) from plain shadcn cards to richer, more premium cards that communicate the wedding's identity at a glance: couple names prominent, date and location displayed clearly, status badge visible, and a warm champagne accent for the active/event-mode wedding.

## Why This Phase Matters

The "My Weddings" page is the organizer's home base. The current cards are functional but generic — they look like any SaaS list card. For beta couples who hand-picked WedPass, the dashboard should feel premium and warm. The couple's names should be the most prominent element, with the wedding name as supporting text.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/app/dashboard/page.tsx` — the file to update (WeddingCard component and DashboardPage)
- `src/components/shared/status-badge.tsx`
- `docs/ui_ux.md` — Section 18.1 (Organizer Dashboard)

## Dependencies

- Phase 06 complete (wedding CRUD, WeddingListItemDTO)
- Phase 35 complete (navy button variant for CTA)

## Scope

### 1. Richer WeddingCard

Replace the current plain `<Card>` with a bespoke card design. The card is a `<Link>` wrapping a styled div (not a shadcn Card component — build directly with Tailwind for more control).

Structure:
```
┌─────────────────────────────────────────┐
│  [colored accent top bar — 3px]         │
│                                         │
│  Couple Names (Playfair Display, large) │
│  Wedding name (small, muted)            │
│                                         │
│  📅 Date · 📍 Location                  │
│                                         │
│                          [Status Badge] │
└─────────────────────────────────────────┘
```

Top accent bar color by status:
- `DRAFT` — `bg-muted` (grey)
- `ACTIVE` — `bg-champagne` (champagne gold)
- `EVENT_MODE` — `bg-warning` (amber/orange)
- `COMPLETED` — `bg-success` (green)

Couple names: `font-display text-xl font-bold text-navy` (Playfair Display via `font-display` class)
Wedding name (shown below couple names if different): `text-sm text-muted-foreground`
Date and location row: `flex items-center gap-3 text-xs text-muted-foreground` with CalendarDays and MapPin icons
Status badge: right-aligned at the bottom using `flex items-center justify-between`

Card wrapper: `group relative rounded-2xl border border-border bg-white shadow-card overflow-hidden transition-shadow hover:shadow-elevated cursor-pointer`

Check `src/app/globals.css` or `tailwind.config.ts` to confirm `shadow-card` and `shadow-elevated` exist. If not, use `shadow-sm hover:shadow-md`.

### 2. "Days until" indicator for upcoming weddings

If `eventDate` is in the future, show a small pill in the card:

```tsx
function getDaysUntil(dateStr: string): number | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(dateStr)
  event.setHours(0, 0, 0, 0)
  const diff = Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
}
```

If `daysUntil` is between 1 and 90, show: `<span className="text-xs font-medium text-champagne-deep">in {daysUntil} days</span>` next to the date.

The `champagne-deep` token (`#A8843F`) was added in Phase 32 to globals.css. If it's not available as a Tailwind class, use `style={{ color: "var(--color-champagne-deep)" }}`.

### 3. "New Wedding" button

The current "New Wedding" `<Button>` in `PageHeader` uses a raw Tailwind override: `className="bg-navy hover:bg-navy/90"`. Change it to `variant="navy"` from Phase 35.

### 4. Empty State Enhancement

The current empty state uses a `<Heart>` icon with "No weddings yet" text and "Create Wedding" button. Keep the same structure but:
- Wrap the icon in a circle: `<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-champagne/15"><Heart className="size-8 text-champagne" /></div>`
- Change the `onAction` button to use `variant="navy"` (not the default which may not be visually branded)
- Add a subtext line: "Each wedding is an offline-first event — start with your guest list."

Check how `EmptyState` is implemented to see if it accepts a variant for the action button. If not, just use a direct `<Button variant="navy">` instead of relying on `EmptyState.onAction`.

## Files to Modify

- `src/app/dashboard/page.tsx` — the main changes

## Files to NOT Touch

- `src/components/shared/empty-state.tsx` (unless the button variant can be threaded through)
- Any other dashboard pages

## Implementation Tasks

1. Read `src/app/dashboard/page.tsx` in full.
2. Replace `WeddingCard` with the richer card design described above.
3. Add `getDaysUntil` helper and use it in the card.
4. Add accent top bar by status.
5. Update "New Wedding" button to `variant="navy"`.
6. Enhance empty state with champagne icon circle.
7. Run `npx tsc --noEmit` — fix all type errors.
8. Run `npm run lint` — fix all lint errors.
9. Update `PROGRESS.md`: add Phase 42 to Completed Phases, set Current Phase to 30 (returning to the main roadmap — all design gap phases are now complete).
10. Commit:
    ```
    git commit -m "feat: polish my weddings cards"
    ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

Visual checks:
- Wedding card shows couple names prominently in Playfair Display
- Top accent bar color matches status (champagne for ACTIVE, amber for EVENT_MODE)
- "in X days" pill appears for upcoming weddings (within 90 days)
- Empty state shows champagne icon circle with warm subtext

## Acceptance Criteria

- [ ] WeddingCard shows couple names in Playfair Display as the primary heading
- [ ] Top accent bar is colored by wedding status
- [ ] "Days until" pill shows for upcoming weddings
- [ ] "New Wedding" button uses `variant="navy"`
- [ ] Empty state has champagne icon circle
- [ ] TypeScript and lint pass

## Git Commit

```
feat: polish my weddings cards
```

## PROGRESS.md Update Instructions

After completing this phase:
- Add Phase 42 to Completed Phases with today's date
- Set Current Phase to 30 (all UI design gap phases 37–42 are now complete; returning to main roadmap)
- Note: "Design gap phases 37–42 complete — all UI polish done before beta"
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 42: My Weddings Cards Polish.

Before starting, read ALL of these files:
- CLAUDE.md
- src/app/dashboard/page.tsx (full read — this is the only file you modify)
- src/components/shared/status-badge.tsx
- src/components/shared/empty-state.tsx (check if it accepts a button variant prop)
- src/app/globals.css (check for shadow-card, shadow-elevated, champagne-deep)

TASK: Rewrite the WeddingCard component inside src/app/dashboard/page.tsx.

Add this helper function near the top of the file (above the WeddingCard component):

function getDaysUntil(dateStr: string): number | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(dateStr)
  event.setHours(0, 0, 0, 0)
  const diff = Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 && diff <= 90 ? diff : null
}

Add this helper for the accent bar color:

function accentBarClass(status: WeddingStatus): string {
  switch (status) {
    case "ACTIVE":     return "bg-champagne"
    case "EVENT_MODE": return "bg-warning"
    case "COMPLETED":  return "bg-success"
    default:           return "bg-muted"
  }
}

Replace the WeddingCard component with this implementation:

function WeddingCard({ wedding }: { wedding: WeddingListItemDTO }) {
  const daysUntil = wedding.eventDate ? getDaysUntil(wedding.eventDate) : null
  const displayName = wedding.coupleNames ?? wedding.name

  return (
    <Link href={`/dashboard/wedding/${wedding.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer">
        {/* Status accent bar */}
        <div className={`h-[3px] w-full ${accentBarClass(wedding.status)}`} />
        
        <div className="px-5 py-4 space-y-3">
          {/* Names */}
          <div>
            <h2 className="font-display text-xl font-bold text-navy leading-tight line-clamp-1">
              {displayName}
            </h2>
            {wedding.coupleNames && wedding.name !== wedding.coupleNames && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{wedding.name}</p>
            )}
          </div>

          {/* Date and location */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {wedding.eventDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" />
                {new Date(wedding.eventDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {daysUntil !== null && (
                  <span className="font-medium" style={{ color: "var(--color-champagne-deep, #A8843F)" }}>
                    · in {daysUntil} day{daysUntil === 1 ? "" : "s"}
                  </span>
                )}
              </span>
            )}
            {wedding.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {wedding.location}
              </span>
            )}
          </div>

          {/* Status badge */}
          <div className="flex justify-end">
            {weddingStatusBadge(wedding.status)}
          </div>
        </div>
      </div>
    </Link>
  )
}

Make sure CalendarDays and MapPin are imported from "lucide-react". They're likely already imported — check the existing imports.

Update the "New Wedding" button in PageHeader primaryAction:
  Change: className="bg-navy hover:bg-navy/90"  
  To: variant="navy"
  Remove the className override for bg-navy.

Update the empty state section. If EmptyState doesn't accept a button variant, replace it with a direct JSX block:

{weddings.length === 0 ? (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-champagne/15">
      <Heart className="size-8 text-champagne" />
    </div>
    <div className="space-y-1">
      <h3 className="font-semibold text-foreground">No weddings yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Each wedding is an offline-first event. Start with your guest list, then generate QR codes.
      </p>
    </div>
    <Button variant="navy" onClick={() => router.push("/dashboard/wedding/new")}>
      Create Wedding
    </Button>
  </div>
) : (
  ...
)}

You may need to add Plus to the lucide imports if used in the button, or keep it icon-free.

After implementing:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: add Phase 42 to Completed Phases (today's date), set Current Phase to 30, add note that design gap phases 37–42 are all complete.
4. Stage and commit:
   git add src/app/dashboard/page.tsx PROGRESS.md
   git commit -m "feat: polish my weddings cards"
```
