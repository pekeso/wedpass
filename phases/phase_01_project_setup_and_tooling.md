# Phase 01 — Project Setup and Tooling

## Goal

Initialize the Next.js App Router project with TypeScript, ESLint, Prettier, and the full WedPass folder structure. The app should run locally with placeholder routes but no feature logic.

## Why This Phase Matters

A correct project scaffold prevents rework in later phases. Getting the folder structure, TypeScript config, and route group organization right now means every future phase has a stable, consistent foundation to build on.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/architecture.md`
- `docs/routes.md`
- `docs/implementation_plan.md` (Stage 1)
- `docs/env_and_deployment.md`

## Dependencies

- Phase 00 complete

## Scope

- Initialize Next.js 14+ project with App Router
- Enable TypeScript strict mode
- Configure ESLint
- Configure Prettier
- Set up the complete folder structure per `CLAUDE.md`
- Create route groups: `(public)`, `dashboard`, `staff`, `w`, `api`
- Create placeholder `page.tsx` files for all core routes
- Create `.env.example` with all required environment variable names
- Add initial `README.md` if not present

## Explicitly Out of Scope

- No TailwindCSS yet (Phase 02)
- No shadcn/ui yet (Phase 02)
- No Prisma yet (Phase 04)
- No feature logic
- No API routes
- No auth

## Implementation Tasks

1. Run `npx create-next-app@latest` with App Router, TypeScript, ESLint options selected.
2. Enable strict TypeScript in `tsconfig.json`.
3. Configure Prettier with a `.prettierrc`.
4. Create the full `src/` folder structure from `CLAUDE.md`:
   ```
   src/app/(public)/page.tsx
   src/app/(public)/login/page.tsx
   src/app/(public)/register/page.tsx
   src/app/(public)/beta/page.tsx
   src/app/dashboard/layout.tsx
   src/app/dashboard/wedding/new/page.tsx
   src/app/dashboard/wedding/[weddingId]/page.tsx
   src/app/dashboard/wedding/[weddingId]/guests/page.tsx
   src/app/dashboard/wedding/[weddingId]/qr-codes/page.tsx
   src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx
   src/app/dashboard/wedding/[weddingId]/staff/page.tsx
   src/app/dashboard/wedding/[weddingId]/checkins/page.tsx
   src/app/dashboard/wedding/[weddingId]/gallery/page.tsx
   src/app/dashboard/wedding/[weddingId]/settings/page.tsx
   src/app/staff/[weddingId]/login/page.tsx
   src/app/staff/[weddingId]/download/page.tsx
   src/app/staff/[weddingId]/checkin/page.tsx
   src/app/staff/[weddingId]/scan/page.tsx
   src/app/staff/[weddingId]/search/page.tsx
   src/app/staff/[weddingId]/sync/page.tsx
   src/app/w/[slug]/page.tsx
   src/app/w/[slug]/upload/page.tsx
   src/app/w/[slug]/gallery/page.tsx
   src/components/ui/
   src/components/layout/
   src/components/shared/
   src/components/wedding/
   src/components/guests/
   src/components/staff/
   src/components/media/
   src/modules/auth/
   src/modules/weddings/
   src/modules/guests/
   src/modules/checkins/
   src/modules/media/
   src/modules/staff/
   src/modules/sync/
   src/lib/api/
   src/lib/auth/
   src/lib/db/
   src/lib/offline/
   src/lib/storage/
   src/lib/validations/
   src/lib/utils/
   src/hooks/
   src/stores/
   src/types/api.ts
   src/types/shared.ts
   ```
5. Add placeholder content in each page file (e.g., `<p>TODO: [Page Name]</p>`).
6. Create `.env.example` with placeholder values for all required env vars:
   ```
   DATABASE_URL=
   JWT_SECRET=
   JWT_EXPIRES_IN=7d
   CLOUDFLARE_R2_ACCOUNT_ID=
   CLOUDFLARE_R2_ACCESS_KEY_ID=
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=
   CLOUDFLARE_R2_BUCKET_NAME=
   CLOUDFLARE_R2_PUBLIC_URL=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SENTRY_DSN=
   ```
7. Ensure `npm run dev` starts without errors.
8. Ensure `npm run build` completes without errors.
9. Ensure `npm run lint` passes.

## Files and Folders Likely to Be Created or Modified

- `package.json`
- `tsconfig.json`
- `.prettierrc`
- `.eslintrc` or `eslint.config.mjs`
- `.env.example`
- `src/app/**` (all placeholder pages and layouts)
- `src/components/**` (empty folders)
- `src/modules/**` (empty folders)
- `src/lib/**` (empty folders)
- `src/hooks/`
- `src/stores/`
- `src/types/api.ts`
- `src/types/shared.ts`

## Testing Requirements

- `npm run dev` — must start without errors
- `npm run build` — must complete
- `npm run lint` — must pass (zero errors)
- `npx tsc --noEmit` — must pass

## Manual QA Checklist

- [ ] `http://localhost:3000` loads the public landing page placeholder
- [ ] `http://localhost:3000/login` loads
- [ ] `http://localhost:3000/dashboard/wedding/new` loads
- [ ] `http://localhost:3000/staff/test/login` loads
- [ ] `http://localhost:3000/w/test` loads
- [ ] TypeScript strict mode is active (`strict: true` in tsconfig)
- [ ] No unused imports or obvious lint errors

## Acceptance Criteria

- [ ] Next.js App Router project is initialized
- [ ] TypeScript strict mode is enabled
- [ ] Folder structure matches `CLAUDE.md`
- [ ] All core routes exist as placeholder pages
- [ ] `.env.example` is complete
- [ ] `npm run dev` starts cleanly
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Git Commit Recommendation

```
chore: initialize wedpass project shell
```

## PROGRESS.md Update Instructions

After completing this phase, update `PROGRESS.md`:
- Move Phase 01 to Completed Phases
- Set Current Phase to Phase 02
- Record files created
- Record test results: dev starts, lint passes, build passes
- Record any issues or decisions made
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 01: Project Setup and Tooling.

Before starting, read:
- CLAUDE.md
- docs/architecture.md
- docs/routes.md

Your task is to initialize the WedPass project shell. Do NOT implement features.

1. Initialize a Next.js 14+ App Router project with TypeScript and ESLint if not already done.
2. Enable TypeScript strict mode in tsconfig.json.
3. Add a .prettierrc configuration file.
4. Create the complete src/ folder structure described in CLAUDE.md.
5. Create placeholder page.tsx files for all core routes listed in docs/routes.md.
6. Create .env.example with all environment variable names (no real values).
7. Verify npm run dev starts without errors.
8. Verify npm run build passes.
9. Verify npm run lint passes.

Do NOT:
- Install TailwindCSS yet (that is Phase 02)
- Install shadcn/ui yet (that is Phase 02)
- Install Prisma yet (that is Phase 04)
- Add any feature logic
- Create API routes

After completing, update PROGRESS.md:
- Phase 01 completed
- Files created
- Test results
- Current Phase → Phase 02

Then run:
git status

Commit with:
git commit -m "chore: initialize wedpass project shell"

Report: files created, confirmation that dev/build/lint pass.
```
