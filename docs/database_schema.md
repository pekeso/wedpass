# WedPass Database Schema

## 1. Document Purpose

This document defines the database schema for **WedPass V1.0**.

It covers two persistence layers:

1. **Server database**: PostgreSQL, accessed through Prisma.
2. **Client database**: IndexedDB, accessed through Dexie.

WedPass is offline-first, so both server and client schemas are important.

The server database is the authoritative source of truth after synchronization.

The client database is the local source of truth during offline event operation.

---

## 2. Database Design Principles

WedPass V1.0 follows these data design principles:

1. Use UUIDs for all primary identifiers.
2. Avoid predictable IDs in public links and QR codes.
3. Scope all wedding data by `wedding_id`.
4. Keep check-in synchronization idempotent.
5. Lock guest lists during Event Mode using snapshots.
6. Store media files in object storage, not PostgreSQL.
7. Store only media metadata in PostgreSQL.
8. Use IndexedDB for offline-critical data only.
9. Avoid premature complexity in V1.0.
10. Use indexes for all high-frequency lookup fields.

---

# Part 1 — Server Database: PostgreSQL

---

## 3. Server Schema Overview

Main PostgreSQL entities:

```text
users
weddings
guests
wedding_snapshots
snapshot_guests
staff_devices
check_ins
media_uploads
sync_logs
beta_feedback
```

Optional future tables are documented later but should not be implemented unless needed.

---

## 4. Entity Relationship Overview

```text
users
  └── weddings
        ├── guests
        ├── wedding_snapshots
        │     └── snapshot_guests
        ├── staff_devices
        ├── check_ins
        ├── media_uploads
        ├── sync_logs
        └── beta_feedback
```

Important relationships:

- One organizer can own multiple weddings in the future.
- V1.0 may expose one active wedding per account, but schema should allow multiple.
- A wedding has many guests.
- A wedding can have multiple snapshots over time.
- A snapshot contains copied guest data for event-day consistency.
- Check-ins reference both guest and snapshot.
- Staff devices are scoped to one wedding.
- Media uploads belong to one wedding.

---

## 5. Enums

Recommended PostgreSQL / Prisma enums:

```prisma
enum UserRole {
  ORGANIZER
}

enum WeddingStatus {
  DRAFT
  ACTIVE
  EVENT_MODE
  COMPLETED
}

enum MediaType {
  IMAGE
  VIDEO
}

enum MediaStatus {
  UPLOADED
  APPROVED
  HIDDEN
  DELETED
}

enum CheckinSyncStatus {
  ACCEPTED
  DUPLICATE
  REJECTED
}

enum StaffDeviceStatus {
  ACTIVE
  REVOKED
}

enum UploadSource {
  GUEST
  ORGANIZER
}
```

---

## 6. users

Stores organizer accounts.

### Fields

```text
id                 uuid primary key
email              varchar unique not null
password_hash      varchar not null
full_name          varchar not null
role               enum UserRole default ORGANIZER
created_at         timestamp not null
updated_at         timestamp not null
last_login_at      timestamp nullable
```

### Notes

- Guests do not have accounts in V1.0.
- Staff access is handled through scoped staff tokens and devices.
- Passwords must be hashed with bcrypt.

### Indexes

```text
unique index users_email_unique on users(email)
```

---

## 7. weddings

Stores wedding records.

### Fields

```text
id                 uuid primary key
organizer_id       uuid foreign key -> users.id
name               varchar not null
couple_names       varchar nullable
event_date         date nullable
location           varchar nullable
country            varchar nullable
slug               varchar unique not null
cover_image_url    varchar nullable
status             enum WeddingStatus default DRAFT
gallery_enabled    boolean default true
created_at         timestamp not null
updated_at         timestamp not null
completed_at       timestamp nullable
```

### Notes

- `slug` is used for guest-facing links.
- `status` controls what actions are allowed.
- Once status is `EVENT_MODE`, guest editing is locked.

### Indexes

```text
index weddings_organizer_id_idx on weddings(organizer_id)
unique index weddings_slug_unique on weddings(slug)
index weddings_status_idx on weddings(status)
```

---

## 8. guests

Stores editable guest records before Event Mode.

### Fields

```text
id                         uuid primary key
wedding_id                 uuid foreign key -> weddings.id
full_name                  varchar not null
phone_number               varchar nullable
email                      varchar nullable
number_of_allowed_guests   integer default 1
qr_token                   varchar unique not null
is_checked_in              boolean default false
checked_in_at              timestamp nullable
created_at                 timestamp not null
updated_at                 timestamp not null
deleted_at                 timestamp nullable
```

### Notes

- `qr_token` must be high entropy and non-predictable.
- `is_checked_in` may be denormalized for dashboard speed.
- The authoritative check-in event should still be stored in `check_ins`.
- Soft delete is recommended to avoid accidental data loss.

### Indexes

```text
index guests_wedding_id_idx on guests(wedding_id)
unique index guests_qr_token_unique on guests(qr_token)
index guests_phone_number_idx on guests(phone_number)
index guests_full_name_idx on guests(full_name)
index guests_checkin_status_idx on guests(wedding_id, is_checked_in)
```

### Constraints

```text
number_of_allowed_guests >= 1
```

---

## 9. wedding_snapshots

Stores event-day snapshot metadata.

### Fields

```text
id                   uuid primary key
wedding_id           uuid foreign key -> weddings.id
version              integer not null
is_active            boolean default false
guest_count          integer not null
created_by_user_id   uuid foreign key -> users.id nullable
created_at           timestamp not null
```

### Notes

- A snapshot is created when Event Mode is enabled.
- All staff devices should operate using the same active snapshot.
- Snapshots allow deterministic offline operation.
- There should only be one active snapshot per wedding.

### Indexes

```text
index wedding_snapshots_wedding_id_idx on wedding_snapshots(wedding_id)
unique index wedding_snapshots_wedding_version_unique on wedding_snapshots(wedding_id, version)
index wedding_snapshots_active_idx on wedding_snapshots(wedding_id, is_active)
```

---

## 10. snapshot_guests

Stores copied guest data for a snapshot.

This avoids event-day inconsistencies if the original guest data changes later.

### Fields

```text
id                         uuid primary key
snapshot_id                uuid foreign key -> wedding_snapshots.id
wedding_id                 uuid foreign key -> weddings.id
guest_id                   uuid foreign key -> guests.id
full_name                  varchar not null
phone_number               varchar nullable
email                      varchar nullable
number_of_allowed_guests   integer default 1
qr_token                   varchar not null
created_at                 timestamp not null
```

### Notes

- This is a snapshot copy of guest data.
- Staff devices download from this table.
- `guest_id` links back to the canonical guest record.

### Indexes

```text
index snapshot_guests_snapshot_id_idx on snapshot_guests(snapshot_id)
index snapshot_guests_wedding_id_idx on snapshot_guests(wedding_id)
index snapshot_guests_guest_id_idx on snapshot_guests(guest_id)
index snapshot_guests_qr_token_idx on snapshot_guests(qr_token)
unique index snapshot_guests_snapshot_guest_unique on snapshot_guests(snapshot_id, guest_id)
```

---

## 11. staff_devices

Stores staff device access records.

### Fields

```text
id                 uuid primary key
wedding_id         uuid foreign key -> weddings.id
label              varchar nullable
device_token_hash  varchar nullable
status             enum StaffDeviceStatus default ACTIVE
last_seen_at       timestamp nullable
created_at         timestamp not null
updated_at         timestamp not null
revoked_at         timestamp nullable
```

### Notes

- `id` can act as the device ID.
- Device tokens should be hashed if stored.
- Staff access must be scoped to a single wedding.
- Revoked devices cannot download snapshots or sync check-ins.

### Indexes

```text
index staff_devices_wedding_id_idx on staff_devices(wedding_id)
index staff_devices_status_idx on staff_devices(wedding_id, status)
```

---

## 12. check_ins

Stores authoritative check-in records.

### Fields

```text
id                    uuid primary key
wedding_id            uuid foreign key -> weddings.id
guest_id              uuid foreign key -> guests.id
snapshot_id           uuid foreign key -> wedding_snapshots.id
staff_device_id       uuid foreign key -> staff_devices.id nullable
checked_in_at         timestamp not null
created_at            timestamp not null
source_queue_id       varchar nullable
is_duplicate          boolean default false
duplicate_of_id       uuid foreign key -> check_ins.id nullable
sync_status           enum CheckinSyncStatus default ACCEPTED
```

### Notes

- For accepted check-ins, only one authoritative check-in should exist per guest.
- Duplicate check-in attempts can be stored for audit if desired.
- `source_queue_id` helps idempotency from client sync queue.
- `guest_id` should be unique for accepted check-ins.

### Recommended Unique Constraints

Preferred V1.0 approach:

```text
unique index check_ins_guest_unique_accepted
on check_ins(guest_id)
where is_duplicate = false
```

If partial indexes are not easily represented in Prisma, enforce this rule in service logic and database transaction.

### Indexes

```text
index check_ins_wedding_id_idx on check_ins(wedding_id)
index check_ins_guest_id_idx on check_ins(guest_id)
index check_ins_snapshot_id_idx on check_ins(snapshot_id)
index check_ins_staff_device_id_idx on check_ins(staff_device_id)
index check_ins_checked_in_at_idx on check_ins(checked_in_at)
unique index check_ins_source_queue_unique on check_ins(staff_device_id, source_queue_id)
```

---

## 13. media_uploads

Stores media metadata.

Actual files are stored in Cloudflare R2.

### Fields

```text
id                         uuid primary key
wedding_id                 uuid foreign key -> weddings.id
uploaded_by_guest_id       uuid foreign key -> guests.id nullable
uploaded_by_name           varchar nullable
media_type                 enum MediaType not null
upload_source              enum UploadSource default GUEST
file_key                   varchar unique not null
file_url                   varchar nullable
thumbnail_key              varchar nullable
thumbnail_url              varchar nullable
file_size_bytes            bigint not null
duration_seconds           integer nullable
mime_type                  varchar not null
original_file_name         varchar nullable
status                     enum MediaStatus default UPLOADED
created_at                 timestamp not null
updated_at                 timestamp not null
hidden_at                  timestamp nullable
deleted_at                 timestamp nullable
```

### Notes

- `file_key` is the object storage key.
- `file_url` may be generated dynamically instead of stored permanently.
- V1.0 can treat uploaded media as visible by default or require approval depending on product decision.
- Safer default: uploaded but organizer can hide/delete.

### Indexes

```text
index media_uploads_wedding_id_idx on media_uploads(wedding_id)
index media_uploads_media_type_idx on media_uploads(wedding_id, media_type)
index media_uploads_status_idx on media_uploads(wedding_id, status)
unique index media_uploads_file_key_unique on media_uploads(file_key)
index media_uploads_created_at_idx on media_uploads(created_at)
```

---

## 14. sync_logs

Stores sync attempt logs for debugging and beta monitoring.

### Fields

```text
id                 uuid primary key
wedding_id         uuid foreign key -> weddings.id
staff_device_id    uuid foreign key -> staff_devices.id nullable
snapshot_id        uuid foreign key -> wedding_snapshots.id nullable
payload_count      integer not null
accepted_count     integer default 0
duplicate_count    integer default 0
rejected_count     integer default 0
error_count        integer default 0
sync_started_at    timestamp not null
sync_completed_at  timestamp nullable
created_at         timestamp not null
```

### Notes

- Very useful during beta.
- Helps diagnose event-day sync problems.
- Should not store sensitive full payloads unless necessary.

### Indexes

```text
index sync_logs_wedding_id_idx on sync_logs(wedding_id)
index sync_logs_staff_device_id_idx on sync_logs(staff_device_id)
index sync_logs_created_at_idx on sync_logs(created_at)
```

---

## 15. beta_feedback

Stores feedback from beta users.

### Fields

```text
id                 uuid primary key
wedding_id         uuid foreign key -> weddings.id nullable
user_id            uuid foreign key -> users.id nullable
rating             integer nullable
worked_well        text nullable
confusing          text nullable
offline_feedback   text nullable
media_feedback     text nullable
general_comment    text nullable
created_at         timestamp not null
```

### Constraints

```text
rating between 1 and 10
```

### Indexes

```text
index beta_feedback_wedding_id_idx on beta_feedback(wedding_id)
index beta_feedback_user_id_idx on beta_feedback(user_id)
```

---

# Part 2 — Client Database: IndexedDB

---

## 16. Client Schema Overview

Client-side persistence is required for offline operation.

IndexedDB stores:

```text
guests
checkinQueue
metadata
mediaQueue
```

IndexedDB is accessed using Dexie.

---

## 17. IndexedDB Design Principles

1. Store only what is needed for offline operation.
2. Do not store passwords.
3. Do not store refresh tokens.
4. Store guest snapshot data for staff mode.
5. Store check-in queue until server acknowledgement.
6. Store media blobs only for pending upload.
7. Keep local schema simple.
8. Index fields used for search and sync.

---

## 18. Dexie Database Name

Recommended database name:

```text
wedpass_offline_db
```

---

## 19. Store: guests

Stores downloaded event snapshot guests.

### TypeScript Interface

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

### Dexie Store Definition

```ts
guests: "guestId, weddingId, snapshotId, qrToken, fullName, phoneNumber, checkedIn"
```

### Primary Key

```text
guestId
```

### Indexes

```text
weddingId
snapshotId
qrToken
fullName
phoneNumber
checkedIn
```

### Notes

- This store is replaced when a new snapshot is downloaded.
- It is the local lookup source during Event Mode.

---

## 20. Store: checkinQueue

Stores unsynced local check-ins.

### TypeScript Interface

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

### Dexie Store Definition

```ts
checkinQueue: "queueId, weddingId, guestId, synced, createdAt"
```

### Primary Key

```text
queueId
```

### Indexes

```text
weddingId
guestId
synced
createdAt
```

### Notes

- Queue items must not be deleted before server acknowledgement.
- The queue must be retry-safe.
- Each queue item should have a stable `queueId` for idempotency.

---

## 21. Store: metadata

Stores device and local sync metadata.

### TypeScript Interface

```ts
export interface LocalMetadata {
  key: string;
  value: string;
  updatedAt: string;
}
```

### Common Keys

```text
deviceId
weddingId
snapshotId
snapshotVersion
lastSnapshotDownloadedAt
lastSuccessfulSyncAt
staffDeviceId
```

### Dexie Store Definition

```ts
metadata: "key"
```

### Primary Key

```text
key
```

---

## 22. Store: mediaQueue

Stores pending media uploads.

### TypeScript Interface

```ts
export interface LocalMediaUpload {
  uploadId: string;
  weddingId: string;
  weddingSlug: string;
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
  fileSizeBytes: number;
  durationSeconds?: number;
  fileBlob: Blob;
  uploadStatus: "pending" | "uploading" | "failed" | "uploaded";
  progress: number;
  uploadedByName?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Dexie Store Definition

```ts
mediaQueue: "uploadId, weddingId, weddingSlug, uploadStatus, createdAt"
```

### Primary Key

```text
uploadId
```

### Indexes

```text
weddingId
weddingSlug
uploadStatus
createdAt
```

### Notes

- Blob storage in IndexedDB should be used carefully.
- Large videos can consume browser storage.
- V1.0 should enforce file size limits.
- Failed uploads should remain retryable.

---

## 23. Suggested Dexie Setup

```ts
import Dexie, { Table } from "dexie";

export class WedPassOfflineDB extends Dexie {
  guests!: Table<LocalGuest, string>;
  checkinQueue!: Table<LocalCheckinQueueItem, string>;
  metadata!: Table<LocalMetadata, string>;
  mediaQueue!: Table<LocalMediaUpload, string>;

  constructor() {
    super("wedpass_offline_db");

    this.version(1).stores({
      guests: "guestId, weddingId, snapshotId, qrToken, fullName, phoneNumber, checkedIn",
      checkinQueue: "queueId, weddingId, guestId, synced, createdAt",
      metadata: "key",
      mediaQueue: "uploadId, weddingId, weddingSlug, uploadStatus, createdAt",
    });
  }
}

export const offlineDb = new WedPassOfflineDB();
```

---

# Part 3 — Sync-Specific Schema Rules

---

## 24. Snapshot Rules

1. A snapshot is created when Event Mode is enabled.
2. Snapshot version starts at 1.
3. Only one snapshot should be active per wedding.
4. Staff devices download active snapshot.
5. Sync requests must include snapshot version.
6. Server rejects or flags mismatched snapshot versions.

---

## 25. Check-In Rules

1. Local check-in writes to IndexedDB first.
2. Local check-in creates sync queue item.
3. Sync queue item includes `queueId`.
4. Server validates guest and snapshot.
5. Earliest timestamp wins.
6. Server response is authoritative.
7. Client updates local state after sync response.

---

## 26. Idempotency Rules

The sync endpoint should use:

```text
staff_device_id + source_queue_id
```

to avoid duplicate processing when clients retry requests.

If the same queue item is received twice:

- Return the previously determined result
- Do not create duplicate accepted check-ins

---

## 27. Duplicate Handling Rules

If two devices check in the same guest:

```text
Device A: 14:01
Device B: 14:03
```

Server result:

- Device A accepted
- Device B duplicate
- Authoritative timestamp = 14:01

If Device B syncs first:

- Device B may initially be accepted
- When Device A syncs with earlier timestamp, the server should update the authoritative accepted timestamp

Simpler V1.0 option:

- First server accepted check-in wins
- But this conflicts with the earlier timestamp rule

Recommended V1.0 rule:

> Earliest timestamp wins, even if it syncs later.

This requires the server to update the accepted check-in if a later sync contains an earlier timestamp.

---

## 28. Implementation Note for Earliest Timestamp Wins

For each incoming check-in:

1. Find current accepted check-in for the guest.
2. If none exists:
   - Create accepted check-in.
3. If one exists:
   - Compare timestamps.
4. If incoming timestamp is earlier:
   - Mark existing check-in duplicate.
   - Create incoming check-in as accepted.
   - Update guest `is_checked_in` and `checked_in_at`.
5. If incoming timestamp is later:
   - Store incoming as duplicate or return duplicate without storing, depending on audit choice.
6. Return authoritative timestamp.

For beta debugging, storing duplicates is useful.

---

# Part 4 — Prisma Schema Draft

---

## 29. Prisma Schema Draft

This is a draft starting point. It may be refined during implementation.

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  fullName     String
  role         UserRole  @default(ORGANIZER)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastLoginAt  DateTime?

  weddings     Wedding[]
}

model Wedding {
  id              String        @id @default(uuid())
  organizerId     String
  organizer       User          @relation(fields: [organizerId], references: [id])
  name            String
  coupleNames     String?
  eventDate       DateTime?
  location        String?
  country         String?
  slug            String        @unique
  coverImageUrl   String?
  status          WeddingStatus @default(DRAFT)
  galleryEnabled  Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  completedAt     DateTime?

  guests          Guest[]
  snapshots       WeddingSnapshot[]
  staffDevices    StaffDevice[]
  checkIns        CheckIn[]
  mediaUploads    MediaUpload[]
  syncLogs        SyncLog[]
  feedback        BetaFeedback[]

  @@index([organizerId])
  @@index([status])
}

model Guest {
  id                       String    @id @default(uuid())
  weddingId                String
  wedding                  Wedding   @relation(fields: [weddingId], references: [id])
  fullName                 String
  phoneNumber              String?
  email                    String?
  numberOfAllowedGuests    Int       @default(1)
  qrToken                  String    @unique
  isCheckedIn              Boolean   @default(false)
  checkedInAt              DateTime?
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt
  deletedAt                DateTime?

  snapshotGuests           SnapshotGuest[]
  checkIns                 CheckIn[]
  mediaUploads             MediaUpload[]

  @@index([weddingId])
  @@index([phoneNumber])
  @@index([fullName])
  @@index([weddingId, isCheckedIn])
}

model WeddingSnapshot {
  id              String    @id @default(uuid())
  weddingId       String
  wedding         Wedding   @relation(fields: [weddingId], references: [id])
  version         Int
  isActive        Boolean   @default(false)
  guestCount      Int
  createdByUserId String?
  createdAt       DateTime  @default(now())

  snapshotGuests  SnapshotGuest[]
  checkIns        CheckIn[]
  syncLogs        SyncLog[]

  @@unique([weddingId, version])
  @@index([weddingId])
  @@index([weddingId, isActive])
}

model SnapshotGuest {
  id                       String           @id @default(uuid())
  snapshotId               String
  snapshot                 WeddingSnapshot  @relation(fields: [snapshotId], references: [id])
  weddingId                String
  guestId                  String
  guest                    Guest            @relation(fields: [guestId], references: [id])
  fullName                 String
  phoneNumber              String?
  email                    String?
  numberOfAllowedGuests    Int              @default(1)
  qrToken                  String
  createdAt                DateTime         @default(now())

  @@unique([snapshotId, guestId])
  @@index([snapshotId])
  @@index([weddingId])
  @@index([guestId])
  @@index([qrToken])
}

model StaffDevice {
  id              String             @id @default(uuid())
  weddingId       String
  wedding         Wedding            @relation(fields: [weddingId], references: [id])
  label           String?
  deviceTokenHash String?
  status          StaffDeviceStatus  @default(ACTIVE)
  lastSeenAt      DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  revokedAt       DateTime?

  checkIns        CheckIn[]
  syncLogs        SyncLog[]

  @@index([weddingId])
  @@index([weddingId, status])
}

model CheckIn {
  id              String              @id @default(uuid())
  weddingId       String
  wedding         Wedding             @relation(fields: [weddingId], references: [id])
  guestId         String
  guest           Guest               @relation(fields: [guestId], references: [id])
  snapshotId      String
  snapshot        WeddingSnapshot     @relation(fields: [snapshotId], references: [id])
  staffDeviceId   String?
  staffDevice     StaffDevice?        @relation(fields: [staffDeviceId], references: [id])
  checkedInAt     DateTime
  createdAt       DateTime            @default(now())
  sourceQueueId   String?
  isDuplicate     Boolean             @default(false)
  duplicateOfId   String?
  syncStatus      CheckinSyncStatus   @default(ACCEPTED)

  @@index([weddingId])
  @@index([guestId])
  @@index([snapshotId])
  @@index([staffDeviceId])
  @@index([checkedInAt])
  @@unique([staffDeviceId, sourceQueueId])
}

model MediaUpload {
  id                  String       @id @default(uuid())
  weddingId           String
  wedding             Wedding      @relation(fields: [weddingId], references: [id])
  uploadedByGuestId   String?
  uploadedByGuest     Guest?       @relation(fields: [uploadedByGuestId], references: [id])
  uploadedByName      String?
  mediaType           MediaType
  uploadSource        UploadSource @default(GUEST)
  fileKey             String       @unique
  fileUrl             String?
  thumbnailKey        String?
  thumbnailUrl        String?
  fileSizeBytes       BigInt
  durationSeconds     Int?
  mimeType            String
  originalFileName    String?
  status              MediaStatus  @default(UPLOADED)
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  hiddenAt            DateTime?
  deletedAt           DateTime?

  @@index([weddingId])
  @@index([weddingId, mediaType])
  @@index([weddingId, status])
  @@index([createdAt])
}

model SyncLog {
  id                String           @id @default(uuid())
  weddingId         String
  wedding           Wedding          @relation(fields: [weddingId], references: [id])
  staffDeviceId     String?
  staffDevice       StaffDevice?     @relation(fields: [staffDeviceId], references: [id])
  snapshotId        String?
  snapshot          WeddingSnapshot? @relation(fields: [snapshotId], references: [id])
  payloadCount      Int
  acceptedCount     Int              @default(0)
  duplicateCount    Int              @default(0)
  rejectedCount     Int              @default(0)
  errorCount        Int              @default(0)
  syncStartedAt     DateTime
  syncCompletedAt   DateTime?
  createdAt         DateTime         @default(now())

  @@index([weddingId])
  @@index([staffDeviceId])
  @@index([createdAt])
}

model BetaFeedback {
  id              String    @id @default(uuid())
  weddingId       String?
  wedding         Wedding?  @relation(fields: [weddingId], references: [id])
  userId          String?
  rating          Int?
  workedWell      String?
  confusing       String?
  offlineFeedback String?
  mediaFeedback   String?
  generalComment  String?
  createdAt       DateTime  @default(now())

  @@index([weddingId])
  @@index([userId])
}

enum UserRole {
  ORGANIZER
}

enum WeddingStatus {
  DRAFT
  ACTIVE
  EVENT_MODE
  COMPLETED
}

enum MediaType {
  IMAGE
  VIDEO
}

enum MediaStatus {
  UPLOADED
  APPROVED
  HIDDEN
  DELETED
}

enum CheckinSyncStatus {
  ACCEPTED
  DUPLICATE
  REJECTED
}

enum StaffDeviceStatus {
  ACTIVE
  REVOKED
}

enum UploadSource {
  GUEST
  ORGANIZER
}
```

---

## 30. Notes on Prisma Limitations

Prisma may not directly support all PostgreSQL partial indexes in the schema file.

For accepted check-in uniqueness, if needed, create a manual SQL migration:

```sql
CREATE UNIQUE INDEX check_ins_guest_unique_accepted
ON check_ins (guest_id)
WHERE is_duplicate = false;
```

This ensures only one non-duplicate authoritative check-in per guest.

---

# Part 5 — Indexing and Performance

---

## 31. Required Server Indexes

High-priority indexes:

```text
users(email)
weddings(organizer_id)
weddings(slug)
guests(wedding_id)
guests(qr_token)
guests(phone_number)
guests(wedding_id, is_checked_in)
snapshot_guests(snapshot_id)
snapshot_guests(qr_token)
check_ins(wedding_id)
check_ins(guest_id)
check_ins(staff_device_id, source_queue_id)
media_uploads(wedding_id)
media_uploads(wedding_id, status)
media_uploads(wedding_id, media_type)
```

---

## 32. Required Client Indexes

High-priority IndexedDB indexes:

```text
guests.qrToken
guests.fullName
guests.phoneNumber
guests.checkedIn
checkinQueue.synced
checkinQueue.createdAt
mediaQueue.uploadStatus
mediaQueue.createdAt
```

---

## 33. Expected V1.0 Data Volume

Per wedding:

```text
Guests: up to 1,000
Staff devices: up to 5
Check-ins: up to 1,000 accepted + duplicates
Media uploads: 500+
Sync logs: dozens to hundreds
```

This is easily manageable with PostgreSQL and IndexedDB if indexes are correct.

---

# Part 6 — Data Integrity Rules

---

## 34. Wedding State Rules

- Guests can be edited only before Event Mode.
- Event Mode creates a snapshot.
- Event Mode locks guest list.
- Completed weddings should be read-only for check-in.

---

## 35. Guest Rules

- Guest must belong to a wedding.
- QR token must be unique.
- Full name is required.
- Allowed guest count must be at least 1.
- Soft-deleted guests should not appear in active lists.

---

## 36. Snapshot Rules

- Snapshot guests are copied from guests at snapshot creation time.
- Snapshot version must be unique per wedding.
- Staff devices should only download active snapshot.
- Sync requests must include snapshot version.

---

## 37. Check-In Rules

- Check-in must reference wedding, guest, snapshot, and optionally staff device.
- Server must validate that guest belongs to wedding.
- Server must validate that guest exists in snapshot.
- Sync endpoint must be idempotent.
- Earliest check-in timestamp wins.

---

## 38. Media Rules

- Media must belong to a wedding.
- Media file must have a valid type.
- Media file must have a valid size.
- Media metadata should be created only after upload confirmation.
- Hidden media should not appear in guest gallery.
- Deleted media should not appear anywhere except admin audit if retained.

---

# Part 7 — Future Schema Considerations

Do not implement these in V1.0 unless required.

Potential future tables:

```text
rsvps
invitations
seating_tables
guest_groups
wedding_tasks
vendors
payments
subscriptions
media_comments
media_reactions
ai_media_collections
album_exports
```

These belong in V1.1 or later.

---

## 39. Summary

The WedPass database design supports:

- Offline-first event operation
- Multi-device guest check-in
- Deterministic synchronization
- Guest snapshots
- QR token-based identification
- Media upload metadata
- Organizer dashboard stats
- Beta monitoring and debugging

The schema is intentionally practical for V1.0 but leaves room for growth.
