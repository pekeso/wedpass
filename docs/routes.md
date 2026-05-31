# WedPass Routes

## 1. Document Purpose

This document defines the route structure for **WedPass V1.0**.

It covers:

- Frontend routes
- Route groups
- Layout responsibilities
- Authentication requirements
- User experience boundaries
- Staff Event Mode routes
- Guest media routes
- Organizer dashboard routes
- API route alignment

WedPass uses **Next.js App Router**.

---

## 2. Routing Principles

WedPass routes follow these principles:

1. Keep user experiences clearly separated.
2. Use route groups for public, dashboard, staff, and guest experiences.
3. Keep organizer routes protected.
4. Keep staff routes scoped to a wedding and staff token.
5. Keep guest routes simple and public/token-based.
6. Keep Event Mode routes mobile-first.
7. Avoid mixing organizer UI with staff or guest UI.
8. Use dynamic route params only where needed.
9. Keep pages thin and move behavior into services/hooks/containers.

---

## 3. High-Level Route Groups

Recommended Next.js structure:

```text
src/app/
  (public)/
  dashboard/
  staff/
  w/
  api/
```

Experience groups:

```text
(public)     Public marketing/auth pages
dashboard    Organizer authenticated dashboard
staff        Staff Event Mode
w            Guest wedding media experience
api          Backend route handlers
```

---

# Part 1 — Public Routes

---

## 4. Public Route Group

Path:

```text
src/app/(public)/
```

Purpose:

- Marketing
- Beta signup
- Authentication

Layout:

```text
src/app/(public)/layout.tsx
```

Recommended layout components:

- PublicHeader
- Simple footer
- Centered content
- Warm, polished public design

---

## 5. Landing Page

Route:

```text
/
```

File:

```text
src/app/(public)/page.tsx
```

Purpose:

- Explain WedPass
- Communicate core value
- Convert beta users

Primary CTA:

```text
Join Free Beta
```

Secondary CTA:

```text
Login
```

Auth:

```text
Public
```

---

## 6. Beta Signup Page

Route:

```text
/beta
```

File:

```text
src/app/(public)/beta/page.tsx
```

Purpose:

- Collect beta wedding interest

Fields:

- Full name
- Email
- Country
- Wedding date
- Estimated guest count
- Preferred language

Auth:

```text
Public
```

---

## 7. Login Page

Route:

```text
/login
```

File:

```text
src/app/(public)/login/page.tsx
```

Purpose:

- Organizer login

Auth:

```text
Public
```

Redirect rules:

- If login succeeds, redirect to `/dashboard`
- If already authenticated, redirect to `/dashboard`

---

## 8. Register Page

Route:

```text
/register
```

File:

```text
src/app/(public)/register/page.tsx
```

Purpose:

- Organizer account creation

Auth:

```text
Public
```

Redirect rules:

- If registration succeeds, redirect to onboarding or dashboard
- If already authenticated, redirect to `/dashboard`

---

## 9. Forgot Password Page

Route:

```text
/forgot-password
```

File:

```text
src/app/(public)/forgot-password/page.tsx
```

Purpose:

- Password recovery

V1.0 note:

- Can be deferred if beta users are manually onboarded.

Auth:

```text
Public
```

---

# Part 2 — Organizer Dashboard Routes

---

## 10. Dashboard Route Group

Base route:

```text
/dashboard
```

Folder:

```text
src/app/dashboard/
```

Layout:

```text
src/app/dashboard/layout.tsx
```

Auth:

```text
Organizer required
```

Layout components:

- AppSidebar
- AppHeader
- Mobile sheet navigation
- Dashboard content wrapper

General style:

- Calm
- Professional
- SaaS dashboard
- Wedding warmth through accents

---

## 11. Dashboard Home

Route:

```text
/dashboard
```

File:

```text
src/app/dashboard/page.tsx
```

Purpose:

- Show list of weddings or redirect to current wedding

V1.0 behavior options:

Option A:

```text
Redirect to the organizer's first wedding if one exists.
```

Option B:

```text
Show empty state with Create Wedding CTA.
```

Recommended V1.0:

```text
Show wedding list/empty state because schema supports multiple weddings later.
```

Auth:

```text
Organizer required
```

---

## 12. Create Wedding

Route:

```text
/dashboard/wedding/new
```

File:

```text
src/app/dashboard/wedding/new/page.tsx
```

Purpose:

- Create a wedding

Fields:

- Wedding name
- Couple names
- Wedding date
- Location
- Country
- Optional cover image

Auth:

```text
Organizer required
```

Redirect after success:

```text
/dashboard/wedding/[weddingId]
```

---

## 13. Wedding Overview / Organizer Dashboard

Route:

```text
/dashboard/wedding/[weddingId]
```

File:

```text
src/app/dashboard/wedding/[weddingId]/page.tsx
```

Purpose:

- Wedding-specific dashboard

Displays:

- Wedding summary
- Guest stats
- Check-in stats
- Media upload count
- Event Mode readiness
- Quick actions

Auth:

```text
Organizer required
Wedding ownership required
```

---

## 14. Guest List

Route:

```text
/dashboard/wedding/[weddingId]/guests
```

File:

```text
src/app/dashboard/wedding/[weddingId]/guests/page.tsx
```

Purpose:

- Manage wedding guests

Features:

- Search guests
- Add guest
- Edit guest
- Delete guest
- Import CSV
- View QR status
- View check-in status

Auth:

```text
Organizer required
Wedding ownership required
```

V1.0 rule:

```text
Guest editing is disabled in Event Mode.
```

---

## 15. QR Codes

Route:

```text
/dashboard/wedding/[weddingId]/qr-codes
```

File:

```text
src/app/dashboard/wedding/[weddingId]/qr-codes/page.tsx
```

Purpose:

- View/download guest QR codes

Features:

- List guest QR codes
- Download individual QR
- Download all QR codes if feasible

Auth:

```text
Organizer required
Wedding ownership required
```

---

## 16. Event Mode Setup

Route:

```text
/dashboard/wedding/[weddingId]/event-mode
```

File:

```text
src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx
```

Purpose:

- Prepare and enable offline Event Mode

Features:

- Readiness checklist
- Snapshot status
- Staff preparation state
- Guest list lock warning
- Enable Event Mode CTA

Auth:

```text
Organizer required
Wedding ownership required
```

Important:

```text
Enable Event Mode must require confirmation.
```

---

## 17. Staff Access

Route:

```text
/dashboard/wedding/[weddingId]/staff
```

File:

```text
src/app/dashboard/wedding/[weddingId]/staff/page.tsx
```

Purpose:

- Manage staff devices and staff access

Features:

- Generate staff access token
- List staff devices
- Device status
- Last seen
- Revoke device

Auth:

```text
Organizer required
Wedding ownership required
```

---

## 18. Check-In Stats

Route:

```text
/dashboard/wedding/[weddingId]/checkins
```

File:

```text
src/app/dashboard/wedding/[weddingId]/checkins/page.tsx
```

Purpose:

- Monitor check-in progress

Features:

- Total guests
- Checked-in guests
- Pending guests
- Check-in percentage
- Staff device sync status
- Last sync time

Auth:

```text
Organizer required
Wedding ownership required
```

V1.0 note:

```text
Manual refresh or light polling only. No WebSockets.
```

---

## 19. Gallery Management / Media Moderation

Route:

```text
/dashboard/wedding/[weddingId]/gallery
```

File:

```text
src/app/dashboard/wedding/[weddingId]/gallery/page.tsx
```

Purpose:

- Manage uploaded photos/videos

Features:

- View media grid
- Filter photos/videos/hidden
- Preview media
- Hide media
- Delete media
- Download individual media

Auth:

```text
Organizer required
Wedding ownership required
```

---

## 20. Settings

Route:

```text
/dashboard/wedding/[weddingId]/settings
```

File:

```text
src/app/dashboard/wedding/[weddingId]/settings/page.tsx
```

Purpose:

- Manage wedding settings

Features:

- Wedding details
- Gallery visibility
- Basic account links
- Logout

Auth:

```text
Organizer required
Wedding ownership required
```

---

## 21. Beta Feedback

Route:

```text
/dashboard/wedding/[weddingId]/feedback
```

File:

```text
src/app/dashboard/wedding/[weddingId]/feedback/page.tsx
```

Purpose:

- Collect beta feedback from organizers

Auth:

```text
Organizer required
Wedding ownership required
```

---

# Part 3 — Staff Event Mode Routes

---

## 22. Staff Route Group

Base route:

```text
/staff/[weddingId]
```

Folder:

```text
src/app/staff/[weddingId]/
```

Layout:

```text
src/app/staff/[weddingId]/layout.tsx
```

Auth:

```text
Staff token required after login
```

Style:

- Mobile-first
- Operational
- Large touch targets
- Minimal decoration
- Always-visible sync status where applicable

---

## 23. Staff Login

Route:

```text
/staff/[weddingId]/login
```

File:

```text
src/app/staff/[weddingId]/login/page.tsx
```

Purpose:

- Staff enters event access token/code

Auth:

```text
Public initially
Staff token issued/validated after login
```

Redirect after success:

```text
/staff/[weddingId]/download
```

---

## 24. Offline Pack Download

Route:

```text
/staff/[weddingId]/download
```

File:

```text
src/app/staff/[weddingId]/download/page.tsx
```

Purpose:

- Download guest snapshot for offline check-in

Features:

- Show wedding name
- Show snapshot version
- Show guest count
- Download offline pack
- Show offline pack readiness status

Auth:

```text
Staff token required
```

Redirect after successful download:

```text
/staff/[weddingId]/checkin
```

---

## 25. Staff Check-In Home

Route:

```text
/staff/[weddingId]/checkin
```

File:

```text
src/app/staff/[weddingId]/checkin/page.tsx
```

Purpose:

- Main staff event-day screen

Features:

- SyncStatusBar
- Scan QR Code CTA
- Manual search input
- Recent check-ins
- Sync Now action

Auth:

```text
Staff token required
Local snapshot recommended/required
```

Important:

```text
Must work offline if snapshot is already downloaded.
```

---

## 26. QR Scanner

Route:

```text
/staff/[weddingId]/scan
```

File:

```text
src/app/staff/[weddingId]/scan/page.tsx
```

Purpose:

- Scan guest QR code

Features:

- Camera scanner
- QR frame
- Manual search fallback
- Invalid QR state

Auth:

```text
Staff token required
Local snapshot required
```

Offline:

```text
Must work without backend calls.
```

---

## 27. Manual Guest Search

Route:

```text
/staff/[weddingId]/search
```

File:

```text
src/app/staff/[weddingId]/search/page.tsx
```

Purpose:

- Search guests manually if QR scanning fails

Features:

- Search by name
- Search by phone
- Local results from IndexedDB
- Check-in status badge
- Select guest

Auth:

```text
Staff token required
Local snapshot required
```

Offline:

```text
Must work offline.
```

---

## 28. Guest Check-In Confirmation

Route:

```text
/staff/[weddingId]/checkin/[guestId]
```

File:

```text
src/app/staff/[weddingId]/checkin/[guestId]/page.tsx
```

Purpose:

- Confirm guest and check in locally

Features:

- Guest name
- Phone number
- Allowed guest count
- Check-in status
- Check In button
- Already checked-in state
- Continue scanning button

Auth:

```text
Staff token required
Local snapshot required
```

Offline:

```text
Must work offline.
```

Important:

```text
Check-in action writes to IndexedDB first and appends sync queue item.
No backend call required.
```

---

## 29. Sync Status

Route:

```text
/staff/[weddingId]/sync
```

File:

```text
src/app/staff/[weddingId]/sync/page.tsx
```

Purpose:

- Show local sync status and allow manual sync

Features:

- Online/offline state
- Pending sync count
- Last successful sync
- Failed attempts
- Manual Sync Now button
- Reassuring offline message

Auth:

```text
Staff token required
```

Offline:

```text
Must show pending check-ins safely.
```

---

# Part 4 — Guest Wedding Routes

---

## 30. Guest Route Group

Base route:

```text
/w/[slug]
```

Folder:

```text
src/app/w/[slug]/
```

Layout:

```text
src/app/w/[slug]/layout.tsx
```

Auth:

```text
Public/token-based depending on implementation
```

Style:

- Warm
- Elegant
- Mobile-first
- Minimal friction

---

## 31. Guest Wedding Landing

Route:

```text
/w/[slug]
```

File:

```text
src/app/w/[slug]/page.tsx
```

Purpose:

- Welcome guests to official wedding memory page

Features:

- Couple names
- Wedding date
- Cover image
- Upload CTA
- View gallery CTA
- Privacy note

Auth:

```text
Public or scoped link access
```

---

## 32. Guest Upload

Route:

```text
/w/[slug]/upload
```

File:

```text
src/app/w/[slug]/upload/page.tsx
```

Purpose:

- Allow guest to upload photos/videos

Features:

- Select photos
- Select short videos
- Optional uploader name
- Upload progress
- Upload retry
- Offline queued state
- View gallery CTA

Auth:

```text
Public or scoped link access
```

Rate limiting:

```text
Required
```

---

## 33. Guest Gallery

Route:

```text
/w/[slug]/gallery
```

File:

```text
src/app/w/[slug]/gallery/page.tsx
```

Purpose:

- Show approved/visible wedding media

Features:

- Media grid
- Filter all/photos/videos
- Lazy loading
- Pagination
- Upload more CTA

Auth:

```text
Public or scoped link access
```

Rules:

```text
Do not show hidden or deleted media.
Do not autoplay videos.
```

---

## 34. Guest Media Viewer

Route:

```text
/w/[slug]/media/[mediaId]
```

File:

```text
src/app/w/[slug]/media/[mediaId]/page.tsx
```

Purpose:

- View individual media item

Features:

- Fullscreen image/video
- Close/back
- Next/previous if feasible
- Download optional

Auth:

```text
Public or scoped link access
```

---

## 35. Gallery Closed / Private

Route option:

```text
/w/[slug]/gallery/private
```

or state inside:

```text
/w/[slug]/gallery
```

Purpose:

- Show friendly message if gallery is disabled/private

Recommended:

```text
Use state inside /gallery rather than separate route.
```

---

# Part 5 — System Routes

---

## 36. Not Found

Route:

```text
/not-found
```

Next.js file:

```text
src/app/not-found.tsx
```

Purpose:

- Invalid route
- Wedding not found
- Media not found

---

## 37. Unauthorized

Possible route:

```text
/unauthorized
```

File:

```text
src/app/unauthorized/page.tsx
```

Purpose:

- User lacks access

---

## 38. Error Boundary

File:

```text
src/app/error.tsx
```

Purpose:

- Global error fallback

---

## 39. Loading States

Use route-level loading files where helpful:

```text
src/app/dashboard/loading.tsx
src/app/dashboard/wedding/[weddingId]/loading.tsx
src/app/w/[slug]/gallery/loading.tsx
```

---

## 40. Offline Fallback

Possible file:

```text
public/offline.html
```

or PWA fallback route:

```text
/offline
```

Purpose:

- Show offline message when user opens non-cached page

Important message:

```text
You are offline. Event Mode still works if this device was prepared earlier.
```

---

# Part 6 — API Route Structure

---

## 41. API Base

All APIs under:

```text
/api/v1
```

Next.js App Router route handlers:

```text
src/app/api/v1/
```

---

## 42. Auth API Routes

```text
src/app/api/v1/auth/register/route.ts
src/app/api/v1/auth/login/route.ts
src/app/api/v1/auth/logout/route.ts
src/app/api/v1/auth/me/route.ts
```

---

## 43. Wedding API Routes

```text
src/app/api/v1/weddings/route.ts
src/app/api/v1/weddings/[weddingId]/route.ts
src/app/api/v1/weddings/[weddingId]/stats/route.ts
```

---

## 44. Guest API Routes

```text
src/app/api/v1/weddings/[weddingId]/guests/route.ts
src/app/api/v1/weddings/[weddingId]/guests/[guestId]/route.ts
src/app/api/v1/weddings/[weddingId]/guests/import/route.ts
src/app/api/v1/weddings/[weddingId]/guests/[guestId]/qr/route.ts
```

---

## 45. QR API Routes

```text
src/app/api/v1/weddings/[weddingId]/qr-codes/route.ts
```

---

## 46. Event Mode API Routes

```text
src/app/api/v1/weddings/[weddingId]/event-mode/readiness/route.ts
src/app/api/v1/weddings/[weddingId]/event-mode/enable/route.ts
src/app/api/v1/weddings/[weddingId]/snapshot/active/route.ts
```

---

## 47. Staff API Routes

```text
src/app/api/v1/weddings/[weddingId]/staff/devices/route.ts
src/app/api/v1/weddings/[weddingId]/staff/devices/[deviceId]/revoke/route.ts
src/app/api/v1/staff/weddings/[weddingId]/snapshot/route.ts
src/app/api/v1/staff/weddings/[weddingId]/checkins/sync/route.ts
```

---

## 48. Media API Routes

```text
src/app/api/v1/weddings/[weddingId]/media/route.ts
src/app/api/v1/weddings/[weddingId]/media/upload-url/route.ts
src/app/api/v1/weddings/[weddingId]/media/confirm/route.ts
src/app/api/v1/weddings/[weddingId]/media/[mediaId]/hide/route.ts
src/app/api/v1/weddings/[weddingId]/media/[mediaId]/route.ts
```

---

## 49. Public API Routes

```text
src/app/api/v1/public/weddings/[slug]/route.ts
src/app/api/v1/public/weddings/[slug]/media/route.ts
```

---

## 50. Feedback API Routes

```text
src/app/api/v1/weddings/[weddingId]/feedback/route.ts
```

---

# Part 7 — Route Guards

---

## 51. Organizer Route Guard

Applies to:

```text
/dashboard/**
```

Requirements:

- Valid organizer session
- Redirect unauthenticated users to `/login`
- Validate wedding ownership for wedding-specific pages

Recommended implementation:

```text
server-side auth helper in layout/page
```

---

## 52. Staff Route Guard

Applies to:

```text
/staff/[weddingId]/**
```

Requirements:

- Staff token for protected staff pages
- Staff token must match wedding ID
- Device must not be revoked
- Snapshot required for offline pages

Pages that require snapshot:

```text
/checkin
/scan
/search
/checkin/[guestId]
```

If no local snapshot exists:

```text
Redirect to /staff/[weddingId]/download
```

---

## 53. Guest Route Guard

Applies to:

```text
/w/[slug]/**
```

V1.0 can be public but rate-limited.

If gallery is disabled:

```text
Show Gallery Private state.
```

Do not expose guest list.

---

# Part 8 — Route-to-Component Mapping

---

## 54. Organizer Dashboard Mapping

```text
/dashboard/wedding/[weddingId]
  → AppSidebar
  → AppHeader
  → PageHeader
  → StatCard
  → EventReadinessChecklist
```

---

## 55. Guest List Mapping

```text
/dashboard/wedding/[weddingId]/guests
  → GuestListToolbar
  → GuestTable desktop
  → GuestCard mobile
  → GuestForm
  → CsvImportDialog
```

---

## 56. Event Mode Mapping

```text
/dashboard/wedding/[weddingId]/event-mode
  → EventReadinessChecklist
  → SectionCard
  → ConfirmDialog
  → Alert
```

---

## 57. Staff Check-In Mapping

```text
/staff/[weddingId]/checkin
  → SyncStatusBar
  → OfflineWarningBanner
  → ScanActionCard
  → RecentCheckinsList
```

---

## 58. Staff Confirmation Mapping

```text
/staff/[weddingId]/checkin/[guestId]
  → SyncStatusBar
  → GuestCheckinCard
  → StatusBadge
```

---

## 59. Guest Upload Mapping

```text
/w/[slug]/upload
  → WeddingHero
  → MediaUploadCard
  → UploadQueueList
  → PrivacyNote
```

---

## 60. Guest Gallery Mapping

```text
/w/[slug]/gallery
  → WeddingHero
  → Tabs
  → MediaGrid
  → MediaCard
  → EmptyState
```

---

# Part 9 — Navigation Rules

---

## 61. Organizer Navigation

Desktop:

```text
Sidebar
```

Mobile:

```text
Sheet/drawer navigation
```

Main items:

```text
Dashboard
Guests
QR Codes
Event Mode
Staff Access
Check-Ins
Gallery
Settings
```

---

## 62. Staff Navigation

Staff mode should not use complex navigation.

Primary actions:

```text
Scan QR
Search
Sync
Exit
```

Keep navigation minimal.

---

## 63. Guest Navigation

Guest pages should keep navigation simple:

```text
Upload
Gallery
Back to Wedding Page
```

Do not expose dashboard or admin links.

---

# Part 10 — Route Implementation Rules

---

## 64. Page Component Rules

Page components should:

- Load required data
- Render containers/components
- Handle redirects
- Stay small

Page components should not:

- Contain business logic
- Call Prisma directly
- Implement sync logic
- Parse CSV directly
- Upload media directly

---

## 65. Dynamic Params

Dynamic route params:

```text
weddingId
guestId
mediaId
slug
```

Rules:

- Validate params before use
- Never assume route param is valid
- Check authorization for `weddingId`
- Check ownership for dashboard routes
- Check staff scope for staff routes

---

## 66. Loading and Error UX

Use route-level loading where helpful.

Required:

- Guest gallery loading
- Dashboard loading
- Guest list loading
- Media moderation loading

Use friendly error messages.

---

# Part 11 — Recommended Build Order

---

## 67. Route Build Order

Build routes in this order:

### Stage 1 — Public/Auth

```text
/
/login
/register
/beta
```

### Stage 2 — Dashboard Shell

```text
/dashboard
/dashboard/wedding/new
/dashboard/wedding/[weddingId]
```

### Stage 3 — Staff Offline Core

```text
/staff/[weddingId]/login
/staff/[weddingId]/download
/staff/[weddingId]/checkin
/staff/[weddingId]/scan
/staff/[weddingId]/search
/staff/[weddingId]/checkin/[guestId]
/staff/[weddingId]/sync
```

### Stage 4 — Guest Management

```text
/dashboard/wedding/[weddingId]/guests
/dashboard/wedding/[weddingId]/qr-codes
/dashboard/wedding/[weddingId]/event-mode
/dashboard/wedding/[weddingId]/staff
```

### Stage 5 — Guest Media

```text
/w/[slug]
/w/[slug]/upload
/w/[slug]/gallery
/w/[slug]/media/[mediaId]
```

### Stage 6 — Media Moderation and Stats

```text
/dashboard/wedding/[weddingId]/gallery
/dashboard/wedding/[weddingId]/checkins
/dashboard/wedding/[weddingId]/settings
/dashboard/wedding/[weddingId]/feedback
```

---

# Part 12 — Route Anti-Patterns

---

## 68. Avoid These

Do not:

- Put staff screens under dashboard routes.
- Put guest media pages under dashboard routes.
- Require guest login.
- Use tables on mobile staff screens.
- Call Prisma from page components.
- Put sync logic inside route components.
- Mix public gallery and organizer media moderation in one page.
- Use WebSockets in V1.0.
- Create deeply nested routes without clear reason.
- Use route params without authorization checks.

---

## 69. Summary

WedPass route design separates the product into four clear route experiences:

```text
Public marketing/auth
Organizer dashboard
Staff Event Mode
Guest media experience
```

This separation keeps the app:

- Easier to build
- Easier to reason about
- Easier to secure
- Easier to scale
- Easier for Claude Code to implement consistently

The most important routing rule is:

> Staff Event Mode must remain independent, mobile-first, and offline-capable.
