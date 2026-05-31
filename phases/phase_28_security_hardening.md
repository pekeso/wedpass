# Phase 28 — Security Hardening

## Goal

Review and harden all security controls across WedPass: wedding-scoped authorization audit, rate limiting on public endpoints, QR token entropy verification, staff token scope verification, file upload security, public endpoint data exposure audit, and API input validation completeness check.

## Why This Phase Matters

WedPass handles personal guest data and wedding memories. Security gaps discovered after beta would be damaging. This phase systematically verifies every security requirement before deployment. It is not about adding features — it is about confirming that existing features are secure.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/security.md` (full document)
- `docs/api_contracts.md` (Part 13 — Security Requirements Per API)

## Dependencies

- Phase 25 complete (all core features built)
- Phase 27 complete (logging in place)

## Scope

This phase is primarily a security audit and hardening exercise — not new feature development.

### Security Checklist

1. **Wedding-Scoped Authorization**
   - [ ] Every organizer route verifies `wedding.organizerId === currentUser.id`
   - [ ] No resource queried by ID alone — always include weddingId
   - [ ] Staff routes verify staffDevice belongs to the correct wedding
   - [ ] Media routes verify media belongs to the correct wedding

2. **Authentication**
   - [ ] Organizer JWT contains only necessary claims (userId)
   - [ ] Staff JWT contains scope, staffDeviceId, weddingId — nothing else
   - [ ] Staff token cannot be used on organizer routes
   - [ ] Organizer token cannot be used on staff routes
   - [ ] Revoked devices rejected at auth guard level

3. **QR Token Security**
   - [ ] QR tokens are at least 32 characters of high entropy
   - [ ] QR tokens are unique per guest
   - [ ] QR tokens are not predictable from any pattern

4. **File Upload Security**
   - [ ] Server validates MIME type (not just extension)
   - [ ] Server validates file size before issuing signed URL
   - [ ] SVG files rejected
   - [ ] No upload through the app server (only R2 signed URLs)
   - [ ] R2 bucket is not public-read (only signed URLs)

5. **Public Endpoints**
   - [ ] Public wedding page returns NO guest list, NO organizer email, NO staff info
   - [ ] Public gallery returns only visible media (not HIDDEN or DELETED)
   - [ ] Rate limiting applied to: `/auth/login`, `/auth/register`, `/media/upload-url`, `/media/confirm`, public gallery, sync endpoint

6. **Input Validation**
   - [ ] Every request body has a Zod schema
   - [ ] Zod schemas are used on the server — not just client-side
   - [ ] Pagination parameters are bounded (pageSize max 100)
   - [ ] No raw user input rendered as HTML

7. **Error Responses**
   - [ ] No raw Prisma errors returned to client
   - [ ] No stack traces in API responses
   - [ ] No internal IDs or file paths in error messages

8. **Environment & Infrastructure**
   - [ ] `.env` is in `.gitignore`
   - [ ] No hardcoded secrets in source code
   - [ ] No test credentials committed
   - [ ] `HTTPS_ONLY` enforced (Vercel does this by default)

9. **Offline Security**
   - [ ] No organizer password stored in IndexedDB
   - [ ] No refresh token stored in IndexedDB
   - [ ] Staff token is the minimum needed for offline operation
   - [ ] Local data clearing works correctly

## Implementation Tasks

1. Run through every checklist item above.
2. For each issue found: fix it before marking as done.
3. Add rate limiting to public endpoints:
   - Use Vercel's built-in rate limiting, or
   - Add middleware rate limiting using `@upstash/ratelimit` or similar
4. Verify QR token entropy (check `qr-token.ts` utility — should use `crypto.randomUUID()` x2 or equivalent).
5. Verify all Zod schemas are server-side validated (not just client-side form validation).
6. Run a manual test: attempt to access another organizer's wedding → verify 403.
7. Run a manual test: use a staff token on an organizer endpoint → verify 403.
8. Run a manual test: attempt upload of an SVG file → verify rejected.
9. Run a manual test: check browser DevTools Network tab for any exposed sensitive data in responses.
10. Fix any issues found during the audit.

## Files Likely to Be Modified

- Route handlers with missing ownership checks
- `src/lib/auth/require-auth.ts` and `require-staff-auth.ts`
- Public endpoints with data leakage
- `src/lib/utils/qr-token.ts` if entropy is insufficient
- Middleware configuration for rate limiting

## Testing Requirements

Security tests:
- Organizer A cannot access organizer B's wedding (403)
- Staff token rejected on organizer endpoint (403)
- Organizer token rejected on staff endpoint (403)
- Revoked staff device cannot sync (401)
- SVG upload rejected
- Oversized file rejected
- Public gallery does not show hidden media
- Public endpoint does not expose guest list
- `npm run lint` passes

## Manual QA Security Checklist

- [ ] Try accessing `/api/v1/weddings/:wrongWeddingId` with correct auth → 403
- [ ] Try accessing `/api/v1/staff/weddings/:weddingId/snapshot` with organizer token → 403
- [ ] Try accessing `/api/v1/weddings/:weddingId/guests` with staff token → 403
- [ ] Upload SVG → rejected
- [ ] Upload 11MB image → rejected
- [ ] Check `/api/v1/public/weddings/:slug` response → no guest list, no organizer email
- [ ] Check public gallery → no hidden media
- [ ] Inspect IndexedDB → no password or sensitive token stored

## Acceptance Criteria

- [ ] All checklist items verified
- [ ] No Prisma errors in API responses
- [ ] No stack traces in production responses
- [ ] Rate limiting on public endpoints
- [ ] All found issues fixed
- [ ] Build and lint pass

## Git Commit Recommendation

```
chore: harden security controls
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 28 to Completed Phases
- Set Current Phase to Phase 29
- Record any security issues found and fixed
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 28: Security Hardening.

Before starting, read:
- CLAUDE.md
- docs/security.md (full document)
- docs/api_contracts.md (Part 13 — Security Requirements Per API)

Your task is NOT to add features. Your task is to audit and harden existing security controls.

Run through this security checklist and fix any issues found:

1. WEDDING-SCOPED AUTHORIZATION: Verify every organizer API query checks that wedding.organizerId === currentUser.id. Fix any that don't.

2. STAFF TOKEN SCOPE: Verify staff tokens are rejected on organizer routes and vice versa. Test both directions.

3. QR TOKEN ENTROPY: Verify qr-token.ts generates at least 32 chars of cryptographically random data.

4. FILE UPLOAD SECURITY: Verify server validates MIME type AND file size before signing. SVG must be rejected.

5. PUBLIC ENDPOINT DATA AUDIT: Check /api/v1/public/weddings/:slug response — ensure no guest list, organizer email, staff info, or check-in data is returned.

6. ZOD VALIDATION: Verify every POST/PATCH route handler has a Zod schema applied on the server (not just client).

7. ERROR RESPONSES: Verify no raw Prisma errors, stack traces, or internal paths are returned to clients.

8. RATE LIMITING: Add rate limiting to: /auth/login, /auth/register, /media/upload-url, /media/confirm, public gallery endpoint, sync endpoint. Use Vercel middleware or a package like @upstash/ratelimit.

9. ENVIRONMENT: Verify .env is in .gitignore and no secrets are hardcoded.

10. INDEXEDDB: Verify no organizer password or refresh token is stored in IndexedDB.

For each issue found: fix it immediately before moving to the next.

After completing all items:
- Run the manual security QA checklist
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 28 completed, record security issues found/fixed.

Commit with:
git commit -m "chore: harden security controls"
```
