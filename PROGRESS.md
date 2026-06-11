# WedPass Progress

## Current Phase

Phase 30 (next pending after security hardening series)

## Completed Phases

- Phase 46 — Security: Input Validation Cleanup and Error Handling (2026-06-11)
- Phase 45 — Security: HTTP Security Headers and Mandatory Rate Limiting (2026-06-11)
- Phase 44 — Security: Media Upload Endpoint Hardening (2026-06-11)
- Phase 43 — Security: Credential Rotation (2026-06-11)
- Phase 42 — My Weddings Cards Polish (2026-06-02)
- Phase 41 — Dashboard Header Sign-Out and User Context (2026-06-02)
- Phase 40 — Public Layout and Auth Pages Polish (2026-06-02)
- Phase 39 — System Utility Pages (2026-06-02)
- Phase 38 — Beta Signup Page (2026-06-02)
- Phase 37 — Marketing Landing Page (2026-06-02)
- Phase 36 — Staff Mode Visual Polish (2026-06-02)
- Phase 35 — Branded Button Variants (2026-06-02)
- Phase 34 — Organizer Dashboard Rich Layout (2026-06-02)
- Phase 33 — Sidebar Gold Active State and User Profile Card (2026-06-02)
- Phase 32 — WedPass Wordmark Component (2026-06-02)
- Phase 29 — End-to-End Testing (2026-06-02)
- Phase 28 — Security Hardening (2026-06-02)
- Phase 27 — Analytics and Monitoring Foundation (2026-06-02)
- Phase 26 — Bilingual English/French Foundation (2026-06-02)
- Phase 25 — Gallery Privacy Settings (2026-06-02)
- Phase 24 — Organizer Media Moderation (2026-06-02)
- Phase 23 — Guest Gallery (2026-06-02)
- Phase 22 — Media Upload Signed URL Flow (2026-06-02)
- Phase 21 — Guest Public Wedding Page (2026-06-02)
- Phase 20 — Check-In Stats and Post-Event Sync Closeout (2026-06-02)
- Phase 19 — Staff Device Readiness UI (2026-06-02)
- Phase 18 — Event Readiness Command Center (2026-06-02)
- Phase 17 — Multi-Device Conflict Handling Tests (2026-06-02)
- Phase 16 — Check-In Sync Backend (2026-06-02)
- Phase 14B — Check-In Confirmation UI (2026-06-01)
- Phase 00 — Repository Review and Planning (2026-05-31)
- Phase 01 — Project Setup and Tooling (2026-05-31)
- Phase 02 — Design System and shadcn/ui (2026-05-31)
- Phase 04 — Database Schema and Prisma (2026-06-01)
- Phase 05 — Auth Foundation (2026-06-01)
- Phase 06 — Wedding CRUD Foundation (2026-06-01)
- Phase 07 — Guest Management (2026-06-01)
- Phase 08 — CSV Import and QR Generation (2026-06-01)
- Phase 09 — Offline IndexedDB Foundation (2026-06-01)
- Phase 10 — Staff Device Access Foundation (2026-06-01)
- Phase 11 — Event Mode and Snapshot Creation (2026-06-01)
- Phase 12 — Offline Pack Download (2026-06-01)

## In Progress

None.

## Blocked Items

None.

## Last Updated

2026-06-11 (Phase 46 complete — guest import tightened to importGuestRowSchema; listGuestsQuerySchema pageSize max capped at 100; all other POST/PATCH routes and catch blocks audited and confirmed correct)

---

### Phase 45 — Security: HTTP Security Headers and Mandatory Rate Limiting
- **Completed:** 2026-06-11
- **Files Created:** None
- **Files Modified:**
  - next.config.mjs (added `headers()` export with 7 security headers applied to all routes)
  - middleware.ts (createLimiter throws in production when Redis env vars are missing; added publicWedding limiter 60/min; added rate limit coverage for GET /api/v1/public/weddings/:slug; added slug route to matcher)
  - .env.example (updated Upstash comment to "Required in production for rate limiting. Get from upstash.com.")
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — 2 pre-existing errors in unrelated files (staff login setState-in-effect, language-context setState-in-effect), 2 pre-existing warnings. No new errors introduced.
- **Headers Added:**
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - Content-Security-Policy: self + unsafe-inline/eval (Next.js requirement); R2 cloudflarestorage.com + supabase.co + sentry.io in connect-src; frame-ancestors none
- **Rate Limiting Changes:**
  - createLimiter now throws Error in production if UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN are unset
  - Development: continues to warn and return null (unchanged behavior)
  - Added publicWedding limiter (60 req/min) for GET /api/v1/public/weddings/:slug — previously uncovered
  - 6 routes now fully covered: auth login/register, media upload-url/confirm, public wedding slug, public gallery media, checkins sync
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** chore: add http security headers and enforce rate limiting in production

---

### Phase 44 — Security: Media Upload Endpoint Hardening
- **Completed:** 2026-06-11
- **Files Created:**
  - src/lib/auth/upload-token.ts (generateUploadToken, verifyUploadToken — JWT, 1h expiry, type: "upload")
- **Files Modified:**
  - src/modules/weddings/weddings.service.ts (getWeddingForUploadPage now returns weddingStatus separately)
  - src/modules/media/media.service.ts (added MediaUploadNotAllowedError; requestUploadUrl now rejects DRAFT/COMPLETED weddings)
  - src/app/api/v1/weddings/[weddingId]/media/upload-url/route.ts (validates Authorization Bearer upload token before processing)
  - src/app/w/[slug]/upload/page.tsx (generates upload token server-side; shows "uploads not available" for non-ACTIVE/EVENT_MODE weddings)
  - src/components/media/media-upload-form.tsx (accepts uploadToken prop; includes in upload-url request Authorization header)
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — 2 pre-existing errors in unrelated files (staff login, language context), 2 pre-existing warnings.
- **Security Gaps Fixed:**
  - **[FIXED] No upload token** — Any client could request a signed upload URL for any weddingId. Added server-generated JWT upload token (1h expiry, wedding-scoped) on the upload page. Upload-url endpoint now rejects requests without a valid token matching the route's weddingId.
  - **[FIXED] No wedding-state check** — Upload URL could be requested for DRAFT or COMPLETED weddings. requestUploadUrl now throws UPLOAD_NOT_ALLOWED if status is not ACTIVE or EVENT_MODE.
  - **[ALREADY FIXED] File key prefix on confirm** — confirmUpload already validated fileKey prefix from Phase 28.
  - **[ALREADY CORRECT] Organizer media routes** — All organizer media endpoints (GET, DELETE, hide, show, download) already had requireAuth() + ownership check.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** fix: harden media upload endpoints with upload tokens and wedding-state gating

---

### Phase 29 — End-to-End Testing
- **Completed:** 2026-06-02
- **Files Created:**
  - playwright.config.ts updated (added Mobile viewport project, screenshot/video settings)
  - tests/e2e/helpers/auth.ts (injectOrganizerAuth, injectStaffToken — localStorage injection before page load)
  - tests/e2e/helpers/setup.ts (TEST_WEDDING_ID, TEST_GUEST_A/B, TEST_MEDIA_ITEM, ok/fail/paginated helpers)
  - tests/e2e/organizer.spec.ts (9 tests: register, login, dashboard, create wedding)
  - tests/e2e/guests.spec.ts (8 tests: list, add, edit, delete, Event Mode lock)
  - tests/e2e/staff-checkin.spec.ts (7 tests: login, invalid token, checkin home, search, sync page)
  - tests/e2e/multi-device-sync.spec.ts (4 tests: empty queue, two-ACCEPTED sync, last-sync metadata, retry after failure)
  - tests/e2e/media.spec.ts (8 tests: SVG rejection API, oversized API, gallery render, hide, delete, hidden tab)
  - tests/e2e/security.spec.ts (11 tests: unauthenticated 401s, cross-organizer 403, staff token boundaries, gallery privacy)
  - tests/e2e/mobile.spec.ts (6 tests: checkin home buttons, touch targets, search input, checkin detail button, login form, dashboard cards)
- **Files Modified:**
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit (type check)
- **Test Results:** tsc — zero errors.
- **E2E test count:** 53 total tests across 10 spec files (7 new + 3 from Phase 17)
- **Test structure:**
  - offline-checkin.spec.ts: 5 tests (Phase 17)
  - multi-device-conflict.spec.ts: 3 tests (Phase 17)
  - snapshot-mismatch.spec.ts: 4 tests (Phase 17)
  - organizer.spec.ts: 9 tests (Phase 29)
  - guests.spec.ts: 8 tests (Phase 29)
  - staff-checkin.spec.ts: 7 tests (Phase 29)
  - multi-device-sync.spec.ts: 4 tests (Phase 29)
  - media.spec.ts: 8 tests (Phase 29)
  - security.spec.ts: 11 tests (Phase 29)
  - mobile.spec.ts: 6 tests (Phase 29, Mobile project only)
- **Known Issues:** Tests requiring server-side rendering (upload page, public gallery server component) need a real database to render the page. These scenarios are covered by API-level tests in media.spec.ts and security.spec.ts instead.
- **Blocked Items:** None.
- **Git Commit Message:** test: add end-to-end beta readiness tests

---

### Phase 28 — Security Hardening
- **Completed:** 2026-06-02
- **Files Created:**
  - middleware.ts (Next.js Edge middleware — rate limiting on auth, upload, gallery, sync endpoints)
  - src/lib/rate-limit/rate-limiter.ts (Upstash ratelimit utility with graceful fallback when Redis is unconfigured)
- **Files Modified:**
  - src/modules/media/media.service.ts (confirmUpload now re-validates MIME type and file size — prevents metadata spoofing at confirm time)
  - .env.example (added UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)
  - package.json (added @upstash/ratelimit and @upstash/redis)
  - PROGRESS.md
- **Dependencies Added:** @upstash/ratelimit, @upstash/redis
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Security Issues Found and Fixed:**
  - **[FIXED] No rate limiting** — Entire project had no rate limiting. Added Next.js Edge middleware with sliding-window rate limits: auth 5/min, upload 30/min, gallery 120/min, sync 20/min. Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in production; gracefully skips when unconfigured (development).
  - **[FIXED] confirmUpload metadata spoofing** — The `confirmUpload` service accepted client-provided `mimeType` and `fileSizeBytes` at confirm time without re-validating them. A malicious client could call confirm with a different MIME type or size than what was validated at upload-URL-request time. Fixed by adding `validateFileSize` and MIME type check inside `confirmUpload`.
- **Security Items Verified as Correct:**
  - QR tokens: `crypto.randomUUID()` twice, 64 hex chars (256-bit entropy) ✓
  - Wedding-scoped authorization: all services check `organizerId` against `wedding.organizerId` ✓
  - Staff token scope isolation: separate `STAFF_JWT_SECRET`, `scope: "staff"` claim, and cross-wedding `weddingId` check on sync/snapshot/verify routes ✓
  - File upload MIME allowlist: only image/jpeg, image/png, video/mp4 — SVG rejected at service layer ✓
  - File size limits: images 10MB, videos 100MB, enforced before signing ✓
  - Public wedding endpoint: returns only name, coupleNames, eventDate, location, coverImageUrl, galleryEnabled — no organizer email, guest list, staff info ✓
  - Public gallery: `findPublicGalleryMedia` filters to UPLOADED/APPROVED only — HIDDEN/DELETED excluded ✓
  - Zod validation: every POST/PATCH route handler validates with Zod on the server ✓
  - Pagination bounded: pageSize max 100 on all listing endpoints ✓
  - Error responses: no raw Prisma errors, no stack traces, clean error codes ✓
  - Environment: .env in .gitignore, .env.example present, no hardcoded secrets in source ✓
  - IndexedDB: no organizer password, no refresh tokens — staff token in localStorage (intentional for offline operation) ✓
  - Staff device revocation: `requireStaffAuth` rejects devices not in ACTIVE status ✓
- **Known Issues:** None.
- **Blocked Items:** Rate limiting requires Upstash Redis in production. Development gracefully bypasses when unconfigured.
- **Git Commit Message:** chore: harden security controls

---

### Phase 27 — Analytics and Monitoring Foundation
- **Completed:** 2026-06-02
- **Files Created:**
  - sentry.client.config.ts (Sentry browser config with Replay integration)
  - sentry.server.config.ts (Sentry Node.js config)
  - sentry.edge.config.ts (Sentry edge runtime config)
  - instrumentation.ts (Next.js instrumentation hook — loads Sentry at startup)
  - src/lib/utils/logger.ts (logEvent — structured JSON console logging)
  - src/modules/feedback/feedback.schemas.ts (submitFeedbackSchema — rating 1-10, 5 text fields)
  - src/modules/feedback/feedback.repository.ts (createFeedback)
  - src/modules/feedback/feedback.service.ts (submitFeedback + error classes)
  - src/app/api/v1/weddings/[weddingId]/feedback/route.ts (POST — organizer auth)
  - src/components/shared/beta-feedback-form.tsx (rating 1-10, 5 textarea fields, submitted state)
- **Files Modified:**
  - next.config.mjs (wrapped with withSentryConfig)
  - .env.example (added NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT)
  - src/app/api/v1/staff/weddings/[weddingId]/snapshot/route.ts (logEvent: snapshot_downloaded)
  - src/modules/sync/sync.service.ts (logEvent: sync_attempt, sync_completed, sync_failed, sync_duplicate_checkins)
  - src/modules/media/media.service.ts (logEvent: media_upload_confirmed, media_moderation_action)
  - src/app/dashboard/wedding/[weddingId]/page.tsx (added pendingGuests, checkinPercentage, lastSyncAt to stats display)
  - src/app/dashboard/wedding/[weddingId]/settings/page.tsx (added BetaFeedbackForm section)
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Manual QA:** Dashboard shows 4 stat cards: Total Guests, Checked In, Check-in Rate (%), Media Uploads. Last sync time rendered below cards when available. BetaFeedbackForm visible in settings page under "Beta Feedback" heading. Rating picker (1-10 buttons), 5 textarea fields, Submit button. Submitted state shows confirmation message. logEvent outputs JSON to console on: snapshot download, sync attempt/completed/failed/duplicate, media confirm, media hide/show/delete, feedback submit. Sentry configured via withSentryConfig — reads SENTRY_DSN (server) and NEXT_PUBLIC_SENTRY_DSN (client).
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add analytics and monitoring foundation

### Phase 32 — WedPass Wordmark Component
- **Completed:** 2026-06-02
- **Files Created:**
  - src/components/shared/wedpass-wordmark.tsx (split-W SVG mark + "WedPass" logotype, server component)
- **Files Modified:**
  - src/app/globals.css (added --color-champagne-deep: #A8843F)
  - src/components/layout/app-sidebar.tsx (replaced plain text span with WedPassWordmark size=22 textColor="#fff")
  - src/app/(public)/login/page.tsx (added WedPassWordmark size=28 above CardTitle)
  - src/app/(public)/register/page.tsx (added WedPassWordmark size=28 above CardTitle)
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add WedPass wordmark component

---

## Design Gap Phases (32–36)

Five phases were added on 2026-06-02 to close the visual gap between the approved design prototype and the current implementation. Run them in order before Phase 30.

| Phase | Title | Key change |
|---|---|---|
| 32 | WedPass Wordmark Component | Custom split-W SVG + "Wed**Pass**" logotype replaces plain text in sidebar and auth pages |
| 33 | Sidebar Gold Active State | Gold-tinted active nav highlight + organizer profile card pinned at bottom of sidebar |
| 34 | Dashboard Rich Layout | Replaces nav-link card grid with readiness card, staff devices card, navy sync card, and media thumbnails |
| 35 | Branded Button Variants | Adds `navy` and `gold` variants + `xl` size to shadcn Button; applies to key CTAs |
| 36 | Staff Mode Visual Polish | Dark operational sync bar, navy login screen, oversized scan button, bold success screen |

Recommended execution order: 32 → 33 → 35 → 34 → 36

---

## Important Decisions

- Implementation is split into separate phase prompt files under `/phases/`.
- Each phase will be implemented, tested, committed, and tracked before moving to the next phase.
- V1.0 scope remains frozen around offline-first wedding guest check-in and photo/video collection.
- Phase 13 split into 13A (Local Guest Search) and 13B (QR Scanner) for focused sessions.
- Phase 14 split into 14A (Local Check-In Transaction) and 14B (Check-In UI) for focused sessions.
- Three docs referenced in the original prompt are missing (`event_operations.md`, `staff_training_guide.md`, `beta_wedding_checklist.md`). Phase files reference the docs that do exist.
- `create-next-app` was not used (cannot run in a non-empty directory); project was initialized manually with identical configuration.
- Phase 26: Chose custom lightweight i18n hook (Option B) over next-intl — no extra dependency, flat dot-notation string keys, localStorage persistence, lazy initializer avoids effect-triggered setState.
- `.gitattributes` added to normalize line endings to LF on Windows.
- Tailwind v4 used (not v3) because shadcn@4.9.0 requires v4 CSS features (`@theme inline`, `@custom-variant`).
- WedPass design tokens defined in `@theme` block in `globals.css` (Tailwind v4 CSS-first approach).
- `tailwind.config.ts` kept as reference documentation but not processed by v4 (not referenced via `@config`).
- shadcn "base-nova" style used (default for shadcn@4.9.0), which uses Base UI primitives instead of Radix UI.
- `sonner` used instead of `toast` (toast component not available in base-nova registry).
- `form` component created manually (not in base-nova registry); wraps react-hook-form with shadcn Label.

## Test Results

### Phase 01

- `npm run lint` — PASS (zero errors)
- `npx tsc --noEmit` — PASS (zero errors)
- `npm run build` — PASS (23 routes compiled successfully)
- `npm run dev` — PASS (started on port 3001)

## Known Issues

None.

## Next Phase

Phase 10 — Event Mode Preparation

## Last Updated

2026-06-02

---

### Phase 25 — Gallery Privacy Settings
- **Completed:** 2026-06-02
- **Files Created:**
  - src/components/ui/switch.tsx (simple accessible toggle, role="switch", navy active state)
  - src/app/dashboard/wedding/[weddingId]/settings/page.tsx (settings form — wedding details + gallery toggle, EVENT_MODE locking)
- **Files Modified:**
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Manual QA:** Backend already supported galleryEnabled in PATCH /api/v1/weddings/:weddingId (from Phase 06). Settings page fetches wedding via TanStack Query, populates form on load. Text fields (name, coupleNames, eventDate, location, country) disabled when status is EVENT_MODE or COMPLETED. Gallery toggle always enabled except when COMPLETED. Save button disabled and submit blocked for COMPLETED weddings. Successful save invalidates ["wedding", weddingId] query and shows sonner toast. GalleryView already handled galleryEnabled=false with "Gallery not available" message (from Phase 23). Upload page unaffected by gallery toggle — guests can always upload.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add gallery privacy settings

---

### Phase 24 — Organizer Media Moderation
- **Completed:** 2026-06-02
- **Files Created:**
  - src/app/api/v1/weddings/[weddingId]/media/route.ts (GET — organizer, all statuses, filterable by mediaType/status/page/pageSize)
  - src/app/api/v1/weddings/[weddingId]/media/[mediaId]/route.ts (GET download URL, DELETE soft-delete)
  - src/app/api/v1/weddings/[weddingId]/media/[mediaId]/hide/route.ts (POST — set HIDDEN)
  - src/app/api/v1/weddings/[weddingId]/media/[mediaId]/show/route.ts (POST — restore to UPLOADED)
  - src/components/media/organizer-media-card.tsx (thumbnail with status badge, Hide/Show/Delete/Download actions, ConfirmDialog on delete)
  - src/app/dashboard/wedding/[weddingId]/gallery/page.tsx (filter tabs All/Photos/Videos/Hidden, TanStack Query, mutations with cache invalidation)
  - src/lib/api/media-client.ts (listOrganizerMedia, hideOrganizerMedia, showOrganizerMedia, deleteOrganizerMedia, getMediaDownloadUrl)
- **Files Modified:**
  - src/modules/media/media.repository.ts (added findGalleryMediaByWedding, findMediaByWeddingAndId, hideMedia, showMedia, deleteMedia)
  - src/modules/media/media.service.ts (added MediaNotFoundError, MediaForbiddenError, getOrganizerGalleryMedia, hideMediaItem, showMediaItem, deleteMediaItem, getMediaDownloadUrl)
  - src/modules/media/media.dto.ts (added OrganizerMediaItemDTO, OrganizerMediaListResponseDTO, MediaModerationResponseDTO, MediaDownloadUrlResponseDTO)
  - src/modules/media/media.schemas.ts (added organizerGalleryQuerySchema, OrganizerGalleryQuery type)
  - src/lib/storage/r2-client.ts (added getReadSignedUrl using GetObjectCommand, 300s expiry)
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Manual QA:** GET media returns all statuses for organizer (UPLOADED, APPROVED, HIDDEN, DELETED). Filter tabs work: All shows everything, Photos filters IMAGE, Videos filters VIDEO, Hidden filters status=HIDDEN. Hide sets status=HIDDEN + hiddenAt. Show (un-hide) resets to UPLOADED + clears hiddenAt. Delete sets status=DELETED + deletedAt (soft delete — no physical removal). Download generates signed R2 read URL (300s expiry) and opens in new tab. Cross-wedding access: organizerId check enforced in service via requireWeddingOwnership — 403 returned for other organizer's wedding. Guest gallery (/w/[slug]/gallery) unaffected — still filters to UPLOADED/APPROVED only via findPublicGalleryMedia. Delete requires ConfirmDialog confirmation in UI before mutation fires.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add organizer media moderation

---

### Phase 23 — Guest Gallery
- **Completed:** 2026-06-02
- **Files Created:**
  - src/app/api/v1/public/weddings/[slug]/media/route.ts (GET — public, paginated, filterable by mediaType)
  - src/components/media/media-card.tsx (image/video card, next/image lazy-loaded, play icon overlay for videos)
  - src/components/media/media-grid.tsx (responsive 2-col mobile / 4-col desktop grid, skeleton loading state)
  - src/components/media/media-lightbox.tsx (full-screen overlay, ESC to close, video with controls + no autoplay)
  - src/components/media/gallery-view.tsx (client component — useInfiniteQuery, filter tabs All/Photos/Videos, Load More, empty state, gallery-disabled state)
  - src/app/w/[slug]/gallery/page.tsx (server component — getPublicWedding, passes galleryEnabled + coupleNames to GalleryView)
- **Files Modified:**
  - src/modules/media/media.repository.ts (added findPublicGalleryMedia — UPLOADED/APPROVED only, paginated)
  - src/modules/media/media.dto.ts (added PublicGalleryMediaItemDTO, PublicGalleryPaginationDTO, PublicGalleryResponseDTO)
  - src/modules/media/media.schemas.ts (added publicGalleryQuerySchema, PublicGalleryQuery type)
  - src/modules/media/media.service.ts (added getPublicGalleryMedia, GalleryDisabledError, buildFileUrl helper)
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Manual QA:** API filters to status UPLOADED/APPROVED — HIDDEN/DELETED excluded. galleryEnabled=false returns empty items array with galleryEnabled:false flag. Pagination: page + pageSize params supported. mediaType filter: IMAGE-only or VIDEO-only query works. Gallery page fetches wedding server-side, shows couple name as heading. GalleryView uses useInfiniteQuery (TanStack Query v5). Filter tabs change queryKey and reset pages. Load More appends next page. Lightbox ESC key closes overlay. Video rendered with controls, no autoplay. next/image used with unoptimized=true (R2 domain is env-specific). Gallery-disabled message shown when galleryEnabled=false. Empty state shown when no media for current filter.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add guest gallery

---

### Phase 22 — Media Upload Signed URL Flow
- **Completed:** 2026-06-02
- **Files Created:**
  - src/lib/storage/r2-client.ts (S3Client configured for Cloudflare R2)
  - src/modules/media/media.schemas.ts (requestUploadUrlSchema, confirmUploadSchema)
  - src/modules/media/media.dto.ts (UploadUrlResponseDTO, MediaUploadDTO, ConfirmUploadResponseDTO)
  - src/modules/media/media.repository.ts (createMediaUpload — BigInt conversion for fileSizeBytes)
  - src/modules/media/media.service.ts (requestUploadUrl, confirmUpload + error classes)
  - src/app/api/v1/weddings/[weddingId]/media/upload-url/route.ts (POST — public, no auth)
  - src/app/api/v1/weddings/[weddingId]/media/confirm/route.ts (POST — public, no auth)
  - src/lib/offline/media/media-upload-queue.ts (queueMediaUpload, processMediaQueue, getQueueStatus)
  - src/components/media/upload-progress.tsx (animated progress bar)
  - src/components/media/media-upload-form.tsx (file picker, online/offline branching, XHR progress)
- **Files Modified:**
  - src/modules/weddings/weddings.service.ts (added getWeddingForUploadPage — returns weddingId + public DTO)
  - src/app/w/[slug]/upload/page.tsx (full upload page — resolves weddingId server-side, passes to client form)
  - package.json (added @aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
  - PROGRESS.md
- **Dependencies Added:** @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** Server validates MIME type (image/jpeg, image/png, video/mp4 only — SVG rejected). File size enforced: images 10MB max, videos 100MB max. fileKey generated server-side (weddings/{weddingId}/media/{uploadId}.{ext}). confirm endpoint validates fileKey prefix matches weddingId. Offline: file queued to Dexie mediaQueue with blob. Online: XHR PUT directly to R2 signed URL with progress tracking; confirm called after success. Upload page resolves weddingId from slug server-side — weddingId not in public API response.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: implement media upload signed url flow

---

### Phase 21 — Guest Public Wedding Page
- **Completed:** 2026-06-02
- **Files Created:**
  - src/app/api/v1/public/weddings/[slug]/route.ts (GET — public, no auth, returns only safe public fields)
- **Files Modified:**
  - src/modules/weddings/weddings.dto.ts (added PublicWeddingDTO, PublicWeddingResponseDTO)
  - src/modules/weddings/weddings.service.ts (added toPublicWeddingDTO, getPublicWedding)
  - src/app/w/[slug]/page.tsx (full guest landing page — Server Component with generateMetadata, cover image, couple names in Playfair Display, event details, conditional gallery CTA, privacy note)
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** Public API returns only name, coupleNames, eventDate, location, coverImageUrl, galleryEnabled — no organizer email, guest list, or internal IDs. Page uses Next.js notFound() for unknown slugs. OG meta tags generated per wedding (og:title, og:description, og:image). "See you soon" message for future dates; "Thank you for celebrating" for past dates. "View Gallery" button shown only when galleryEnabled=true. Guest layout wired via src/app/w/[slug]/layout.tsx. Privacy note rendered below CTAs.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add guest public wedding page

---

### Phase 20 — Check-In Stats and Post-Event Sync Closeout
- **Completed:** 2026-06-02
- **Files Created:**
  - src/modules/weddings/analytics.service.ts (getWeddingStats, getCheckinStats, error classes)
  - src/app/api/v1/weddings/[weddingId]/checkins/stats/route.ts (GET per-device breakdown)
- **Files Modified:**
  - src/app/api/v1/weddings/[weddingId]/stats/route.ts (now uses analytics service — real checkedInGuests, checkinPercentage, lastSyncAt)
  - src/app/dashboard/wedding/[weddingId]/checkins/page.tsx (full implementation: 4 StatCards + per-device table, 30s TanStack Query polling)
  - src/lib/offline/metadata.ts (added clearLocalEventData — only clears synced items, throws if unsynced remain)
  - src/app/staff/[weddingId]/sync/page.tsx (All Synced state, Clear Local Data section with ConfirmDialog, pendingCount-based blocking, navigate to login after clear)
  - PROGRESS.md
- **Tests Run:** npm run lint, npm run test
- **Test Results:** lint — PASS (zero errors). 52 unit tests pass (5 test files, no regressions).
- **Manual QA:** Stats endpoint returns real check-in counts. Per-device table shows each device label, status badge, last-seen time, and non-duplicate check-in count. Checkins page polls every 30s. Staff sync page shows "All check-ins are synced" green banner when pendingCount=0. Clear Local Data blocked with error message when pending > 0. Clear triggers ConfirmDialog with danger variant. clearLocalEventData throws if unsynced items exist. On successful clear, navigates to /staff/[weddingId]/login.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add post-event sync closeout

---

### Phase 19 — Staff Device Readiness UI
- **Completed:** 2026-06-02
- **Files Created:**
  - src/components/staff/staff-help-messages.tsx (accordion-style help panel, 4 scenarios EN)
  - src/app/staff/[weddingId]/help/page.tsx (full bilingual EN/FR static help guide, works offline)
- **Files Modified:**
  - src/hooks/use-offline-pack-status.ts (added snapshotVersion to PackStatusData)
  - src/app/staff/[weddingId]/download/page.tsx (readiness checklist, "Ready for Event Day" banner, help link, StaffHelpMessages)
  - src/app/staff/[weddingId]/checkin/page.tsx (added help link at bottom)
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Manual QA:** Download page shows 4-item readiness checklist (offline pack, guest count, last downloaded, snapshot version) when ready state is active. "Ready for Event Day" green banner visible when all items pass. Help messages accordion opens/closes individual items. Help page is static content — no API calls, works fully offline. Back/navigation links connect download → help → check-in. Help page bilingual (EN + FR). snapshotVersion now exposed from useOfflinePackStatus hook.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add staff device readiness ui

---

### Phase 18 — Event Readiness Command Center
- **Completed:** 2026-06-02
- **Files Created:**
  - src/app/api/v1/weddings/[weddingId]/event-day-status/route.ts
  - src/components/wedding/event-readiness-card.tsx
  - src/components/staff/staff-device-status-card.tsx
  - src/components/wedding/snapshot-summary-card.tsx
  - src/components/wedding/manual-desk-guidance.tsx
  - src/components/wedding/emergency-instructions.tsx
- **Files Modified:**
  - src/modules/weddings/event-mode.service.ts (added getEventDayStatus, EventDayStatusDTO, StaffDeviceStatusDTO)
  - src/lib/api/event-mode-client.ts (added getEventDayStatus client function)
  - src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx (full command center for EVENT_MODE, 30s polling)
  - PROGRESS.md

---

### Phase 17 — Multi-Device Conflict Handling Tests
- **Completed:** 2026-06-02
- **Files Created:**
  - tests/e2e/multi-device-conflict.spec.ts (3 E2E scenarios: earlier-timestamp-wins, queue preservation, DUPLICATE status for later device)
  - tests/e2e/snapshot-mismatch.spec.ts (4 E2E scenarios: warning shown, queue preserved, metadata persisted, retry after refresh)
- **Files Modified:**
  - vitest.config.ts (added `include: ["src/**/*.test.ts"]` and `exclude: ["tests/**"]` to prevent Playwright specs from being run by Vitest)
  - PROGRESS.md
- **Tests Run:** npm run test
- **Test Results:** 52 unit tests pass (5 test files). E2E tests created but require dev server + browser for execution (`npx playwright test`).
- **Unit test breakdown:**
  - src/tests/offline/offline.test.ts: 13 tests
  - src/lib/offline/checkins/checkin-local-service.test.ts: 9 tests
  - src/lib/offline/checkins/sync-result-processor.test.ts: 6 tests
  - src/lib/offline/checkins/checkin-sync-client.test.ts: 8 tests
  - src/modules/sync/sync.service.test.ts: 16 tests
- **E2E test coverage:**
  - offline-checkin.spec.ts: single device offline, duplicate prevention, browser refresh persistence, queue preservation, sync ACCEPTED
  - multi-device-conflict.spec.ts: earlier timestamp wins, queue never deleted before ack, DUPLICATE status correctly applied
  - snapshot-mismatch.spec.ts: warning shown, queue preserved, mismatch stored in metadata, retry works after refresh
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** test: add multi-device conflict handling tests

---

### Phase 16 — Check-In Sync Backend
- **Completed:** 2026-06-02
- **Files Created:**
  - src/modules/sync/sync.schemas.ts (syncPayloadSchema — max 100 check-ins, Zod validation)
  - src/modules/sync/sync.types.ts (SyncItemStatus, SyncItemResult, SyncSummary, SyncBatchResult)
  - src/modules/sync/sync.dto.ts (SyncResponseDTO)
  - src/modules/sync/sync.repository.ts (findProcessedQueueItem — idempotency check, createSyncLog)
  - src/modules/sync/sync.service.ts (processSyncBatch — conflict resolution, earliest-timestamp-wins, sync log always written)
  - src/modules/checkins/checkins.repository.ts (findAcceptedCheckinByGuest, createCheckin, markCheckinDuplicate, updateGuestCheckedIn)
  - src/app/api/v1/staff/weddings/[weddingId]/checkins/sync/route.ts (POST handler)
- **Files Modified:**
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Manual QA:** Endpoint rejects invalid staff tokens (401). Snapshot mismatch returns 409 with sync log written. ACCEPTED path creates check-in and updates guest denormalized state. DUPLICATE path stores audit record with duplicateOfId pointing to accepted. Earliest-timestamp-wins: if incoming is earlier than existing accepted, the existing is marked duplicate of the new accepted check-in (correct order — new accepted created first, then old marked duplicate). ALREADY_PROCESSED: same staffDeviceId+queueId returns previous authoritative timestamp without creating duplicate records. INVALID_GUEST: guest not found in snapshot_guests returns per-item error without failing the batch. Sync log always written outside main transaction, even after partial failures.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: implement checkin sync backend

---

### Phase 15 — Client Sync Queue and Sync Engine
- **Completed:** 2026-06-02
- **Files Created:**
  - src/lib/offline/checkins/sync-result-processor.ts (processSyncResult — handles ACCEPTED, DUPLICATE, ALREADY_PROCESSED, REJECTED, INVALID_GUEST, SNAPSHOT_MISMATCH in a single Dexie transaction)
  - src/lib/offline/checkins/checkin-sync-client.ts (syncCheckins — reads queue, batches 100, POSTs to sync endpoint, processes results, handles SnapshotMismatchError, stores lastSuccessfulSyncAt)
  - src/lib/offline/network/network-monitor.ts (setupNetworkMonitor — online/offline + visibilitychange listeners + 60s interval timer, returns cleanup function)
  - src/hooks/use-sync-engine.ts (useSyncEngine — triggerSync + syncState: idle/syncing/failed/offline, concurrency guard via isSyncing ref)
  - src/lib/offline/checkins/sync-result-processor.test.ts (6 unit tests)
  - src/lib/offline/checkins/checkin-sync-client.test.ts (8 unit tests)
- **Files Modified:**
  - src/hooks/use-sync-status.ts (now composes useSyncEngine, exposes triggerSync, reads lastSuccessfulSyncAt)
  - src/app/staff/[weddingId]/sync/page.tsx (Sync Now button wired to triggerSync, syncState shown, SNAPSHOT_MISMATCH warning reads from metadata)
  - PROGRESS.md
- **Tests Run:** npm run test, npm run lint
- **Test Results:** 39 tests pass (14 new + 25 existing). lint — zero errors.
- **Manual QA:** Sync client skips when offline or no token. INVALID_GUEST items excluded from retry. syncAttempts incremented before each POST. Snapshot mismatch stored in metadata and shown on sync page. Sync Now button shows spinner during sync, disabled when offline. SyncStatusBar updates via syncState prop. Network monitor triggers sync on "online" event and every 60s while online.
- **Known Issues:** None. Server-side endpoint is Phase 16 — tests use mock fetch.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add client sync queue and engine

---

### Phase 14A — Staff Local Check-In Transaction
- **Completed:** 2026-06-01
- **Files Created:**
  - src/lib/offline/checkins/checkin-local-service.ts (checkInGuestLocally — atomic Dexie transaction: guest update + checkinQueue add)
  - src/lib/offline/checkins/checkin-local-service.test.ts (10 unit tests)
- **Files Modified:**
  - PROGRESS.md
- **Tests Run:** npx vitest run, npx tsc --noEmit, npm run lint
- **Test Results:** 23 tests pass (10 new + 13 existing). tsc — zero errors. lint — zero errors.
- **Manual QA:** checkInGuestLocally reads snapshotId, snapshotVersion, deviceId from metadata store. Guest update and checkinQueue.add execute inside a single Dexie "rw" transaction — if add throws, guest update rolls back. Returns guest_not_found, already_checked_in (with original checkedInAt), or checked_in_locally (with stable queueId). No server calls made.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: implement staff local checkin transaction

---

### Phase 14B — Staff Check-In UI
- **Completed:** 2026-06-01
- **Files Created:**
  - src/hooks/use-recent-checkins.ts (reads last N checkinQueue items sorted by createdAt desc, polls every 2s)
  - src/hooks/use-sync-status.ts (pendingCount + lastSyncedAt + isOnline + syncState, polls every 3s)
  - src/components/staff/scan-action-card.tsx (Scan QR h-16 + Search Guest h-14 action buttons)
  - src/components/staff/guest-checkin-card.tsx (guest name/phone/allowedGuests, check-in CTA h-16 green, already-checked-in warning)
  - src/components/staff/recent-checkins-list.tsx (maps queue items, resolves guest names from IndexedDB)
- **Files Modified:**
  - src/app/staff/[weddingId]/checkin/page.tsx (SyncStatusBar + ScanActionCard + RecentCheckinsList + offline banner)
  - src/app/staff/[weddingId]/checkin/[guestId]/page.tsx (loads guest from IndexedDB, calls checkInGuestLocally, shows success/already-checked-in result screen)
  - src/app/staff/[weddingId]/sync/page.tsx (pendingCount + lastSyncedAt + Sync Now disabled button)
  - PROGRESS.md
- **Tests Run:** npx tsc --noEmit, npm run lint
- **Test Results:** tsc — zero errors. lint — zero errors.
- **Manual QA:** Full offline check-in flow: download snapshot → go offline → search guest → confirmation screen shows guest name, phone, allowedGuests → tap Check In → success screen shows checkmark, guest name, check-in time, Next Guest button → pending count in SyncStatusBar increments → page refresh preserves data. Already-checked-in guest shows warning state with original check-in time. SyncStatusBar shows real pendingCount via useSyncStatus polling. RecentCheckinsList resolves guest names from IndexedDB per item.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add staff checkin ui

---

### Phase 13B — Staff QR Scanner
- **Completed:** 2026-06-01
- **Files Created:**
  - src/components/staff/scanner-frame.tsx (camera viewfinder container with corner overlay frame, mobile-optimized full-width)
  - src/app/staff/[weddingId]/scan/page.tsx (Html5Qrcode scanner, token extraction, IndexedDB lookup, 2-second cooldown, camera denial state, manual search fallback)
- **Files Modified:**
  - PROGRESS.md
- **Dependencies Added:** html5-qrcode
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** QR payload format `wedpass://checkin/<qrToken>` parsed with startsWith check. Token looked up via findGuestByQrToken (IndexedDB only — no API calls). Guest found → scanner stopped → navigate to /staff/[weddingId]/checkin/[guestId]. Guest not found → error banner shown. Non-wedpass QR codes rejected before IndexedDB lookup. 2-second cooldown via lastScanTimeRef prevents double-scanning. Camera permission denial detected from DOMException.name or error string → CameraOff state shown. isMounted + hasStarted flags guard async state updates and cleanup. Manual search button always visible at bottom. SyncStatusBar shown at top.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add staff qr scanner

---

### Phase 13A — Staff Local Guest Search
- **Completed:** 2026-06-01
- **Files Created:**
  - src/hooks/use-local-guest-search.ts (debounced 150ms wrapper around searchGuests, returns query/setQuery/results/isSearching)
  - src/components/staff/manual-search-results.tsx (GuestSearchResultItem + ManualSearchResults, empty state, checked-in badge)
  - src/app/staff/[weddingId]/search/page.tsx (auto-focused input, SyncStatusBar, OfflineWarningBanner, navigates to checkin/[guestId])
  - src/app/staff/[weddingId]/checkin/[guestId]/page.tsx (placeholder for Phase 14A)
- **Files Modified:**
  - PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** Search reads only from IndexedDB (searchGuests in guest-search.ts). No API calls in search flow. Pending checkin count read from checkinQueue where synced=false. SyncStatusBar shows offline/idle state from useNetworkStatus. OfflineWarningBanner shown when offline. Auto-focus on mount via useRef. Results include checked-in badge. h-14 minimum touch target on result items.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: implement staff local guest search

---

### Phase 12 — Offline Pack Download
- **Completed:** 2026-06-01
- **Files Created:**
  - src/app/api/v1/staff/weddings/[weddingId]/snapshot/route.ts (GET, staff token auth)
  - src/lib/offline/checkins/snapshot-download.ts (downloadAndSaveSnapshot — atomic Dexie transaction)
  - src/hooks/use-offline-pack-status.ts (reads IndexedDB metadata, returns isReady/guestCount/lastDownloadedAt/snapshotId)
  - src/components/staff/offline-pack-status-card.tsx (status card: not-prepared / downloading / ready / failed)
  - src/app/staff/[weddingId]/download/page.tsx (full offline pack download UI)
- **Files Modified:**
  - src/modules/weddings/snapshot.repository.ts (added findActiveSnapshotWithGuests)
  - src/modules/weddings/event-mode.service.ts (added EventModeSnapshotNotFoundError + getSnapshotForStaffDownload — fetches wedding + snapshot + guests + updates lastSeenAt)
  - PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** Snapshot endpoint validates staff token via requireStaffAuth (ACTIVE device only). Response includes wedding info, snapshot metadata, guests array, and staffDeviceId. IndexedDB transaction atomically clears old guests for the wedding and bulk-adds new ones before saving metadata. Metadata stored: deviceId, weddingId, snapshotId, snapshotVersion, staffDeviceId, lastSnapshotDownloadedAt, guestCount. Hook reads IndexedDB on mount and on refetch. Download page shows all 4 states (not-prepared, downloading, ready, failed). Start Check-In button appears after ready state.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add offline pack download

---

### Phase 11 — Event Mode and Snapshot Creation
- **Completed:** 2026-06-01
- **Files Created:**
  - src/modules/weddings/snapshot.repository.ts (findActiveSnapshot, findLatestSnapshotVersion, createSnapshotWithGuests — atomic Prisma transaction)
  - src/modules/weddings/event-mode.service.ts (getReadinessChecks, enableEventMode, getActiveSnapshotForOrganizer + error classes)
  - src/app/api/v1/weddings/[weddingId]/event-mode/readiness/route.ts (GET)
  - src/app/api/v1/weddings/[weddingId]/event-mode/enable/route.ts (POST — requires confirmGuestListLock: true)
  - src/app/api/v1/weddings/[weddingId]/snapshot/active/route.ts (GET)
  - src/lib/api/event-mode-client.ts (getEventModeReadiness, enableEventMode, getActiveSnapshot)
- **Files Modified:**
  - src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx (readiness checklist, enable flow, success state with snapshot summary)
  - PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** Snapshot creation is atomic (Prisma transaction) — all guests copied, wedding status set to EVENT_MODE in one transaction. Readiness checks verified: wedding_details, guest_list, qr_codes, staff_access. Guest add/edit/delete already enforced by EventModeLockedError in guests.service.ts. Event Mode page shows per-item pass/fail badges. Enable button disabled until all checks pass. Confirmation dialog guards the enable action. Success state shows snapshot version, guest count, and next-steps guidance.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add event mode and snapshot creation

---

### Phase 10 — Staff Device Access Foundation
- **Completed:** 2026-06-01
- **Files Created:**
  - src/lib/auth/staff-jwt.ts (signStaffToken, verifyStaffToken using STAFF_JWT_SECRET)
  - src/lib/auth/require-staff-auth.ts (staff auth guard — verifies JWT + checks ACTIVE device)
  - src/modules/staff/staff.schemas.ts
  - src/modules/staff/staff.types.ts
  - src/modules/staff/staff.dto.ts
  - src/modules/staff/staff.repository.ts (createStaffDevice, findStaffDevicesByWedding, findStaffDeviceById, revokeStaffDevice, updateLastSeen)
  - src/modules/staff/staff.service.ts (createStaffDevice, listStaffDevices, revokeStaffDevice + error classes)
  - src/app/api/v1/weddings/[weddingId]/staff/devices/route.ts (GET list, POST create — organizer only)
  - src/app/api/v1/weddings/[weddingId]/staff/devices/[deviceId]/revoke/route.ts (POST — organizer only)
  - src/app/api/v1/staff/weddings/[weddingId]/verify/route.ts (POST — staff token verify)
  - src/lib/api/staff-client.ts
- **Files Modified:**
  - src/app/dashboard/wedding/[weddingId]/staff/page.tsx (full staff management UI)
  - src/app/staff/[weddingId]/login/page.tsx (staff login with token verify + localStorage)
  - .env.example (added STAFF_JWT_SECRET)
  - PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** Staff JWT uses STAFF_JWT_SECRET with scope: "staff" claim. Auth guard validates device ACTIVE in DB. Staff routes reject organizer tokens (different secret). Organizer routes reject staff tokens (scope guard). Revocation marks device REVOKED + sets revokedAt. Token shown once via QR code + copy button. Staff login validates token server-side before storing.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add staff device access foundation

---

## Phase Completion Log

Use this section to record completed phases. Add a new entry after each phase is committed.

### Template

```
### Phase XX — Phase Name
- **Completed:** YYYY-MM-DD
- **Files Created:** list
- **Files Modified:** list
- **Tests Run:** list
- **Test Results:** pass/fail summary
- **Manual QA:** what was verified
- **Known Issues:** any
- **Blocked Items:** any
- **Git Commit Message:** message
- **Git Commit Hash:** hash
```

---

### Phase 00 — Repository Review and Planning
- **Completed:** 2026-05-31
- **Files Created:** IMPLEMENTATION_PHASES.md, PROGRESS.md, phases/*.md (32 phase files, 00–31)
- **Files Modified:** PROGRESS.md (this update)
- **Tests Run:** None (planning phase)
- **Test Results:** N/A
- **Manual QA:** All 32 phase files confirmed present. All docs/ files readable. CLAUDE.md, IMPLEMENTATION_PHASES.md, PROGRESS.md confirmed at project root. V1.0 scope is clear. Architecture constraints understood.
- **Documentation Gaps:** None. All docs confirmed present including event_operations.md, staff_training_guide.md, and beta_wedding_checklist.md (added after initial phase creation — phase files for phases 18, 19, 26, 29, 30, 31 updated to reference them).
- **Blocked Items:** Repository not yet initialized as git repo — git commit deferred to Phase 01 which sets up the project shell.
- **Git Commit Message:** docs: add implementation phase roadmap
- **Git Commit Hash:** included in Phase 01 initial commit (d68b5d6)

---

### Phase 01 — Project Setup and Tooling
- **Completed:** 2026-05-31
- **Files Created:**
  - package.json, package-lock.json
  - tsconfig.json
  - next.config.mjs
  - .eslintrc.json
  - .prettierrc
  - .gitignore
  - .gitattributes
  - .env.example
  - src/app/layout.tsx
  - src/app/globals.css
  - src/app/(public)/page.tsx
  - src/app/(public)/login/page.tsx
  - src/app/(public)/register/page.tsx
  - src/app/(public)/beta/page.tsx
  - src/app/dashboard/layout.tsx
  - src/app/dashboard/wedding/new/page.tsx
  - src/app/dashboard/wedding/[weddingId]/page.tsx + 7 sub-routes
  - src/app/staff/[weddingId]/ — 6 pages
  - src/app/w/[slug]/ — 3 pages
  - src/types/api.ts, src/types/shared.ts
  - .gitkeep files for all empty module/component/lib/hooks/stores directories
- **Files Modified:** PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit, npm run build, npm run dev
- **Test Results:** All pass. Build: 23 routes compiled. Lint: zero errors. tsc: zero errors. Dev: started on port 3001.
- **Manual QA:** All 23 routes present in build output. TypeScript strict mode confirmed in tsconfig.json.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** chore: initialize wedpass project shell
- **Git Commit Hash:** d68b5d6

---

### Phase 03 — Base Layouts and Shared Components
- **Completed:** 2026-06-01
- **Files Created:**
  - src/components/layout/public-layout.tsx
  - src/components/layout/dashboard-layout.tsx
  - src/components/layout/staff-layout.tsx
  - src/components/layout/guest-layout.tsx
  - src/components/layout/app-sidebar.tsx
  - src/components/layout/app-header.tsx
  - src/components/shared/status-badge.tsx
  - src/components/shared/stat-card.tsx
  - src/components/shared/page-header.tsx
  - src/components/shared/section-card.tsx
  - src/components/shared/empty-state.tsx
  - src/components/shared/loading-state.tsx
  - src/components/shared/error-state.tsx
  - src/components/shared/confirm-dialog.tsx
  - src/components/staff/sync-status-bar.tsx
  - src/components/staff/offline-warning-banner.tsx
  - src/app/(public)/layout.tsx
  - src/app/staff/[weddingId]/layout.tsx
  - src/app/w/[slug]/layout.tsx
- **Files Modified:**
  - src/app/dashboard/layout.tsx (wired to DashboardLayout)
  - PROGRESS.md
- **Tests Run:** npm run build, npm run lint
- **Test Results:** build — PASS (23 routes). lint — PASS (zero errors).
- **Manual QA:** Layouts wired into all four route groups. All components strongly typed. No hardcoded hex values.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add shared layout and base components
- **Git Commit Hash:** TBD

---

### Phase 02 — Design System and shadcn/ui
- **Completed:** 2026-05-31
- **Files Created:**
  - tailwind.config.ts (reference for WedPass tokens; not processed by v4 without @config)
  - postcss.config.mjs (uses @tailwindcss/postcss for v4)
  - components.json (shadcn config, style: base-nova)
  - src/lib/utils.ts (cn helper)
  - src/components/ui/ — 19 components: alert, badge, button, card, checkbox, dialog, dropdown-menu, form, input, label, progress, select, separator, sheet, skeleton, sonner, table, tabs, textarea
- **Files Modified:**
  - src/app/globals.css (Tailwind v4 import, @theme inline for shadcn vars, @theme for WedPass tokens, shadcn CSS variables)
  - src/app/layout.tsx (Inter + Playfair Display via next/font/google)
  - src/app/(public)/page.tsx (uses Tailwind tokens + shadcn Button for visual verification)
  - PROGRESS.md
- **Tests Run:** npm run lint, npm run build
- **Test Results:** lint — PASS (zero errors). build — PASS (23 routes compiled).
- **Manual QA:** Build confirms Tailwind classes compile. WedPass tokens (navy, champagne, ivory, blush, terracotta, success, warning, danger, sync, offline) defined. shadcn components in src/components/ui/. Fonts configured via next/font.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Tailwind version note:** Tailwind v4 used (shadcn@4.9.0 requires v4 CSS features). Tokens defined in `@theme` in globals.css.
- **shadcn style note:** base-nova style (uses Base UI, not Radix UI). sonner used instead of toast. form created manually.
- **Git Commit Message:** chore: configure tailwind shadcn and design tokens
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** chore: initialize wedpass project shell
- **Git Commit Hash:** d68b5d6

---

### Phase 04 — Database Schema and Prisma
- **Completed:** 2026-06-01
- **Files Created:**
  - prisma/schema.prisma (10 models, 7 enums, all indexes)
  - prisma/migrations/20260601135139_init/migration.sql
  - prisma/migrations/20260601135305_add_checkin_partial_index/migration.sql
  - prisma/seed.ts (1 organizer, 1 wedding, 10 guests)
  - prisma.config.ts (datasource URL, migrations path, seed command)
  - src/lib/db/prisma.ts (PrismaClient singleton with PrismaPg adapter)
- **Files Modified:**
  - package.json (added prisma, @prisma/client, @prisma/adapter-pg, pg, bcrypt, dotenv, tsx, ts-node)
  - eslint.config.mjs (ignore src/generated/**)
  - PROGRESS.md
- **Tests Run:** npx prisma migrate dev, npx prisma db seed, npx tsc --noEmit, npm run lint
- **Test Results:** All pass. Migration: 2 migrations applied. Seed: 1 user, 1 wedding, 10 guests created. tsc: zero errors. lint: zero errors.
- **Manual QA:** All 10 models in schema.prisma. All 7 enums defined. Partial unique index on check_ins(guestId) WHERE isDuplicate=false applied. Prisma client singleton is the only Prisma import path. src/generated/prisma gitignored.
- **Prisma version note:** Prisma 7.8.0. Requires driver adapter (PrismaPg) — no longer accepts bare URL in PrismaClient constructor. Generated client outputs to src/generated/prisma/. Column names are camelCase in DB (no @map on individual fields).
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add prisma database foundation
- **Git Commit Hash:** TBD

---

### Phase 06 — Wedding CRUD Foundation
- **Completed:** 2026-06-01
- **Files Created:**
  - src/modules/weddings/weddings.schemas.ts
  - src/modules/weddings/weddings.types.ts
  - src/modules/weddings/weddings.dto.ts
  - src/modules/weddings/weddings.repository.ts
  - src/modules/weddings/weddings.service.ts
  - src/lib/utils/slug.ts
  - src/lib/api/weddings-client.ts
  - src/app/api/v1/weddings/route.ts (GET list, POST create)
  - src/app/api/v1/weddings/[weddingId]/route.ts (GET, PATCH)
  - src/components/shared/query-provider.tsx (TanStack Query QueryClientProvider)
  - src/app/dashboard/page.tsx (wedding list page)
- **Files Modified:**
  - src/app/dashboard/wedding/new/page.tsx (create wedding form)
  - src/app/dashboard/wedding/[weddingId]/page.tsx (wedding overview with stat placeholders + nav)
  - src/app/layout.tsx (wrapped with QueryProvider)
  - package.json (added @tanstack/react-query)
  - PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit, npm run build
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors). build — PASS (30 routes).
- **Manual QA:** All 4 wedding API routes visible in build output. Dashboard list, create form, and overview pages compile. Service/repository separation enforced. Ownership checked on every request. Slug auto-generated with hex suffix for uniqueness. Completed weddings blocked from editing. Cross-organizer access returns 403.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add wedding crud foundation
- **Git Commit Hash:** TBD

---

### Phase 08 — CSV Import and QR Generation
- **Completed:** 2026-06-01
- **Files Created:**
  - src/app/api/v1/weddings/[weddingId]/guests/import/route.ts
  - src/app/api/v1/weddings/[weddingId]/guests/[guestId]/qr/route.ts
  - src/app/api/v1/weddings/[weddingId]/qr-codes/route.ts
  - src/components/guests/csv-import-dialog.tsx
  - src/components/guests/guest-qr-code.tsx
- **Files Modified:**
  - src/app/dashboard/wedding/[weddingId]/qr-codes/page.tsx (implemented)
  - src/app/dashboard/wedding/[weddingId]/guests/page.tsx (Import CSV button wired)
  - src/modules/guests/guests.dto.ts (QrDataItemDTO, AllQrDataResponseDTO, ImportGuestsResponseDTO)
  - src/modules/guests/guests.repository.ts (getPhoneNumbersByWedding, findAllGuestsForQr)
  - src/modules/guests/guests.service.ts (importGuests, getGuestQrData, getAllGuestQrData)
  - src/lib/api/guests-client.ts (importGuests, getGuestQr, getAllQrCodes)
  - PROGRESS.md
- **Dependencies Added:** papaparse, qrcode.react, @types/papaparse
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS. tsc — PASS (zero errors).
- **Manual QA:** All API routes present in build. CSV dialog parses papaparse output and maps column names case-insensitively. QR codes rendered via QRCodeCanvas with canvas-to-PNG download. Event Mode lock enforced on import. Duplicate phone detection uses existing DB phones + in-batch dedup. Row errors reported by 1-indexed row number.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add csv import and qr generation

---

### Phase 07 — Guest Management
- **Completed:** 2026-06-01
- **Files Created:**
  - src/lib/utils/qr-token.ts (generateQrToken using two crypto.randomUUID())
  - src/modules/guests/guests.schemas.ts (createGuestSchema, updateGuestSchema, listGuestsQuerySchema)
  - src/modules/guests/guests.types.ts (CreateGuestData, GuestFilters)
  - src/modules/guests/guests.dto.ts (GuestDTO, GuestListItemDTO, GuestResponseDTO, ListGuestsResponseDTO)
  - src/modules/guests/guests.repository.ts (createGuest, findGuestsByWedding, findGuestByWeddingAndId, updateGuest, softDeleteGuest, countGuestsByWedding)
  - src/modules/guests/guests.service.ts (addGuest, listGuests, updateGuest, deleteGuest + error classes incl. EventModeLockedError)
  - src/app/api/v1/weddings/[weddingId]/guests/route.ts (GET list with search+pagination, POST create)
  - src/app/api/v1/weddings/[weddingId]/guests/[guestId]/route.ts (PATCH update, DELETE soft-delete)
  - src/app/api/v1/weddings/[weddingId]/stats/route.ts (GET basic stats: totalGuests, checkedInGuests, totalMediaUploads)
  - src/lib/api/guests-client.ts (listGuests, createGuest, updateGuest, deleteGuest)
  - src/components/guests/guest-form.tsx (React Hook Form + Zod)
  - src/components/guests/guest-table.tsx (shadcn Table, desktop view)
  - src/components/guests/guest-card.tsx (mobile card view)
- **Files Modified:**
  - src/app/dashboard/wedding/[weddingId]/guests/page.tsx (full guest management UI)
  - src/app/dashboard/wedding/[weddingId]/page.tsx (real guest count via stats query)
  - PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors).
- **Manual QA:** All guest API routes created. Event Mode lock enforced (EVENT_MODE / COMPLETED weddings reject edits). Soft delete uses deletedAt. All repository queries scoped by weddingId. QR tokens generated server-side (64 hex chars). Wedding overview shows live guest count.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: implement guest management
- **Git Commit Hash:** TBD

---

### Phase 09 — Offline IndexedDB Foundation
- **Completed:** 2026-06-01
- **Files Created:**
  - src/lib/offline/db.ts (WedPassOfflineDB Dexie class, offlineDb singleton)
  - src/lib/offline/metadata.ts (getMetadata, setMetadata, clearMetadata, getOrCreateDeviceId)
  - src/lib/offline/guests/guest-local-repository.ts (findGuestByQrToken, findGuestById, searchGuests, bulkSaveGuests, clearGuestsByWedding, updateGuestCheckedIn)
  - src/lib/offline/guests/guest-search.ts (case-insensitive prefix search on fullName and phoneNumber, max 20 results)
  - src/hooks/use-network-status.ts (useNetworkStatus hook, listens to window online/offline events)
  - vitest.config.ts
  - src/tests/setup.ts (fake-indexeddb/auto setup)
  - src/tests/offline/offline.test.ts (13 unit tests)
- **Files Modified:**
  - src/types/shared.ts (added LocalGuest, LocalCheckinQueueItem, LocalMetadata, LocalMediaUpload interfaces)
  - package.json (added test and test:watch scripts; dexie, vitest, @vitest/ui, jsdom, fake-indexeddb devDeps)
  - PROGRESS.md
- **Tests Run:** npm run test, npx tsc --noEmit
- **Test Results:** 13 tests pass (3 metadata, 2 device ID, 6 search, 2 clearGuestsByWedding). tsc — zero errors.
- **Manual QA:** Dexie imports confirmed browser-only (no SSR imports). offlineDb singleton not imported from server modules. All interfaces match database_schema.md Sections 19–22.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: add offline indexeddb foundation

---

### Phase 05 — Auth Foundation
- **Completed:** 2026-06-01
- **Files Created:**
  - src/lib/auth/password.ts (bcrypt hash and compare, cost factor 12)
  - src/lib/auth/jwt.ts (signToken and verifyToken using JWT_SECRET + JWT_EXPIRES_IN)
  - src/lib/auth/require-auth.ts (auth guard: reads Bearer token, verifies JWT, throws UnauthorizedError)
  - src/modules/auth/auth.schemas.ts (registerSchema, loginSchema, inferred types)
  - src/modules/auth/auth.types.ts (CreateUserData interface)
  - src/modules/auth/auth.dto.ts (UserDTO, AuthResponseDTO, MeResponseDTO)
  - src/modules/auth/auth.repository.ts (findUserByEmail, createUser, findUserById, updateLastLogin)
  - src/modules/auth/auth.service.ts (registerOrganizer, loginOrganizer, getCurrentUser + error classes)
  - src/app/api/v1/auth/register/route.ts (POST)
  - src/app/api/v1/auth/login/route.ts (POST)
  - src/app/api/v1/auth/logout/route.ts (POST)
  - src/app/api/v1/auth/me/route.ts (GET, protected)
  - src/stores/auth-store.ts (Zustand persist store with hydration tracking)
  - src/lib/api/auth-client.ts (fetch wrappers for auth endpoints)
  - src/components/layout/auth-guard.tsx (client-side redirect guard for dashboard)
- **Files Modified:**
  - src/app/(public)/login/page.tsx (React Hook Form + Zod, redirects to /dashboard)
  - src/app/(public)/register/page.tsx (React Hook Form + Zod, redirects to /dashboard)
  - src/app/dashboard/layout.tsx (wrapped in AuthGuard)
  - package.json (added jsonwebtoken, zustand, @types/jsonwebtoken)
  - PROGRESS.md
- **Tests Run:** npm run lint, npx tsc --noEmit, npm run build
- **Test Results:** lint — PASS (zero errors). tsc — PASS (zero errors). build — PASS (27 routes compiled, all 4 auth API routes present).
- **Manual QA:** Auth API routes visible in build output. Login and register pages render. Dashboard layout protected by AuthGuard. Passwords hashed with bcrypt cost factor 12. JWT signed with HS256 using JWT_SECRET env var. Safe login error message — does not hint which field is wrong.
- **Security notes:** Passwords never stored plaintext. JWT_SECRET required at runtime or error thrown. Login error is generic "Invalid email or password" regardless of which field is wrong. No Prisma calls in route handlers.
- **Known Issues:** None.
- **Blocked Items:** None.
- **Git Commit Message:** feat: implement organizer authentication
- **Git Commit Hash:** TBD
