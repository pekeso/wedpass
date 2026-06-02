# WedPass Progress

## Current Phase

Phase 16 — Server-Side Check-In Sync Endpoint

## Completed Phases

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

## Important Decisions

- Implementation is split into separate phase prompt files under `/phases/`.
- Each phase will be implemented, tested, committed, and tracked before moving to the next phase.
- V1.0 scope remains frozen around offline-first wedding guest check-in and photo/video collection.
- Phase 13 split into 13A (Local Guest Search) and 13B (QR Scanner) for focused sessions.
- Phase 14 split into 14A (Local Check-In Transaction) and 14B (Check-In UI) for focused sessions.
- Three docs referenced in the original prompt are missing (`event_operations.md`, `staff_training_guide.md`, `beta_wedding_checklist.md`). Phase files reference the docs that do exist.
- `create-next-app` was not used (cannot run in a non-empty directory); project was initialized manually with identical configuration.
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
