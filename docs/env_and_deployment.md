# WedPass Environment and Deployment

## 1. Document Purpose

This document defines the environment setup and deployment plan for **WedPass V1.0**.

It covers:

- Local development setup
- Required environment variables
- Supabase PostgreSQL setup
- Cloudflare R2 setup
- Vercel deployment
- Database migrations
- Secrets management
- Production checklist
- Beta deployment checklist
- Rollback considerations

WedPass V1.0 uses a lean deployment architecture optimized for solo development and fast beta validation.

---

## 2. Deployment Architecture

WedPass V1.0 deployment stack:

```text
Vercel
  ├── Next.js web app
  └── Next.js API route handlers

Supabase
  └── Managed PostgreSQL database

Cloudflare R2
  └── Object storage for photos and videos

Sentry
  └── Error monitoring
```

No Kubernetes, Redis, Docker Swarm, or microservices are required for V1.0.

---

## 3. Environment Types

WedPass should support at least two environments:

```text
development
production
```

Optional later:

```text
staging
```

For V1.0 beta, development and production are enough if deployments are controlled carefully.

---

## 4. Local Development Requirements

Required tools:

```text
Node.js LTS
npm or pnpm
Git
PostgreSQL access
Prisma CLI
Cloudflare account
Supabase account
Vercel account
```

Recommended package manager:

```text
pnpm
```

If using npm, keep scripts consistent.

---

## 5. Recommended Local Setup Steps

1. Clone repository.
2. Install dependencies.
3. Copy `.env.example` to `.env.local`.
4. Configure database URL.
5. Configure JWT secrets.
6. Configure Cloudflare R2 credentials.
7. Run Prisma migration.
8. Seed local database.
9. Start dev server.

Example:

```bash
git clone <repo-url>
cd wedpass
pnpm install
cp .env.example .env.local
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

---

## 6. Required Environment Variables

Create `.env.example` with the following variables.

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wedpass

# Auth
JWT_SECRET=replace-with-secure-secret
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_SECRET=replace-with-secure-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudflare R2
R2_ACCOUNT_ID=replace-with-r2-account-id
R2_ACCESS_KEY_ID=replace-with-r2-access-key-id
R2_SECRET_ACCESS_KEY=replace-with-r2-secret-access-key
R2_BUCKET_NAME=wedpass-media
R2_PUBLIC_BASE_URL=https://media.example.com

# Upload Limits
MAX_IMAGE_UPLOAD_MB=10
MAX_VIDEO_UPLOAD_MB=100

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Optional Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

---

## 7. Environment Variable Rules

Do:

- Keep `.env.example` committed.
- Keep `.env.local` ignored.
- Use Vercel environment variables in production.
- Use separate secrets for development and production.
- Rotate secrets if exposed.

Do not:

- Commit `.env.local`.
- Hardcode secrets in code.
- Expose server secrets with `NEXT_PUBLIC_`.
- Share production secrets in chat tools or screenshots.

---

## 8. Git Ignore Requirements

Ensure `.gitignore` includes:

```gitignore
.env
.env.local
.env.*.local
node_modules
.next
.vercel
coverage
playwright-report
test-results
```

---

# Part 1 — Supabase PostgreSQL Setup

---

## 9. Supabase Role in WedPass

WedPass uses Supabase only for managed PostgreSQL in V1.0.

WedPass does not rely on Supabase Auth or Supabase Storage in V1.0.

---

## 10. Supabase Setup Steps

1. Create Supabase project.
2. Choose region closest to target users where practical.
3. Copy PostgreSQL connection string.
4. Add connection string to local `.env.local`.
5. Add connection string to Vercel production environment.
6. Run Prisma migrations.
7. Confirm tables exist.
8. Enable backups according to Supabase plan.

---

## 11. Database URL

Local `.env.local`:

```env
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

Production Vercel environment:

```env
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

Use the connection string recommended by Supabase for server-side applications.

---

## 12. Prisma Migration Commands

Development:

```bash
pnpm prisma:migrate
```

or:

```bash
npx prisma migrate dev
```

Production:

```bash
npx prisma migrate deploy
```

Do not use `prisma migrate dev` against production.

---

## 13. Prisma Studio

Local inspection:

```bash
npx prisma studio
```

Do not expose Prisma Studio publicly.

---

## 14. Database Backup Requirements

For beta:

- Confirm automated backups are enabled.
- Take manual backup before schema changes if possible.
- Do not test destructive migrations on production first.

Minimum backup expectation:

```text
Daily managed backups
```

---

# Part 2 — Cloudflare R2 Setup

---

## 15. Cloudflare R2 Role

Cloudflare R2 stores:

- Wedding photos
- Wedding short videos
- Optional cover images
- Future thumbnails/exports

The application stores only metadata in PostgreSQL.

---

## 16. R2 Bucket Setup

Recommended bucket name:

```text
wedpass-media
```

Folder/key structure:

```text
weddings/{weddingId}/media/{uploadId}.{extension}
weddings/{weddingId}/covers/{coverImageId}.{extension}
```

Do not use original filenames as object keys.

---

## 17. R2 Access Keys

Create R2 API token with minimum required permissions:

```text
Object Read
Object Write
Object Delete, if delete is implemented
```

Avoid using overly broad account-level permissions where possible.

---

## 18. R2 Environment Variables

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=wedpass-media
R2_PUBLIC_BASE_URL=
```

`R2_PUBLIC_BASE_URL` depends on whether media is served through a public domain or signed read URLs.

---

## 19. R2 Security Rules

- Disable public bucket listing.
- Use signed upload URLs.
- Use unpredictable object keys.
- Validate upload requests before issuing signed URLs.
- Keep upload URL expiry short.
- Do not expose R2 secret key to frontend.
- Do not allow arbitrary file paths from client.

Recommended signed URL expiry:

```text
5–15 minutes
```

---

## 20. Media Access Strategy

For V1.0, there are two possible strategies.

### Option A: Public Read URLs

Simpler for beta.

Pros:

- Easier implementation
- Faster gallery loading
- Less signed read URL complexity

Cons:

- Anyone with file URL can access media

### Option B: Signed Read URLs

More private.

Pros:

- Better privacy
- Stronger access control

Cons:

- More backend complexity
- URLs expire
- Gallery implementation more complex

Recommended V1.0 beta approach:

```text
Use public or CDN-readable media URLs only if wedding gallery access itself is acceptable as semi-private.
For stronger privacy, implement signed read URLs after core beta validation.
```

At minimum:

- Hidden/deleted media must not be listed in gallery APIs.
- Bucket listing must remain disabled.

---

# Part 3 — Vercel Deployment

---

## 21. Vercel Role

Vercel hosts:

- Next.js frontend
- Next.js API route handlers
- Preview deployments
- Production deployment

---

## 22. Vercel Setup Steps

1. Create Vercel project from Git repository.
2. Set framework preset to Next.js.
3. Add environment variables.
4. Configure production branch.
5. Deploy preview.
6. Run production build.
7. Verify routes.
8. Test auth, database, and R2 upload flow.

---

## 23. Vercel Environment Variables

Add all production values in Vercel:

```text
DATABASE_URL
JWT_SECRET
REFRESH_TOKEN_SECRET
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_BASE_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SENTRY_DSN
```

Never expose:

```text
DATABASE_URL
JWT_SECRET
REFRESH_TOKEN_SECRET
R2_SECRET_ACCESS_KEY
```

with `NEXT_PUBLIC_`.

---

## 24. Build Command

Default:

```bash
next build
```

If using pnpm:

```bash
pnpm build
```

---

## 25. Production Deployment Command

Vercel handles deployment automatically from Git.

Before production deploy:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

---

## 26. Preview Deployments

Use Vercel preview deployments for testing.

Do not connect preview deployments to production database unless necessary.

Recommended:

- Development database for preview
- Production database only for production branch

---

# Part 4 — Sentry Setup

---

## 27. Sentry Role

Sentry monitors:

- Frontend runtime errors
- Backend API route errors
- Sync failures
- Upload failures
- Unexpected production issues

---

## 28. Sentry Setup Steps

1. Create Sentry project.
2. Install Sentry SDK.
3. Configure Next.js integration.
4. Add DSN to environment variables.
5. Test error capture.
6. Ensure sensitive data is not sent unnecessarily.

---

## 29. High-Priority Errors to Track

Track:

- Sync endpoint failures
- Snapshot download failures
- Media upload URL errors
- Media confirm errors
- Auth failures
- Offline storage errors
- API authorization errors
- Unexpected UI crashes

---

# Part 5 — Local Development Workflow

---

## 30. Recommended Daily Workflow

```bash
git pull
pnpm install
pnpm prisma:migrate
pnpm dev
```

Before commit:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Before deploy:

```bash
pnpm build
```

---

## 31. Recommended Branching

For solo development:

```text
main
feature/<feature-name>
fix/<fix-name>
```

For beta, keep `main` deployable.

Do not commit broken code to `main`.

---

## 32. Commit Discipline

Use small commits.

Examples:

```text
feat: add guest form component
feat: implement local check-in service
fix: prevent duplicate sync queue item
docs: add offline sync documentation
```

---

# Part 6 — Production Readiness Checklist

---

## 33. Pre-Production Checklist

Before first production deployment:

- [ ] Production DATABASE_URL configured
- [ ] JWT_SECRET configured
- [ ] REFRESH_TOKEN_SECRET configured
- [ ] R2 credentials configured
- [ ] R2 bucket created
- [ ] R2 bucket listing disabled
- [ ] Sentry configured
- [ ] `.env.example` updated
- [ ] Prisma migrations tested
- [ ] Production migration command tested
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] Critical tests pass
- [ ] Auth flow tested
- [ ] Guest CRUD tested
- [ ] Event Mode tested
- [ ] Offline check-in tested
- [ ] Sync tested
- [ ] Media upload tested
- [ ] Public gallery tested

---

## 34. Security Checklist Before Production

- [ ] HTTPS enabled
- [ ] Password hashing implemented
- [ ] Auth endpoints rate-limited
- [ ] Public upload endpoints rate-limited
- [ ] Staff tokens scoped
- [ ] QR tokens non-predictable
- [ ] Wedding-scoped authorization implemented
- [ ] File type validation implemented
- [ ] File size validation implemented
- [ ] Hidden media excluded from public gallery
- [ ] No secrets committed
- [ ] `.env.local` ignored
- [ ] Raw DB errors not exposed
- [ ] Sentry not logging secrets

---

## 35. Offline Readiness Checklist

Before beta:

- [ ] Staff device can download snapshot
- [ ] Snapshot persists after browser refresh
- [ ] Guest search works offline
- [ ] QR lookup works offline
- [ ] Local check-in works offline
- [ ] Queue persists after refresh
- [ ] Pending count displays correctly
- [ ] Sync works when online returns
- [ ] Duplicate conflict resolves correctly
- [ ] Sync failure preserves queue

---

## 36. Media Readiness Checklist

Before beta:

- [ ] Image upload works
- [ ] Video upload works within limits
- [ ] Oversized file rejected
- [ ] Unsupported file rejected
- [ ] Upload progress shown
- [ ] Failed upload can retry
- [ ] Confirmed media appears in dashboard
- [ ] Public gallery loads media
- [ ] Hidden media disappears from public gallery
- [ ] Deleted media disappears from public gallery

---

# Part 7 — Deployment Steps

---

## 37. First Production Deployment

1. Merge stable code to main.
2. Confirm environment variables in Vercel.
3. Run production migration:

```bash
npx prisma migrate deploy
```

4. Deploy to Vercel.
5. Verify app loads.
6. Register test organizer.
7. Create test wedding.
8. Add/import guests.
9. Enable Event Mode.
10. Download staff snapshot.
11. Test offline check-in.
12. Test sync.
13. Test media upload.
14. Test public gallery.
15. Check Sentry for errors.

---

## 38. Post-Deployment Smoke Test

After every deployment, test:

- Login
- Dashboard load
- Guest list load
- Staff check-in route load
- Public wedding page load
- Upload URL endpoint
- API health if implemented

---

## 39. Optional Health Endpoint

Optional API route:

```text
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

Advanced health checks can include DB connectivity later.

---

# Part 8 — Rollback Strategy

---

## 40. Vercel Rollback

Vercel supports rollback to previous deployments.

If production breaks:

1. Open Vercel dashboard.
2. Select previous stable deployment.
3. Promote/rollback.
4. Verify app.
5. Investigate issue locally.

---

## 41. Database Rollback

Database rollbacks are more sensitive.

Rules:

- Avoid destructive migrations during beta.
- Prefer additive migrations.
- Backup before risky migrations.
- Do not drop columns/tables casually.
- Test migrations locally first.

If migration fails:

- Stop deployment.
- Restore backup if necessary.
- Fix migration script.

---

## 42. Media Rollback

Media files in R2 are not tied to app deployment.

If media bug occurs:

- Disable upload endpoint temporarily if needed.
- Keep existing media untouched.
- Fix app/API.
- Re-enable upload.

---

# Part 9 — Beta Operations

---

## 43. Beta Environment Strategy

For first beta weddings, use production environment carefully.

Recommended:

- Manually onboard first 3–5 weddings.
- Do not open public signup broadly.
- Monitor logs during events if possible.
- Keep backup support process ready.

---

## 44. Beta Support Checklist

For each beta wedding:

Before event:

- Confirm guest list imported.
- Confirm QR codes generated.
- Confirm Event Mode enabled.
- Confirm every staff device downloaded offline pack.
- Confirm QR scan tested.
- Confirm manual search tested.
- Confirm upload page tested.

During event:

- Monitor if possible.
- Ask staff to check pending sync count.
- Ensure devices sync after event.

After event:

- Confirm all devices synced.
- Review sync logs.
- Review media uploads.
- Collect feedback.

---

## 45. Production Data Handling During Beta

Beta users are real users.

Rules:

- Do not casually delete production data.
- Do not use production data for local testing.
- Do not expose guest lists in logs.
- Ask permission before inspecting user data manually.
- Provide deletion if organizer requests it.

---

# Part 10 — Performance and Cost Considerations

---

## 46. V1.0 Cost Drivers

Main cost drivers:

- Vercel usage
- Supabase database
- R2 storage
- R2 operations
- Sentry plan if upgraded

Media uploads are the biggest variable.

---

## 47. Cost Controls

Use:

- Image compression
- Video size limits
- Gallery pagination
- Upload rate limiting
- Storage monitoring
- Manual beta user limits

---

## 48. Recommended V1 Upload Limits

```text
Images: 10MB max
Videos: 100MB max
```

Adjust after beta based on real usage.

---

# Part 11 — Environment Anti-Patterns

---

## 49. Avoid These

Do not:

- Commit `.env.local`
- Use production DB for local development
- Use production R2 bucket for tests
- Run `prisma migrate dev` on production
- Give public access to bucket listing
- Expose R2 secret key to frontend
- Deploy without running build
- Ignore failed migrations
- Use destructive migrations casually
- Open beta publicly before offline flow is tested

---

## 50. Summary

WedPass V1.0 deployment should remain simple:

```text
Vercel + Supabase PostgreSQL + Cloudflare R2
```

This stack is sufficient for beta and early product validation.

The most important deployment rule is:

> Do not deploy changes that could break offline check-in during an active wedding.

Reliability during real events is more important than rapid feature deployment.
