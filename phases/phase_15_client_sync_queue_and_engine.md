# Phase 15 — Client Sync Queue and Sync Engine

## Goal

Implement the client-side sync engine: reads unsynced queue items from IndexedDB, sends them to the server, processes results (accepted/duplicate/rejected), updates local state, and retries on failure. The "Sync Now" button on the staff sync page becomes functional.

## Why This Phase Matters

The sync engine is what makes offline check-ins permanent. Without it, check-ins live only on the staff device and are never reflected in the organizer's dashboard. The sync engine must be idempotent, retry-safe, and handle all server result states correctly.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Sections 18–26, 34–35 — Sync Trigger, Algorithm, Retry)
- `docs/api_contracts.md` (Part 7 — Check-In Sync API)

## Dependencies

- Phase 14A complete (local check-in creates queue items)
- Phase 16 will implement the server-side sync endpoint — the client engine can be built against a mock or stub first

## Scope

### Client-Side Only

- `src/lib/offline/checkins/checkin-sync-client.ts`:
  - `syncCheckins(weddingId)` — main sync function
  - Reads unsynced items from `checkinQueue`
  - Batches to 100 items per request
  - Calls `POST /api/v1/staff/weddings/:weddingId/checkins/sync`
  - Processes results: marks synced, updates guest timestamps
  - Records retry metadata on failure
  - Updates `lastSuccessfulSyncAt` in metadata

- `src/lib/offline/checkins/sync-result-processor.ts`:
  - `processSyncResults(results)` — handles ACCEPTED, DUPLICATE, ALREADY_PROCESSED, REJECTED
  - Updates `checkinQueue` items (synced flag, error)
  - Updates `guests` store with authoritative timestamp

- `src/lib/offline/network/network-monitor.ts`:
  - Sets up `window.online`/`window.offline` and `visibilitychange` listeners
  - Triggers sync when device comes back online
  - Periodic sync timer (every 60–120 seconds while online)

- Update `src/hooks/use-sync-status.ts`:
  - Add `triggerSync()` function
  - `syncState` transitions: `idle → syncing → idle/failed`

- Wire "Sync Now" button in `src/app/staff/[weddingId]/sync/page.tsx`

## Retry Strategy

From `docs/offline_sync.md` Section 25:
```
Attempt 1: wait 5s
Attempt 2: wait 15s
Attempt 3: wait 45s
Attempt 4+: wait 120s
```

Track `syncAttempts` and `lastSyncAttemptAt` on queue items.

## Sync Request Payload

Per `docs/api_contracts.md` Section 28:
```json
{
  "snapshotId": "uuid",
  "snapshotVersion": 1,
  "deviceId": "uuid",
  "checkins": [
    {
      "queueId": "local-uuid",
      "guestId": "uuid",
      "checkedInAt": "ISO-8601"
    }
  ]
}
```

## Sync Result Handling

Per `docs/offline_sync.md` Section 23:
- `ACCEPTED`: mark synced, update guest checkedInAt with authoritative timestamp
- `DUPLICATE`: mark synced, update guest checkedInAt with authoritative timestamp
- `ALREADY_PROCESSED`: mark synced, update guest
- `REJECTED`: keep unsynced, store syncError
- `INVALID_GUEST`: mark failed, show staff warning
- `SNAPSHOT_MISMATCH`: stop sync, show warning to download new snapshot

## Implementation Tasks

1. Create `src/lib/offline/checkins/sync-result-processor.ts`:
   - `processSyncResult(result, db)` — single result processor
   - Updates queue item and guest in one Dexie transaction
2. Create `src/lib/offline/checkins/checkin-sync-client.ts`:
   - `syncCheckins(weddingId)` function
   - Load metadata (snapshotId, snapshotVersion, deviceId, staffDeviceId)
   - Load unsynced items (limit 100)
   - If none: return early
   - POST to sync endpoint with staff token
   - Process each result
   - Handle SNAPSHOT_MISMATCH: stop sync, update metadata
   - On network error: increment syncAttempts, store error
   - Update `lastSuccessfulSyncAt` on success
3. Create `src/lib/offline/network/network-monitor.ts`:
   - Sets up online/offline and visibilitychange event listeners
   - Calls `syncCheckins()` on relevant events
   - Sets up interval timer (60s when online)
   - Cleanup function for unmount
4. Create `src/hooks/use-sync-engine.ts`:
   - Returns `{ triggerSync, syncState }`
   - `syncState` from network monitor and sync in progress flag
5. Update `src/hooks/use-sync-status.ts` to expose `triggerSync`.
6. Wire `SyncStatusBar` to show `syncState` (syncing indicator).
7. Update `src/app/staff/[weddingId]/sync/page.tsx`:
   - "Sync Now" button triggers `triggerSync()`
   - Shows syncing state, last sync time, pending count
   - Shows SNAPSHOT_MISMATCH warning if relevant

## Files and Folders Likely to Be Created or Modified

- `src/lib/offline/checkins/checkin-sync-client.ts`
- `src/lib/offline/checkins/sync-result-processor.ts`
- `src/lib/offline/network/network-monitor.ts`
- `src/hooks/use-sync-engine.ts`
- `src/hooks/use-sync-status.ts`
- `src/app/staff/[weddingId]/sync/page.tsx`
- `src/components/shared/sync-status-bar.tsx`

## Testing Requirements

Unit tests:
- `sync-result-processor.ts`: ACCEPTED marks synced and updates guest timestamp
- `sync-result-processor.ts`: DUPLICATE marks synced with authoritative timestamp
- `sync-result-processor.ts`: REJECTED keeps item unsynced
- `sync-result-processor.ts`: SNAPSHOT_MISMATCH stops sync
- `syncCheckins`: batches to max 100 items
- `syncCheckins`: skips sync if no unsynced items
- `syncCheckins`: increments syncAttempts on network failure

Note: Phase 16 builds the actual server endpoint. Test against a mock/stub for now.

`npm run test` — all tests pass
`npm run lint` passes

## Manual QA Checklist (Once Phase 16 is complete)

- [ ] Sync Now button triggers sync call
- [ ] Pending count decreases after sync
- [ ] SyncStatusBar shows "Syncing..." during sync
- [ ] After sync: "All check-ins synced"
- [ ] Network error: "Sync failed. Retrying..."
- [ ] Comes back online after offline: auto-sync triggers

## Acceptance Criteria

- [ ] Sync engine reads queue items and sends correct payload
- [ ] All result statuses handled correctly
- [ ] SNAPSHOT_MISMATCH handled (stops sync, shows warning)
- [ ] Retry with exponential backoff
- [ ] Sync triggers on online event
- [ ] Unit tests pass

## Git Commit Recommendation

```
feat: add client sync queue and engine
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 15 to Completed Phases
- Set Current Phase to Phase 16
- Record unit test results
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 15: Client Sync Queue and Sync Engine.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Sections 18–26, 34–35)
- docs/api_contracts.md (Part 7 — Check-In Sync API, Section 28)

Your task is to build the client-side sync engine.

1. Create src/lib/offline/checkins/sync-result-processor.ts:
   processSyncResult(result, offlineDb) — handles one sync result:
   - ACCEPTED / DUPLICATE / ALREADY_PROCESSED: mark queue item synced, update guest checkedInAt with authoritativeCheckedInAt
   - REJECTED: keep unsynced, store syncError
   - INVALID_GUEST: mark failed
   - SNAPSHOT_MISMATCH: return flag to stop sync

2. Create src/lib/offline/checkins/checkin-sync-client.ts:
   syncCheckins(weddingId: string): Promise<void>
   - Check navigator.onLine — skip if offline
   - Load metadata: snapshotId, snapshotVersion, deviceId, staffDeviceId
   - Load up to 100 unsynced queue items
   - If none: return early
   - Increment syncAttempts on each item, set lastSyncAttemptAt
   - POST to /api/v1/staff/weddings/:weddingId/checkins/sync with staff token header
   - Process each result via processSyncResult
   - If SNAPSHOT_MISMATCH: stop all sync, store snapshotMismatch metadata, warn user
   - On network error: increment syncAttempts, store error message
   - On full success: set lastSuccessfulSyncAt in metadata

3. Create src/lib/offline/network/network-monitor.ts:
   Exports: setupNetworkMonitor(syncFn) → returns cleanup function
   - Calls syncFn on window "online" event
   - Calls syncFn on visibilitychange (when visible + online)
   - Sets up 60s interval while online
   - Cleans up on unmount

4. Create src/hooks/use-sync-engine.ts:
   Returns { triggerSync, syncState }
   syncState: "idle" | "syncing" | "failed" | "offline"

5. Wire "Sync Now" button in src/app/staff/[weddingId]/sync/page.tsx.

6. Update SyncStatusBar to show syncState.

Write unit tests for:
- Sync result processor (ACCEPTED, DUPLICATE, REJECTED, SNAPSHOT_MISMATCH)
- syncCheckins skips when offline or no items

Note: Phase 16 builds the server. Test against a mock fetch for now.

Run: npm run test — all tests pass
Run: npm run lint — must pass

Update PROGRESS.md: Phase 15 completed, Current Phase → Phase 16.

Commit with:
git commit -m "feat: add client sync queue and engine"
```
