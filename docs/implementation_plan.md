# WedPass Implementation Plan

## 1. Document Purpose

This document defines the implementation plan for **WedPass V1.0**.

It is intended to guide development using **Claude Code** while keeping the project scalable, maintainable, and aligned with the frozen V1.0 scope.

This document explains:

- Build stages
- Technical implementation order
- Claude Code workflow
- Deliverables per stage
- Definition of done
- Testing checkpoints
- What not to build in V1.0

---

## 2. Product Reminder

WedPass V1.0 is:

> An offline-first wedding guest check-in and photo/video collection platform.

It is designed for weddings in Central, East, and West Africa where internet connectivity may be unreliable.

V1.0 focuses on:

- Organizer wedding setup
- Guest list management
- QR code generation
- Offline multi-device check-in
- Safe check-in sync
- Guest photo/video upload
- Gallery and media moderation
- Free beta readiness

WedPass V1.0 is not a full wedding planning platform.

---

## 3. Technical Stack

Frontend:

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Dexie / IndexedDB

Backend:

- Next.js Route Handlers
- TypeScript
- Prisma
- PostgreSQL

Storage:

- Cloudflare R2
- Signed upload URLs

Infrastructure:

- Vercel
- Supabase PostgreSQL
- Cloudflare R2
- Sentry

---

## 4. Implementation Principles

Claude Code must follow these implementation principles:

1. Build incrementally.
2. Do not generate unrelated features.
3. Keep the app as a modular monolith.
4. Keep business logic out of React components.
5. Use service/repository separation.
6. Use Zod validation for all inputs.
7. Use Prisma only inside repositories.
8. Keep offline sync logic isolated in `src/lib/offline`.
9. Keep UI components presentational where possible.
10. Prefer simple, explicit code over clever abstractions.
11. Do not introduce microservices, Redis, queues, or WebSockets in V1.0.
12. Do not build features that are explicitly out of scope.

---

## 5. Recommended Build Order

The recommended implementation order is:

```text
Stage 0: Project rules and setup
Stage 1: Project shell and tooling
Stage 2: Database and Prisma foundation
Stage 3: Auth foundation
Stage 4: Shared UI and layouts
Stage 5: Offline foundation
Stage 6: Staff Event Mode
Stage 7: Organizer wedding and guest management
Stage 8: Event Mode and snapshots
Stage 9: Check-in sync backend
Stage 10: Guest media upload and gallery
Stage 11: Media moderation
Stage 12: Dashboard stats and feedback
Stage 13: Testing and hardening
Stage 14: Deployment and beta preparation
```

The order prioritizes the offline check-in core early because it is the highest-risk and highest-value feature.

---

# Stage 0 — Project Rules and Documentation

## Goal

Prepare the repository for AI-assisted development.

## Tasks

- Add `CLAUDE.md`
- Add all planning documents
- Add `.env.example`
- Add initial `README.md`
- Add project conventions

## Deliverables

- Repository contains core documentation
- Claude Code has clear engineering rules
- V1.0 frozen scope is visible

## Definition of Done

- `CLAUDE.md` exists
- `README.md` exists
- Scope and architecture documents exist
- Claude Code can be instructed to read these files before coding

---

# Stage 1 — Project Shell and Tooling

## Goal

Create the base Next.js project and tooling.

## Tasks

1. Initialize Next.js App Router project.
2. Enable TypeScript strict mode.
3. Install and configure TailwindCSS.
4. Install and configure shadcn/ui.
5. Install Lucide React.
6. Install ESLint and Prettier.
7. Set up base folder structure.
8. Add route groups:
   - `(public)`
   - `dashboard`
   - `staff`
   - `w`
   - `api`
9. Add placeholder pages for core routes.
10. Add global styles and Tailwind tokens.

## Suggested Claude Code Prompt

```text
Set up the WedPass project shell using Next.js App Router, TypeScript, TailwindCSS, and shadcn/ui.

Follow CLAUDE.md and create the folder structure described in routes.md and components.md.

Create placeholder pages only. Do not implement features yet.
Configure Tailwind theme tokens using the WedPass design system.
```

## Deliverables

- Next.js project runs locally
- Tailwind works
- shadcn/ui works
- Folder structure exists
- Placeholder routes exist
- Theme tokens configured

## Definition of Done

- `npm run dev` works
- `npm run lint` works
- Public, dashboard, staff, and guest route groups exist
- No feature logic yet

---

# Stage 2 — Database and Prisma Foundation

## Goal

Create the server data foundation.

## Tasks

1. Install Prisma.
2. Configure PostgreSQL connection.
3. Create Prisma schema.
4. Add core enums.
5. Add models:
   - User
   - Wedding
   - Guest
   - WeddingSnapshot
   - SnapshotGuest
   - StaffDevice
   - CheckIn
   - MediaUpload
   - SyncLog
   - BetaFeedback
6. Run initial migration.
7. Create Prisma client wrapper.
8. Add seed script with sample wedding and guests.
9. Add repository folder structure.

## Suggested Claude Code Prompt

```text
Implement the Prisma database foundation for WedPass.

Use database_schema.md as the source of truth.
Create the Prisma schema, enums, models, indexes where Prisma supports them, and the Prisma client wrapper.

Do not implement API routes yet.
Add a seed script with one organizer, one wedding, and sample guests.
```

## Deliverables

- Prisma schema implemented
- Migration created
- Seed script works
- Database connection works

## Definition of Done

- `npx prisma migrate dev` works
- `npx prisma db seed` works
- Prisma Studio shows sample data
- Prisma access is isolated to repository layer

---

# Stage 3 — Authentication Foundation

## Goal

Implement organizer authentication.

## Tasks

1. Add auth module structure.
2. Add password hashing with bcrypt.
3. Add JWT signing and verification utilities.
4. Add auth schemas with Zod.
5. Implement register endpoint.
6. Implement login endpoint.
7. Implement logout endpoint if needed.
8. Implement `/auth/me`.
9. Add organizer route protection helper.
10. Build login/register UI.

## Suggested Claude Code Prompt

```text
Implement the WedPass authentication foundation.

Use api_contracts.md and security.md.
Create auth module with schemas, service, repository, JWT utilities, and API route handlers.

Use bcrypt for password hashing.
Do not store passwords in plain text.
Do not expose password hashes.
Add login and register UI using shadcn/ui.
```

## Deliverables

- Organizer can register
- Organizer can login
- Auth token issued
- Protected dashboard routes work
- Current user endpoint works

## Definition of Done

- Register works
- Login works
- Dashboard is protected
- Passwords are hashed
- Auth requests are validated with Zod
- No raw Prisma access from route handlers

---

# Stage 4 — Shared UI and Layouts

## Goal

Create the reusable UI foundation.

## Tasks

1. Install required shadcn/ui components.
2. Build shared components:
   - StatusBadge
   - StatCard
   - PageHeader
   - SectionCard
   - EmptyState
   - ConfirmDialog
   - LoadingState
   - ErrorState
3. Build layout components:
   - PublicHeader
   - AppSidebar
   - AppHeader
   - StaffLayoutShell
   - GuestLayoutShell
4. Apply responsive layout rules.
5. Add basic navigation.

## Suggested Claude Code Prompt

```text
Create the shared UI and layout components for WedPass.

Use components.md and ui_ux.md.
Use shadcn/ui primitives and Tailwind tokens.
Components must be reusable, presentational, and strongly typed.
Do not add API calls inside components.
```

## Deliverables

- Shared UI components exist
- Dashboard layout exists
- Staff layout exists
- Guest layout exists
- Navigation works

## Definition of Done

- Shared components render correctly
- Layouts are responsive
- Staff layout is mobile-first
- No business logic inside low-level components

---

# Stage 5 — Offline Foundation

## Goal

Implement local offline storage and services.

## Tasks

1. Install Dexie.
2. Create IndexedDB schema:
   - guests
   - checkinQueue
   - metadata
   - mediaQueue
3. Create metadata helpers.
4. Create device ID helper.
5. Create local guest repository.
6. Create guest search utility.
7. Create local check-in service.
8. Create network status hook.
9. Create sync status hook placeholder.
10. Add unit tests for local check-in.

## Suggested Claude Code Prompt

```text
Implement the offline foundation for WedPass staff check-in.

Use offline_sync.md and database_schema.md.
Create Dexie database setup, local guest repository, metadata helpers, device ID helper, guest search utility, and local check-in service.

Do not implement server sync yet.
Do not build UI pages yet.
Add unit tests for local check-in behavior.
```

## Deliverables

- IndexedDB schema exists
- Local guests can be stored
- Local guest search works
- Local check-in writes guest state and queue item
- Device ID persists

## Definition of Done

- Local check-in works offline
- Queue item is created
- Duplicate local check-in is prevented
- Tests pass

---

# Stage 6 — Staff Event Mode UI

## Goal

Build the staff-facing offline check-in experience.

## Tasks

1. Build staff components:
   - SyncStatusBar
   - OfflineWarningBanner
   - ScanActionCard
   - GuestCheckinCard
   - RecentCheckinsList
   - ScannerFrame
   - ManualSearchResults
   - OfflinePackStatusCard
2. Build routes:
   - `/staff/[weddingId]/login`
   - `/staff/[weddingId]/download`
   - `/staff/[weddingId]/checkin`
   - `/staff/[weddingId]/scan`
   - `/staff/[weddingId]/search`
   - `/staff/[weddingId]/checkin/[guestId]`
   - `/staff/[weddingId]/sync`
3. Use mock/local data first.
4. Connect pages to IndexedDB services.
5. Ensure all key screens work offline after snapshot is loaded.

## Suggested Claude Code Prompt

```text
Implement the staff Event Mode UI for WedPass.

Use routes.md, components.md, ui_ux.md, and offline_sync.md.
Build mobile-first staff screens and connect them to the local IndexedDB offline services.

Use mock snapshot data initially if backend snapshot endpoint is not ready.
Do not call the backend during local check-in.
```

## Deliverables

- Staff check-in home works
- Staff can search local guests
- Staff can open confirmation screen
- Staff can check in guest locally
- Sync status screen shows pending queue

## Definition of Done

- Works on mobile viewport
- Works offline after local data exists
- Check-in action writes locally
- UI clearly shows pending sync count
- Manual search fallback exists

---

# Stage 7 — Organizer Wedding and Guest Management

## Goal

Build organizer-facing wedding and guest management.

## Tasks

1. Build wedding creation page.
2. Build dashboard page.
3. Build guest list page.
4. Build guest add/edit form.
5. Build CSV import dialog.
6. Build QR codes screen.
7. Implement wedding API routes.
8. Implement guest API routes.
9. Implement QR data API routes.
10. Connect frontend to APIs through typed API client.

## Suggested Claude Code Prompt

```text
Implement organizer wedding and guest management.

Use routes.md, api_contracts.md, database_schema.md, components.md, and CLAUDE.md.
Build APIs using route handler → service → repository pattern.
Build UI using existing components.

Do not allow guest editing when wedding is in Event Mode.
```

## Deliverables

- Organizer can create wedding
- Organizer can add/edit/delete guests
- Organizer can import guests from CSV
- Guest list displays correctly
- QR data is generated and shown

## Definition of Done

- Guest CRUD works
- CSV import works with validation
- QR token generated by server
- Event Mode lock rule is respected
- UI works on desktop and mobile

---

# Stage 8 — Event Mode and Snapshots

## Goal

Implement Event Mode preparation and snapshot download.

## Tasks

1. Build Event Mode readiness endpoint.
2. Build Enable Event Mode endpoint.
3. Implement snapshot creation.
4. Copy guests into snapshot_guests.
5. Set wedding status to EVENT_MODE.
6. Lock guest editing.
7. Build active snapshot endpoint.
8. Build staff snapshot download endpoint.
9. Connect staff offline pack download screen to endpoint.
10. Save downloaded snapshot to IndexedDB.

## Suggested Claude Code Prompt

```text
Implement Event Mode and snapshot functionality for WedPass.

Use offline_sync.md, database_schema.md, api_contracts.md, and security.md.
When Event Mode is enabled, create an active snapshot and lock guest editing.
Implement staff snapshot download and save it into IndexedDB.

Do not allow guest edits after Event Mode is enabled.
```

## Deliverables

- Organizer can enable Event Mode
- Snapshot is created
- Staff device can download snapshot
- Snapshot guests saved locally
- Staff device becomes offline-ready

## Definition of Done

- Snapshot version exists
- Snapshot guest count matches guest list
- Guest editing blocked in Event Mode
- Staff download works
- Offline check-in uses downloaded snapshot

---

# Stage 9 — Check-In Sync Backend

## Goal

Implement server-authoritative sync.

## Tasks

1. Implement staff device access.
2. Implement staff token validation.
3. Implement sync endpoint.
4. Implement sync service.
5. Implement idempotency with device ID + queue ID.
6. Implement conflict resolution.
7. Implement duplicate handling.
8. Update guest checked-in denormalized state.
9. Write sync logs.
10. Connect client sync engine.

## Suggested Claude Code Prompt

```text
Implement the WedPass check-in sync backend and client sync engine.

Use offline_sync.md, api_contracts.md, database_schema.md, and security.md.
The sync endpoint must be idempotent.
Use earliest valid check-in timestamp wins.
Use route handler → service → repository pattern.
Do not put sync logic in React components.
```

## Deliverables

- Staff device can sync queue
- Accepted check-ins stored
- Duplicate check-ins handled
- Queue items marked synced on client
- Sync logs created

## Definition of Done

- Single-device sync works
- Multi-device duplicate scenario works
- Retry does not create duplicate accepted records
- Server response updates local state
- Sync failures preserve queue

---

# Stage 10 — Guest Media Upload and Gallery

## Goal

Implement guest media upload and public gallery.

## Tasks

1. Build guest landing page.
2. Build guest upload page.
3. Build media upload components.
4. Implement signed upload URL endpoint.
5. Implement media confirmation endpoint.
6. Implement direct upload to R2.
7. Add image/video validation.
8. Add upload progress.
9. Add media queue behavior where feasible.
10. Build guest gallery page.
11. Implement public gallery media endpoint.

## Suggested Claude Code Prompt

```text
Implement guest media upload and gallery for WedPass.

Use api_contracts.md, security.md, components.md, and ui_ux.md.
Use signed URLs for Cloudflare R2.
Do not upload media files through the app server.
Support images and MP4 videos with size limits.
Build mobile-first guest upload and gallery pages.
```

## Deliverables

- Guest can open wedding page
- Guest can upload image
- Guest can upload video within limit
- Upload goes directly to R2
- Upload confirmation creates metadata
- Gallery displays uploaded media

## Definition of Done

- Signed URL flow works
- File validation works
- Upload progress shown
- Gallery paginated/lazy loaded
- Hidden/deleted media not shown publicly

---

# Stage 11 — Media Moderation

## Goal

Allow organizers to manage uploaded media.

## Tasks

1. Build media moderation page.
2. Add media filters:
   - All
   - Photos
   - Videos
   - Hidden
3. Add media preview.
4. Add hide action.
5. Add delete action.
6. Add confirmation dialog for delete.
7. Add download individual media.

## Suggested Claude Code Prompt

```text
Implement organizer media moderation for WedPass.

Use components.md, api_contracts.md, and security.md.
Organizer must be able to view, hide, delete, and download media.
Delete actions require confirmation.
Do not show hidden/deleted media in the public guest gallery.
```

## Deliverables

- Organizer media grid works
- Hide media works
- Delete media works
- Guest gallery respects visibility

## Definition of Done

- Media moderation APIs protected
- Wedding ownership validated
- Delete requires confirmation
- Public gallery excludes hidden/deleted media

---

# Stage 12 — Dashboard Stats and Feedback

## Goal

Add V1.0 operational stats and beta feedback.

## Tasks

1. Implement dashboard stats endpoint.
2. Implement check-in stats endpoint.
3. Show dashboard stat cards.
4. Show staff device sync summary.
5. Implement beta feedback form.
6. Implement feedback endpoint.

## Suggested Claude Code Prompt

```text
Implement WedPass dashboard stats and beta feedback.

Use api_contracts.md and components.md.
Show basic stats only: total guests, checked-in guests, pending guests, check-in percentage, media uploads, latest sync time.
Do not build advanced analytics.
```

## Deliverables

- Dashboard stats shown
- Check-in stats shown
- Beta feedback can be submitted

## Definition of Done

- Stats are accurate
- Empty states handled
- Feedback stored
- No advanced analytics added

---

# Stage 13 — Testing and Hardening

## Goal

Prepare V1.0 for real beta weddings.

## Tasks

1. Unit test local check-in service.
2. Unit test sync result processing.
3. Unit test validation schemas.
4. Integration test sync endpoint.
5. Test multi-device duplicate scenario.
6. Test offline browser refresh.
7. Test media upload failure.
8. Test QR invalid fallback.
9. Test low-end mobile viewport.
10. Fix accessibility basics.
11. Add Sentry.
12. Review security checklist.

## Suggested Claude Code Prompt

```text
Create tests and hardening checks for WedPass V1.0.

Focus on:
- offline local check-in
- sync queue behavior
- multi-device duplicate handling
- API validation
- media upload validation
- mobile staff mode flows

Do not add new features.
```

## Deliverables

- Critical tests exist
- Key offline scenarios tested
- Sync retry tested
- Upload validation tested
- Sentry configured

## Definition of Done

- Tests pass
- Manual offline test passes
- Multi-device duplicate test passes
- Media upload test passes
- Security checklist reviewed

---

# Stage 14 — Deployment and Beta Preparation

## Goal

Deploy WedPass and prepare first beta users.

## Tasks

1. Configure Vercel.
2. Configure Supabase PostgreSQL.
3. Configure Cloudflare R2.
4. Set production environment variables.
5. Run migrations.
6. Seed production only if needed.
7. Configure Sentry.
8. Create beta landing page.
9. Create beta onboarding checklist.
10. Test full production flow.
11. Prepare support/debug checklist.

## Suggested Claude Code Prompt

```text
Prepare WedPass for beta deployment.

Use env_and_deployment.md, security.md, and beta_plan.md.
Create deployment checklist, verify required environment variables, and ensure production build passes.

Do not add new product features.
```

## Deliverables

- Production deployment live
- Database migrated
- R2 upload works
- Auth works
- Offline check-in works in production
- Beta onboarding ready

## Definition of Done

- Production app accessible
- Full end-to-end flow works
- First beta wedding can be onboarded
- Monitoring is active

---

# 6. Eight-Week Execution Breakdown

## Week 1 — Project Setup and Foundation

Focus:

- Project shell
- Tailwind/shadcn setup
- Prisma setup
- Basic auth
- Dashboard shell

Deliverable:

```text
Organizer can register, login, create a wedding, and access dashboard shell.
```

---

## Week 2 — Guest Management

Focus:

- Guest CRUD
- CSV import
- QR token generation
- Guest list UI

Deliverable:

```text
Organizer can manage guest list and prepare QR data.
```

---

## Week 3 — Offline Foundation

Focus:

- Dexie setup
- Snapshot local storage
- Local guest search
- Local check-in service

Deliverable:

```text
Local offline check-in works with sample snapshot data.
```

---

## Week 4 — Staff Event Mode and Sync

Focus:

- Staff UI
- Offline pack download
- Sync endpoint
- Conflict handling

Deliverable:

```text
Multiple devices can check in guests offline and sync safely later.
```

---

## Week 5 — Guest Media Upload

Focus:

- Guest upload page
- Signed URL flow
- R2 upload
- Upload progress

Deliverable:

```text
Guests can upload photos and videos to the wedding.
```

---

## Week 6 — Gallery and Moderation

Focus:

- Guest gallery
- Organizer media moderation
- Hide/delete media
- Basic media filters

Deliverable:

```text
Organizer can manage uploaded wedding memories.
```

---

## Week 7 — Testing and Hardening

Focus:

- Offline testing
- Multi-device testing
- Upload failure testing
- Mobile UX polish
- Security checks

Deliverable:

```text
System is stable enough for real beta wedding testing.
```

---

## Week 8 — Deployment and Beta Launch

Focus:

- Production deployment
- Landing page
- Beta onboarding
- Feedback form
- Monitoring

Deliverable:

```text
WedPass is live and ready for 3–5 beta weddings.
```

---

# 7. Claude Code Workflow

For each implementation task:

1. Ask Claude Code to read:
   - `CLAUDE.md`
   - relevant domain document
   - current file tree
2. Give one small task at a time.
3. Require it to explain files changed.
4. Run tests/lint.
5. Commit after a working increment.
6. Avoid asking it to build multiple major features at once.

---

## Recommended Prompt Pattern

```text
Read CLAUDE.md, implementation_plan.md, and [specific document].

Implement [specific feature].

Constraints:
- Follow modular monolith structure.
- Use service/repository separation.
- Use Zod validation.
- Do not add unrelated features.
- Keep UI components presentational.
- Add or update tests if logic is involved.

After implementation, summarize:
- Files created
- Files changed
- How to test
```

---

# 8. Definition of Done for V1.0

WedPass V1.0 is complete when:

- Organizer can register and login
- Organizer can create a wedding
- Organizer can manage guests
- Organizer can import guests from CSV
- Organizer can generate QR codes
- Organizer can enable Event Mode
- Staff can download offline snapshot
- Staff can check in guests offline
- Staff can sync check-ins later
- Multi-device duplicate sync is deterministic
- Guests can upload photos/videos
- Guests can view gallery
- Organizer can moderate media
- Dashboard stats are available
- App is deployed
- Security checklist is reviewed
- Free beta onboarding is ready

---

# 9. Explicit Non-Implementation List for V1.0

Do not implement:

- RSVP
- Invitation builder
- Seating chart
- Vendor marketplace
- Payment processing
- AI features
- Social media auto-posting
- WebSockets
- Native mobile app
- Advanced analytics
- Guest comments
- Guest reactions
- Public event discovery

These belong in backlog or later versions.

---

# 10. Summary

This implementation plan is designed to help build WedPass quickly without losing architectural discipline.

The most important implementation priorities are:

1. Offline check-in reliability
2. Multi-device sync correctness
3. Media upload safety
4. Mobile-first usability
5. Scope discipline

The goal is not to build everything.

The goal is to build a reliable V1.0 that can survive real wedding conditions.
