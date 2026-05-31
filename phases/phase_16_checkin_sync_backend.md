# Phase 16 — Check-In Sync Backend

## Goal

Implement the server-side check-in sync endpoint: validates the batch, applies the "earliest timestamp wins" conflict rule, creates authoritative check-in records, writes sync logs, and returns per-item results to the client.

## Why This Phase Matters

This is where multi-device offline check-ins become permanent and authoritative. The sync endpoint must be idempotent, transactionally correct, and implement the conflict rule precisely. Any bugs here could cause data loss, duplicate accepted check-ins, or incorrect timestamps.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Sections 26–28 — Idempotency, Server Reconciliation Algorithm, Earliest Timestamp Wins)
- `docs/api_contracts.md` (Part 7 — Check-In Sync API, Section 28)
- `docs/database_schema.md` (check_ins table, sync_logs table)

## Dependencies

- Phase 11 complete (snapshots)
- Phase 10 complete (staff auth)
- Phase 15 complete (client sync engine knows the API contract)

## Scope

### Backend

- Sync module: `src/modules/sync/`
  - `sync.schemas.ts` — Zod validation for sync payload
  - `sync.types.ts` — result types
  - `sync.repository.ts` — check-in persistence
  - `sync.service.ts` — conflict resolution, idempotency
  - `sync.dto.ts`
- Check-ins module additions: `src/modules/checkins/`
  - `checkins.repository.ts` — find/create check-in records
- API route handler:
  - `POST /api/v1/staff/weddings/:weddingId/checkins/sync`

## Conflict Resolution (Earliest Timestamp Wins)

For each incoming check-in item:
1. Check if `staffDeviceId + queueId` already processed → return `ALREADY_PROCESSED`
2. Find existing accepted check-in for guest
3. If none: create new accepted check-in → `ACCEPTED`
4. If existing is earlier: incoming is later → store as duplicate → `DUPLICATE`
5. If incoming is earlier: mark existing as duplicate, create incoming as accepted → `ACCEPTED`
6. Update guest `isCheckedIn` and `checkedInAt` to authoritative timestamp

## Idempotency Key

```
staffDeviceId + sourceQueueId (queueId from client)
```

This unique combination in `check_ins` prevents double-processing.

## Server Validation Per Item

Per `api_contracts.md` Section 28:
1. Staff token is valid
2. Staff device is ACTIVE
3. Wedding is in EVENT_MODE
4. Snapshot version matches active snapshot
5. Guest exists in the wedding snapshot (`snapshot_guests`)
6. Timestamp is valid ISO 8601
7. `queueId + staffDeviceId` not already processed

## Implementation Tasks

1. Create `src/modules/sync/sync.schemas.ts`:
   ```ts
   export const syncPayloadSchema = z.object({
     snapshotId: z.string().uuid(),
     snapshotVersion: z.number().int(),
     deviceId: z.string().uuid(),
     checkins: z.array(z.object({
       queueId: z.string(),
       guestId: z.string().uuid(),
       checkedInAt: z.string().datetime(),
     })).max(100),
   });
   ```
2. Create `src/modules/checkins/checkins.repository.ts`:
   - `findAcceptedCheckinByGuest(weddingId, guestId)` — returns current accepted check-in
   - `createCheckin(data)` — creates new check-in record
   - `markCheckinDuplicate(checkinId, duplicateOfId)` — updates is_duplicate
   - `updateGuestCheckedIn(guestId, isCheckedIn, checkedInAt)` — denormalized update
3. Create `src/modules/sync/sync.repository.ts`:
   - `findProcessedQueueItem(staffDeviceId, queueId)` — idempotency check
   - `createSyncLog(data)` — write sync log
4. Create `src/modules/sync/sync.service.ts`:
   - `processSyncBatch(weddingId, staffDeviceId, snapshotId, payload)`:
     - Validate snapshot matches active snapshot
     - For each check-in item, run conflict resolution
     - All operations in Prisma transaction where possible
     - Write sync log
     - Return array of per-item results
5. Create `src/app/api/v1/staff/weddings/[weddingId]/checkins/sync/route.ts` (POST):
   - Auth via `requireStaffAuth`
   - Validate payload with `syncPayloadSchema`
   - Call `sync.service.processSyncBatch`
   - Return results array + summary

## Response Format

Per `api_contracts.md` Section 28:
```json
{
  "success": true,
  "data": {
    "results": [
      { "queueId": "...", "guestId": "...", "status": "ACCEPTED", "authoritativeCheckedInAt": "..." },
      { "queueId": "...", "guestId": "...", "status": "DUPLICATE", "authoritativeCheckedInAt": "..." }
    ],
    "summary": { "accepted": 1, "duplicate": 1, "rejected": 0 }
  }
}
```

## Files and Folders Likely to Be Created or Modified

- `src/modules/sync/`
- `src/modules/checkins/checkins.repository.ts`
- `src/app/api/v1/staff/weddings/[weddingId]/checkins/sync/route.ts`

## Testing Requirements

Integration tests (using real test DB or mocked Prisma):
- Single device check-in → ACCEPTED
- Retry same item → ALREADY_PROCESSED
- Two devices, same guest, different timestamps → earlier wins → later is DUPLICATE
- Two devices, later syncs first → first gets ACCEPTED, second (earlier timestamp) updates authority
- Invalid guest → INVALID_GUEST
- Wrong snapshot version → SNAPSHOT_MISMATCH
- Revoked device → UNAUTHORIZED

`npm run test` — all tests pass
`npm run lint` passes

## Manual QA Checklist

- [ ] Complete offline check-in + sync flow works end-to-end
- [ ] After sync, organizer dashboard shows updated check-in count
- [ ] Duplicate scenario (two devices, same guest) resolves correctly
- [ ] `sync_logs` table has a record for each sync call
- [ ] check_ins table has accepted check-in per guest

## Acceptance Criteria

- [ ] Sync endpoint is idempotent
- [ ] Earliest timestamp wins is correctly implemented
- [ ] Sync logs written
- [ ] Guest denormalized state updated
- [ ] All per-item status codes returned correctly
- [ ] Invalid/revoked devices rejected

## Git Commit Recommendation

```
feat: implement checkin sync backend
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 16 to Completed Phases
- Set Current Phase to Phase 17
- Record: sync endpoint tested, multi-device scenario tested
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 16: Check-In Sync Backend.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Sections 26–28 — Server Reconciliation, Idempotency, Earliest Timestamp Wins)
- docs/api_contracts.md (Part 7 — Check-In Sync API, Section 28)
- docs/database_schema.md (check_ins and sync_logs tables)

Your task is to implement the server-side check-in sync endpoint.

1. Create src/modules/sync/sync.schemas.ts — Zod schema for sync payload (max 100 check-ins).
2. Create src/modules/checkins/checkins.repository.ts:
   - findAcceptedCheckinByGuest(weddingId, guestId)
   - createCheckin(data)
   - markCheckinDuplicate(checkinId, duplicateOfId)
   - updateGuestCheckedIn(guestId, isCheckedIn, checkedInAt)
3. Create src/modules/sync/sync.repository.ts:
   - findProcessedQueueItem(staffDeviceId, queueId) — idempotency check
   - createSyncLog(data)
4. Create src/modules/sync/sync.service.ts:
   processSyncBatch(weddingId, staffDeviceId, payload):
   For each check-in item:
   a. Check idempotency (staffDeviceId + queueId) → return ALREADY_PROCESSED if found
   b. Validate snapshot version matches active snapshot → return SNAPSHOT_MISMATCH
   c. Validate guest exists in snapshot_guests → return INVALID_GUEST if not
   d. Find existing accepted check-in for guest
   e. If none: create accepted check-in → ACCEPTED
   f. If existing and incoming is earlier: mark existing as duplicate, create incoming as accepted → ACCEPTED
   g. If existing and incoming is later: store incoming as duplicate → DUPLICATE
   h. Update guest isCheckedIn and checkedInAt with authoritative timestamp
   i. Create sync log for the batch

5. Create route handler: POST /api/v1/staff/weddings/:weddingId/checkins/sync
   - requireStaffAuth
   - Validate with syncPayloadSchema
   - Call sync.service.processSyncBatch
   - Return { results, summary }

CRITICAL RULES:
- The endpoint must be idempotent — same queueId submitted twice returns same result
- Earliest check-in timestamp wins, even if it syncs later
- All check-in writes should be in a transaction where feasible
- Sync logs must always be written, even on partial failure

After completing:
- Test: single device sync, retry idempotency, two-device duplicate scenario
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 16 completed, Current Phase → Phase 17.

Commit with:
git commit -m "feat: implement checkin sync backend"
```
