# Phase 17 — Multi-Device Conflict Handling Tests

## Goal

Write comprehensive tests for the complete offline check-in and sync system: single device offline flow, multi-device duplicate scenarios, retry behavior, snapshot mismatch, browser refresh persistence, and sync queue safety. This phase hardens the most critical WedPass feature before operational readiness work begins.

## Why This Phase Matters

The offline check-in system is WedPass's main differentiator. If this fails at a real wedding, data is lost and trust is broken. Thorough testing of every edge case — multi-device duplicates, retries, snapshot mismatches, browser refreshes — is required before beta. These tests are the safety net.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Section 40 — Testing Scenarios)
- `docs/testing_strategy.md`

## Dependencies

- Phase 15 complete (client sync engine)
- Phase 16 complete (server sync backend)

## Scope

### Test Suites

1. **Local Check-In Unit Tests** (Vitest)
2. **Sync Result Processor Unit Tests** (Vitest)
3. **Sync Service Integration Tests** (Vitest, test DB or mocked Prisma)
4. **Offline Persistence Tests** (Playwright — browser-level)
5. **Multi-Device Conflict E2E Tests** (Playwright)

## Test Scenarios to Cover

### Scenario 1: Single Device Offline Check-In

1. Download snapshot
2. Go offline
3. Check in 5 guests
4. Refresh browser — verify all 5 still checked in
5. Come online
6. Sync — verify server has 5 accepted check-ins
7. Verify pending count drops to 0

### Scenario 2: Multi-Device Duplicate (Core)

1. Device A and Device B download same snapshot
2. Both go offline
3. Device B checks in Guest X at 14:03
4. Device A checks in Guest X at 14:01
5. Device B syncs first → accepted at 14:03
6. Device A syncs second → server updates authority to 14:01, B's is now duplicate
7. Both clients show correct authoritative time (14:01)

### Scenario 3: Idempotent Retry

1. Check in a guest offline
2. Come online, attempt sync
3. Simulate network timeout — request sent but response lost
4. Retry sync
5. Verify: only one accepted check-in exists on server
6. Verify: client queue item marked synced

### Scenario 4: Browser Refresh Persistence

1. Check in 3 guests offline
2. Close tab and reopen (or hard refresh)
3. Verify guests are still checked in in IndexedDB
4. Verify queue items are still present
5. Sync — verify all 3 synced correctly

### Scenario 5: Snapshot Mismatch

1. Staff device downloads snapshot V1
2. Organizer creates new snapshot (simulate by updating snapshotId in server)
3. Staff attempts to sync
4. Server returns SNAPSHOT_MISMATCH
5. Client stops syncing, shows warning
6. Client queue is preserved (not deleted)

### Scenario 6: Invalid QR Fallback

1. Scan a QR code not in the snapshot
2. App shows "QR code not recognized"
3. Manual search fallback link is visible and functional

### Scenario 7: Poor Network Sync Retry

1. Check in guests offline
2. Come online with simulated 500 error from sync endpoint
3. Client increments syncAttempts
4. Client retries after backoff
5. On next successful response, items are marked synced

## Implementation Tasks

### Unit Tests (Vitest)

1. Expand `checkin-local-service.test.ts`:
   - Transaction atomicity (mock Dexie transaction failure)
   - Queue item fields are complete and correct

2. Expand `sync-result-processor.test.ts`:
   - All status codes handled
   - Guest checkedInAt updated to authoritative timestamp
   - SNAPSHOT_MISMATCH halts processing

3. Create `sync.service.test.ts` (server-side):
   - ACCEPTED scenario
   - DUPLICATE scenario (B syncs first, A has earlier timestamp)
   - ALREADY_PROCESSED idempotency
   - SNAPSHOT_MISMATCH response
   - INVALID_GUEST response

### Playwright Tests

4. Create `tests/e2e/offline-checkin.spec.ts`:
   - Test Scenarios 1 and 4 above using Playwright offline mode

5. Create `tests/e2e/multi-device-conflict.spec.ts`:
   - Simulate multi-device duplicate using two Playwright contexts

6. Create `tests/e2e/snapshot-mismatch.spec.ts`:
   - Scenario 5 above

## Playwright Setup

If not yet set up:
```bash
npm install -D @playwright/test
npx playwright install
```

Create `playwright.config.ts` targeting `http://localhost:3000`.

## Files and Folders Likely to Be Created or Modified

- `src/lib/offline/checkins/checkin-local-service.test.ts` (expand)
- `src/lib/offline/checkins/sync-result-processor.test.ts` (expand)
- `src/modules/sync/sync.service.test.ts`
- `tests/e2e/offline-checkin.spec.ts`
- `tests/e2e/multi-device-conflict.spec.ts`
- `tests/e2e/snapshot-mismatch.spec.ts`
- `playwright.config.ts`

## Testing Requirements

```bash
npm run test          # all Vitest unit tests pass
npx playwright test   # all E2E tests pass
```

## Manual QA Checklist (Full Event Simulation)

Run through these manually with browser DevTools:

- [ ] Download snapshot on two browser tabs (simulate two devices)
- [ ] Both go offline
- [ ] Both check in the same guest (at different times)
- [ ] Sync device B first
- [ ] Sync device A (earlier timestamp) second
- [ ] Confirm authoritative timestamp = A's (earlier)
- [ ] Both clients show correct time
- [ ] Dashboard shows 1 accepted check-in for that guest
- [ ] Pending count on both clients = 0

## Acceptance Criteria

- [ ] All unit tests pass
- [ ] E2E offline check-in test passes
- [ ] Multi-device duplicate scenario verified
- [ ] Browser refresh persistence verified
- [ ] Snapshot mismatch scenario verified
- [ ] Queue is never silently deleted before acknowledgement

## Git Commit Recommendation

```
test: add multi-device conflict handling tests
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 17 to Completed Phases
- Set Current Phase to Phase 18 and Phase 20
- Record: all test results (pass counts), any edge cases found
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 17: Multi-Device Conflict Handling Tests.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Section 40 — Testing Scenarios)
- docs/testing_strategy.md

Your task is to write comprehensive tests for the offline check-in and sync system.

Unit tests (Vitest) — expand existing test files:
1. Expand checkin-local-service.test.ts: transaction atomicity, queue item field completeness.
2. Expand sync-result-processor.test.ts: all status codes (ACCEPTED, DUPLICATE, REJECTED, SNAPSHOT_MISMATCH).
3. Create src/modules/sync/sync.service.test.ts:
   - Single device ACCEPTED scenario
   - Multi-device: later-timestamped device syncs first, earlier-timestamped device syncs second → earlier wins
   - ALREADY_PROCESSED idempotency
   - SNAPSHOT_MISMATCH
   - INVALID_GUEST

Playwright E2E tests:
4. Install Playwright if not set up, create playwright.config.ts.
5. Create tests/e2e/offline-checkin.spec.ts:
   - Download snapshot, go offline, check in guests, refresh page, confirm persistence, come online, sync, confirm server has records.
6. Create tests/e2e/multi-device-conflict.spec.ts:
   - Use two browser contexts to simulate two staff devices
   - Both check in same guest offline at different times
   - Sync in order of later-timestamp first, then earlier-timestamp
   - Confirm authoritative timestamp is the earlier one
7. Create tests/e2e/snapshot-mismatch.spec.ts:
   - Simulate SNAPSHOT_MISMATCH by having server return that status
   - Confirm client shows warning and preserves queue

CRITICAL: Queue items must never be deleted before server acknowledgement. Include a test that confirms this.

Run: npm run test — all Vitest tests pass
Run: npx playwright test — all E2E tests pass

Update PROGRESS.md: Phase 17 completed, Current Phase → Phase 18.

Commit with:
git commit -m "test: add multi-device conflict handling tests"

Report: total test count, pass/fail, any issues found.
```
