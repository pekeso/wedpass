# Phase 10 — Staff Device Access Foundation

## Goal

Implement staff device registration, staff JWT token generation (scoped to wedding and check-in operations), staff token validation middleware, and the organizer's staff management UI. Also build the staff login page.

## Why This Phase Matters

Staff access is the gateway to all Event Mode operations. Staff tokens must be narrowly scoped to prevent staff from accessing organizer-only areas. Getting staff token scoping right here protects every staff-facing API in later phases.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 6 — Staff API, sections 24–26)
- `docs/security.md`
- `docs/database_schema.md` (staff_devices table)

## Dependencies

- Phase 05 complete (organizer auth)
- Phase 09 complete (offline foundation — device ID concept)

## Scope

### Backend

- Staff module: `src/modules/staff/`
  - `staff.schemas.ts`
  - `staff.types.ts`
  - `staff.repository.ts`
  - `staff.service.ts`
  - `staff.dto.ts`
- Staff JWT utilities (`src/lib/auth/staff-jwt.ts`):
  - `signStaffToken(payload: { staffDeviceId, weddingId })` — limited scope
  - `verifyStaffToken(token)` — returns `{ staffDeviceId, weddingId }`
- Staff auth guard: `src/lib/auth/require-staff-auth.ts`
  - Validates staff token
  - Ensures device is ACTIVE
  - Returns `{ staffDeviceId, weddingId }`
- API route handlers:
  - `POST /api/v1/weddings/:weddingId/staff/devices` — organizer creates device
  - `GET /api/v1/weddings/:weddingId/staff/devices` — organizer lists devices
  - `POST /api/v1/weddings/:weddingId/staff/devices/:deviceId/revoke` — organizer revokes

### Frontend

- `src/app/dashboard/wedding/[weddingId]/staff/page.tsx` — organizer staff management page
  - Shows list of staff devices with label, status, last seen
  - Create new device (generates staff token)
  - Revoke device
  - Show staff token once (copy or QR code)
- `src/app/staff/[weddingId]/login/page.tsx` — staff login page
  - Input for staff token
  - On success: store in session/localStorage, navigate to download page

## Explicitly Out of Scope

- Snapshot download (Phase 12)
- Check-in sync (Phase 16)
- Staff cannot access organizer routes — enforce this via middleware
- Staff invitation emails (not in V1.0)

## Important Security Rules

- Staff JWT must contain `staffDeviceId` and `weddingId` claims, and `scope: "staff"`.
- Staff JWT must NOT grant access to organizer endpoints.
- Organizer JWT must NOT grant access to staff-only endpoints.
- Staff token should have a shorter expiry (e.g., 30 days or for the event duration).
- Revoked staff devices must be rejected at the auth guard level.

## Implementation Tasks

1. Create `src/lib/auth/staff-jwt.ts`:
   - `signStaffToken({ staffDeviceId, weddingId })` using `STAFF_JWT_SECRET` env var (separate from organizer secret)
   - `verifyStaffToken(token)` — checks `scope === "staff"` claim
2. Create `src/lib/auth/require-staff-auth.ts`:
   - Reads `Authorization: Bearer <token>`
   - Calls `verifyStaffToken`
   - Queries DB to confirm device is `ACTIVE`
   - Returns `{ staffDeviceId, weddingId }`
3. Create `src/modules/staff/staff.repository.ts`:
   - `createStaffDevice(weddingId, label)`
   - `findStaffDevicesByWedding(weddingId)`
   - `findStaffDeviceById(weddingId, deviceId)`
   - `revokeStaffDevice(weddingId, deviceId)`
   - `updateLastSeen(deviceId)`
4. Create `src/modules/staff/staff.service.ts`:
   - `createStaffDevice()` — creates device, signs staff token, returns both
   - `listStaffDevices()`
   - `revokeStaffDevice()`
5. Create API route handlers:
   - `src/app/api/v1/weddings/[weddingId]/staff/devices/route.ts` — GET, POST (organizer only)
   - `src/app/api/v1/weddings/[weddingId]/staff/devices/[deviceId]/revoke/route.ts` — POST (organizer only)
6. Add `STAFF_JWT_SECRET` to `.env.example`.
7. Build `src/app/dashboard/wedding/[weddingId]/staff/page.tsx`:
   - List devices with status badge
   - Create device dialog (label input → shows generated token once)
   - Revoke button with ConfirmDialog
8. Build `src/app/staff/[weddingId]/login/page.tsx`:
   - Token input field
   - Calls verify endpoint or validates client-side
   - On success: stores staff token, redirects to download page

## Files and Folders Likely to Be Created or Modified

- `src/modules/staff/`
- `src/lib/auth/staff-jwt.ts`
- `src/lib/auth/require-staff-auth.ts`
- `src/app/api/v1/weddings/[weddingId]/staff/devices/route.ts`
- `src/app/api/v1/weddings/[weddingId]/staff/devices/[deviceId]/revoke/route.ts`
- `src/app/dashboard/wedding/[weddingId]/staff/page.tsx`
- `src/app/staff/[weddingId]/login/page.tsx`
- `.env.example`

## Testing Requirements

- Create a staff device — verify token returned and device in DB
- List devices — verify organizer sees their devices
- Use staff token on staff endpoint — verify succeeds
- Use staff token on organizer endpoint — verify `FORBIDDEN`
- Use organizer token on staff endpoint — verify `FORBIDDEN`
- Revoke a device — verify revoked device cannot authenticate
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Staff management page shows device list
- [ ] Create device dialog shows token exactly once
- [ ] Staff login page accepts a valid token and redirects
- [ ] Staff login with invalid token shows error
- [ ] Revoked device cannot log in
- [ ] Staff cannot navigate to organizer dashboard pages

## Acceptance Criteria

- [ ] Staff tokens are scoped (`scope: "staff"` + weddingId + staffDeviceId)
- [ ] Staff auth guard validates device is ACTIVE
- [ ] Organizer routes reject staff tokens
- [ ] Staff routes reject organizer tokens
- [ ] Revocation works
- [ ] Staff login page works end-to-end

## Git Commit Recommendation

```
feat: add staff device access foundation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 10 to Completed Phases
- Set Current Phase to Phase 11 and Phase 12
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 10: Staff Device Access Foundation.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 6 — Staff API, sections 24–26)
- docs/security.md

Your task is to implement staff device registration and scoped staff JWT tokens.

Backend:
1. Create src/lib/auth/staff-jwt.ts:
   signStaffToken({ staffDeviceId, weddingId }) — uses STAFF_JWT_SECRET env var, includes scope: "staff" claim
   verifyStaffToken(token) — validates and returns { staffDeviceId, weddingId }

2. Create src/lib/auth/require-staff-auth.ts:
   Reads Bearer token, verifies staff JWT, checks device is ACTIVE in DB.
   Returns { staffDeviceId, weddingId } or throws UNAUTHORIZED/FORBIDDEN.

3. Create src/modules/staff/ with: staff.schemas.ts, staff.repository.ts, staff.service.ts.

4. Create API routes (organizer auth required):
   - POST /api/v1/weddings/:weddingId/staff/devices
   - GET /api/v1/weddings/:weddingId/staff/devices
   - POST /api/v1/weddings/:weddingId/staff/devices/:deviceId/revoke

SECURITY RULES:
- Staff JWT must contain scope: "staff", staffDeviceId, weddingId
- Staff JWT must NOT grant organizer access
- Organizer JWT must NOT grant staff access
- Revoked devices must fail auth at the guard level

Frontend:
5. Build organizer staff page at src/app/dashboard/wedding/[weddingId]/staff/page.tsx.
   Shows device list, create device (shows token once), revoke with confirmation.

6. Build staff login page at src/app/staff/[weddingId]/login/page.tsx.
   Token input, on success stores staff token and redirects to /staff/[weddingId]/download.

After completing:
- Test: create device, list, revoke, cross-scope token rejection
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 10 completed, Current Phase → Phase 11.

Commit with:
git commit -m "feat: add staff device access foundation"
```
