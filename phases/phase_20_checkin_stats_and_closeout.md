# Phase 20 — Check-In Stats and Post-Event Sync Closeout

## Goal

Build the organizer check-in stats screen (live stats with polling) and the post-event sync closeout flow: confirm all devices have synced, show a sync summary, and allow safe local data clearing on staff devices.

## Why This Phase Matters

After the wedding, organizers need to confirm all check-ins are captured and all staff devices have synced. The closeout flow guides organizers through a "sync complete" verification step. Without it, data could be silently lost if a staff member doesn't sync before clearing their device.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Parts 8, 7 — Stats and Sync)
- `docs/offline_sync.md` (Section 37 — Local Data Clearing)
- `docs/v1_scope.md` (Section 7.10)

## Dependencies

- Phase 16 complete (sync backend)
- Phase 18 complete (event readiness)

## Scope

### Backend

- `GET /api/v1/weddings/:weddingId/stats` (extend or build)
- `GET /api/v1/weddings/:weddingId/checkins/stats` (device-level summary)
- `POST /api/v1/weddings/:weddingId/complete` (optional — marks wedding as COMPLETED)

### Frontend — Check-In Stats Page

- `src/app/dashboard/wedding/[weddingId]/checkins/page.tsx`:
  - Stat cards: Total Guests, Checked In, Pending, Check-In %
  - Per-device sync summary: device label, last seen, check-in count, synced?
  - Auto-refreshes every 30 seconds (TanStack Query)

### Frontend — Staff Closeout

- `src/app/staff/[weddingId]/sync/page.tsx` (full implementation from Phase 15 placeholder):
  - Pending count
  - Sync Now button
  - "All Synced!" confirmation state
  - Safe local data clearing (with ConfirmDialog):
    - Warning: "Only clear after all check-ins have synced"
    - If pending > 0: block clearing with error
    - If synced: allow clearing
  - Sync history (last 5 sync operations)

## Explicitly Out of Scope

- Advanced analytics
- Export to CSV (backlog)
- Real-time WebSocket updates

## Implementation Tasks

1. Extend `weddings.service.ts` or create `analytics.service.ts`:
   - `getWeddingStats(weddingId)`: total guests, checked in, pending, %, total media
   - `getCheckinStats(weddingId)`: per-device breakdown
2. Create or update `GET /api/v1/weddings/:weddingId/stats` route.
3. Create or update `GET /api/v1/weddings/:weddingId/checkins/stats` route.
4. Build `src/app/dashboard/wedding/[weddingId]/checkins/page.tsx`:
   - Stat cards using `StatCard` component
   - Device sync table showing each device's last sync time and check-in count
   - TanStack Query with 30s refetch interval
5. Fully implement `src/app/staff/[weddingId]/sync/page.tsx`:
   - Show pendingCount from IndexedDB
   - "Sync Now" button wired to `triggerSync()`
   - Show sync progress and result
   - "All Synced ✓" state when pendingCount === 0
   - Local data clearing section:
     - Button: "Clear Local Event Data"
     - ConfirmDialog with strong warning
     - If pendingCount > 0: show error, block clearing
     - If cleared: navigate to staff login
6. Create `clearLocalEventData(weddingId)` utility in `src/lib/offline/metadata.ts`:
   - Clears `guests`, `checkinQueue` (only synced items), `metadata` for the wedding
   - Must NOT clear unsynced queue items

## Files and Folders Likely to Be Created or Modified

- `src/modules/weddings/analytics.service.ts` (or extend existing)
- `src/app/api/v1/weddings/[weddingId]/stats/route.ts`
- `src/app/api/v1/weddings/[weddingId]/checkins/stats/route.ts`
- `src/app/dashboard/wedding/[weddingId]/checkins/page.tsx`
- `src/app/staff/[weddingId]/sync/page.tsx`
- `src/lib/offline/metadata.ts` (add clearLocalEventData)

## Testing Requirements

- Stats API returns correct totals after check-ins sync
- Per-device stats show last seen and sync count
- Local data clear blocked when pending count > 0
- Local data clear succeeds when fully synced
- Cleared state navigates to staff login
- `npm run test` passes
- `npm run lint` passes

## Manual QA Checklist

- [ ] Check-in stats page shows correct total/checked-in/pending counts
- [ ] Counts update after 30 seconds (or on manual refresh)
- [ ] Per-device table shows each device's activity
- [ ] Staff sync page shows pending count
- [ ] "Sync Now" triggers sync and updates pending count
- [ ] "All Synced" message shows when pending = 0
- [ ] "Clear Local Data" blocked when items pending
- [ ] "Clear Local Data" succeeds and navigates to login when synced

## Acceptance Criteria

- [ ] Stats endpoints return correct data
- [ ] Check-in stats page with polling works
- [ ] Staff sync closeout flow works
- [ ] Local data clear only works when fully synced
- [ ] Unsynced queue items are never deleted by clear

## Git Commit Recommendation

```
feat: add post-event sync closeout
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 20 to Completed Phases
- Set Current Phase to Phase 21 and Phase 27
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 20: Check-In Stats and Post-Event Sync Closeout.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Parts 8 — Stats API)
- docs/offline_sync.md (Section 37 — Local Data Clearing)

Your task is to build check-in stats and the staff post-event closeout flow.

Backend:
1. Create stats service methods: getWeddingStats(weddingId) and getCheckinStats(weddingId).
2. Create/update route handlers:
   GET /api/v1/weddings/:weddingId/stats
   GET /api/v1/weddings/:weddingId/checkins/stats

Frontend — Organizer:
3. Build src/app/dashboard/wedding/[weddingId]/checkins/page.tsx:
   - StatCards: Total, Checked In, Pending, Percentage
   - Per-device table: label, status, lastSeenAt, check-in count
   - TanStack Query with 30s refetch

Frontend — Staff:
4. Complete src/app/staff/[weddingId]/sync/page.tsx:
   - Shows pending count (from IndexedDB)
   - "Sync Now" button (triggers syncCheckins from Phase 15)
   - "All Synced ✓" state when pendingCount === 0
   - Safe Local Data Clear:
     Add clearLocalEventData(weddingId) to src/lib/offline/metadata.ts
     IMPORTANT: Only deletes synced queue items. NEVER deletes unsynced ones.
     If pending count > 0: block clear, show error
     If all synced: allow clear with ConfirmDialog, then navigate to login

CRITICAL RULE: Unsynced check-in queue items must never be deleted before server acknowledgement.

After completing:
- Test stats accuracy, clear-blocking, and clear-success flow
- Run npm run lint — must pass

Update PROGRESS.md: Phase 20 completed, Current Phase → Phase 21.

Commit with:
git commit -m "feat: add post-event sync closeout"
```
