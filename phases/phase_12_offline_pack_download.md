# Phase 12 — Offline Pack Download

## Goal

Implement the staff snapshot download endpoint and the staff device preparation flow. Staff devices fetch the active snapshot + guest list from the server and store everything in IndexedDB, making the device offline-ready for Event Mode check-in.

## Why This Phase Matters

The offline pack download is the moment a staff device transitions from "online only" to "event-day ready." If this step fails silently, staff will arrive at the wedding without offline data. The download must be clearly confirmed, and the local storage must be verified.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Sections 7, 12, 31)
- `docs/api_contracts.md` (Part 6 Section 27 — Staff Download Snapshot)
- `docs/database_schema.md` (snapshot_guests table)

## Dependencies

- Phase 09 complete (offline IndexedDB foundation)
- Phase 10 complete (staff auth)
- Phase 11 complete (snapshot creation)

## Scope

### Backend

- Staff snapshot download endpoint:
  - `GET /api/v1/staff/weddings/:weddingId/snapshot`
  - Auth: staff token
  - Returns: wedding info, snapshot metadata, full guest list
  - Validates: staff device ACTIVE, snapshot exists for wedding
  - Updates: `staffDevice.lastSeenAt`

### Frontend — Offline Pack Preparation

- `src/lib/offline/checkins/snapshot-download.ts`:
  - `downloadAndSaveSnapshot(weddingId, staffToken)`:
    1. Call snapshot endpoint
    2. Clear old guest data for this wedding in IndexedDB
    3. Bulk save new guests to IndexedDB
    4. Save snapshot metadata to `metadata` store
    5. Return success with guest count
- `src/app/staff/[weddingId]/download/page.tsx`:
  - Shows offline pack status card:
    - `Not prepared` — no snapshot data
    - `Downloading...` — in progress
    - `Offline Pack Ready` — with guest count and last downloaded time
    - `Snapshot outdated` — if metadata differs from server
    - `Download failed` — with retry button
  - Critical message: "Download this offline pack before guests arrive."
  - Download button (triggers `downloadAndSaveSnapshot`)
  - Redirect to check-in home after successful download

## Explicitly Out of Scope

- Check-in itself (Phase 14)
- Sync (Phase 15–16)

## Implementation Tasks

1. Create staff snapshot route:
   - `src/app/api/v1/staff/weddings/[weddingId]/snapshot/route.ts`
   - Auth via `requireStaffAuth`
   - Validate device is ACTIVE
   - Fetch active snapshot + all snapshot_guests
   - Update device `lastSeenAt`
   - Return response per `api_contracts.md` Section 27
2. Create `src/lib/offline/checkins/snapshot-download.ts`:
   ```ts
   export async function downloadAndSaveSnapshot(weddingId: string): Promise<{
     guestCount: number;
     snapshotId: string;
     snapshotVersion: number;
   }>
   ```
   Implementation:
   - Fetch staff token from auth store
   - Call snapshot API
   - Begin Dexie transaction: clear existing guests for weddingId, bulk add new guests
   - Save metadata: weddingId, snapshotId, snapshotVersion, staffDeviceId, lastSnapshotDownloadedAt
3. Create `src/hooks/use-offline-pack-status.ts`:
   - Reads metadata from IndexedDB
   - Returns: `{ isReady, guestCount, lastDownloadedAt, snapshotId }`
4. Build `src/app/staff/[weddingId]/download/page.tsx`:
   - Show `OfflinePackStatusCard` (use or build this component)
   - State machine UI: not-prepared → downloading → ready / failed
   - Download button calls `downloadAndSaveSnapshot`
   - After download success: show guest count, last downloaded time, navigate to check-in
   - Mobile-first, large buttons (h-14 minimum)
5. After download, staff should see:
   ```
   ✅ Offline Pack Ready
   300 guests loaded
   Last downloaded: Today at 08:45 AM
   [Start Check-In →]
   ```

## Files and Folders Likely to Be Created or Modified

- `src/app/api/v1/staff/weddings/[weddingId]/snapshot/route.ts`
- `src/lib/offline/checkins/snapshot-download.ts`
- `src/hooks/use-offline-pack-status.ts`
- `src/app/staff/[weddingId]/download/page.tsx`
- `src/components/staff/offline-pack-status-card.tsx`

## Testing Requirements

- Download snapshot with valid staff token — verify guests saved to IndexedDB
- Download snapshot with revoked device — verify `UNAUTHORIZED`
- Download when wedding not in Event Mode — verify error
- Refresh page after download — verify IndexedDB data persists
- Count of local guests matches snapshot guest count
- `npm run lint` passes

## Manual QA Checklist (Requires Browser DevTools)

- [ ] Download page loads for staff
- [ ] Initial state shows "Not prepared"
- [ ] Download button triggers fetch + IndexedDB write
- [ ] After download: shows "Offline Pack Ready" with guest count
- [ ] In DevTools IndexedDB: `guests` store shows downloaded guests
- [ ] In DevTools IndexedDB: `metadata` store shows snapshotId and lastSnapshotDownloadedAt
- [ ] Page refresh keeps "Offline Pack Ready" state
- [ ] Revoked device shows error on download attempt

## Acceptance Criteria

- [ ] Snapshot endpoint returns full guest list
- [ ] Client clears old and saves new guests atomically
- [ ] Metadata saved correctly
- [ ] UI reflects correct download state
- [ ] Persists across browser refreshes
- [ ] Staff device lastSeenAt updated on download

## Git Commit Recommendation

```
feat: add offline pack download
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 12 to Completed Phases
- Set Current Phase to Phase 13A
- Record: snapshot download tested, IndexedDB verified in browser DevTools
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 12: Offline Pack Download.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Sections 7, 12, and 31 — Device Preparation, Snapshot Download Flow, Offline Pack Readiness UI)
- docs/api_contracts.md (Part 6 Section 27 — Staff Download Snapshot)

Your task is to implement snapshot download for staff devices.

Backend:
1. Create src/app/api/v1/staff/weddings/[weddingId]/snapshot/route.ts (GET, staff auth required):
   - Validate staff token via requireStaffAuth
   - Check device is ACTIVE
   - Fetch active snapshot for wedding
   - Fetch all snapshot_guests for that snapshot
   - Update staffDevice.lastSeenAt
   - Return: { wedding, snapshot: { id, version, guestCount }, guests: [...] }
   (See api_contracts.md Section 27 for exact response shape)

Offline client:
2. Create src/lib/offline/checkins/snapshot-download.ts:
   downloadAndSaveSnapshot(weddingId: string): Promise<{ guestCount, snapshotId, snapshotVersion }>
   - Calls the snapshot API
   - Uses a Dexie transaction to: clear old guests for weddingId, bulk add new guests
   - Saves metadata: weddingId, snapshotId, snapshotVersion, staffDeviceId, lastSnapshotDownloadedAt

3. Create src/hooks/use-offline-pack-status.ts:
   Returns { isReady, guestCount, lastDownloadedAt, snapshotId } from IndexedDB metadata.

Frontend:
4. Build src/app/staff/[weddingId]/download/page.tsx (mobile-first):
   - Shows offline pack status: Not prepared / Downloading / Ready / Failed
   - Download button (calls downloadAndSaveSnapshot)
   - On success: shows guest count, last downloaded time, link to check-in
   - Critical text: "Download this offline pack before guests arrive."
   - Button height: h-14 minimum

IMPORTANT:
- The snapshot save must be atomic — use a Dexie transaction
- Clear old guest data before saving new data to prevent stale entries
- The UI must persist download state across page refreshes (read from IndexedDB, not local state)

After completing:
- Test download flow end-to-end
- Verify IndexedDB in browser DevTools shows guests and metadata
- Test page refresh preserves ready state
- Run npm run lint — must pass

Update PROGRESS.md: Phase 12 completed, Current Phase → Phase 13A.

Commit with:
git commit -m "feat: add offline pack download"
```
