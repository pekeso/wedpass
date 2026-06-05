# Phase 34 — Organizer Dashboard Rich Layout

## Goal

Replace the current dashboard's placeholder navigation-link card grid with the design-spec information panels: an event readiness card, a staff devices card, a sync status card, and a recent memories thumbnail strip. All data comes from existing API endpoints built in earlier phases.

## Why This Phase Matters

The approved design shows three rows of information below the four stat cards. The current implementation shows a grid of clickable nav links instead — a temporary scaffold that was never replaced. The design's panels surface the most operationally important data (are devices ready? how many check-ins are pending sync? any new photos?) without the organizer navigating away. This closes the largest functional gap in the organizer dashboard.

## Documents to Read Before Starting

- `CLAUDE.md`
- `src/app/dashboard/wedding/[weddingId]/page.tsx` — the file to heavily modify
- `src/lib/api/event-mode-client.ts` — `getEventModeReadiness` function signature
- `src/lib/api/staff-client.ts` — `listStaffDevices` function signature
- `src/lib/api/media-client.ts` — `listOrganizerMedia` function signature
- Phase 18, 10, 24 completion notes in PROGRESS.md — understand what each API returns

## Dependencies

- Phase 10 complete (staff devices API)
- Phase 11 complete (event readiness API)
- Phase 18 complete (event day status)
- Phase 20 complete (stats API returns `pendingGuests`, `lastSyncAt`)
- Phase 24 complete (organizer media API)

## Scope

### 1. Remove the navigation link card grid

In `src/app/dashboard/wedding/[weddingId]/page.tsx`, remove the `NAV_LINKS` array and the `<div className="grid gap-3 ...">` block that renders nav link cards. This was a placeholder that is not in the design.

The four stat cards and `PageHeader` remain as is.

### 2. Create four new dashboard panel components

Create these small, focused components in `src/components/wedding/`:

---

#### `src/components/wedding/dashboard-readiness-card.tsx`

Fetches `GET /api/v1/weddings/[weddingId]/event-mode/readiness` using `getEventModeReadiness` from `src/lib/api/event-mode-client.ts`.

Shows:
- Eyebrow text: "Event readiness" (small caps, champagne-deep colour)
- Large percentage number (count of passing checks / total checks × 100, rounded)
- A linear progress bar using the existing `<Progress>` shadcn component, coloured with `bg-success` fill
- Up to 4 checklist rows (icon: checkmark for done, gold dot for pending; label text)
- A "Complete setup →" button/link that goes to `./event-mode` — only shown when `pct < 100`

When all checks pass, show a green "Ready for event day ✓" heading instead of the percentage.

Loading state: render a `<Skeleton>` placeholder matching the card height.
Error state: render nothing (silent fail — this is supplementary info).

Props: `weddingId: string`, `accessToken: string`

---

#### `src/components/wedding/dashboard-staff-devices-card.tsx`

Fetches `GET /api/v1/weddings/[weddingId]/staff/devices` using `listStaffDevices` from `src/lib/api/staff-client.ts`.

Shows:
- Eyebrow: "Staff devices"
- A badge: "N of N ready" — warning variant if any devices are not ACTIVE with a snapshot downloaded, success variant if all ready
- A list of up to 4 devices, each row showing:
  - Phone icon in a small ivory-dark rounded box
  - Device label (truncated)
  - Status text: "Ready" (green), "Pending sync (N)" (amber), or "Not prepared" (grey)
  - A coloured dot on the right
- A "Manage devices →" link to `./staff`

Device ready = status is `ACTIVE`. Determine readiness from the `status` field on each device. The API response shape comes from `src/modules/staff/staff.dto.ts` — read that file to confirm field names.

Loading: `<Skeleton>` rows.
Error / empty: "No staff devices created yet" with a link to `./staff`.

Props: `weddingId: string`, `accessToken: string`

---

#### `src/components/wedding/dashboard-sync-card.tsx`

Uses the stats already fetched by the parent page (passed as props — no extra fetch).

Shows on a navy background (`bg-navy text-white`):
- Eyebrow: "Sync status" (gold / champagne coloured)
- Last sync time: "Last sync X min ago" or "Never synced" — format the `lastSyncAt` ISO string to a relative label
- Two big numbers side by side:
  - `checkedInGuests` — label "Synced"
  - `pendingGuests` — label "Pending on devices" — rendered in champagne/gold colour when > 0
- A small caption: "Some devices may have unsynced check-ins. Final numbers update after sync."

This component is purely presentational. Props:

```ts
interface DashboardSyncCardProps {
  checkedInGuests: number
  pendingGuests: number
  lastSyncAt: string | null
}
```

---

#### `src/components/wedding/dashboard-media-thumbnails.tsx`

Fetches `GET /api/v1/weddings/[weddingId]/media?pageSize=4` using `listOrganizerMedia` from `src/lib/api/media-client.ts`.

Shows:
- Eyebrow: "Recent memories"
- A 2×2 grid of media thumbnails (aspect ratio 1:1, `rounded-lg overflow-hidden`). Use `next/image` with `unoptimized` for R2 URLs. For videos show a play icon overlay.
- A caption: "N uploads · M awaiting review" (awaiting = status UPLOADED, not yet APPROVED)
- A "Moderate →" link to `./gallery`

Empty state: "No uploads yet" with a note that guests can upload via the public link.
Loading: 4 `<Skeleton>` squares.
Error: silent fail.

Props: `weddingId: string`, `accessToken: string`

### 3. Assemble the new dashboard layout

Replace the removed nav-link grid in the page with three rows:

**Row 1** — `<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">`
- `<DashboardReadinessCard weddingId={weddingId} accessToken={accessToken!} />`
- `<DashboardStaffDevicesCard weddingId={weddingId} accessToken={accessToken!} />`

**Row 2** — `<div className="grid grid-cols-1 gap-4 md:grid-cols-2">`
- `<DashboardSyncCard checkedInGuests={statsData?.checkedInGuests ?? 0} pendingGuests={statsData?.pendingGuests ?? 0} lastSyncAt={statsData?.lastSyncAt ?? null} />`
- `<DashboardMediaThumbnails weddingId={weddingId} accessToken={accessToken!} />`

Wrap both rows in a `<div className="space-y-4">`.

The page already calls `useAuthStore` — use the same `accessToken` that is already present.

## Files to Create

- `src/components/wedding/dashboard-readiness-card.tsx`
- `src/components/wedding/dashboard-staff-devices-card.tsx`
- `src/components/wedding/dashboard-sync-card.tsx`
- `src/components/wedding/dashboard-media-thumbnails.tsx`

## Files to Modify

- `src/app/dashboard/wedding/[weddingId]/page.tsx`

## Explicitly Out of Scope

- No new API endpoints — all data comes from existing endpoints
- No changes to stats, guest, or media modules
- No real-time updates (polling is fine via TanStack Query `refetchInterval`)
- The stat cards row stays exactly as is

## Implementation Tasks

1. Read `src/lib/api/event-mode-client.ts`, `src/lib/api/staff-client.ts`, `src/lib/api/media-client.ts`, and `src/modules/staff/staff.dto.ts` to confirm exact function signatures and response shapes.
2. Create `dashboard-readiness-card.tsx` — use TanStack Query `useQuery` with `queryKey: ["event-readiness", weddingId]`.
3. Create `dashboard-staff-devices-card.tsx` — use `useQuery` with `queryKey: ["staff-devices", weddingId]`.
4. Create `dashboard-sync-card.tsx` — purely presentational, no fetch.
5. Create `dashboard-media-thumbnails.tsx` — use `useQuery` with `queryKey: ["media-thumbnails", weddingId]`.
6. Update `page.tsx`: remove `NAV_LINKS` array and nav-link card grid; add the two new rows.
7. Run `npx tsc --noEmit` — fix all type errors.
8. Run `npm run lint` — fix all lint errors.
9. Update `PROGRESS.md`: move Phase 34 to Completed Phases, set Current Phase to Phase 35, record today's date.
10. Commit:
    ```
    git commit -m "feat: replace nav-link grid with rich dashboard panels"
    ```

## Testing Requirements

```bash
npx tsc --noEmit   # zero errors
npm run lint       # zero errors
```

## Acceptance Criteria

- [ ] Nav-link card grid is removed from the dashboard
- [ ] Event Readiness card renders with progress bar and checklist
- [ ] Staff Devices card renders device list with status indicators
- [ ] Sync Status card renders on a navy background with pending/synced counts
- [ ] Recent Memories thumbnails render (or show empty state)
- [ ] All four new components have loading and empty states
- [ ] TypeScript and lint pass

## Git Commit

```
feat: replace nav-link grid with rich dashboard panels
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 34 to Completed Phases with today's date
- Set Current Phase to Phase 35
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 34: Organizer Dashboard Rich Layout.

Before starting, read:
- CLAUDE.md
- src/app/dashboard/wedding/[weddingId]/page.tsx  (the file to modify)
- src/lib/api/event-mode-client.ts  (getEventModeReadiness signature)
- src/lib/api/staff-client.ts  (listStaffDevices signature)
- src/lib/api/media-client.ts  (listOrganizerMedia signature)
- src/modules/staff/staff.dto.ts  (StaffDeviceDTO fields)

Your task is to remove the placeholder nav-link cards and replace them with four information panels matching the approved design.

STEP 1 — Remove the NAV_LINKS grid from page.tsx.
Find the NAV_LINKS array definition and the <div> that maps over it to render link cards. Delete both. The PageHeader, stat cards row, and lastSyncAt text below it stay as is.

STEP 2 — Create four new "use client" components in src/components/wedding/:

A) dashboard-readiness-card.tsx
   Props: weddingId: string, accessToken: string
   useQuery({ queryKey: ["event-readiness", weddingId], queryFn: () => getEventModeReadiness(weddingId, accessToken) })
   Show:
     - Eyebrow: "Event readiness" in small caps champagne-deep colour
     - If loading: <Skeleton className="h-32 w-full" />
     - If data: compute pct = Math.round(passing / total * 100)
       - Large number: pct% in navy bold
       - Progress bar (<Progress value={pct} className="h-2" />)
       - List of up to 4 checklist items: green checkmark for passing, amber dot for failing. Show label text.
       - If pct < 100: link to "./event-mode" with text "Complete setup →"
       - If pct === 100: green "Ready for event day ✓" badge instead

B) dashboard-staff-devices-card.tsx
   Props: weddingId: string, accessToken: string
   useQuery({ queryKey: ["staff-devices", weddingId], queryFn: () => listStaffDevices(weddingId, accessToken) })
   Show:
     - Eyebrow: "Staff devices"
     - Badge: "N of N ready" — count devices where status === "ACTIVE" as "ready"
     - Up to 4 device rows: phone icon in ivory-dark rounded box, label text (truncated), status text + coloured dot
       Status "ACTIVE" = "Ready" green; any other status = "Not prepared" grey
     - "Manage devices →" link to "./staff"
     - Empty state if no devices: "No staff devices yet" with link to ./staff

C) dashboard-sync-card.tsx
   Props: checkedInGuests: number, pendingGuests: number, lastSyncAt: string | null
   Purely presentational — no fetch.
   Render on bg-navy text-white rounded-xl p-5:
     - Eyebrow in champagne colour: "Sync status"
     - Last sync line: if lastSyncAt format as relative ("2 min ago") else "Never synced"
     - Two numbers side by side with gap-6:
       checkedInGuests in white, label "Synced" in white/60
       pendingGuests in champagne (when > 0) or white (when 0), label "Pending on devices" in white/60
     - Caption: "Some devices may have unsynced check-ins. Final numbers update after sync." in white/65 text-sm

D) dashboard-media-thumbnails.tsx
   Props: weddingId: string, accessToken: string
   useQuery({ queryKey: ["media-thumbnails", weddingId], queryFn: () => listOrganizerMedia(weddingId, accessToken, { pageSize: 4 }) })
   Show:
     - Eyebrow: "Recent memories"
     - If loading: 4 <Skeleton> squares in 2x2 grid
     - If data with items: 2x2 grid (grid-cols-2 gap-2), each item:
       Aspect ratio 1, rounded-lg overflow-hidden, <img src={item.fileUrl} alt="memory" className="size-full object-cover" />
       For VIDEO items overlay a play icon (lucide Play, size-6 text-white, absolute centered)
     - Caption: `${total} uploads · ${awaitingReview} awaiting review` where awaitingReview = items with status UPLOADED
     - "Moderate →" link to "./gallery"
     - Empty state: "No uploads yet — share the guest upload link"

STEP 3 — Update page.tsx.
Below the stat cards row and the lastSyncAt line, add:

  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <DashboardReadinessCard weddingId={weddingId} accessToken={accessToken!} />
      <DashboardStaffDevicesCard weddingId={weddingId} accessToken={accessToken!} />
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DashboardSyncCard
        checkedInGuests={statsData?.checkedInGuests ?? 0}
        pendingGuests={statsData?.pendingGuests ?? 0}
        lastSyncAt={statsData?.lastSyncAt ?? null}
      />
      <DashboardMediaThumbnails weddingId={weddingId} accessToken={accessToken!} />
    </div>
  </div>

Import all four components at the top of page.tsx.

After all changes:
1. Run: npx tsc --noEmit — fix all type errors.
2. Run: npm run lint — fix all lint errors.
3. Update PROGRESS.md: Phase 34 to Completed Phases (today's date), Current Phase → Phase 35.
4. Stage and commit:
   git add src/components/wedding/dashboard-readiness-card.tsx src/components/wedding/dashboard-staff-devices-card.tsx src/components/wedding/dashboard-sync-card.tsx src/components/wedding/dashboard-media-thumbnails.tsx src/app/dashboard/wedding/[weddingId]/page.tsx PROGRESS.md
   git commit -m "feat: replace nav-link grid with rich dashboard panels"
```
