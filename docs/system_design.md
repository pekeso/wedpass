# WedPass System Design

## 1. Document Purpose

This document describes the system design for **WedPass V1.0**.

While `architecture.md` explains the overall technical architecture and major design decisions, this document explains how the system behaves in practice:

- Major system components
- User flows
- Data flows
- Offline behavior
- Synchronization behavior
- Media upload behavior
- Failure handling
- Scalability assumptions
- Operational concerns

WedPass is designed as an offline-first wedding guest check-in and photo/video collection platform for Central, East, and West Africa.

---

## 2. Product Context

WedPass V1.0 focuses on:

> Smart wedding guest check-in and wedding photo/video collection.

It is not a full wedding planning platform in V1.0.

The key product challenges are:

- Wedding venues may have poor or unreliable internet
- Check-in must continue even when offline
- Multiple staff devices may check in guests at the same time
- Guests should be able to upload photos and short videos
- Media upload must not overload the application server
- Organizers need simple operational visibility
- The system must remain simple enough for solo development

---

## 3. System Design Goals

The system must be designed to satisfy these goals:

1. **Offline-first check-in**
   - Staff can check in guests without internet.

2. **Multi-device event operation**
   - Multiple staff devices can work independently.

3. **Deterministic sync**
   - Check-in conflicts are resolved predictably.

4. **Server-authoritative data**
   - Backend remains the final source of truth.

5. **Media scalability**
   - Photos/videos upload directly to object storage.

6. **Mobile-first UX**
   - Staff and guests use phones most of the time.

7. **Low operational complexity**
   - Avoid unnecessary infrastructure in V1.0.

8. **Security by design**
   - Every wedding resource is scoped and validated.

---

## 4. High-Level System Overview

```text
+-------------------------------------------------------------+
|                        Browser / PWA                        |
|-------------------------------------------------------------|
| Organizer Dashboard | Staff Event Mode | Guest Media Pages  |
| IndexedDB           | Service Worker    | Upload Queue      |
+--------------------------+----------------------------------+
                           |
                           | HTTPS JSON APIs
                           |
+--------------------------v----------------------------------+
|                    Next.js Fullstack App                    |
|-------------------------------------------------------------|
| API Route Handlers | Domain Services | Repositories         |
| Auth | Validation | Sync Reconciliation | Signed URLs       |
+--------------------------+----------------------------------+
                           |
          +----------------+------------------+
          |                                   |
+---------v----------+              +---------v----------+
| PostgreSQL         |              | Cloudflare R2       |
| Authoritative Data |              | Media Storage       |
+--------------------+              +--------------------+
```

---

## 5. Core Actors

## 5.1 Organizer

The organizer manages the wedding.

Main responsibilities:

- Create wedding
- Manage guest list
- Import CSV
- Generate QR codes
- Enable Event Mode
- Create staff access
- Monitor check-ins
- Moderate media

---

## 5.2 Event Staff

Event staff operate on the wedding day.

Main responsibilities:

- Download offline guest snapshot
- Scan guest QR codes
- Search guests manually
- Check guests in
- Sync local check-ins when online

---

## 5.3 Guest

Guests interact with the public wedding media experience.

Main responsibilities:

- Open wedding media link
- Upload photos/videos
- View approved gallery media

Guests do not need accounts in V1.0.

---

## 6. Major System Components

## 6.1 Web Application

The web application is a responsive PWA.

It contains three user experiences:

```text
Organizer Dashboard
Staff Event Mode
Guest Media Experience
```

---

## 6.2 API Layer

The API layer exposes versioned REST endpoints under:

```text
/api/v1
```

Responsibilities:

- Authentication
- Authorization
- Request validation
- Wedding management
- Guest management
- Snapshot generation
- Check-in synchronization
- Media signed upload URL generation
- Media metadata management

---

## 6.3 PostgreSQL Database

PostgreSQL stores authoritative structured data:

- Users
- Weddings
- Guests
- Wedding snapshots
- Staff devices
- Check-ins
- Media metadata
- Sync logs
- Feedback

---

## 6.4 IndexedDB Local Database

IndexedDB stores offline-critical event data on staff/guest devices:

- Guest snapshot
- Check-in sync queue
- Device metadata
- Media upload queue

IndexedDB enables check-in even when the backend is unreachable.

---

## 6.5 Cloudflare R2 Object Storage

R2 stores:

- Guest-uploaded photos
- Guest-uploaded short videos
- Media thumbnails, if generated
- Optional cover images

Files are uploaded using signed URLs.

---

## 6.6 Service Worker / PWA Layer

The service worker supports:

- App installability
- Offline shell caching
- Offline fallback page
- Better event-day reliability

The service worker does not replace IndexedDB for business data.

---

## 7. Key Domains

## 7.1 Identity and Access

Handles:

- Organizer authentication
- Staff scoped access
- Wedding ownership
- Token validation
- Route protection

Design principle:

> Every request must be scoped to a wedding and validated against the user or staff token.

---

## 7.2 Guest Management

Handles:

- Guest creation
- Guest import
- QR token generation
- Guest search
- Guest updates before Event Mode
- Guest list locking during Event Mode

---

## 7.3 Event Mode

Handles:

- Snapshot creation
- Guest list locking
- Offline preparation
- Staff access setup
- Device readiness

Event Mode turns a wedding from editable setup state into operational event-day state.

---

## 7.4 Offline Check-In

Handles:

- Local guest lookup
- QR scan result resolution
- Local check-in write
- Sync queue creation
- Offline UI status

---

## 7.5 Synchronization

Handles:

- Batch check-in upload
- Snapshot validation
- Device validation
- Duplicate detection
- Conflict resolution
- Sync result response
- Audit logging

---

## 7.6 Media

Handles:

- Upload validation
- Signed URL generation
- Direct R2 upload
- Upload confirmation
- Gallery listing
- Media moderation

---

## 8. Core System Flows

## 8.1 Organizer Creates Wedding

```text
Organizer registers/logs in
        ↓
Creates wedding
        ↓
Wedding stored in PostgreSQL
        ↓
Dashboard becomes available
```

Important design points:

- Organizer must own the wedding
- Wedding starts in Draft or Active state
- Guest list is editable before Event Mode

---

## 8.2 Organizer Adds Guests

```text
Organizer opens Guest List
        ↓
Adds guests manually or imports CSV
        ↓
System validates guest data
        ↓
System generates QR token per guest
        ↓
Guests stored in PostgreSQL
```

Validation rules:

- Full name required
- Phone/email optional but useful
- Allowed guests must be numeric
- QR token must be unique and non-predictable

---

## 8.3 Organizer Enables Event Mode

```text
Organizer opens Event Mode Setup
        ↓
System checks readiness
        ↓
Organizer confirms guest list lock
        ↓
Server creates wedding snapshot
        ↓
Wedding status changes to Event Mode
        ↓
Guest list becomes locked
```

Important design points:

- Event Mode requires confirmation
- Guest edits are blocked after Event Mode starts
- Snapshot version is stored
- Staff devices must download this snapshot

---

## 8.4 Staff Downloads Offline Pack

```text
Staff logs into Event Mode
        ↓
Device requests snapshot
        ↓
Server validates staff token
        ↓
Server returns guest snapshot
        ↓
Device stores guest list in IndexedDB
        ↓
Device can now operate offline
```

Stored locally:

- Wedding ID
- Snapshot ID
- Snapshot version
- Guests
- QR tokens
- Device ID
- Last download timestamp

---

## 8.5 Offline QR Check-In

```text
Staff scans QR
        ↓
App reads QR token
        ↓
App looks up guest in IndexedDB
        ↓
Staff confirms guest
        ↓
App marks guest checked in locally
        ↓
App adds check-in to local sync queue
        ↓
UI shows success immediately
```

No server communication is required.

This is a critical V1.0 behavior.

---

## 8.6 Manual Search Check-In

```text
Staff opens search
        ↓
Searches by name or phone
        ↓
App searches local IndexedDB
        ↓
Staff selects guest
        ↓
Staff confirms check-in
        ↓
App writes local check-in and sync queue item
```

Manual search is required because QR scanning may fail on some devices.

---

## 8.7 Check-In Sync

```text
Device detects internet
        ↓
App reads unsynced queue items
        ↓
App sends batch to sync endpoint
        ↓
Server validates wedding, device, snapshot, guests
        ↓
Server reconciles conflicts
        ↓
Server returns result per check-in
        ↓
Client marks accepted/duplicate items as synced
```

Sync endpoint must be:

- Idempotent
- Retry-safe
- Batch-capable
- Transaction-safe

---

## 8.8 Media Upload

```text
Guest opens upload page
        ↓
Guest selects photo/video
        ↓
Client validates file type and size
        ↓
Client compresses image when applicable
        ↓
Client requests signed upload URL
        ↓
Client uploads directly to R2
        ↓
Client confirms upload with API
        ↓
API stores media metadata
        ↓
Media appears in gallery if approved/visible
```

Important design points:

- App server does not receive file stream
- Uploads are direct-to-storage
- Videos may be restricted by size
- Offline uploads can be queued locally where feasible

---

## 8.9 Organizer Moderates Media

```text
Organizer opens media management
        ↓
API lists uploaded media
        ↓
Organizer previews media
        ↓
Organizer hides/deletes/downloads media
        ↓
Media metadata updated in PostgreSQL
```

Media deletion should be handled carefully.

Recommended V1 approach:

- Hide media first
- Hard delete only after confirmation

---

## 9. Offline Check-In Design

## 9.1 Local Guest Snapshot

Each prepared staff device stores a guest snapshot.

Snapshot fields include:

- guestId
- weddingId
- snapshotId
- fullName
- phoneNumber
- qrToken
- allowedGuests
- checkedIn
- checkedInAt

---

## 9.2 Local Check-In Queue

Each check-in creates a queue item:

```json
{
  "queueId": "uuid",
  "weddingId": "uuid",
  "guestId": "uuid",
  "checkedInAt": "ISO timestamp",
  "deviceId": "uuid",
  "synced": false,
  "createdAt": "ISO timestamp"
}
```

The queue is append-only until the server acknowledges sync.

---

## 9.3 Device ID

Each staff device generates or receives a device ID.

The device ID is used for:

- Sync audit
- Conflict tracing
- Device status reporting
- Debugging beta issues

---

## 9.4 Local Source of Truth During Event

During offline operation:

> IndexedDB is the local source of truth for the staff device.

After sync:

> PostgreSQL is the authoritative source of truth.

---

## 10. Sync Reconciliation Design

## 10.1 Sync Request

The client sends:

```json
{
  "snapshotVersion": 1,
  "deviceId": "device_uuid",
  "checkins": [
    {
      "guestId": "guest_uuid",
      "checkedInAt": "2026-08-14T14:03:00Z"
    }
  ]
}
```

---

## 10.2 Server Validation

For each sync request, the server validates:

- Staff token is valid
- Staff token belongs to wedding
- Device is authorized
- Snapshot version is valid
- Guest belongs to wedding
- Guest belongs to snapshot
- Check-in timestamp is valid

---

## 10.3 Conflict Rule

If no server check-in exists:

- Accept check-in

If a server check-in already exists:

- Compare timestamps
- Earliest timestamp wins
- Later timestamp is marked duplicate

Rule:

> Earliest valid check-in timestamp wins.

---

## 10.4 Sync Response

The server returns one result per item:

```json
{
  "results": [
    {
      "guestId": "guest_uuid",
      "status": "accepted",
      "authoritativeCheckedInAt": "2026-08-14T14:03:00Z"
    },
    {
      "guestId": "guest_uuid_2",
      "status": "duplicate",
      "authoritativeCheckedInAt": "2026-08-14T13:59:00Z"
    }
  ]
}
```

Possible statuses:

- accepted
- duplicate
- rejected
- invalid_guest
- snapshot_mismatch

---

## 10.5 Client Handling

Client behavior:

- Accepted: mark queue item synced
- Duplicate: mark queue item synced and update local authoritative timestamp
- Rejected: keep item for review or mark failed with reason
- Snapshot mismatch: block sync and require snapshot refresh

---

## 11. Failure Handling

## 11.1 Internet Drops During Check-In

Expected behavior:

- Check-in continues
- Offline banner appears
- Check-ins are saved locally
- Pending sync count increases
- Sync resumes later

---

## 11.2 Internet Drops During Sync

Expected behavior:

- Unsynced items remain in queue
- No item is marked synced without acknowledgement
- Retry later using exponential backoff

---

## 11.3 Device Battery Dies

Expected behavior:

- Previously saved local check-ins remain in IndexedDB
- Device can resume when powered on
- Staff should sync once online

---

## 11.4 QR Scan Fails

Expected behavior:

- Show invalid QR or scan failure message
- Offer manual search fallback immediately

---

## 11.5 Guest Not Found Locally

Possible causes:

- Wrong QR
- Device did not download latest snapshot
- Guest was added after snapshot
- Wrong wedding QR

Expected behavior:

- Show clear error
- Offer manual search
- Suggest verifying offline pack

---

## 11.6 Duplicate Check-In

Expected behavior:

- Local duplicate on same device is blocked
- Cross-device duplicate is resolved during sync
- Staff sees already checked-in state if known locally

---

## 11.7 Media Upload Fails

Expected behavior:

- Upload marked failed or queued
- Guest sees retry option
- Upload is not considered complete until confirmation succeeds

---

## 12. Scalability Design

## 12.1 V1.0 Load Assumptions

V1.0 should handle:

- 1,000 guests per wedding
- 5 staff devices per wedding
- 500+ media uploads per wedding
- Batch sync of 100 check-ins per request
- Multiple weddings in beta, but not massive public launch

---

## 12.2 Why This Scale Is Manageable

The design is manageable because:

- Check-ins are local-first
- API is stateless
- Media bypasses app server
- PostgreSQL handles structured writes
- R2 handles media storage
- Gallery uses pagination/lazy loading

---

## 12.3 Potential Bottlenecks

Potential bottlenecks:

1. Large video uploads
2. Gallery loading too many files
3. Sync storms when internet returns
4. Slow guest search on low-end devices
5. Database queries without proper indexes

Mitigations:

- File size limits
- Pagination
- Batch sync
- Exponential backoff
- IndexedDB indexes
- PostgreSQL indexes

---

## 13. Performance Requirements

## 13.1 Staff Mode

Staff mode must prioritize speed.

Targets:

- Local guest search under 200ms
- Check-in local write under 500ms
- QR scan result response near-instant
- Sync status always visible

---

## 13.2 Organizer Dashboard

Dashboard should:

- Load summary stats quickly
- Paginate guest lists
- Avoid loading all media at once
- Use skeleton states

---

## 13.3 Guest Media Pages

Guest pages should:

- Load fast on mobile
- Compress images before upload
- Warn on large videos
- Lazy load gallery media
- Avoid autoplay videos

---

## 14. Security Design

System security depends on:

- Organizer authentication
- Wedding-scoped authorization
- Scoped staff tokens
- Non-predictable QR tokens
- Signed media upload URLs
- Input validation
- Rate limiting
- File validation
- Local data minimization

Key rule:

> Never trust client data, even if it came from offline mode.

---

## 15. Observability Design

V1.0 should log and monitor:

- Auth failures
- Staff device registration
- Snapshot downloads
- Sync attempts
- Sync failures
- Duplicate conflicts
- Media upload failures
- API errors
- Unexpected client errors

Recommended tools:

- Sentry for frontend/backend errors
- Server logs for sync processing
- Basic audit logs in PostgreSQL

---

## 16. System States

## 16.1 Wedding States

```text
Draft
  ↓
Active
  ↓
Event Mode
  ↓
Completed
```

## 16.2 Staff Device States

```text
Not Prepared
  ↓
Snapshot Downloaded
  ↓
Offline Ready
  ↓
Checking In
  ↓
Pending Sync
  ↓
Synced
```

## 16.3 Media Upload States

```text
Selected
  ↓
Validated
  ↓
Queued / Uploading
  ↓
Uploaded to R2
  ↓
Confirmed
  ↓
Visible / Hidden
```

---

## 17. Data Consistency Rules

1. PostgreSQL is authoritative after sync.
2. IndexedDB is authoritative only for local offline operation.
3. Check-in sync must be idempotent.
4. Sync queue items must not be deleted before acknowledgement.
5. Guest list must be locked during Event Mode.
6. Snapshot version must be validated during sync.
7. Media is not valid until upload confirmation succeeds.

---

## 18. System Boundaries

## 18.1 In System

WedPass owns:

- Organizer accounts
- Wedding records
- Guest records
- Staff access
- QR tokens
- Check-in data
- Media metadata
- Upload authorization
- Gallery visibility

## 18.2 External Systems

WedPass depends on:

- Vercel for hosting
- Supabase PostgreSQL
- Cloudflare R2
- Email provider, if password reset is implemented
- Sentry, if monitoring is enabled

---

## 19. V1.0 Non-Goals

The system design intentionally excludes:

- Microservices
- WebSockets
- Native mobile apps
- AI processing
- Payment processing
- Social media integrations
- Vendor marketplace
- Seating charts
- RSVP automation
- Full wedding planning workflows

These are future extensions.

---

## 20. Future System Evolution

Possible future evolution:

## V1.1

- CSV exports
- Multi-wedding accounts
- Storage quotas
- Media ZIP download
- Better dashboard analytics

## V2

- RSVP
- Invitation builder
- Payment integration
- Planner accounts
- AI media curation

## V3

- Native mobile apps
- AI wedding memory generation
- Vendor marketplace
- Advanced event operations

---

## 21. Summary

WedPass system design is built around one central idea:

> The wedding must continue operating even when the internet does not.

The system achieves this through:

- Local-first staff event mode
- IndexedDB snapshots
- Append-only sync queues
- Server-authoritative reconciliation
- Direct-to-storage media uploads
- Simple modular backend design
- Mobile-first UX

This design is intentionally practical, reliable, and suitable for real wedding conditions in Central, East, and West Africa.
