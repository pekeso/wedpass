# WedPass Architecture

## 1. Document Purpose

This document describes the software architecture for **WedPass V1.0**.

WedPass is an offline-first wedding guest check-in and photo/video collection platform designed for Central, East, and West Africa.

The architecture is optimized for:

- Solo development speed
- Maintainability
- Offline-first event operation
- Multi-device check-in
- Reliable synchronization
- Scalable media upload
- Low operational complexity
- Future expansion into a broader wedding platform

---

## 2. Architecture Summary

WedPass uses:

> A TypeScript fullstack modular monolith with offline-first PWA capabilities, local IndexedDB persistence, server-authoritative synchronization, PostgreSQL for structured data, and Cloudflare R2 for media storage.

In short:

```text
Responsive Web App / PWA
        ↓
Next.js Fullstack App
        ↓
PostgreSQL + Cloudflare R2
```

---

## 3. Architectural Style

## 3.1 Primary Style: Modular Monolith

WedPass V1.0 is built as a modular monolith.

This means:

- One codebase
- One deployable application
- One database
- Clear internal module boundaries
- No microservices in V1.0

The system is modular internally but simple operationally.

### Why Modular Monolith

This is the correct choice for V1.0 because:

- The product is early-stage
- The founder is building solo
- Fast iteration is more important than distributed scaling
- Microservices would add unnecessary complexity
- The system still needs maintainable boundaries

---

## 3.2 Secondary Style: Offline-First PWA

WedPass is designed around unreliable internet.

The app must continue working during wedding check-in even when internet is unavailable.

Offline-first behavior is supported through:

- PWA installation
- Service worker caching
- IndexedDB local database
- Local guest snapshots
- Append-only sync queues
- Background and manual synchronization
- Server-side conflict resolution

This is not just an online app with caching. Event-day check-in must be operational without internet.

---

## 3.3 Sync Style: Eventual Consistency

During Event Mode, staff devices can operate independently.

Each device:

- Downloads a guest snapshot
- Checks guests in locally
- Stores pending check-ins in a local queue
- Syncs with the backend when internet returns

The backend is the authoritative source after synchronization.

The system accepts temporary inconsistency during offline operation and resolves it deterministically during sync.

---

## 4. High-Level Architecture

```text
+-----------------------------------------------------+
|                    Web Browser / PWA                |
|-----------------------------------------------------|
| Organizer UI | Staff Event Mode | Guest Media Pages |
| Dexie/IndexedDB | Service Worker | Upload Queue     |
+----------------------------+------------------------+
                             |
                             | HTTPS / JSON APIs
                             |
+----------------------------v------------------------+
|                  Next.js Fullstack App              |
|-----------------------------------------------------|
| Route Handlers | Server Actions where appropriate   |
| Domain Services | Repositories | Validation | Auth  |
+----------------------------+------------------------+
                             |
          +------------------+------------------+
          |                                     |
+---------v----------+              +-----------v----------+
| PostgreSQL         |              | Cloudflare R2         |
| Structured Data    |              | Photos / Videos       |
| Weddings, Guests,  |              | Direct Signed Uploads |
| Check-ins, Media   |              |                       |
+--------------------+              +----------------------+
```

---

## 5. Technology Stack

## 5.1 Frontend

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Dexie / IndexedDB
- PWA service worker

## 5.2 Backend

- Next.js Route Handlers
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Zod validation

## 5.3 Storage

- PostgreSQL for structured application data
- Cloudflare R2 for photos and videos
- Signed URLs for direct media upload

## 5.4 Infrastructure

- Vercel for hosting
- Supabase PostgreSQL for managed database
- Cloudflare R2 for object storage
- Sentry for error monitoring

---

## 6. Major System Modules

All modules live inside the same application but must remain logically separated.

Recommended module structure:

```text
src/modules/
  auth/
  weddings/
  guests/
  checkins/
  sync/
  staff/
  media/
  analytics/
  feedback/
```

Each module should contain:

```text
<module-name>/
  *.service.ts
  *.repository.ts
  *.schemas.ts
  *.types.ts
  *.dto.ts
```

---

## 6.1 Auth Module

Responsibilities:

- Organizer registration
- Organizer login
- Password hashing
- JWT creation and validation
- Refresh/session handling
- Protected route support

Does not own:

- Staff event permissions
- Wedding-specific authorization rules beyond user identity

---

## 6.2 Weddings Module

Responsibilities:

- Wedding creation
- Wedding updates
- Wedding status management
- Wedding ownership
- Wedding slug generation
- Wedding dashboard summary

Wedding statuses:

- Draft
- Active
- Event Mode
- Completed

---

## 6.3 Guests Module

Responsibilities:

- Guest CRUD
- CSV import validation
- Duplicate guest detection
- QR token generation
- Guest search
- Guest list locking after Event Mode

Does not own:

- Check-in conflict resolution
- Staff device sync

---

## 6.4 Staff Module

Responsibilities:

- Staff access generation
- Staff scoped tokens
- Staff device registration
- Device labels
- Device revocation
- Staff permission boundaries

Staff access is wedding-scoped and limited.

---

## 6.5 Check-ins Module

Responsibilities:

- Check-in data model
- Authoritative server check-in state
- Duplicate handling
- Check-in timestamp recording
- Check-in stats

Does not own:

- Client-side IndexedDB implementation

---

## 6.6 Sync Module

Responsibilities:

- Sync endpoint contract
- Batch check-in sync
- Snapshot version validation
- Idempotent processing
- Conflict resolution
- Sync audit logs

Conflict resolution rule:

> Earliest valid check-in timestamp wins.

---

## 6.7 Media Module

Responsibilities:

- Signed upload URL generation
- Media metadata creation
- Upload confirmation
- Gallery listing
- Media moderation
- Media deletion/hiding
- File validation rules

Does not own:

- Direct file upload transport
- Video transcoding
- AI media processing

---

## 6.8 Analytics Module

V1.0 responsibilities:

- Total guests
- Checked-in guests
- Pending check-ins
- Check-in percentage
- Total uploads
- Latest sync time

Advanced analytics are out of scope for V1.0.

---

## 7. Layered Backend Architecture

Backend code should follow this structure:

```text
Route Handler
    ↓
Validation / Auth Guard
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

## 7.1 Route Handlers

Route handlers are responsible for:

- Receiving HTTP requests
- Parsing request input
- Validating request payloads
- Checking authentication
- Calling services
- Returning standardized responses

Route handlers must not:

- Contain complex business logic
- Call Prisma directly
- Implement sync conflict rules directly

---

## 7.2 Services

Services are responsible for:

- Business logic
- Coordinating repositories
- Enforcing rules
- Performing workflow operations

Examples:

- `enableEventMode()`
- `syncCheckins()`
- `generateGuestQrToken()`
- `createSignedUploadUrl()`

---

## 7.3 Repositories

Repositories are responsible for:

- Database reads
- Database writes
- Prisma queries
- Transactions

Repositories must not:

- Know about HTTP
- Return raw API responses
- Implement UI rules

---

## 8. Frontend Architecture

The frontend should be organized by experience:

```text
src/app/
  (public)/
  dashboard/
  staff/
  w/
```

## 8.1 Public Experience

Includes:

- Landing page
- Beta signup
- Login
- Register

Purpose:

- Explain the product
- Convert beta users
- Authenticate organizers

---

## 8.2 Organizer Experience

Routes under:

```text
/dashboard/wedding/[weddingId]
```

Includes:

- Dashboard
- Guest list
- QR codes
- Event Mode setup
- Staff access
- Check-in stats
- Gallery moderation
- Settings

UI style:

- Calm
- Professional
- SaaS-like
- Wedding warmth through subtle accents

---

## 8.3 Staff Experience

Routes under:

```text
/staff/[weddingId]
```

Includes:

- Staff login
- Offline pack download
- Check-in home
- QR scanner
- Manual search
- Guest confirmation
- Sync status

UI style:

- Mobile-first
- Operational
- Large touch targets
- Always-visible sync status
- Minimal decoration

---

## 8.4 Guest Experience

Routes under:

```text
/w/[slug]
```

Includes:

- Guest landing page
- Media upload
- Gallery
- Media viewer

UI style:

- Warm
- Elegant
- Wedding-oriented
- Very simple
- Mobile-first

---

## 9. Offline-First Architecture

Offline support is a first-class architecture concern.

## 9.1 Local Storage

IndexedDB is used through Dexie.

Local stores:

- `guests`
- `checkinQueue`
- `metadata`
- `mediaQueue`

---

## 9.2 Event Snapshot

Before the wedding, each staff device downloads a guest snapshot.

The snapshot includes:

- Wedding ID
- Snapshot ID
- Snapshot version
- Guest list
- QR tokens
- Basic guest lookup fields

The snapshot allows check-in without internet.

---

## 9.3 Local Check-In Flow

```text
Scan QR or search guest
        ↓
Find guest in IndexedDB
        ↓
Mark checked_in locally
        ↓
Append check-in item to sync queue
        ↓
Show success immediately
```

No server call is required during check-in.

---

## 9.4 Sync Flow

```text
Device detects internet
        ↓
Read unsynced check-ins
        ↓
POST batch to sync endpoint
        ↓
Server validates and reconciles
        ↓
Client marks accepted/duplicate items as synced
```

---

## 9.5 Conflict Resolution

If two devices check in the same guest offline:

- Both devices save local check-ins
- Both later sync
- Server compares timestamps
- Earliest timestamp wins
- Later one is marked duplicate

The server is authoritative.

---

## 10. Media Architecture

Media must never pass through the application server as a file stream in V1.0.

The upload flow is:

```text
Guest selects file
        ↓
Client validates type/size
        ↓
Client requests signed upload URL
        ↓
API returns signed Cloudflare R2 URL
        ↓
Client uploads directly to R2
        ↓
Client confirms upload
        ↓
API stores media metadata
```

## 10.1 Why Direct-to-Storage Upload

This approach:

- Reduces server bandwidth cost
- Improves scalability
- Keeps API stateless
- Works better for photos/videos
- Avoids server memory pressure

---

## 10.2 Media Constraints

V1.0 media constraints:

- Images: JPEG, PNG
- Videos: MP4
- File size limits enforced
- No server-side transcoding
- No AI processing
- No autoplay in gallery
- Pagination and lazy loading required

---

## 11. Data Architecture

## 11.1 Server Database

PostgreSQL stores authoritative structured data.

Primary entities:

- users
- weddings
- guests
- wedding_snapshots
- staff_devices
- check_ins
- media_uploads
- sync_logs

## 11.2 Client Database

IndexedDB stores offline-critical data.

Primary stores:

- local guests
- check-in queue
- metadata
- media upload queue

## 11.3 Object Storage

Cloudflare R2 stores:

- photos
- videos
- generated thumbnails where applicable
- media assets

---

## 12. API Architecture

All APIs should be versioned:

```text
/api/v1
```

API categories:

- `/auth`
- `/weddings`
- `/guests`
- `/staff`
- `/checkins`
- `/sync`
- `/media`
- `/analytics`

API responses should follow a consistent shape:

```json
{
  "success": true,
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## 13. Security Architecture

Security principles:

- Server validates everything
- Every resource is wedding-scoped
- Staff tokens are scoped and limited
- QR tokens must be non-predictable
- Public endpoints must be rate-limited
- Uploads must use signed URLs
- Media file types and sizes must be validated
- Secrets must live in environment variables
- No raw HTML rendering from user input

---

## 14. Deployment Architecture

V1.0 deployment:

```text
Vercel
  ├── Next.js frontend
  └── Next.js API route handlers

Supabase
  └── PostgreSQL database

Cloudflare R2
  └── Object storage for media

Sentry
  └── Error monitoring
```

No Kubernetes, Docker Swarm, Redis, queue workers, or microservices are required for V1.0.

---

## 15. Scaling Path

WedPass should scale gradually.

## Stage 1: V1.0 Beta

- Single Next.js app
- Managed Postgres
- R2 object storage
- Manual beta onboarding

## Stage 2: Post-Beta

Add:

- Better monitoring
- Background jobs
- ZIP media downloads
- Improved analytics
- Storage quotas

## Stage 3: Growth

Consider:

- Separate backend service
- Worker process for media processing
- Redis for rate limiting
- CDN optimization
- Read replicas
- Payment integration

## Stage 4: Advanced Platform

Consider:

- AI media curation
- Wedding planning features
- RSVP
- Invitation builder
- Planner accounts
- Multi-event management

---

## 16. Architectural Constraints

V1.0 must not introduce:

- Microservices
- Kafka
- Redis unless strictly required
- WebSockets
- Complex event sourcing
- Server-side video processing
- AI pipelines
- Native mobile apps

These are future options, not V1.0 requirements.

---

## 17. Key Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| App architecture | Modular monolith | Solo build speed and maintainability |
| Language | TypeScript | Shared frontend/backend types |
| Framework | Next.js | Fullstack web app and route handlers |
| Database | PostgreSQL | Relational consistency |
| ORM | Prisma | Type-safe database access |
| Offline DB | IndexedDB via Dexie | Reliable browser persistence |
| Media storage | Cloudflare R2 | Cheap scalable object storage |
| Upload strategy | Signed URLs | Avoid server bandwidth bottleneck |
| Check-in sync | Eventual consistency | Supports offline operation |
| Conflict rule | Earliest timestamp wins | Deterministic and simple |
| Staff access | Scoped tokens | Least-privilege access |
| Real-time | Not V1.0 | Avoid unnecessary complexity |

---

## 18. Architecture Quality Attributes

WedPass architecture prioritizes:

1. Reliability
2. Offline resilience
3. Simplicity
4. Maintainability
5. Mobile usability
6. Data integrity
7. Security
8. Future extensibility

It deliberately does not optimize for premature large-scale complexity.

---

## 19. Summary

WedPass V1.0 architecture is intentionally simple but robust.

It is:

- Fullstack TypeScript
- Modular monolith
- Offline-first
- PWA-based
- Server-authoritative
- Media-scalable
- Security-conscious
- Built for real African wedding conditions

The architecture should remain boring internally and impressive externally.
