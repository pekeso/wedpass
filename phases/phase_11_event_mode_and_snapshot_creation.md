# Phase 11 — Event Mode and Snapshot Creation

## Goal

Implement Event Mode enablement on the server: create the event snapshot, copy guests into `snapshot_guests`, set wedding status to `EVENT_MODE`, lock guest editing, and build the organizer Event Mode readiness and enable screens.

## Why This Phase Matters

Event Mode and snapshots are the bridge between pre-event preparation and the wedding day. The snapshot is what every staff device downloads for offline check-in. Getting snapshot creation correct — atomically, with proper data copying — is critical for offline reliability.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 5 — Event Mode and Snapshot API)
- `docs/database_schema.md` (wedding_snapshots and snapshot_guests tables)
- `docs/offline_sync.md` (Sections 5–7)
- `docs/v1_scope.md` (Section 7.5)

## Dependencies

- Phase 08 complete (guests with QR tokens)
- Phase 10 complete (staff devices)

## Scope

### Backend

- Event Mode service in `src/modules/weddings/` or a new `src/modules/checkins/snapshot.service.ts`:
  - `getEventModeReadiness(weddingId)` — returns readiness checklist
  - `enableEventMode(weddingId, userId)` — creates snapshot atomically
  - `getActiveSnapshot(weddingId)` — returns active snapshot metadata
- Snapshot creation must use a Prisma transaction:
  1. Check wedding is ACTIVE or DRAFT
  2. Count guests (must be > 0)
  3. Create `WeddingSnapshot` record
  4. Copy all guests into `SnapshotGuest` records
  5. Set snapshot `isActive = true`
  6. Update wedding status to `EVENT_MODE`
- API route handlers:
  - `GET /api/v1/weddings/:weddingId/event-mode/readiness`
  - `POST /api/v1/weddings/:weddingId/event-mode/enable`
  - `GET /api/v1/weddings/:weddingId/snapshot/active`

### Frontend

- `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx`:
  - Event Mode readiness checklist (animated check/fail items)
  - Prominent warning: "Enabling Event Mode locks your guest list"
  - Enable Event Mode button (disabled until all checks pass)
  - Confirmation dialog before enabling
  - After enabling: show snapshot summary and staff device prep guidance

## Explicitly Out of Scope

- Snapshot download to devices (Phase 12)
- Check-in sync (Phase 16)
- Multiple snapshots or snapshot refresh (V1.0 uses one active snapshot)

## Implementation Tasks

1. Create snapshot-related repository methods in `src/modules/checkins/checkins.repository.ts` or a new `src/modules/weddings/snapshot.repository.ts`:
   - `createSnapshot(weddingId, userId, guestCount)` — insert WeddingSnapshot
   - `copyGuestsToSnapshot(snapshotId, weddingId, guests)` — bulk insert SnapshotGuest
   - `setSnapshotActive(snapshotId)` — set isActive = true
   - `findActiveSnapshot(weddingId)` — returns active snapshot
   - `findSnapshotWithGuests(snapshotId)` — returns snapshot + guest count
2. Create `src/modules/weddings/event-mode.service.ts`:
   - `getReadinessChecks(weddingId)` — returns array of `{ key, label, passed }`:
     - `wedding_details`: name and eventDate are set
     - `guest_list`: at least 1 guest exists (non-deleted)
     - `qr_codes`: all guests have qrToken
     - `staff_access`: at least 1 active staff device exists
   - `enableEventMode(weddingId, userId)` — transactional snapshot creation
3. Create API route handlers:
   - `src/app/api/v1/weddings/[weddingId]/event-mode/readiness/route.ts`
   - `src/app/api/v1/weddings/[weddingId]/event-mode/enable/route.ts`
   - `src/app/api/v1/weddings/[weddingId]/snapshot/active/route.ts`
4. Update guest service: enforce `EVENT_MODE_LOCKED` when wedding is in `EVENT_MODE`.
5. Build `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx`:
   - Readiness checklist UI (green check / red X per item)
   - Warning callout: "This will lock your guest list"
   - Enable button (disabled if any check fails)
   - ConfirmDialog before enabling
   - After success: show snapshot created message and instructions

## Files and Folders Likely to Be Created or Modified

- `src/modules/weddings/event-mode.service.ts`
- `src/modules/weddings/snapshot.repository.ts` (or checkins)
- `src/app/api/v1/weddings/[weddingId]/event-mode/readiness/route.ts`
- `src/app/api/v1/weddings/[weddingId]/event-mode/enable/route.ts`
- `src/app/api/v1/weddings/[weddingId]/snapshot/active/route.ts`
- `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx`

## Testing Requirements

- Enable Event Mode with valid wedding + guests — verify snapshot created, snapshot_guests populated, wedding status updated
- Enable Event Mode with zero guests — verify error returned
- After enabling, try to add a guest — verify EVENT_MODE_LOCKED
- After enabling, try to edit a guest — verify EVENT_MODE_LOCKED
- Get active snapshot — verify returns correct data
- Enable Event Mode twice — verify idempotent behavior (or error)
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Event Mode page shows readiness checklist
- [ ] Checklist items turn green as conditions are met
- [ ] Enable button is disabled until all checks pass
- [ ] Confirmation dialog shows before enabling
- [ ] After enabling, wedding status shows EVENT_MODE badge
- [ ] After enabling, trying to add/edit guests shows a locked message
- [ ] Snapshot guest count matches the guest list count

## Acceptance Criteria

- [ ] Snapshot creation is atomic (Prisma transaction)
- [ ] All guests are copied into snapshot_guests
- [ ] Wedding status transitions to EVENT_MODE
- [ ] Guest editing blocked after Event Mode
- [ ] Readiness checklist API works
- [ ] UI readiness flow works end-to-end

## Git Commit Recommendation

```
feat: add event mode and snapshot creation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 11 to Completed Phases
- Set Current Phase to Phase 12 and Phase 18
- Record: snapshot creation tested, guest lock verified
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 11: Event Mode and Snapshot Creation.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 5 — Event Mode and Snapshot API)
- docs/database_schema.md (wedding_snapshots and snapshot_guests sections)
- docs/offline_sync.md (Sections 5–7 — Snapshot Concept and Download Flow)

Your task is to implement Event Mode enablement and snapshot creation.

Backend:
1. Create snapshot repository methods for: createSnapshot, copyGuestsToSnapshot, setSnapshotActive, findActiveSnapshot.

2. Create src/modules/weddings/event-mode.service.ts with:
   - getReadinessChecks(weddingId): returns { key, label, passed }[] for:
     wedding_details, guest_list, qr_codes, staff_access
   - enableEventMode(weddingId, userId): atomically creates snapshot using Prisma transaction:
     a. Validate wedding is in DRAFT or ACTIVE state
     b. Count non-deleted guests (must be > 0)
     c. Create WeddingSnapshot record
     d. Bulk copy all guests into SnapshotGuest records
     e. Set snapshot isActive = true
     f. Update wedding status to EVENT_MODE
     (All steps in a single Prisma transaction)

3. Create API route handlers:
   - GET /api/v1/weddings/:weddingId/event-mode/readiness
   - POST /api/v1/weddings/:weddingId/event-mode/enable (requires confirmGuestListLock: true in body)
   - GET /api/v1/weddings/:weddingId/snapshot/active

4. Enforce EVENT_MODE_LOCKED on guest add/edit/delete when wedding.status is EVENT_MODE.

Frontend:
5. Build src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx:
   - Show readiness checklist with pass/fail per item
   - Enable button disabled until all checks pass
   - ConfirmDialog before enabling
   - Success state showing snapshot info and next steps

CRITICAL: Snapshot creation must be transactional. If any step fails, roll back everything.

After completing:
- Test enabling Event Mode, guest lock enforcement
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 11 completed, Current Phase → Phase 12.

Commit with:
git commit -m "feat: add event mode and snapshot creation"
```
