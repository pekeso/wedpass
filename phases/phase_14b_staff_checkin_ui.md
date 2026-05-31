# Phase 14B — Staff Check-In UI

## Goal

Build the complete staff check-in UI: the check-in home screen, guest confirmation screen, check-in result screen, recent check-ins list, and sync status display. Connects to the local check-in service from Phase 14A and the QR scanner from Phase 13B.

## Why This Phase Matters

The staff UI is the face of WedPass on wedding day. It must be bold, fast, clear, and work under pressure. Staff will be handling a long queue of guests — the interface must show clear feedback, display sync status, and make the check-in confirmation obvious on a phone screen.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/ui_ux.md` (Staff mode UX)
- `docs/components.md`
- `docs/offline_sync.md` (Section 29–30 — Sync UI Requirements)

## Dependencies

- Phase 13A complete (local guest search)
- Phase 13B complete (QR scanner)
- Phase 14A complete (local check-in transaction)

## Scope

### Pages

- `src/app/staff/[weddingId]/checkin/page.tsx` — Check-In Home
  - Navigation buttons: "Scan QR Code" and "Search Guest" (large, h-16+)
  - `SyncStatusBar` at top (online/offline, pending count, last synced)
  - Recent check-ins list (last 5–10 local check-ins)
  - Offline mode messaging if offline

- `src/app/staff/[weddingId]/checkin/[guestId]/page.tsx` — Guest Check-In Confirmation
  - Shows guest name, phone, allowed guests count
  - "Check In" button (h-16, full width, prominent green)
  - If already checked in: shows checked-in time, "Already Checked In" state
  - "Wrong Guest?" link back to search/scan

- Check-In Result Screen (inline after action, or separate route):
  - Success: large checkmark, guest name, check-in time, "Next Guest" button
  - Already checked in: warning state with original check-in time

### Components

- `src/components/staff/guest-checkin-card.tsx` — confirmation card showing guest details
- `src/components/staff/recent-checkins-list.tsx` — shows last N check-ins from IndexedDB
- `src/components/staff/scan-action-card.tsx` — scan or search action buttons
- Update `src/components/shared/sync-status-bar.tsx` — wire up real data from `use-sync-status.ts`

### Hooks

- `src/hooks/use-recent-checkins.ts` — reads last 10 check-ins from `checkinQueue` sorted by `createdAt` desc
- `src/hooks/use-sync-status.ts` placeholder — returns `{ pendingCount, lastSyncedAt, isOnline, syncState }`

## Explicitly Out of Scope

- Actual sync trigger (Phase 15–16) — sync status shows pending count, but sync does not execute yet
- The `sync/page.tsx` detail screen (covered partially here, completed in Phase 15)

## Implementation Tasks

1. Create `src/hooks/use-recent-checkins.ts`:
   ```ts
   export function useRecentCheckins(weddingId: string, limit = 10): LocalCheckinQueueItem[]
   ```
   - Reads from `checkinQueue` ordered by `createdAt` desc
2. Create `src/hooks/use-sync-status.ts`:
   - Returns `{ pendingCount, lastSyncedAt, isOnline, syncState }`
   - `pendingCount`: count of `synced: false` items in `checkinQueue`
   - `isOnline`: from `useNetworkStatus`
   - `syncState`: `"idle" | "syncing" | "failed" | "offline"` (idle for now)
3. Wire `SyncStatusBar` to `useSyncStatus` data.
4. Create `src/components/staff/scan-action-card.tsx` — two large action buttons.
5. Create `src/components/staff/guest-checkin-card.tsx`:
   - Shows guest name (large), phone, allowed guests
   - Check-in button (h-16, green)
   - Already-checked-in state
6. Create `src/components/staff/recent-checkins-list.tsx`:
   - Maps over recent check-ins
   - Shows guest name and time (resolved from local guests store)
7. Build `src/app/staff/[weddingId]/checkin/page.tsx`:
   - Check-in home with SyncStatusBar, action cards, recent list
   - Show offline message if offline
8. Build `src/app/staff/[weddingId]/checkin/[guestId]/page.tsx`:
   - Loads guest from IndexedDB by guestId
   - Shows GuestCheckinCard
   - On "Check In": calls `checkInGuestLocally` from Phase 14A
   - Shows success/already-checked-in result
9. Build `src/app/staff/[weddingId]/sync/page.tsx` (basic version):
   - Shows pending queue count
   - Shows last synced time
   - "Sync Now" button (disabled, connects in Phase 15)

## UI Standards for Staff Mode

From `docs/ui_ux.md`:
- Large text (16px minimum for secondary, 20px+ for primary)
- Minimum button height: `h-14` (scan/check-in: `h-16`)
- High contrast
- Always-visible sync status
- Clear success/failure states

## Files and Folders Likely to Be Created or Modified

- `src/hooks/use-recent-checkins.ts`
- `src/hooks/use-sync-status.ts`
- `src/components/staff/guest-checkin-card.tsx`
- `src/components/staff/recent-checkins-list.tsx`
- `src/components/staff/scan-action-card.tsx`
- `src/components/shared/sync-status-bar.tsx` (update to use real data)
- `src/app/staff/[weddingId]/checkin/page.tsx`
- `src/app/staff/[weddingId]/checkin/[guestId]/page.tsx`
- `src/app/staff/[weddingId]/sync/page.tsx`

## Testing Requirements

Manual test — full offline check-in flow:
1. Download snapshot
2. Go offline (DevTools → Offline)
3. Open check-in home
4. Scan QR or search for guest
5. Open check-in confirmation
6. Tap "Check In"
7. Verify success screen shown
8. Verify guest is now shown as checked in in recent list
9. Verify pending count in SyncStatusBar increased
10. Refresh page — verify data persists

`npm run lint` passes
`npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Check-in home shows action buttons (scan and search)
- [ ] SyncStatusBar shows pending count and online/offline state
- [ ] From QR scan → check-in confirmation screen shows correct guest
- [ ] From search → check-in confirmation screen shows correct guest
- [ ] Check-in confirmation shows guest name prominently
- [ ] Tapping "Check In" shows success screen immediately
- [ ] Already-checked-in guest shows warning state
- [ ] Recent check-ins list updates after check-in
- [ ] Works fully offline (DevTools → Offline)
- [ ] Page refresh preserves check-in state

## Acceptance Criteria

- [ ] Complete offline check-in flow works end-to-end
- [ ] Success and already-checked-in states handled correctly
- [ ] SyncStatusBar shows real pending count
- [ ] Mobile-first UI with large touch targets
- [ ] No server calls during check-in

## Git Commit Recommendation

```
feat: add staff checkin ui
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 14B to Completed Phases
- Set Current Phase to Phase 15
- Record: full offline check-in flow tested manually, browser DevTools verified
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 14B: Staff Check-In UI.

Before starting, read:
- CLAUDE.md
- docs/ui_ux.md (Staff mode section)
- docs/offline_sync.md (Sections 29–30 — Sync UI Requirements)

Your task is to build the staff check-in UI screens.

1. Create src/hooks/use-recent-checkins.ts — reads last 10 items from checkinQueue (sorted by createdAt desc).
2. Create src/hooks/use-sync-status.ts — returns { pendingCount, lastSyncedAt, isOnline, syncState }.
   - pendingCount: count where synced === false in checkinQueue
   - isOnline: from useNetworkStatus hook
   - syncState: "idle" for now
3. Update src/components/shared/sync-status-bar.tsx to use real data from useSyncStatus.
4. Create src/components/staff/scan-action-card.tsx — two large action buttons: "Scan QR" and "Search Guest".
5. Create src/components/staff/guest-checkin-card.tsx — shows guest name, phone, allowed guests, Check In button (h-16 green).
6. Create src/components/staff/recent-checkins-list.tsx — last 10 local check-ins.
7. Build src/app/staff/[weddingId]/checkin/page.tsx:
   - SyncStatusBar at top
   - ScanActionCard (large scan + search buttons)
   - RecentCheckinsList
   - Offline message when offline
8. Build src/app/staff/[weddingId]/checkin/[guestId]/page.tsx:
   - Loads guest from IndexedDB
   - Shows GuestCheckinCard
   - On "Check In": calls checkInGuestLocally(guestId)
   - Shows result: success state or already-checked-in state
9. Build basic src/app/staff/[weddingId]/sync/page.tsx:
   - Shows pending count
   - "Sync Now" button (disabled for now — Phase 15 will wire it up)

UI RULES:
- Minimum button height: h-14 (check-in CTA: h-16)
- Large text, high contrast
- Clear check-in success state (green checkmark, guest name, time)
- Always show SyncStatusBar

After completing:
- Do the full manual offline check-in test:
  1. Download snapshot
  2. Go offline in DevTools
  3. Search guest → confirmation → check in → success screen
  4. Verify pending count in SyncStatusBar increases
  5. Refresh page → data persists
- Run npm run lint — must pass

Update PROGRESS.md: Phase 14B completed, Current Phase → Phase 15.

Commit with:
git commit -m "feat: add staff checkin ui"
```
