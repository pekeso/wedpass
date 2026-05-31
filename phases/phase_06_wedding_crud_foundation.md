# Phase 06 — Wedding CRUD Foundation

## Goal

Implement the organizer's wedding management: create, list, get, and update a wedding, plus the wedding dashboard shell and basic stats placeholder. Includes API routes, service/repository layers, and the dashboard UI.

## Why This Phase Matters

The wedding is the root entity in WedPass. Every other feature (guests, staff, media, check-in) is scoped to a wedding. Getting wedding CRUD right — including status transitions and ownership checks — is prerequisite for all domain features.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 2 — Wedding API)
- `docs/database_schema.md` (weddings table)
- `docs/routes.md`
- `docs/components.md`

## Dependencies

- Phase 05 complete (auth)

## Scope

### Backend

- Wedding module: `src/modules/weddings/`
  - `weddings.schemas.ts` — Zod schemas
  - `weddings.types.ts`
  - `weddings.repository.ts` — DB operations
  - `weddings.service.ts` — business logic (create, list, get, update, status checks)
  - `weddings.dto.ts`
- API route handlers:
  - `POST /api/v1/weddings`
  - `GET /api/v1/weddings`
  - `GET /api/v1/weddings/:weddingId`
  - `PATCH /api/v1/weddings/:weddingId`
- Slug generation utility
- Wedding ownership guard

### Frontend

- `src/app/dashboard/wedding/new/page.tsx` — Create wedding form
- `src/app/dashboard/wedding/[weddingId]/page.tsx` — Wedding dashboard overview
- `src/app/dashboard/` — main weddings list page

## Explicitly Out of Scope

- Guest management (Phase 07)
- Event Mode (Phase 11)
- Staff access (Phase 10)
- Media (Phase 22)
- Wedding deletion (not in V1.0 scope — use status changes)

## Implementation Tasks

1. Create `src/modules/weddings/weddings.schemas.ts`:
   ```ts
   export const createWeddingSchema = z.object({
     name: z.string().min(2),
     coupleNames: z.string().optional(),
     eventDate: z.string().optional(),
     location: z.string().optional(),
     country: z.string().optional(),
   });
   export const updateWeddingSchema = createWeddingSchema.partial().extend({
     galleryEnabled: z.boolean().optional(),
   });
   ```
2. Create `src/modules/weddings/weddings.repository.ts`:
   - `createWedding(organizerId, data)`
   - `findWeddingsByOrganizer(organizerId)`
   - `findWeddingById(weddingId)`
   - `findWeddingBySlug(slug)`
   - `updateWedding(weddingId, data)`
3. Create `src/modules/weddings/weddings.service.ts`:
   - `createWedding()` — generate slug, validate, create
   - `listWeddings()` — filter by organizer
   - `getWeddingForOrganizer()` — verify ownership
   - `updateWedding()` — verify ownership, enforce status rules
4. Create slug utility in `src/lib/utils/slug.ts`:
   - `generateSlug(name)` — kebab-case from name + random suffix
5. Create API route handlers:
   - `src/app/api/v1/weddings/route.ts` — GET (list), POST (create)
   - `src/app/api/v1/weddings/[weddingId]/route.ts` — GET, PATCH
6. Build `src/app/dashboard/` overview page (shows list of weddings).
7. Build `src/app/dashboard/wedding/new/page.tsx`:
   - Form: name, coupleNames, eventDate, location, country
   - React Hook Form + Zod
   - On success: redirect to `/dashboard/wedding/[weddingId]`
8. Build `src/app/dashboard/wedding/[weddingId]/page.tsx`:
   - Shows: wedding name, status badge, couple names, date, location
   - Shows placeholder stat cards (total guests: 0, checked in: 0, media: 0)
   - Links to guests, event-mode, staff, gallery, settings pages
9. Use TanStack Query for server state fetching in dashboard pages.

## API Response Shape

Must follow standard shape from `api_contracts.md`:
```json
{ "success": true, "data": { "wedding": { ... } } }
```

## Files and Folders Likely to Be Created or Modified

- `src/modules/weddings/`
- `src/lib/utils/slug.ts`
- `src/app/api/v1/weddings/route.ts`
- `src/app/api/v1/weddings/[weddingId]/route.ts`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/wedding/new/page.tsx`
- `src/app/dashboard/wedding/[weddingId]/page.tsx`

## Testing Requirements

- Create a wedding — verify in DB with correct organizerId and slug
- List weddings — verify only organizer's weddings returned
- Get a wedding — verify ownership check (organizer B cannot see organizer A's wedding)
- Update a wedding — verify ownership check
- Try to access another organizer's wedding — verify `FORBIDDEN`
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] `/dashboard/wedding/new` form works
- [ ] After creating wedding, redirected to wedding dashboard
- [ ] Wedding dashboard shows name, status badge, stat placeholders
- [ ] Dashboard home shows list of weddings
- [ ] Navigation links to guests, event-mode, gallery pages work
- [ ] Trying to access another organizer's wedding returns 403

## Acceptance Criteria

- [ ] Wedding CRUD API works
- [ ] Ownership verified on every request
- [ ] Slug is auto-generated and unique
- [ ] Wedding status transitions only in allowed direction
- [ ] Service/repository separation enforced
- [ ] Frontend form and dashboard work end-to-end

## Git Commit Recommendation

```
feat: add wedding crud foundation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 06 to Completed Phases
- Set Current Phase to Phase 07
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 06: Wedding CRUD Foundation.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 2 — Wedding API)
- docs/database_schema.md (weddings section)

Your task is to implement wedding creation, listing, viewing, and editing.

Backend:
1. Create src/modules/weddings/ with: weddings.schemas.ts, weddings.repository.ts, weddings.service.ts, weddings.dto.ts, weddings.types.ts
2. Create slug utility src/lib/utils/slug.ts — generates kebab-case slug from wedding name + random suffix.
3. Create API route handlers:
   - src/app/api/v1/weddings/route.ts (GET list, POST create) — requires organizer auth
   - src/app/api/v1/weddings/[weddingId]/route.ts (GET details, PATCH update) — requires organizer auth + ownership check

Rules:
- Route handlers must not call Prisma — go through service → repository
- Every wedding query must be scoped by organizerId
- Never query by weddingId alone without also checking organizerId
- Use standard API response: { success: true, data: {} } or { success: false, error: {} }

Frontend:
4. Build the dashboard home page src/app/dashboard/page.tsx — shows list of weddings.
5. Build src/app/dashboard/wedding/new/page.tsx — create wedding form (React Hook Form, Zod).
6. Build src/app/dashboard/wedding/[weddingId]/page.tsx — wedding overview with stat placeholders.
7. Use TanStack Query for data fetching.

After completing:
- Test: create wedding, list, get, update, cross-organizer access denied
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 06 completed, Current Phase → Phase 07.

Commit with:
git commit -m "feat: add wedding crud foundation"
```
