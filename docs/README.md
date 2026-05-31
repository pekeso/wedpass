# WedPass

**WedPass** is an offline-first wedding guest check-in and photo/video collection platform designed for weddings in Central, East, and West Africa.

It helps wedding organizers manage guest lists, prepare QR-based event access, perform reliable offline check-ins using multiple staff devices, and collect guest photos and videos in one secure wedding gallery.

WedPass starts as a focused **Smart Wedding Guest & Media Management Platform**, not a full wedding planning suite.

---

## 1. Product Summary

WedPass solves two major wedding-day problems:

1. **Guest entrance control**
   - Guest list management
   - QR code generation
   - Offline check-in
   - Multi-device staff check-in
   - Sync when internet returns

2. **Wedding memory collection**
   - Guest photo uploads
   - Guest short video uploads
   - Upload retry under poor network conditions
   - Private wedding gallery
   - Organizer media moderation

The platform is built for real-world event environments where internet connectivity may be poor or unavailable during the wedding.

---

## 2. Target Market

WedPass is initially designed for:

- Central Africa
- East Africa
- West Africa
- English-speaking and French-speaking markets

The platform assumes:

- Mobile-first usage
- Large guest lists
- WhatsApp-heavy sharing habits
- Unreliable venue internet
- Low-end and mid-range Android devices
- Need for simple guest and staff workflows

---

## 3. V1.0 Product Focus

V1.0 focuses on:

- Wedding creation
- Guest list management
- CSV guest import
- QR code generation
- Staff access
- Offline event mode
- Multi-device offline check-in
- Sync queue and conflict-safe reconciliation
- Guest photo and short video uploads
- Organizer gallery moderation
- Basic dashboard stats

V1.0 does **not** include:

- Full wedding planning
- RSVP automation
- Invitation builder
- Seating charts
- Vendor marketplace
- Payments
- Native mobile apps
- AI features
- Social media auto-posting

These are future roadmap items.

---

## 4. Technical Stack

WedPass uses a TypeScript-first fullstack architecture.

### Frontend

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- Zustand
- TanStack Query
- Dexie / IndexedDB
- PWA support

### Backend

- Next.js Route Handlers
- Prisma
- PostgreSQL
- JWT authentication
- Service/repository architecture

### Storage

- Cloudflare R2 or another S3-compatible object storage
- Signed upload URLs for media uploads

### Infrastructure

- Vercel for app hosting
- Supabase PostgreSQL or managed PostgreSQL
- Cloudflare R2 for media storage
- Sentry for error monitoring
- Optional PostHog for product analytics

---

## 5. Architectural Style

WedPass follows an:

> Offline-first modular monolith architecture.

Core characteristics:

- Modular monolith
- Stateless API layer
- Offline-first PWA client
- IndexedDB local persistence
- Eventual consistency for check-ins
- Server-authoritative conflict resolution
- Direct-to-object-storage media uploads
- Wedding-scoped authorization
- Token-based staff access

---

## 6. Key User Roles

### Organizer

The organizer is usually the couple, a trusted family member, or a wedding planner.

Organizer capabilities:

- Create and manage a wedding
- Add/import guests
- Generate QR codes
- Prepare event mode
- Create staff access
- View check-in stats
- Moderate uploaded media

### Staff

Staff members operate the entrance check-in workflow.

Staff capabilities:

- Download offline guest snapshot
- Scan guest QR codes
- Search guests manually
- Check guests in offline
- Sync check-ins when online

Staff accounts are event-scoped and limited.

### Guest

Guests interact with public wedding links or QR codes.

Guest capabilities:

- Open wedding media page
- Upload photos
- Upload short videos
- View approved gallery media

Guests do not need accounts in V1.0.

---

## 7. Core System Flows

### 7.1 Event Preparation Flow

1. Organizer creates wedding
2. Organizer imports guest list
3. System generates guest QR tokens
4. Organizer enables Event Mode
5. System creates guest snapshot
6. Staff devices download offline snapshot

### 7.2 Offline Check-In Flow

1. Staff scans QR code
2. App looks up guest locally in IndexedDB
3. Staff confirms check-in
4. Check-in is saved locally
5. Check-in is added to local sync queue
6. UI confirms success immediately

No internet is required for this flow.

### 7.3 Check-In Sync Flow

1. Device detects online state
2. Device sends unsynced check-ins to server
3. Server validates wedding, snapshot, device, and guests
4. Server applies conflict resolution
5. Server returns authoritative result
6. Client updates local IndexedDB state

Conflict rule:

> First check-in timestamp wins.

### 7.4 Media Upload Flow

1. Guest selects photo/video
2. Client validates file type and size
3. Image may be compressed client-side
4. If offline, file is queued locally
5. If online, client requests signed upload URL
6. Client uploads directly to object storage
7. Client confirms upload metadata with backend

---

## 8. Project Structure

Recommended project structure:

```txt
src/
  app/
    (public)/
    dashboard/
    staff/
    w/

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
  stores/
  types/
```

Detailed rules are defined in `CLAUDE.md`.

---

## 9. Local Development Setup

### Prerequisites

- Node.js LTS
- pnpm or npm
- PostgreSQL database
- Cloudflare R2 or S3-compatible bucket
- Git

### Install Dependencies

```bash
pnpm install
```

or:

```bash
npm install
```

### Configure Environment Variables

Create a local `.env` file based on `.env.example`.

Required variables will include:

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
APP_URL=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=
```

Do not commit `.env` files.

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Run the Development Server

```bash
pnpm dev
```

or:

```bash
npm run dev
```

---

## 10. Development Principles

### Keep the code modular

Each business area should live in a dedicated module.

Examples:

- `auth`
- `weddings`
- `guests`
- `checkins`
- `media`
- `staff`
- `sync`

### Keep business logic out of UI components

UI components should render data and trigger callbacks.

Business rules belong in services.

### Keep database access inside repositories

Do not call Prisma directly from pages or UI components.

### Keep offline logic isolated

Offline logic belongs under:

```txt
src/lib/offline/
```

This includes:

- IndexedDB setup
- guest snapshot storage
- local check-in service
- sync queue
- media upload queue
- network monitoring

### Use shared types and validation

Use Zod schemas and shared DTOs to avoid duplicated validation logic.

---

## 11. Testing Strategy

V1.0 must prioritize testing around the highest-risk areas:

- Offline check-in
- IndexedDB persistence
- Multi-device sync
- Conflict resolution
- Snapshot mismatch handling
- Media upload retries
- QR scanning fallback
- Guest import validation

Recommended tools:

- Vitest for unit tests
- Playwright for end-to-end tests

---

## 12. Security Principles

Security is built into the architecture.

Key principles:

- Use UUIDs and high-entropy QR tokens
- Scope every resource by wedding ID
- Use short-lived access tokens
- Use scoped staff tokens
- Validate every API payload with Zod
- Use signed upload URLs
- Never trust client-side state
- Rate-limit public and auth endpoints
- Store minimal sensitive data in IndexedDB
- Never expose raw database errors to users

Detailed rules are defined in `security.md`.

---

## 13. Beta Strategy

WedPass will launch first as a free beta.

Beta goals:

- Test real wedding check-ins
- Validate offline mode
- Measure guest media upload behavior
- Collect feedback from organizers and staff
- Identify pricing sensitivity

Initial beta should target a small number of weddings with different guest sizes.

---

## 14. Success Criteria for V1.0

V1.0 is successful if:

- At least 3 real weddings use WedPass
- Offline check-in works without data loss
- Multiple staff devices can check in guests independently
- Sync reconciliation works correctly
- Guest photo/video uploads work reliably enough for beta use
- Organizers find the system useful enough to recommend
- At least 20 pieces of structured feedback are collected

---

## 15. Related Documents

The complete implementation pack should include:

- `CLAUDE.md`
- `prd.md`
- `v1_scope.md`
- `architecture.md`
- `system_design.md`
- `database_schema.md`
- `api_contracts.md`
- `offline_sync.md`
- `security.md`
- `ui_ux.md`
- `components.md`
- `routes.md`
- `implementation_plan.md`
- `testing_strategy.md`
- `env_and_deployment.md`
- `risk_register.md`
- `beta_plan.md`
- `backlog.md`

---

## 16. Project Status

Current phase:

> Pre-implementation documentation and architecture finalization.

Next phase:

> Generate implementation documents, set up repository, and begin V1.0 development with Claude Code.
