# Phase 14A — Staff Local Check-In Transaction

## Goal

Implement the local check-in service: the IndexedDB transaction that marks a guest as checked in and appends an item to the sync queue. This is the core offline check-in logic — no server call, instant feedback, queue item created for later sync.

## Why This Phase Matters

This is the heart of WedPass's offline-first promise. When a staff member taps "Check In", the result must be instant and persistent, even without internet. The check-in transaction must be atomic, duplicate-safe, and produce a correctly structured queue item that the sync engine can process.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Sections 15–16 — Local Check-In Algorithm)
- `docs/database_schema.md` (checkinQueue store definition)

## Dependencies

- Phase 09 complete (IndexedDB foundation)
- Phase 12 complete (snapshot download — guests exist locally)

## Scope

### Service Layer Only (no UI yet)

- `src/lib/offline/checkins/checkin-local-service.ts`:
  - `checkInGuestLocally(guestId, weddingId)`:
    1. Load guest from IndexedDB
    2. Check if already checked in → return `{ status: "already_checked_in" }`
    3. Generate `checkedInAt` timestamp
    4. Generate `queueId` using `crypto.randomUUID()`
    5. Begin Dexie transaction:
       - Update `guests` store: `checkedIn = true`, `checkedInAt`
       - Add item to `checkinQueue` store
    6. Return `{ status: "checked_in_locally", checkedInAt, queueId }`

## Queue Item Requirements

The queue item added to `checkinQueue` must include:
```ts
{
  queueId: string;           // stable, for idempotency
  weddingId: string;
  snapshotId: string;        // from metadata store
  snapshotVersion: number;   // from metadata store
  guestId: string;
  checkedInAt: string;       // ISO 8601
  deviceId: string;          // from metadata store
  synced: false;
  syncAttempts: 0;
  createdAt: string;         // ISO 8601
}
```

## Explicitly Out of Scope

- Check-in UI (Phase 14B)
- Server sync (Phase 15–16)
- Staff check-in home screen (Phase 14B)

## Implementation Tasks

1. Create `src/lib/offline/checkins/checkin-local-service.ts`:
   Implement `checkInGuestLocally` exactly as described in `docs/offline_sync.md` Section 15.
   ```ts
   export async function checkInGuestLocally(guestId: string): Promise<CheckInLocalResult>
   ```
   Where `CheckInLocalResult` is:
   ```ts
   type CheckInLocalResult =
     | { status: "checked_in_locally"; checkedInAt: string; queueId: string }
     | { status: "already_checked_in"; checkedInAt: string }
     | { status: "guest_not_found" };
   ```
2. The service must read all metadata (snapshotId, snapshotVersion, deviceId) from the `metadata` store.
3. The guest update and queue add must be inside a single `offlineDb.transaction("rw", ...)`.
4. Write comprehensive unit tests:
   - Test: check-in new guest → `status: "checked_in_locally"`, queue item created
   - Test: check-in already-checked-in guest → `status: "already_checked_in"`, no new queue item
   - Test: check-in unknown guest → `status: "guest_not_found"`
   - Test: after check-in, guest `checkedIn` is true in IndexedDB
   - Test: queue item has correct `synced: false` and all required fields
   - Test: atomic transaction — if one part fails, both parts roll back

## Files and Folders Likely to Be Created or Modified

- `src/lib/offline/checkins/checkin-local-service.ts`
- Test file: `src/lib/offline/checkins/checkin-local-service.test.ts`

## Testing Requirements

Run: `npm run test`

All unit tests must pass:
- [ ] New guest check-in creates queue item
- [ ] Duplicate check-in returns `already_checked_in`
- [ ] Guest not found returns `guest_not_found`
- [ ] Queue item has all required fields
- [ ] Transaction atomicity verified

`npm run lint` passes
`npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] In browser console: call `checkInGuestLocally(guestId)` directly, verify result
- [ ] Check IndexedDB `guests` store: guest shows `checkedIn: true`
- [ ] Check IndexedDB `checkinQueue` store: item exists with `synced: false`
- [ ] Call again for same guest: returns `already_checked_in`, no new queue item

## Acceptance Criteria

- [ ] `checkInGuestLocally` is atomic
- [ ] Duplicate check-in prevention works
- [ ] Queue item has correct structure
- [ ] All unit tests pass
- [ ] No server calls are made

## Git Commit Recommendation

```
feat: implement staff local checkin transaction
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 14A to Completed Phases
- Set Current Phase to Phase 14B and Phase 15
- Record unit test results (must pass)
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 14A: Staff Local Check-In Transaction.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Sections 15–16 — Local Check-In Algorithm and Local Duplicate Prevention)
- docs/database_schema.md (checkinQueue store, Section 20)

Your task is to implement the local check-in service. This is the most critical offline logic in WedPass.

Create src/lib/offline/checkins/checkin-local-service.ts:

Implement checkInGuestLocally(guestId: string): Promise<CheckInLocalResult>

The function must:
1. Read metadata: snapshotId, snapshotVersion, deviceId from the metadata store
2. Load the guest from IndexedDB
3. If guest not found: return { status: "guest_not_found" }
4. If guest.checkedIn is already true: return { status: "already_checked_in", checkedInAt: guest.checkedInAt }
5. Generate: checkedInAt = new Date().toISOString(), queueId = crypto.randomUUID()
6. Begin a Dexie transaction on guests + checkinQueue:
   - Update guest: checkedIn = true, checkedInAt
   - Add to checkinQueue: { queueId, weddingId, snapshotId, snapshotVersion, guestId, checkedInAt, deviceId, synced: false, syncAttempts: 0, createdAt }
7. Return { status: "checked_in_locally", checkedInAt, queueId }

CheckInLocalResult type:
type CheckInLocalResult =
  | { status: "checked_in_locally"; checkedInAt: string; queueId: string }
  | { status: "already_checked_in"; checkedInAt: string }
  | { status: "guest_not_found" };

CRITICAL RULES:
- Guest update + queue add must be in ONE atomic Dexie transaction
- Never delete queue items before server acknowledgement
- The queueId must remain stable (never regenerate for the same check-in)

Write unit tests in checkin-local-service.test.ts:
- New guest check-in success
- Duplicate check-in prevention
- Guest not found
- Queue item field completeness
- Transaction atomicity

Run: npm run test — all tests must pass
Run: npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 14A completed, Current Phase → Phase 14B and Phase 15.

Commit with:
git commit -m "feat: implement staff local checkin transaction"

Report: test results summary.
```
