# WedPass Offline Sync Design

## 1. Document Purpose

This document defines the offline synchronization design for **WedPass V1.0**.

Offline sync is the most important technical capability in WedPass.

WedPass must allow wedding staff to check guests in even when the internet is unreliable or completely unavailable.

This document describes:

- Offline-first principles
- Event Mode preparation
- Local IndexedDB storage
- Multi-device check-in
- Local check-in algorithm
- Sync queue design
- Server reconciliation
- Conflict resolution
- Retry behavior
- Failure handling
- UI state requirements
- Testing scenarios

---

## 2. Core Offline Principle

The central principle is:

> Wedding check-in must continue even when the internet fails.

During Event Mode:

- Staff devices must not depend on the backend for every scan.
- Guest lookup must work locally.
- Check-in must be written locally first.
- Sync must happen later when internet is available.
- Server remains authoritative after synchronization.

---

## 3. Offline Sync Goals

WedPass V1.0 offline sync must support:

1. Offline guest search
2. Offline QR code lookup
3. Offline check-in
4. Multiple staff devices
5. Local persistence after refresh or device sleep
6. Sync queue retry
7. Idempotent backend sync
8. Deterministic duplicate handling
9. Clear operator confidence through UI states

---

## 4. Non-Goals

Offline sync V1.0 does not include:

- Device-to-device communication
- Peer-to-peer sync
- WebSockets
- Real-time collaboration
- CRDTs
- Complex distributed consensus
- Offline guest editing
- Offline media viewing beyond cached content

The design is intentionally simple and reliable.

---

## 5. Event Mode Overview

Event Mode is the operational state used on the wedding day.

Before Event Mode:

- Organizer can edit wedding details
- Organizer can add/edit/delete guests
- Organizer can import guests
- Organizer can generate QR codes

When Event Mode is enabled:

- Server creates a wedding snapshot
- Guest list is locked
- Staff devices download the snapshot
- Staff devices can operate offline
- Sync uses snapshot version validation

---

## 6. Snapshot Concept

A snapshot is a frozen copy of the guest list at the time Event Mode is enabled.

Snapshot contains:

- Snapshot ID
- Wedding ID
- Snapshot version
- Guest count
- Guest records
- QR tokens

Why snapshots matter:

- Prevent inconsistent guest data across devices
- Allow deterministic offline operation
- Avoid mid-event guest list changes causing sync errors
- Make debugging easier during beta

---

## 7. Snapshot Download Flow

### 7.1 Preconditions

Before downloading a snapshot:

- Wedding must be in Event Mode
- Staff device must have valid staff token
- Staff device must be active
- Active snapshot must exist

### 7.2 Flow

```text
Staff opens Offline Pack Download screen
        ↓
Device calls staff snapshot endpoint
        ↓
Server validates staff token
        ↓
Server returns active snapshot + guests
        ↓
Client clears old local guest data for that wedding
        ↓
Client saves snapshot guests to IndexedDB
        ↓
Client stores snapshot metadata
        ↓
Device becomes offline-ready
```

### 7.3 API

```http
GET /api/v1/staff/weddings/:weddingId/snapshot
```

### 7.4 Local Metadata Saved

```text
weddingId
snapshotId
snapshotVersion
staffDeviceId
deviceId
lastSnapshotDownloadedAt
lastSuccessfulSyncAt
```

---

## 8. Client-Side IndexedDB Stores

WedPass uses IndexedDB through Dexie.

Required stores:

```text
guests
checkinQueue
metadata
mediaQueue
```

Offline check-in depends mainly on:

- guests
- checkinQueue
- metadata

---

## 9. Local Guest Store

The `guests` store contains snapshot guest data.

### Type

```ts
export interface LocalGuest {
  guestId: string;
  weddingId: string;
  snapshotId: string;
  snapshotVersion: number;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  qrToken: string;
  allowedGuests: number;
  checkedIn: boolean;
  checkedInAt?: string;
  lastSyncedAt?: string;
}
```

### Indexes

```text
guestId
weddingId
snapshotId
qrToken
fullName
phoneNumber
checkedIn
```

### Usage

This store is used for:

- QR lookup
- Manual search
- Check-in status
- Recent check-ins
- Local duplicate prevention

---

## 10. Local Check-In Queue Store

The `checkinQueue` store contains unsynced local check-ins.

### Type

```ts
export interface LocalCheckinQueueItem {
  queueId: string;
  weddingId: string;
  snapshotId: string;
  snapshotVersion: number;
  guestId: string;
  checkedInAt: string;
  deviceId: string;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttemptAt?: string;
  syncError?: string;
  createdAt: string;
}
```

### Important Rules

- Queue items are append-only until server acknowledgement.
- Queue items must not be deleted before sync success.
- `queueId` must remain stable across retries.
- `queueId` is used for idempotency on the server.
- Failed items remain retryable.

---

## 11. Metadata Store

The `metadata` store contains local device and sync metadata.

### Common Keys

```text
deviceId
weddingId
snapshotId
snapshotVersion
staffDeviceId
lastSnapshotDownloadedAt
lastSuccessfulSyncAt
```

### Device ID Rule

If `deviceId` does not exist, the app must generate one:

```text
deviceId = crypto.randomUUID()
```

The same device ID should be reused for future sync attempts.

---

## 12. Device Preparation Algorithm

When staff prepares a device:

```text
1. Validate staff token.
2. Generate or load local deviceId.
3. Download active snapshot.
4. Store guests in IndexedDB.
5. Store metadata.
6. Show success state: Offline Pack Ready.
```

### Pseudocode

```ts
async function prepareOfflineDevice(weddingId: string) {
  const deviceId = await getOrCreateDeviceId();

  const snapshot = await api.staff.getSnapshot(weddingId);

  await offlineDb.transaction("rw", offlineDb.guests, offlineDb.metadata, async () => {
    await offlineDb.guests.where("weddingId").equals(weddingId).delete();

    await offlineDb.guests.bulkAdd(
      snapshot.guests.map((guest) => ({
        guestId: guest.guestId,
        weddingId,
        snapshotId: snapshot.snapshot.id,
        snapshotVersion: snapshot.snapshot.version,
        fullName: guest.fullName,
        phoneNumber: guest.phoneNumber,
        email: guest.email,
        qrToken: guest.qrToken,
        allowedGuests: guest.allowedGuests,
        checkedIn: false,
      }))
    );

    await setMetadata("deviceId", deviceId);
    await setMetadata("weddingId", weddingId);
    await setMetadata("snapshotId", snapshot.snapshot.id);
    await setMetadata("snapshotVersion", String(snapshot.snapshot.version));
    await setMetadata("lastSnapshotDownloadedAt", new Date().toISOString());
  });
}
```

---

## 13. QR Check-In Flow

### 13.1 Flow

```text
Staff scans QR code
        ↓
App extracts qrToken
        ↓
App searches LocalGuest by qrToken
        ↓
If guest found:
    Show confirmation screen
If guest not found:
    Show invalid QR error + manual search fallback
```

### 13.2 Important Rule

QR scanning must not call the backend during Event Mode check-in.

QR lookup must be local-first.

---

## 14. Manual Search Flow

Manual search is required as a fallback.

### Search Inputs

Staff can search by:

- Full name
- Phone number

### Flow

```text
Staff enters search term
        ↓
App searches IndexedDB
        ↓
Results display locally
        ↓
Staff selects guest
        ↓
App opens confirmation screen
```

### Performance Requirement

Local search should complete in under 200ms for 1,000 guests.

---

## 15. Local Check-In Algorithm

### 15.1 Preconditions

Before checking in locally:

- Guest must exist in local IndexedDB
- Guest must belong to current wedding
- Snapshot metadata must exist
- Device ID must exist

### 15.2 Algorithm

```text
1. Load guest from IndexedDB.
2. If guest.checkedIn is true:
     Show already checked-in state.
     Stop.
3. Create checkedInAt timestamp.
4. Mark guest.checkedIn = true.
5. Set guest.checkedInAt = checkedInAt.
6. Create checkinQueue item.
7. Save both operations in one IndexedDB transaction.
8. Show success immediately.
```

### 15.3 Pseudocode

```ts
async function checkInGuestLocally(guestId: string) {
  const deviceId = await getMetadata("deviceId");
  const snapshotId = await getMetadata("snapshotId");
  const snapshotVersion = Number(await getMetadata("snapshotVersion"));

  const guest = await offlineDb.guests.get(guestId);

  if (!guest) {
    throw new Error("Guest not found locally");
  }

  if (guest.checkedIn) {
    return {
      status: "already_checked_in",
      checkedInAt: guest.checkedInAt,
    };
  }

  const checkedInAt = new Date().toISOString();
  const queueId = crypto.randomUUID();

  await offlineDb.transaction("rw", offlineDb.guests, offlineDb.checkinQueue, async () => {
    await offlineDb.guests.update(guestId, {
      checkedIn: true,
      checkedInAt,
    });

    await offlineDb.checkinQueue.add({
      queueId,
      weddingId: guest.weddingId,
      snapshotId,
      snapshotVersion,
      guestId,
      checkedInAt,
      deviceId,
      synced: false,
      syncAttempts: 0,
      createdAt: new Date().toISOString(),
    });
  });

  return {
    status: "checked_in_locally",
    checkedInAt,
    queueId,
  };
}
```

---

## 16. Local Duplicate Prevention

If the same device tries to check in the same guest twice:

```text
guest.checkedIn === true
```

Then the app should show:

```text
Already checked in at HH:MM
```

No new queue item should be created.

---

## 17. Cross-Device Duplicate Handling

If two devices check in the same guest offline:

```text
Device A checks guest at 14:01
Device B checks guest at 14:03
```

Both devices accept locally.

During sync:

- Server compares timestamps
- Earliest timestamp wins
- Later check-in is duplicate

This is expected behavior.

---

## 18. Sync Trigger Rules

Sync should trigger when:

1. App detects internet restored
2. Staff taps “Sync Now”
3. App regains focus and is online
4. Periodic timer runs while online
5. After a successful local check-in while online

Recommended interval while online:

```text
Every 60–120 seconds
```

Avoid excessive sync calls.

---

## 19. Sync Preconditions

Before syncing:

- Device must be online
- Staff token must exist
- Wedding ID must exist
- Snapshot metadata must exist
- There must be unsynced queue items

If any condition fails, sync should not run.

---

## 20. Sync Batch Size

Recommended batch size:

```text
100 check-ins per request
```

This prevents very large payloads and simplifies retries.

---

## 21. Sync Request

Endpoint:

```http
POST /api/v1/staff/weddings/:weddingId/checkins/sync
```

Request:

```json
{
  "snapshotId": "uuid",
  "snapshotVersion": 1,
  "deviceId": "uuid",
  "checkins": [
    {
      "queueId": "local_queue_uuid",
      "guestId": "guest_uuid",
      "checkedInAt": "2026-08-14T14:03:00Z"
    }
  ]
}
```

---

## 22. Sync Response

Response:

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "queueId": "local_queue_uuid",
        "guestId": "guest_uuid",
        "status": "ACCEPTED",
        "authoritativeCheckedInAt": "2026-08-14T14:03:00Z"
      },
      {
        "queueId": "local_queue_uuid_2",
        "guestId": "guest_uuid_2",
        "status": "DUPLICATE",
        "authoritativeCheckedInAt": "2026-08-14T13:59:00Z"
      }
    ],
    "summary": {
      "accepted": 1,
      "duplicate": 1,
      "rejected": 0
    }
  }
}
```

---

## 23. Sync Result Statuses

Possible statuses:

```text
ACCEPTED
DUPLICATE
REJECTED
INVALID_GUEST
SNAPSHOT_MISMATCH
ALREADY_PROCESSED
```

### ACCEPTED

Server accepted this check-in as authoritative.

Client action:

- Mark queue item as synced
- Update guest checkedIn = true
- Update guest checkedInAt = authoritative timestamp

### DUPLICATE

Another check-in already exists for the guest.

Client action:

- Mark queue item as synced
- Update guest checkedIn = true
- Update guest checkedInAt = authoritative timestamp
- Optionally mark local duplicate metadata for UI

### REJECTED

Server rejected the check-in.

Client action:

- Keep item or mark as failed
- Show error in Sync Status screen
- Do not silently discard

### INVALID_GUEST

Guest does not exist or does not belong to snapshot.

Client action:

- Mark item failed
- Show staff warning
- Suggest snapshot refresh

### SNAPSHOT_MISMATCH

Client snapshot does not match server active snapshot.

Client action:

- Stop syncing
- Warn staff
- Require snapshot refresh

### ALREADY_PROCESSED

Server has already processed this `queueId`.

Client action:

- Mark queue item as synced
- Update guest using authoritative timestamp

---

## 24. Sync Algorithm

### 24.1 Client Algorithm

```text
1. Check online state.
2. Load unsynced queue items.
3. If none, stop.
4. Load metadata.
5. Build batch payload.
6. Send sync request.
7. Process response per item.
8. Mark accepted/duplicate/already_processed items as synced.
9. Mark rejected items with error.
10. Update local guests with authoritative timestamps.
11. Update lastSuccessfulSyncAt.
12. Repeat if more unsynced items remain.
```

### 24.2 Pseudocode

```ts
async function syncCheckins() {
  if (!navigator.onLine) return;

  const metadata = await getSyncMetadata();
  const items = await offlineDb.checkinQueue
    .where("synced")
    .equals(false)
    .limit(100)
    .toArray();

  if (items.length === 0) return;

  await markSyncAttempt(items);

  try {
    const response = await api.staff.syncCheckins(metadata.weddingId, {
      snapshotId: metadata.snapshotId,
      snapshotVersion: metadata.snapshotVersion,
      deviceId: metadata.deviceId,
      checkins: items.map((item) => ({
        queueId: item.queueId,
        guestId: item.guestId,
        checkedInAt: item.checkedInAt,
      })),
    });

    await offlineDb.transaction("rw", offlineDb.guests, offlineDb.checkinQueue, offlineDb.metadata, async () => {
      for (const result of response.results) {
        if (
          result.status === "ACCEPTED" ||
          result.status === "DUPLICATE" ||
          result.status === "ALREADY_PROCESSED"
        ) {
          await offlineDb.checkinQueue.update(result.queueId, {
            synced: true,
            syncError: undefined,
          });

          await offlineDb.guests.update(result.guestId, {
            checkedIn: true,
            checkedInAt: result.authoritativeCheckedInAt,
            lastSyncedAt: new Date().toISOString(),
          });
        } else {
          await offlineDb.checkinQueue.update(result.queueId, {
            syncError: result.status,
          });
        }
      }

      await setMetadata("lastSuccessfulSyncAt", new Date().toISOString());
    });
  } catch (error) {
    await recordSyncFailure(items, error);
  }
}
```

---

## 25. Retry Strategy

If sync fails due to network or server error:

- Do not mark items as synced
- Increment syncAttempts
- Store lastSyncAttemptAt
- Store syncError
- Retry later

Recommended backoff:

```text
Attempt 1: 5 seconds
Attempt 2: 15 seconds
Attempt 3: 45 seconds
Attempt 4+: 2 minutes
```

Manual “Sync Now” should bypass waiting but still respect online state.

---

## 26. Idempotency

The sync endpoint must be idempotent.

Idempotency key:

```text
staffDeviceId + queueId
```

If the same queue item is submitted multiple times:

- Server must not create duplicate accepted check-ins
- Server returns previous result or authoritative state

This protects against:

- Retry after timeout
- Browser refresh
- Duplicate network requests
- Staff tapping Sync Now repeatedly

---

## 27. Server Reconciliation Algorithm

For each incoming check-in:

```text
1. Validate staff device.
2. Validate snapshot.
3. Validate guest belongs to wedding.
4. Validate guest belongs to snapshot.
5. Check if queueId was already processed.
6. If already processed, return ALREADY_PROCESSED.
7. Find current accepted check-in for guest.
8. If none:
     create accepted check-in.
9. If existing accepted check-in exists:
     compare timestamps.
10. If incoming timestamp is earlier:
      mark previous accepted check-in duplicate.
      create incoming as accepted.
      update guest checked_in_at.
11. If incoming timestamp is later:
      create incoming as duplicate or return duplicate.
12. Return result.
```

---

## 28. Earliest Timestamp Wins

WedPass uses the rule:

> Earliest valid check-in timestamp wins.

### Why

This rule matches real-world event operation.

If one staff member checked the guest in earlier, that should be the authoritative check-in.

### Example

```text
Device B syncs first:
- Guest checked in at 14:03
- Server accepts 14:03

Device A syncs later:
- Guest checked in at 14:01
- Server updates authority to 14:01
- 14:03 becomes duplicate
```

This is slightly more complex than “first sync wins” but more accurate.

---

## 29. Sync UI Requirements

Staff must always understand sync safety.

### Required UI States

```text
Online · All synced
Online · Syncing
Offline · 12 pending
Sync failed · Retrying
Snapshot mismatch · Refresh required
```

### Required Messaging

When offline:

```text
Offline mode active. Check-ins are safely saved on this device and will sync when internet returns.
```

When sync fails:

```text
Sync failed. Your check-ins are still saved on this device. We will retry automatically.
```

When all synced:

```text
All check-ins are synced.
```

---

## 30. SyncStatusBar

Every staff operational screen must include a sync status bar.

Screens:

- Staff Check-In Home
- QR Scanner
- Guest Check-In Confirmation
- Manual Search
- Sync Status

Props:

```ts
type SyncStatusBarProps = {
  isOnline: boolean;
  pendingCount: number;
  lastSyncedAt?: string;
  syncState: "idle" | "syncing" | "failed" | "offline";
};
```

---

## 31. Offline Pack Readiness UI

Before event day, the device must clearly show whether it is ready.

States:

```text
Not prepared
Downloading snapshot
Offline pack ready
Snapshot outdated
Download failed
```

Critical message:

```text
Download this offline pack before guests arrive.
```

---

## 32. Media Offline Queue

Media upload sync is separate from check-in sync.

Photos/videos cannot be uploaded without internet, but upload attempts can be queued.

### Media Queue Flow

```text
Guest selects file
        ↓
Client validates file
        ↓
If offline:
    Save file blob in mediaQueue
    Show queued state
If online:
    Request signed URL
    Upload to R2
    Confirm upload
```

### Important Rule

Media upload failure must never affect check-in sync.

Check-in sync and media sync are separate systems.

---

## 33. Media Queue Risks

Browser storage may be limited.

Especially for videos.

V1.0 should:

- Limit video file size
- Warn users about large videos
- Avoid unlimited queueing
- Allow retry
- Allow user to remove failed uploads

---

## 34. Network Detection

Use browser online/offline events:

```ts
window.addEventListener("online", handleOnline);
window.addEventListener("offline", handleOffline);
```

Also use request failures as a source of truth.

Important:

```text
navigator.onLine is not always reliable.
```

A device may appear online but have no usable internet.

Sync should handle request failures gracefully.

---

## 35. App Lifecycle Events

Sync should also consider:

- App focus
- Visibility change
- Page reload
- Device wake from sleep

Useful event:

```ts
document.addEventListener("visibilitychange", ...)
```

When app becomes visible and online, attempt sync.

---

## 36. Snapshot Mismatch Handling

If server returns `SNAPSHOT_MISMATCH`:

Client must:

1. Stop syncing current queue.
2. Show clear warning.
3. Ask staff to refresh offline pack.
4. Avoid deleting local check-ins.
5. Preserve queue for support/debugging.

Message:

```text
This device is using an outdated event snapshot. Please refresh the offline pack before continuing.
```

In V1.0, snapshot mismatch should be rare because guest list is locked in Event Mode.

---

## 37. Local Data Clearing

Staff should be able to clear local event data only intentionally.

Use cases:

- Wrong wedding loaded
- Device being reused
- Event completed
- Debugging

Clearing local data must require confirmation.

Warning:

```text
This will remove offline guest data and any unsynced check-ins from this device. Only continue if all check-ins are synced.
```

If unsynced queue exists, block clearing unless admin override is implemented.

---

## 38. Security Considerations

Offline data is stored on staff devices.

Security rules:

- Do not store organizer password.
- Do not store refresh token in IndexedDB.
- Store only event-specific guest snapshot.
- Staff token should expire.
- Staff token should be scoped to wedding.
- Device can be revoked server-side.
- Local data should be clearable after event.
- Public QR tokens must be non-predictable.

---

## 39. Privacy Considerations

Guest snapshot includes personal data.

Keep local data minimal:

- Full name
- Phone number if needed for search
- Email only if necessary
- Allowed guest count
- QR token

Avoid storing unnecessary personal data offline.

---

## 40. Testing Scenarios

Offline sync must be tested thoroughly.

### 40.1 Single Device Offline Check-In

Scenario:

1. Download snapshot.
2. Turn off internet.
3. Check in 10 guests.
4. Refresh browser.
5. Confirm check-ins still exist.
6. Restore internet.
7. Sync.
8. Confirm server has 10 check-ins.

---

### 40.2 Multi-Device Duplicate

Scenario:

1. Device A and Device B download same snapshot.
2. Turn both offline.
3. Both check in same guest.
4. Device B checks in at 14:03.
5. Device A checks in at 14:01.
6. Sync Device B first.
7. Sync Device A second.
8. Confirm authoritative timestamp is 14:01.

---

### 40.3 Sync Retry

Scenario:

1. Check in guests offline.
2. Restore internet.
3. Simulate failed sync request.
4. Confirm queue remains unsynced.
5. Retry.
6. Confirm queue syncs.

---

### 40.4 Browser Refresh

Scenario:

1. Check in guest offline.
2. Refresh browser.
3. Confirm guest remains checked in locally.
4. Confirm queue item still exists.

---

### 40.5 Snapshot Mismatch

Scenario:

1. Device has old snapshot.
2. Server has different active snapshot.
3. Device attempts sync.
4. Server returns SNAPSHOT_MISMATCH.
5. Client shows warning and preserves queue.

---

### 40.6 Invalid QR

Scenario:

1. Scan QR not belonging to wedding.
2. App shows invalid QR.
3. Manual search fallback is available.

---

### 40.7 Poor Network

Scenario:

1. Device appears online.
2. Sync request times out.
3. App shows retrying state.
4. Queue remains safe.

---

## 41. Unit Tests

Unit tests should cover:

- Local check-in service
- Duplicate local check-in prevention
- Queue item creation
- Metadata loading
- Sync result processing
- Conflict result handling
- Retry counter updates

---

## 42. Integration Tests

Integration tests should cover:

- Snapshot download to IndexedDB
- Offline check-in flow
- Sync endpoint processing
- Idempotent sync retry
- Multi-device conflict resolution

---

## 43. E2E Tests

E2E tests should cover:

- Staff downloads offline pack
- Staff goes offline
- Staff scans/searches guest
- Staff checks guest in
- Staff comes online
- Sync completes
- Organizer dashboard reflects check-in

Use Playwright where possible.

---

## 44. Observability

Log and monitor:

- Snapshot downloads
- Staff device IDs
- Sync attempts
- Sync failures
- Duplicate conflicts
- Snapshot mismatches
- Queue sizes
- Last sync timestamps

These logs are especially important during free beta.

---

## 45. Operational Checklist for Real Weddings

Before wedding day:

- Guest list imported
- QR codes generated
- Event Mode enabled
- Staff devices registered
- Offline pack downloaded on every staff device
- Manual search tested
- QR scan tested
- Sync status understood by staff
- Backup phone or tablet prepared

After wedding:

- Ensure all staff devices synced
- Check pending sync count is zero
- Review duplicate conflicts
- Confirm dashboard totals
- Clear local data only after successful sync

---

## 46. Implementation Boundaries

Offline sync code should live in:

```text
src/lib/offline/
```

Suggested structure:

```text
src/lib/offline/
  db.ts
  metadata.ts

  guests/
    guest-local-repository.ts
    guest-search.ts

  checkins/
    checkin-local-service.ts
    checkin-sync-service.ts
    checkin-sync-client.ts
    sync-result-processor.ts

  media/
    media-upload-queue.ts
    media-upload-sync.ts

  hooks/
    use-sync-status.ts
    use-local-guests.ts
    use-recent-checkins.ts
    use-upload-queue.ts

  network/
    network-monitor.ts
```

React components must not contain sync business logic.

---

## 47. Anti-Patterns

Do not:

- Call the backend during every QR scan.
- Block check-in when offline.
- Delete sync queue items before acknowledgement.
- Store all guests in Zustand.
- Store passwords in IndexedDB.
- Mix media sync and check-in sync.
- Hide pending sync state from staff.
- Use WebSockets in V1.0.
- Use complex distributed consensus algorithms.
- Allow guest edits during Event Mode.

---

## 48. Summary

WedPass offline sync is built around a simple but powerful model:

```text
Prepare snapshot before event
        ↓
Operate locally during event
        ↓
Queue all check-ins
        ↓
Sync safely when online
        ↓
Server resolves conflicts
```

This design makes WedPass resilient in real wedding conditions where internet cannot be trusted.

The core rule remains:

> Check-in must never depend on live internet.
