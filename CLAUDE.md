# CLAUDE.md

## Project Name

**WedPass**

## Project Overview

WedPass is an offline-first wedding guest check-in and photo/video collection platform designed for Central, East, and West Africa.

The V1.0 product focus is **Smart Wedding Guest & Media Management**, not a full wedding planning suite.

WedPass helps wedding organizers:

- Manage wedding guest lists
- Generate QR codes for guests
- Prepare event staff devices for offline check-in
- Check guests in using multiple devices, even without reliable internet
- Sync check-ins safely when internet becomes available
- Collect wedding photos and short videos from guests
- Moderate and view uploaded media in one place

The platform is built as a **responsive web application** using the TypeScript ecosystem.

---

## Core Product Principles

1. **Offline-first for event-day operations**
   - Check-in must work without internet.
   - Staff must be able to scan/search/check in guests offline.
   - Check-ins must be stored locally and synced later.

2. **Mobile-first**
   - Staff check-in and guest upload flows must be excellent on mobile.
   - Large touch targets are required for event-day use.

3. **Simple, focused V1**
   - V1 is not a full wedding planning platform.
   - V1 focuses on guest management, offline check-in, and media collection.

4. **Server is authoritative**
   - Local devices may work offline, but final conflict resolution happens on the server.

5. **Privacy and security by default**
   - Wedding data must be scoped to the correct wedding.
   - Public links must use secure tokens.
   - Media uploads must use signed URLs.

6. **AI is not part of V1**
   - Do not implement AI features unless explicitly requested in a later version.

---

## Target Users

### 1. Organizer

The organizer is the wedding owner, couple, planner, or trusted admin.

Organizer can:

- Create a wedding
- Add/import guests
- Generate QR codes
- Prepare Event Mode
- Create staff access
- View check-in stats
- View and moderate media

### 2. Event Staff

Event staff are temporary users who operate check-in on event day.

Staff can:

- Access Event Mode
- Download offline guest snapshot
- Scan QR codes
- Search guests manually
- Check guests in offline
- Sync check-ins when online

Staff must not access organizer-only areas such as settings, guest editing, media moderation, or account management.

### 3. Guest

Guests can:

- Open a wedding link or scan QR code
- Upload photos and short videos
- View approved gallery media if enabled

Guests do not need accounts.

---

## Architecture Style

WedPass uses a:

> **Modular monolith using a TypeScript fullstack architecture with offline-first client synchronization.**

Architecture characteristics:

- Next.js App Router
- TypeScript everywhere
- Server-side API route handlers
- PostgreSQL as authoritative database
- IndexedDB for offline client data
- Cloudflare R2 or S3-compatible object storage for media
- Direct-to-storage uploads using signed URLs
- Modular code boundaries by domain

Do not introduce microservices in V1.

Do not introduce GraphQL in V1.

Do not introduce event sourcing in V1.

Do not introduce unnecessary queues, Kafka, Redis, or Kubernetes in V1 unless explicitly requested.

---

## Technology Stack

### Frontend

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Dexie.js for IndexedDB
- Lucide React icons

### Backend

- Next.js Route Handlers
- TypeScript
- Prisma
- PostgreSQL

### Storage

- Cloudflare R2 or S3-compatible object storage
- Signed upload URLs for media

### Deployment

- Vercel for app hosting
- Supabase PostgreSQL or managed Postgres
- Cloudflare R2 for media

### Testing

- Vitest for unit tests
- Playwright for end-to-end tests

---

## Repository Structure

Use this structure unless explicitly changed by the project owner.

```text
src/
  app/
    (public)/
      page.tsx
      beta/
        page.tsx
      login/
        page.tsx
      register/
        page.tsx

    dashboard/
      layout.tsx
      wedding/
        new/
          page.tsx
        [weddingId]/
          page.tsx
          guests/
            page.tsx
          qr-codes/
            page.tsx
          event-mode/
            page.tsx
          staff/
            page.tsx
          checkins/
            page.tsx
          gallery/
            page.tsx
          settings/
            page.tsx

    staff/
      [weddingId]/
        login/
          page.tsx
        download/
          page.tsx
        checkin/
          page.tsx
          [guestId]/
            page.tsx
        scan/
          page.tsx
        search/
          page.tsx
        sync/
          page.tsx

    w/
      [slug]/
        page.tsx
        upload/
          page.tsx
        gallery/
          page.tsx
        media/
          [mediaId]/
            page.tsx

  components/
    ui/
    layout/
    shared/
    wedding/
    guests/
    staff/
    media/
    feedback/

  modules/
    auth/
    weddings/
    guests/
    checkins/
    media/
    staff/
    sync/

  lib/
    api/
    auth/
    db/
    offline/
    storage/
    validations/
    utils/

  hooks/
    use-network-status.ts
    use-mobile.ts

  stores/
    auth-store.ts
    sync-store.ts
    ui-store.ts

  types/
    api.ts
    shared.ts
```

---

## Module Structure Rules

Each domain module should follow a predictable structure.

Example:

```text
src/modules/guests/
  guests.service.ts
  guests.repository.ts
  guests.schemas.ts
  guests.types.ts
  guests.dto.ts
```

### Module responsibilities

#### `auth`

Owns:

- Organizer registration
- Organizer login
- Password hashing
- JWT creation
- Session handling

#### `weddings`

Owns:

- Wedding creation
- Wedding update
- Wedding status
- Wedding slug
- Event Mode status

#### `guests`

Owns:

- Guest CRUD
- CSV import logic
- QR token generation
- Guest validation

#### `checkins`

Owns:

- Server-side check-in sync
- Conflict resolution
- Check-in records
- Check-in stats

#### `sync`

Owns:

- Sync payload types
- Sync validation
- Sync result format
- Sync audit logs

#### `staff`

Owns:

- Staff access token generation
- Staff device registration
- Staff token validation

#### `media`

Owns:

- Signed upload URL generation
- Media metadata
- Gallery queries
- Media moderation

---

## Layering Rules

Always follow this pattern:

```text
Route Handler / Page Action
  -> Service
      -> Repository
          -> Prisma
```

### Route handlers

Route handlers may:

- Parse request
- Validate input
- Check authentication
- Call services
- Return standard API responses

Route handlers must not:

- Contain business logic
- Call Prisma directly
- Perform complex conflict resolution
- Implement upload processing logic

### Services

Services may:

- Contain business logic
- Coordinate multiple repositories
- Enforce business rules
- Handle conflict resolution
- Prepare response DTOs

Services must not:

- Know about React components
- Return raw Prisma objects when DTOs are required
- Contain direct HTTP request/response logic

### Repositories

Repositories may:

- Call Prisma
- Execute database queries
- Handle database transactions
- Return persistence models

Repositories must not:

- Contain HTTP logic
- Contain UI logic
- Contain complex business orchestration

---

## Naming Conventions

### Files and folders

- Use kebab-case for folders.
- Use kebab-case for general files.
- Use PascalCase only for React component names.
- Use suffixes consistently.

Examples:

```text
guest-table.tsx
guest-card.tsx
guests.service.ts
guests.repository.ts
guests.schemas.ts
guests.types.ts
checkin-sync-service.ts
```

### TypeScript names

- Use PascalCase for types and interfaces.
- Use camelCase for variables and functions.
- Use UPPER_SNAKE_CASE for constants only when appropriate.

Examples:

```ts
type GuestDTO = {}
interface LocalGuest {}
const MAX_VIDEO_UPLOAD_SIZE_MB = 100
function syncCheckins() {}
```

### Boolean names

Use prefixes:

- `is`
- `has`
- `can`
- `should`

Examples:

```ts
isCheckedIn
hasPendingSync
canUploadMedia
shouldRetryUpload
```

---

## DTO and Type Rules

All API payloads must use DTOs.

DTOs should live in module-level files:

```text
src/modules/guests/guests.dto.ts
src/modules/checkins/checkins.dto.ts
src/modules/media/media.dto.ts
```

Shared DTOs may live in:

```text
src/types/api.ts
src/types/shared.ts
```

Rules:

- Do not duplicate DTOs across modules.
- Use Zod schemas for runtime validation.
- Infer TypeScript types from Zod schemas where practical.
- Do not trust frontend payloads.

Example:

```ts
import { z } from "zod"

export const createGuestSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  allowedGuests: z.number().int().min(1).max(20),
})

export type CreateGuestDTO = z.infer<typeof createGuestSchema>
```

---

## API Response Standard

All API route handlers should return a consistent shape.

Success:

```ts
{
  success: true,
  data: T
}
```

Failure:

```ts
{
  success: false,
  error: {
    code: string,
    message: string
  }
}
```

Do not expose raw database errors to clients.

Do not return stack traces to clients.

Use stable error codes.

Examples:

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
SNAPSHOT_MISMATCH
INVALID_QR_TOKEN
UPLOAD_TOO_LARGE
SYNC_FAILED
```

---

## Authentication Rules

### Organizer authentication

Use:

- Email and password
- Hashed passwords using bcrypt
- JWT access token
- Secure refresh token if implemented

### Staff authentication

Staff tokens must be:

- Wedding-scoped
- Limited permission
- Time-limited when possible
- Unable to access organizer dashboard

Staff tokens can access only:

- Snapshot download
- Offline Event Mode data
- Check-in sync endpoints

### Guest access

Guests do not authenticate with accounts.

Guest access is token/link-based.

Public guest endpoints must be:

- Scoped to wedding
- Rate limited
- Validated carefully

---

## Authorization Rules

Every protected resource must be scoped by `weddingId`.

Never query by `guestId`, `mediaId`, or `checkinId` alone.

Bad:

```ts
findGuestById(guestId)
```

Good:

```ts
findGuestByWeddingAndId(weddingId, guestId)
```

All organizer operations must verify:

- Organizer is authenticated
- Organizer owns the wedding

All staff operations must verify:

- Staff token is valid
- Token is scoped to the wedding
- Operation is allowed for staff role

---

## Offline-First Rules

Offline check-in is a core WedPass differentiator.

### Core rules

- Staff check-in must work without internet.
- IndexedDB is the local source of truth during event operation.
- Check-ins are written locally first.
- Sync queue must be append-only until server acknowledgement.
- Server is authoritative after synchronization.
- Never block check-in because of network state.

### Local check-in flow

```text
Scan/search guest
  -> Find guest in IndexedDB
  -> If not checked in locally
  -> Mark checked in locally
  -> Append sync queue item
  -> Show success immediately
```

### Sync flow

```text
Detect online
  -> Read unsynced queue
  -> Send batch to server
  -> Server validates
  -> Server resolves conflicts
  -> Client updates local state from server response
  -> Mark queue items as synced
```

### Conflict rule

Server uses:

> Earliest check-in timestamp wins.

If two devices check in the same guest offline, the server keeps the earliest check-in time and marks later records as duplicates.

### Critical rule

Do not delete unsynced check-in queue items before server acknowledgement.

---

## IndexedDB Rules

Use Dexie.js.

All offline logic must live under:

```text
src/lib/offline/
```

Do not scatter IndexedDB logic across pages or components.

Required local stores:

```text
guests
checkinQueue
metadata
mediaQueue
```

### IndexedDB data responsibilities

#### `guests`

Stores downloaded guest snapshot.

#### `checkinQueue`

Stores locally created check-in operations waiting for sync.

#### `metadata`

Stores device ID, snapshot ID, snapshot version, last sync time.

#### `mediaQueue`

Stores pending photo/video uploads and retry status.

---

## Media Upload Rules

Media uploads must use signed URLs.

Correct flow:

```text
Client requests signed upload URL
  -> Client uploads directly to object storage
  -> Client confirms upload with server
  -> Server stores metadata
```

Do not upload large media through the Next.js server.

### Allowed media types for V1

- JPEG
- PNG
- MP4

Do not allow SVG uploads in V1.

### File limits

Use conservative limits in V1.

Recommended starting limits:

- Photos: 10 MB max
- Videos: 100 MB max

### Video rules

- Short videos only.
- Do not autoplay videos.
- Warn users when upload may be slow.
- Queue videos if offline.

---

## React Component Rules

### General rules

- Keep components small and focused.
- Components should be presentational where possible.
- Do not put business logic inside React components.
- Do not call Prisma from React components.
- Do not call low-level fetch directly from deeply nested components.
- Use typed props.

### Component size

Aim for:

- Components under 250 lines.
- Prefer extracting subcomponents when logic grows.

### Containers vs presentational components

Use this pattern:

```text
Page
  -> Feature Container
      -> Presentational Components
```

Example:

```text
GuestListPage
  -> GuestsPageContainer
      -> GuestTable
      -> GuestCard
      -> CsvImportDialog
```

### Server components vs client components

Use server components by default.

Use client components only when needed for:

- interactivity
- local state
- forms
- IndexedDB
- QR scanning
- upload progress
- offline sync UI

Add `"use client"` only where necessary.

---

## State Management Rules

Use the right state tool for the right problem.

### Zustand

Use Zustand only for:

- auth UI state
- sync UI state
- global UI state
- sidebar open/closed state

Do not store all guests or all media in Zustand.

### TanStack Query

Use TanStack Query for:

- server state
- dashboard stats
- wedding details
- guest list from server
- media gallery from server
- staff devices

### Dexie

Use Dexie for:

- offline guest snapshot
- check-in sync queue
- media upload queue
- local event metadata

---

## UI and Design Rules

WedPass uses:

> Modern African Wedding Elegance + Operational Reliability

### Organizer UI

Should feel:

- calm
- professional
- organized
- premium

### Staff UI

Should feel:

- fast
- bold
- high contrast
- operational
- distraction-free

Staff screens require:

- large buttons
- large text
- clear sync status
- visible offline state
- manual fallback when QR fails

### Guest UI

Should feel:

- warm
- elegant
- celebratory
- simple

Use:

- Ivory background
- Champagne accents
- Playfair Display only for couple names or wedding title

---

## shadcn/ui Rules

Use shadcn/ui primitives for:

- Button
- Input
- Label
- Card
- Badge
- Dialog
- DropdownMenu
- Table
- Tabs
- Toast
- Progress
- Alert
- Sheet
- Separator
- Skeleton

Build product-specific components on top of shadcn/ui.

Do not heavily customize shadcn components in inconsistent ways.

Centralize variants when possible.

---

## Tailwind Rules

Use Tailwind design tokens.

Do not hardcode random hex values in components.

Preferred token mapping:

- `navy`
- `champagne`
- `ivory`
- `blush`
- `terracotta`
- `success`
- `warning`
- `danger`
- `sync`
- `offline`

Use responsive utilities intentionally.

Staff mode buttons should have minimum height of `h-14`.

---

## Security Rules

### General

- Validate all inputs with Zod.
- Never trust client data.
- Never expose raw errors.
- Never log passwords or tokens.
- Use UUIDs instead of predictable IDs.

### Wedding scoping

Every query must enforce wedding ownership or wedding token scope.

### QR tokens

QR tokens must be random, secure, and non-predictable.

### Staff tokens

Staff tokens must be limited to Event Mode functionality.

### Media

- Use signed upload URLs.
- Validate file type and size.
- Reject unsupported file types.
- Avoid SVG uploads in V1.
- Do not expose private storage paths unnecessarily.

### Public endpoints

Public guest endpoints must be rate-limited where possible.

---

## Performance Rules

### Staff mode

- Offline guest search should feel instant.
- Guest search target: under 200ms for 1,000 guests.
- Keep UI lightweight.
- Avoid unnecessary animations.

### Gallery

- Paginate media.
- Lazy-load images.
- Do not load full gallery at once.
- Do not autoplay videos.

### Sync

- Batch check-ins.
- Use retry with exponential backoff.
- Avoid sync storms when network returns.

---

## Testing Rules

Use Vitest for unit tests.

Use Playwright for E2E tests.

### Unit test priority

Test:

- local check-in service
- duplicate local check-in prevention
- sync payload creation
- conflict resolution logic
- guest validation
- media validation

### E2E test priority

Test:

- organizer creates wedding
- organizer imports guests
- staff downloads offline pack
- staff checks in guest offline
- sync works when online returns
- guest uploads media
- organizer moderates media

### Offline-specific tests

Must cover:

- device offline before check-in
- device offline after check-in
- sync retry after network returns
- duplicate check-in from two devices
- invalid QR fallback to manual search

---

## Logging and Observability Rules

Use structured logging where possible.

Track:

- snapshot downloads
- staff device registration
- sync attempts
- sync failures
- duplicate check-ins
- upload failures
- media moderation actions

Do not log sensitive tokens.

Add Sentry or equivalent error monitoring before real beta weddings.

---

## Anti-Patterns

Do not:

- Build microservices in V1
- Add GraphQL in V1
- Add Redux
- Call Prisma directly from React components
- Put business logic inside UI components
- Scatter IndexedDB calls across the app
- Upload media through the app server
- Allow unlimited video uploads
- Build AI features in V1
- Build RSVP in V1 unless explicitly added to scope
- Build invitation designer in V1
- Build payment processing in V1
- Build vendor marketplace in V1
- Add WebSockets in V1 unless explicitly requested
- Use predictable IDs in URLs
- Store secrets in code
- Commit `.env` files

---

## V1.0 Scope Guardrails

V1 includes:

- Organizer account
- Wedding creation
- Guest management
- CSV guest import
- QR code generation
- Staff access
- Offline Event Mode
- Multi-device offline check-in
- Check-in sync
- Guest photo upload
- Guest short video upload
- Gallery
- Organizer media moderation
- Basic dashboard stats

V1 excludes:

- Full wedding planning
- RSVP automation
- Invitation builder
- Seating charts
- Vendor marketplace
- Payments
- AI features
- Native mobile apps
- Social media auto-posting
- Advanced analytics
- Real-time WebSocket dashboard

If a feature is not listed in V1, do not implement it without explicit approval.

---

## Package Management Rules

- Always install the latest stable version of any npm package unless a specific version is required to resolve a documented compatibility conflict.
- Use `@latest` when installing packages via `npx` (e.g. `npx create-next-app@latest`).
- Do not pin to a specific semver range (e.g. `^18.0.0`) unless a known conflict with a newer version exists and you document why inline.
- When a peer-dependency conflict arises, investigate the cause first. Prefer resolving the conflict over using `--legacy-peer-deps` or `--force`.
- If a conflict cannot be resolved without downgrading, note the constraint as a comment in `package.json` or in the relevant phase doc.

---

## Claude Code Operating Instructions

When implementing features:

1. Read this file first.
2. Implement only the requested feature.
3. Follow the existing folder structure.
4. Keep code modular.
5. Use TypeScript strictly.
6. Use Zod for validation.
7. Keep business logic in services.
8. Keep database logic in repositories.
9. Keep offline logic in `src/lib/offline`.
10. Keep UI components reusable and presentational where possible.
11. Do not invent new product scope.
12. Ask for clarification if a requested feature conflicts with V1 scope.
13. Use the latest stable version of any npm package unless a conflict requires otherwise (see Package Management Rules).

---

## Preferred Implementation Order

1. Project setup
2. Tailwind and shadcn/ui setup
3. Shared UI components
4. Database schema and Prisma
5. Auth
6. Wedding creation
7. Guest management
8. CSV import
9. QR generation
10. Offline IndexedDB foundation
11. Staff Event Mode
12. Local check-in
13. Sync endpoint
14. Media upload signed URL flow
15. Guest upload page
16. Gallery
17. Media moderation
18. Testing and hardening

---

## Definition of Good Code

Good WedPass code is:

- simple
- typed
- modular
- testable
- explicit
- secure by default
- offline-aware where relevant
- easy for another developer to understand

Avoid cleverness.

Prefer clarity.

---

## Final Reminder

WedPass is not just a wedding website.

WedPass is:

> An offline-first wedding guest operations and media collection platform.

The event-day check-in experience must be reliable even under poor network conditions.

Protect that principle in every implementation decision.
