# Phase 30 — Deployment Preparation

## Goal

Deploy WedPass to production: configure Vercel, Supabase PostgreSQL, and Cloudflare R2. Run production migrations, verify the production environment, and confirm the full end-to-end flow works in production before inviting beta users.

## Why This Phase Matters

A successful deployment is the final technical gate before real weddings. Environment variable misconfigurations, migration failures, or R2 permission errors discovered for the first time at a real event would be catastrophic. This phase verifies everything in production before beta starts.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/env_and_deployment.md` (full document)
- `docs/security.md` (infrastructure security section)
- `docs/beta_plan.md`
- `docs/beta_wedding_checklist.md` (use this as the pre-launch verification checklist)

## Dependencies

- Phase 29 complete (all tests passing)

## Scope

### Infrastructure Setup

- Vercel project configured (or existing project connected)
- Supabase PostgreSQL database created
- Cloudflare R2 bucket created with correct CORS configuration
- All environment variables set in Vercel dashboard

### Deployment Steps

1. Production database migrated
2. Production build succeeds
3. Production deployment live
4. Full production smoke test
5. Sentry receiving errors in production

## Implementation Tasks

1. **Vercel Setup**
   - Create/connect Vercel project to GitHub repository
   - Configure production environment variables:
     ```
     DATABASE_URL=<supabase-production-url>
     JWT_SECRET=<production-random-secret>
     STAFF_JWT_SECRET=<different-production-secret>
     JWT_EXPIRES_IN=7d
     CLOUDFLARE_R2_ACCOUNT_ID=
     CLOUDFLARE_R2_ACCESS_KEY_ID=
     CLOUDFLARE_R2_SECRET_ACCESS_KEY=
     CLOUDFLARE_R2_BUCKET_NAME=
     CLOUDFLARE_R2_PUBLIC_URL=
     NEXT_PUBLIC_APP_URL=https://your-production-domain.com
     SENTRY_DSN=
     NODE_ENV=production
     ```
   - Ensure `NEXT_PUBLIC_APP_URL` is correct
   - Configure Vercel edge middleware for rate limiting if applicable

2. **Supabase PostgreSQL**
   - Create production database
   - Get production `DATABASE_URL`
   - Run migrations:
     ```bash
     npx prisma migrate deploy
     ```
   - Verify all tables created
   - Do NOT run seed script in production

3. **Cloudflare R2 Setup**
   - Create R2 bucket
   - Configure CORS:
     ```json
     [
       {
         "AllowedOrigins": ["https://your-production-domain.com"],
         "AllowedMethods": ["PUT"],
         "AllowedHeaders": ["Content-Type"],
         "MaxAgeSeconds": 3600
       }
     ]
     ```
   - Create R2 API token with write access
   - Note: bucket should NOT be public-read (use signed URLs only)

4. **Deployment Verification Checklist**

   After deployment, verify:
   - [ ] Production URL loads
   - [ ] Register a test organizer account
   - [ ] Create a test wedding
   - [ ] Add 3 guests
   - [ ] Enable Event Mode
   - [ ] Create a staff access token
   - [ ] On mobile: log in as staff, download offline pack
   - [ ] Go offline: check in a guest locally
   - [ ] Come online: sync — verify server check-in
   - [ ] Open guest upload page on mobile, upload a photo
   - [ ] Verify photo appears in organizer gallery
   - [ ] Hide the photo, verify guest gallery excludes it
   - [ ] Sentry shows environment as "production"

5. **DNS and HTTPS**
   - Custom domain configured (optional — Vercel provides a default)
   - Verify HTTPS is enforced

6. **Create `.env.production.example`** — document all required production variables.

## Files and Folders Likely to Be Created or Modified

- Vercel configuration (via dashboard)
- `vercel.json` (if custom rules needed)
- `.env.production.example`
- No application code changes unless bugs are found during deployment

## Testing Requirements

- Production build passes (`npm run build`)
- All production migrations succeed
- Full smoke test of production environment (use checklist above)
- Sentry receives a test event in production

## Manual QA Checklist (Production)

- [ ] Production URL loads correctly
- [ ] HTTPS active
- [ ] Register/login works
- [ ] Wedding creation works
- [ ] Staff download works (tests R2)
- [ ] Offline check-in works
- [ ] Check-in sync works
- [ ] Media upload works (tests R2 CORS + signed URL)
- [ ] Gallery shows media
- [ ] Sentry captures errors
- [ ] No production secrets visible in page source or API responses

## Acceptance Criteria

- [ ] Production deployment is live
- [ ] Database migrations ran successfully
- [ ] R2 upload works (verified by real upload)
- [ ] Full E2E smoke test passes in production
- [ ] Sentry is active
- [ ] No secrets committed to code

## Git Commit Recommendation

```
chore: prepare production deployment
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 30 to Completed Phases
- Set Current Phase to Phase 31
- Record: production URL, smoke test results
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 30: Deployment Preparation.

Before starting, read:
- CLAUDE.md
- docs/env_and_deployment.md (full document)
- docs/beta_plan.md
- docs/beta_wedding_checklist.md (use this as the verification checklist for the production smoke test)

Your task is to deploy WedPass to production and verify it works.

Step 1: Set up Supabase PostgreSQL
- Create a production database
- Run: npx prisma migrate deploy
- Verify all tables created

Step 2: Set up Cloudflare R2
- Create R2 bucket
- Configure CORS to allow PUT from production domain
- Create API token with write access
- Bucket must NOT be public-read

Step 3: Configure Vercel
- Connect GitHub repository
- Set all required environment variables:
  DATABASE_URL, JWT_SECRET, STAFF_JWT_SECRET, CLOUDFLARE_R2_*, NEXT_PUBLIC_APP_URL, SENTRY_DSN
- Deploy

Step 4: Create .env.production.example documenting all required production variables.

Step 5: Run the production smoke test checklist:
- Register organizer
- Create wedding
- Add guests
- Enable Event Mode
- Staff login + download offline pack (verifies R2)
- Offline check-in + sync
- Guest uploads photo (verifies R2 CORS + signed URL)
- Organizer views and moderates gallery
- Sentry receives an event

Fix any issues found during the smoke test.

After completing:
- Record production URL in PROGRESS.md
- Record smoke test results (pass/fail per item)

Update PROGRESS.md: Phase 30 completed, Current Phase → Phase 31.

Commit with:
git commit -m "chore: prepare production deployment"
```
