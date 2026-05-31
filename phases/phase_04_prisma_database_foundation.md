# Phase 04 — Prisma Database Foundation

## Goal

Set up Prisma ORM, create the full PostgreSQL schema with all V1.0 models, run the initial migration, and add a seed script. The database layer must be complete and correct before any API work begins.

## Why This Phase Matters

The database schema is the authoritative data model for everything in WedPass. Getting it right early prevents migration pain and data integrity bugs in later phases. The Prisma schema is the source of truth — all repositories depend on it.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/database_schema.md`
- `docs/architecture.md`
- `docs/env_and_deployment.md`

## Dependencies

- Phase 01 complete (project shell)

## Scope

- Install Prisma
- Configure PostgreSQL connection string
- Create full Prisma schema with all V1.0 models:
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
- Create all enums:
  - UserRole, WeddingStatus, MediaType, MediaStatus, CheckinSyncStatus, StaffDeviceStatus, UploadSource
- Add all indexes
- Create Prisma client singleton
- Run initial migration
- Create seed script with: one organizer, one wedding, 10 sample guests
- Set up partial index for accepted check-in uniqueness (raw SQL migration)

## Explicitly Out of Scope

- No API routes
- No service or repository files yet
- No auth logic
- No feature UI

## Implementation Tasks

1. Install Prisma:
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```
2. Set `DATABASE_URL` in `.env` (local dev database).
3. Create `prisma/schema.prisma` using the exact draft in `docs/database_schema.md` Section 29.
4. Add all enums, models, and `@@index` / `@@unique` directives.
5. Create `src/lib/db/prisma.ts` — the Prisma client singleton:
   ```ts
   import { PrismaClient } from "@prisma/client";

   const globalForPrisma = global as unknown as { prisma: PrismaClient };

   export const prisma =
     globalForPrisma.prisma ||
     new PrismaClient({
       log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
     });

   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
   ```
6. Run first migration:
   ```bash
   npx prisma migrate dev --name init
   ```
7. After migration, add a raw SQL migration for the partial unique index on `check_ins`:
   ```sql
   CREATE UNIQUE INDEX check_ins_guest_unique_accepted
   ON check_ins (guest_id)
   WHERE is_duplicate = false;
   ```
   Add this as a new migration file.
8. Create `prisma/seed.ts`:
   - One organizer user (hashed password: use `bcrypt.hashSync`)
   - One wedding in ACTIVE status
   - 10 guests with unique `qrToken` values (use `crypto.randomUUID()` or similar)
9. Configure seed in `package.json`:
   ```json
   "prisma": {
     "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
   }
   ```
10. Run seed:
    ```bash
    npx prisma db seed
    ```
11. Open Prisma Studio to visually verify data:
    ```bash
    npx prisma studio
    ```

## Files and Folders Likely to Be Created or Modified

- `prisma/schema.prisma`
- `prisma/migrations/`
- `prisma/seed.ts`
- `src/lib/db/prisma.ts`
- `package.json` (prisma seed config)
- `.env` (local DATABASE_URL)
- `.env.example` (update if needed)

## Testing Requirements

- `npx prisma migrate dev` runs successfully
- `npx prisma db seed` runs successfully
- `npx prisma studio` opens and shows data
- `npx tsc --noEmit` passes
- `npm run lint` passes

## Manual QA Checklist

- [ ] `prisma/schema.prisma` contains all 10 models
- [ ] All enums are defined
- [ ] Prisma Studio shows: 1 user, 1 wedding, 10 guests
- [ ] `src/lib/db/prisma.ts` is the only Prisma client
- [ ] No Prisma imports outside `src/lib/db/` and `src/modules/*/repository` files
- [ ] Partial index migration exists for `check_ins_guest_unique_accepted`
- [ ] `npx tsc --noEmit` passes

## Acceptance Criteria

- [ ] Full Prisma schema matches `docs/database_schema.md`
- [ ] All enums and models present
- [ ] Migration runs successfully
- [ ] Seed script works
- [ ] Prisma client singleton created
- [ ] TypeScript checks pass

## Git Commit Recommendation

```
feat: add prisma database foundation
```

## PROGRESS.md Update Instructions

After completing this phase, update `PROGRESS.md`:
- Move Phase 04 to Completed Phases
- Set Current Phase to Phase 05
- Record: schema models added, migration created, seed verified
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 04: Prisma Database Foundation.

Before starting, read:
- CLAUDE.md
- docs/database_schema.md (this is the primary reference — follow it exactly)
- docs/architecture.md

Your task is to set up Prisma and the full database schema.

1. Install prisma and @prisma/client.
2. Run npx prisma init.
3. Create prisma/schema.prisma using the schema draft in docs/database_schema.md (Section 29).
   Include all 10 models: User, Wedding, Guest, WeddingSnapshot, SnapshotGuest, StaffDevice, CheckIn, MediaUpload, SyncLog, BetaFeedback.
   Include all enums: UserRole, WeddingStatus, MediaType, MediaStatus, CheckinSyncStatus, StaffDeviceStatus, UploadSource.
   Include all @@index and @@unique directives.

4. Create src/lib/db/prisma.ts as a singleton PrismaClient.

5. Run the initial migration:
   npx prisma migrate dev --name init

6. Add a second migration for the partial unique index on check_ins:
   CREATE UNIQUE INDEX check_ins_guest_unique_accepted ON check_ins (guest_id) WHERE is_duplicate = false;

7. Create prisma/seed.ts with: 1 organizer user (bcrypt-hashed password), 1 wedding in ACTIVE status, 10 guests with unique qrTokens.

8. Configure "prisma.seed" in package.json and run: npx prisma db seed

9. Verify with: npx prisma studio

Rules:
- Prisma must only be imported through src/lib/db/prisma.ts
- Never import PrismaClient directly in route handlers, services, or components
- Do not build API routes in this phase
- Do not build any UI in this phase

After completing:
- Verify npx prisma migrate dev succeeds
- Verify npx prisma db seed succeeds
- Run npm run lint — must pass

Update PROGRESS.md: Phase 04 completed, Current Phase → Phase 05.

Commit with:
git commit -m "feat: add prisma database foundation"

Report: models created, migration status, seed data summary.
```
