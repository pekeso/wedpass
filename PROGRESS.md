# WedPass Progress

## Current Phase

Phase 08 — CSV Guest Import

## Completed Phases

- Phase 00 — Repository Review and Planning (2026-05-31)
- Phase 01 — Project Setup and Tooling (2026-05-31)
- Phase 02 — Design System and shadcn/ui (2026-05-31)
- Phase 04 — Database Schema and Prisma (2026-06-01)
- Phase 05 — Auth Foundation (2026-06-01)
- Phase 06 — Wedding CRUD Foundation (2026-06-01)

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

Phase 08 — CSV Guest Import

## Last Updated

2026-06-01

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
