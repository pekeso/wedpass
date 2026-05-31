# WedPass Product Requirements Document (PRD)

## 1. Product Overview

**Product name:** WedPass  
**Product type:** Offline-first smart wedding guest check-in and media collection platform  
**Target release:** V1.0 Free Beta  
**Primary market:** Central, East, and West Africa  
**Primary platform:** Responsive web application / PWA  

WedPass helps wedding organizers manage guests, perform reliable QR-based check-ins even when internet connectivity is poor, and collect guest photos and short videos in one secure wedding gallery.

V1.0 is intentionally focused on **guest control and wedding memory collection**, not a full wedding planning suite.

---

## 2. Product Vision

WedPass exists to make wedding guest management and memory collection simple, reliable, and adapted to African event realities.

The platform should help couples and planners answer three questions with confidence:

1. Who is invited?
2. Who has arrived?
3. Where are all the wedding photos and videos?

The product must work well in environments where internet connectivity may be unreliable during the event.

---

## 3. Core Value Proposition

> **Control your wedding entrance and collect every wedding memory in one place — even when the internet is unreliable.**

WedPass combines:

- guest list management,
- QR-based guest check-in,
- offline-first event mode,
- multi-device staff check-in,
- photo and short video upload,
- centralized wedding gallery.

---

## 4. Target Users

## 4.1 Wedding Organizer

This may be:

- the couple,
- a family representative,
- a wedding planner,
- an event coordinator.

### Goals

- Create and manage a wedding event.
- Upload or add guests.
- Generate QR codes for guests.
- Prepare staff devices for event-day check-in.
- Monitor check-in progress.
- Review uploaded photos and videos.

### Pain Points

- Manual guest tracking is chaotic.
- Entrance control can be slow or disorganized.
- Guests send photos through scattered WhatsApp groups.
- Event-day internet may not be reliable.

---

## 4.2 Event Staff

Staff members manage guest entry on the wedding day.

### Goals

- Scan guest QR codes quickly.
- Search for guests manually when QR scanning fails.
- Check guests in even while offline.
- Trust that check-ins are saved and will sync later.

### Pain Points

- Slow internet at venues.
- Pressure at the entrance.
- Guests arriving without QR codes.
- Multiple staff devices checking in guests at once.

---

## 4.3 Wedding Guest

Guests attend the wedding and contribute media.

### Goals

- Access the official wedding page easily.
- Upload photos or short videos.
- View the approved wedding gallery.

### Pain Points

- No clear place to share photos.
- Uploading large videos on poor networks can fail.
- Guests do not want to create accounts.

---

## 5. V1.0 Product Scope

V1.0 focuses on:

1. wedding setup,
2. guest management,
3. QR generation,
4. offline-first check-in,
5. photo/video uploads,
6. media gallery,
7. basic dashboard stats.

---

## 6. Functional Requirements

## 6.1 Authentication

### Requirements

- Organizers can register with email and password.
- Organizers can log in securely.
- Sessions are handled with secure token-based authentication.
- Staff access is scoped to a wedding and check-in permissions only.

### Out of Scope for V1

- Social login.
- Enterprise SSO.
- Multi-organization account management.

---

## 6.2 Wedding Management

### Requirements

Organizers can create a wedding with:

- wedding name,
- couple names,
- event date,
- location,
- country,
- optional cover image,
- gallery visibility setting.

Organizers can edit wedding details before Event Mode is enabled.

### Constraints

Once Event Mode is enabled, guest data used for check-in is locked through a snapshot.

---

## 6.3 Guest Management

### Requirements

Organizers can:

- add guests manually,
- edit guests,
- delete guests before Event Mode,
- import guests from CSV,
- search guests by name or phone,
- generate QR codes for guests.

Guest fields for V1:

- full name,
- phone number,
- email address,
- number of allowed guests,
- QR token,
- check-in status,
- check-in timestamp.

### Out of Scope for V1

- seating charts,
- RSVP workflow,
- meal preferences,
- table assignments.

---

## 6.4 QR Code Generation

### Requirements

- Each guest receives a unique QR token.
- The organizer can download individual QR codes.
- The organizer can download all QR codes.
- QR tokens must be random, non-predictable, and wedding-scoped.

---

## 6.5 Event Mode

### Requirements

Event Mode prepares the wedding for offline check-in.

When Event Mode is enabled:

- a guest snapshot is created,
- guest editing is locked,
- staff devices can download the offline guest pack,
- check-ins can happen without internet.

### Required UX

The organizer must clearly see that enabling Event Mode locks the guest list for operational consistency.

---

## 6.6 Offline Staff Check-In

### Requirements

Staff can:

- access Event Mode with scoped credentials,
- download the guest snapshot before the event,
- search guests locally,
- scan QR codes locally,
- check guests in while offline,
- see recent check-ins,
- see pending sync count,
- manually trigger sync when online.

### Multi-Device Requirement

V1 must support multiple staff devices checking guests in independently while offline.

The server resolves conflicts when devices sync later.

### Conflict Rule

If the same guest is checked in on multiple devices, the earliest valid check-in timestamp wins.

---

## 6.7 Check-In Synchronization

### Requirements

The client maintains a local sync queue.

When internet is available:

- unsynced check-ins are batched,
- sent to the server,
- validated against the wedding snapshot,
- marked as accepted or duplicate,
- updated locally based on the server response.

The sync endpoint must be:

- idempotent,
- retry-safe,
- conflict-safe.

---

## 6.8 Guest Media Upload

### Requirements

Guests can upload:

- photos,
- short videos.

Media upload must support:

- client-side validation,
- file size limits,
- upload progress,
- offline queueing where possible,
- retry after network failure,
- signed upload URLs to object storage.

### Constraints

Videos are supported in V1 but must be size-limited.

Server-side video transcoding is out of scope for V1.

---

## 6.9 Wedding Gallery

### Requirements

Guests can view approved wedding media.

Organizers can:

- view all uploaded media,
- hide media,
- delete media,
- download individual items.

Gallery must support:

- pagination,
- lazy loading,
- photo/video filters,
- video thumbnail/play indicators.

### Out of Scope for V1

- likes,
- comments,
- social media auto-posting,
- AI curation,
- facial recognition.

---

## 6.10 Dashboard Stats

### Requirements

Organizers can view basic stats:

- total guests,
- checked-in guests,
- pending guests,
- check-in percentage,
- total media uploads.

V1 can use manual refresh or simple polling.

Real-time WebSocket dashboard is out of scope.

---

## 7. Non-Functional Requirements

## 7.1 Offline Reliability

- Staff check-in must work without internet after snapshot download.
- Local check-ins must persist through page refreshes and device restarts.
- Pending check-ins must sync safely when internet returns.

---

## 7.2 Performance

The system should support:

- up to 1,000 guests per wedding,
- up to 5 concurrent check-in devices,
- at least 500 media uploads per wedding in beta conditions.

Performance expectations:

- offline guest search under 200ms,
- local check-in response instantly visible,
- paginated gallery loading,
- no full-gallery eager loading.

---

## 7.3 Security

The system must enforce:

- HTTPS only,
- secure authentication,
- scoped staff tokens,
- wedding-level authorization checks,
- non-predictable QR tokens,
- signed upload URLs,
- file type and size validation,
- API rate limiting on public endpoints.

---

## 7.4 Usability

The UI must be:

- mobile-first,
- responsive,
- simple for guests,
- operationally clear for staff,
- calm and structured for organizers.

Staff screens must use:

- large buttons,
- clear status indicators,
- offline/sync messages,
- manual search fallback.

---

## 7.5 Accessibility

V1 should aim for:

- readable contrast,
- large touch targets,
- keyboard-accessible forms,
- clear error messages,
- no reliance on color alone for critical statuses.

---

## 8. Technical Stack

V1 uses the TypeScript ecosystem.

### Frontend

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- Dexie / IndexedDB
- Zustand
- TanStack Query
- React Hook Form
- Zod

### Backend

- Next.js Route Handlers
- Prisma
- PostgreSQL
- JWT-based authentication

### Storage

- Cloudflare R2 or S3-compatible storage
- Signed upload URLs

### Deployment

- Vercel for web/API
- Supabase Postgres for database
- Cloudflare R2 for media storage

---

## 9. V1 Exclusions

The following are explicitly out of scope for V1:

- full wedding planning suite,
- invitation designer,
- RSVP automation,
- seating charts,
- vendor marketplace,
- payment processing,
- native mobile apps,
- AI photo curation,
- AI story generation,
- facial recognition,
- social media auto-posting,
- guest comments and likes,
- real-time WebSocket dashboard,
- complex role-based permissions,
- enterprise multi-tenant organizations.

---

## 10. Success Metrics for Free Beta

V1 beta is successful if:

- at least 3 real weddings use WedPass,
- no check-in data is lost,
- offline check-in works in real event conditions,
- at least 90% of attempted uploads succeed or retry successfully,
- at least 20 structured feedback responses are collected,
- organizers rate the experience at least 8/10 on average.

---

## 11. Product Risks

Key risks:

- offline sync failure,
- poor media upload experience under weak internet,
- QR scanner issues on low-end Android devices,
- low guest participation in media uploads,
- public upload abuse,
- storage cost growth,
- feature creep during solo development.

Mitigations are documented in `risk_register.md`.

---

## 12. V1 Product Principle

If a proposed feature does not support one of the following, it should not be included in V1:

1. guest list preparation,
2. offline check-in,
3. media upload,
4. gallery management,
5. beta validation.

WedPass V1 is not trying to solve every wedding problem.

It is trying to solve guest control and memory collection extremely well.
