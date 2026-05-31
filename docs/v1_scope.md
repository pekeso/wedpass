# WedPass V1.0 Frozen Scope

## 1. Document Purpose

This document defines the frozen scope for **WedPass V1.0**.

WedPass V1.0 is intentionally focused on a narrow, high-value problem:

> Offline-first wedding guest check-in and wedding photo/video collection for Central, East, and West Africa.

This document protects the project from scope creep during implementation with Claude Code.

Any feature not explicitly listed as **in scope** must be treated as **out of scope** for V1.0.

---

## 2. Product Name

**WedPass**

---

## 3. Product Positioning

WedPass is a smart wedding guest and media management platform.

It helps wedding organizers:

- Manage wedding guest lists
- Generate QR codes for guest check-in
- Check guests in using multiple devices
- Continue check-in even without reliable internet
- Collect guest photos and short videos in one place
- View and moderate uploaded wedding memories

WedPass V1.0 is **not** a full wedding planning platform.

---

## 4. Target Market

WedPass V1.0 is designed for weddings in:

- Central Africa
- East Africa
- West Africa

The product must support realities common in these markets:

- Unreliable or intermittent internet
- Mobile-first usage
- Large guest lists
- Multiple staff members handling check-in
- Guests using different Android/iOS devices
- Heavy WhatsApp/social media culture
- Need for simple, low-friction guest participation

---

## 5. Target Users

### 5.1 Organizer

The organizer may be:

- The couple
- A trusted family member
- A wedding planner
- An event coordinator

The organizer is responsible for:

- Creating the wedding
- Managing the guest list
- Preparing event mode
- Generating staff access
- Viewing check-in stats
- Managing uploaded media

---

### 5.2 Event Staff

Event staff are temporary users responsible for check-in.

They can:

- Access staff event mode
- Download the offline guest snapshot
- Scan QR codes
- Search guests manually
- Check guests in offline
- Sync check-ins when internet returns

They cannot:

- Edit wedding details
- Edit guest lists
- View account settings
- Delete the wedding
- Manage billing
- Access unrelated weddings

---

### 5.3 Guest

Guests can:

- Open the wedding media link
- Upload photos
- Upload short videos
- View approved gallery media, if the gallery is enabled

Guests do **not** need accounts in V1.0.

---

## 6. V1.0 Product Goals

V1.0 must prove that WedPass can reliably support a real wedding.

The main goals are:

1. Reliable offline guest check-in
2. Multi-device check-in support
3. Safe synchronization after network recovery
4. Simple guest media upload
5. Organizer media moderation
6. Low-friction mobile experience
7. Free beta validation with real weddings

---

## 7. V1.0 In Scope

## 7.1 Authentication

In scope:

- Organizer registration
- Organizer login
- Email and password authentication
- JWT-based session handling
- Logout
- Basic protected routes

Out of scope:

- Social login
- Magic links
- SMS login
- WhatsApp login
- Multi-factor authentication
- Enterprise SSO

---

## 7.2 Wedding Management

In scope:

- Create a wedding
- Edit wedding basic details before Event Mode
- View wedding dashboard
- Wedding name
- Couple names
- Wedding date
- Wedding location
- Country
- Optional cover image
- Wedding status:
  - Draft
  - Active
  - Event Mode
  - Completed

Out of scope:

- Vendor management
- Seating plans
- Budget management
- Wedding timeline planner
- Task management
- Supplier marketplace
- Payment collection
- Multiple event types beyond weddings

---

## 7.3 Guest Management

In scope:

- Add guest manually
- Edit guest before Event Mode
- Delete guest before Event Mode
- Import guests from CSV
- Validate CSV imports
- Detect possible duplicate guests
- Search guests by name or phone
- Generate unique QR token per guest
- Display guest check-in status

Guest fields in V1.0:

- Full name
- Phone number
- Email address
- Number of allowed guests
- QR token
- Check-in status
- Check-in timestamp

Out of scope:

- RSVP management
- Meal preferences
- Table assignments
- Family grouping
- Guest messaging
- Invitation delivery automation
- Guest account creation

---

## 7.4 QR Code Management

In scope:

- Generate unique QR code per guest
- Display QR code per guest
- Download individual QR code
- Download all QR codes as a package, if feasible for V1
- QR code scanning in staff mode
- Manual search fallback when QR scanning fails

Out of scope:

- Designed invitation cards
- Printable luxury invitation templates
- NFC check-in
- Facial recognition check-in
- Biometric check-in

---

## 7.5 Event Mode

Event Mode is a core V1.0 feature.

In scope:

- Enable Event Mode
- Create guest snapshot
- Lock guest list after Event Mode is enabled
- Display Event Mode readiness checklist
- Show warning before enabling Event Mode
- Allow staff devices to download offline guest snapshot
- Store guest snapshot in IndexedDB
- Support offline guest lookup
- Support offline check-in
- Support sync after reconnecting

Out of scope:

- Editing guests during Event Mode
- Real-time collaboration between devices
- WebSocket-based live sync
- P2P device communication
- Complex event staff role hierarchy

---

## 7.6 Offline Check-In

In scope:

- Offline QR scanning
- Offline manual guest search
- Offline local check-in
- Local IndexedDB persistence
- Append-only sync queue
- Device ID generation
- Pending sync counter
- Sync status indicator
- Manual sync trigger
- Automatic sync retry when online
- Multi-device conflict handling
- Server-authoritative reconciliation

Conflict rule:

> The earliest valid check-in timestamp wins.

Out of scope:

- Real-time check-in dashboard via WebSockets
- Cross-device offline communication
- Advanced distributed conflict algorithms
- Check-out workflows

---

## 7.7 Staff Access

In scope:

- Generate staff access for a wedding
- Staff access limited to check-in functionality
- Staff device registration
- Device labels
- Device last seen timestamp
- Staff token revocation

Out of scope:

- Fine-grained RBAC
- Staff invitation emails
- Staff payroll or attendance
- Staff permission matrix

---

## 7.8 Media Uploads

In scope:

- Guest photo upload
- Guest short video upload
- File size validation
- File type validation
- Client-side image compression
- Upload progress
- Upload retry
- Offline upload queue where feasible
- Signed upload URLs
- Direct upload to Cloudflare R2
- Upload confirmation endpoint
- Store media metadata
- Gallery view

Supported V1 media types:

- JPEG
- PNG
- MP4 video

Out of scope:

- Server-side video transcoding
- AI video generation
- Highlight reel generation
- Facial recognition
- Automatic photo grouping
- Advanced photo editing
- Unlimited video upload

---

## 7.9 Gallery

In scope:

- Guest-facing gallery page
- Organizer gallery management page
- Display approved media
- Lazy loading
- Pagination
- Photo/video filtering
- Video play icon indicator
- Media preview
- Hide media
- Delete media
- Download individual media

Out of scope:

- Comments
- Likes/reactions
- Public social feed
- Social media auto-posting
- AI curation
- Automatic album generation
- Full ZIP download generation, unless simple enough for V1

---

## 7.10 Dashboard and Basic Analytics

In scope:

- Total guests
- Checked-in guests
- Pending check-ins
- Check-in percentage
- Total media uploads
- Latest sync time
- Staff device sync summary

Out of scope:

- Advanced analytics
- Predictive attendance
- Guest engagement scoring
- Exportable BI reports
- Realtime streaming dashboards

---

## 7.11 Beta Feedback

In scope:

- Simple beta feedback form
- Collect user rating
- Collect comments
- Collect issue reports

Out of scope:

- Full support ticketing system
- Live chat
- Automated customer success workflows

---

## 8. V1.0 Explicitly Out of Scope

The following features must not be built in V1.0:

- Full wedding planning suite
- RSVP automation
- Invitation builder
- Designed digital invitation templates
- Seating chart
- Vendor marketplace
- Budget planner
- Task planner
- Payment processing
- Ticketing
- Social media auto-posting
- Public event discovery
- Guest comments
- Guest likes/reactions
- Native iOS app
- Native Android app
- AI photo curation
- AI wedding assistant
- AI storytelling
- AI video generation
- Real-time WebSocket dashboard
- Multi-tenant enterprise organization management
- White-label planner portal
- Multi-language UI beyond basic preparation

If any of these are needed, they must be planned for V1.1 or later.

---

## 9. Technical Scope

V1.0 technical stack is frozen as:

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

- Cloudflare R2 for photos/videos
- Signed upload URLs

Infrastructure:

- Vercel for app hosting
- Supabase PostgreSQL for managed database
- Cloudflare R2 for media storage

Monitoring:

- Sentry for errors
- Basic product analytics later if needed

---

## 10. Performance Requirements

V1.0 should support:

- Up to 1,000 guests per wedding
- Up to 5 concurrent staff check-in devices
- Offline operation for an entire event
- Local guest search under 200ms on common devices
- Sync batches of at least 100 check-ins
- At least 500 media uploads per wedding
- Gallery pagination and lazy loading

---

## 11. Security Requirements

V1.0 must include:

- HTTPS only
- JWT authentication
- Scoped staff tokens
- Wedding-scoped authorization
- UUID-based identifiers
- Non-predictable QR tokens
- API validation with Zod
- Rate limiting on public endpoints
- Signed media upload URLs
- File type validation
- File size validation
- No raw HTML rendering from user input
- No Prisma access directly from UI components
- Secrets managed through environment variables

---

## 12. UX Requirements

V1.0 UI must be:

- Mobile-first
- Highly responsive
- Clear under pressure
- Simple for non-technical users
- Warm and elegant for guests
- Calm and professional for organizers
- Bold and operational for staff mode

Staff mode must always show:

- Online/offline status
- Pending sync count
- Last sync state
- Manual search fallback

---

## 13. Beta Scope

V1.0 will launch as a free beta.

Beta target:

- 3 to 5 real weddings initially
- Different guest list sizes
- At least one low-connectivity test environment
- Structured feedback collection after each event

V1.0 beta is considered successful if:

- No check-in data is lost
- Offline mode works during a real event
- At least 90% of attempted uploads succeed or queue safely
- Organizers understand how to prepare Event Mode
- Staff can check in guests without technical support
- At least 20 pieces of structured feedback are collected

---

## 14. Definition of Done for V1.0

WedPass V1.0 is done when:

- Organizer can create a wedding
- Organizer can add/import guests
- Organizer can generate QR codes
- Organizer can enable Event Mode
- Staff can download offline guest snapshot
- Staff can check in guests offline
- Check-ins sync correctly after reconnecting
- Duplicate check-ins resolve deterministically
- Guests can upload photos and short videos
- Organizer can view and moderate media
- Basic dashboard stats are available
- App is deployed to production
- App has been tested on mobile devices
- App is ready for free beta weddings

---

## 15. Scope Change Rule

Any feature not explicitly listed as V1.0 in scope must follow this process:

1. Add it to `backlog.md`
2. Assess product impact
3. Assess technical impact
4. Decide whether it belongs in V1.1 or later
5. Do not build it during V1.0 unless the frozen scope is formally updated

---

## 16. Guiding Principle

WedPass V1.0 should be:

> Narrow, reliable, offline-first, and useful at real weddings.

The goal is not to build every wedding feature.

The goal is to prove that WedPass can reliably manage wedding guest entry and collect wedding memories under real African event conditions.
