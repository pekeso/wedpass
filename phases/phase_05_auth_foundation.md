# Phase 05 — Auth Foundation

## Goal

Implement complete organizer authentication: registration, login, logout, current user endpoint, JWT utilities, protected route middleware, and login/register UI pages.

## Why This Phase Matters

Auth is the security foundation for every organizer-facing feature. Getting it right here — correct password hashing, JWT handling, protected routes — prevents security vulnerabilities in all subsequent phases.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 1 — Auth API)
- `docs/security.md`
- `docs/database_schema.md` (users table)

## Dependencies

- Phase 03 complete (layouts and shared components)
- Phase 04 complete (Prisma schema)

## Scope

### Backend

- Auth module: `src/modules/auth/`
  - `auth.schemas.ts` — Zod schemas for register/login
  - `auth.types.ts` — TypeScript types
  - `auth.repository.ts` — user database operations
  - `auth.service.ts` — business logic (hash, compare, JWT)
  - `auth.dto.ts` — response DTOs
- JWT utilities in `src/lib/auth/`
  - `jwt.ts` — sign and verify JWT
  - `password.ts` — bcrypt hash and compare
- API route handlers:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
- Route protection middleware/helper

### Frontend

- Login page: `src/app/(public)/login/page.tsx`
- Register page: `src/app/(public)/register/page.tsx`
- Auth store: `src/stores/auth-store.ts` (Zustand — stores user + token)
- API client helper for auth: `src/lib/api/auth-client.ts`

## Explicitly Out of Scope

- Staff token auth (Phase 10)
- OAuth / social login
- SMS auth
- Multi-factor auth
- Password reset (not in V1.0)

## Implementation Tasks

1. Install dependencies:
   ```bash
   npm install bcryptjs jsonwebtoken
   npm install -D @types/bcryptjs @types/jsonwebtoken
   ```
2. Create `src/lib/auth/password.ts`:
   ```ts
   import bcrypt from "bcryptjs";
   export async function hashPassword(password: string): Promise<string>
   export async function comparePassword(password: string, hash: string): Promise<boolean>
   ```
3. Create `src/lib/auth/jwt.ts`:
   ```ts
   export function signToken(payload: { userId: string }): string
   export function verifyToken(token: string): { userId: string }
   ```
   Use `JWT_SECRET` and `JWT_EXPIRES_IN` env vars.
4. Create `src/modules/auth/auth.schemas.ts`:
   ```ts
   export const registerSchema = z.object({
     fullName: z.string().min(2),
     email: z.string().email(),
     password: z.string().min(8),
   });
   export const loginSchema = z.object({
     email: z.string().email(),
     password: z.string().min(1),
   });
   ```
5. Create `src/modules/auth/auth.repository.ts`:
   - `findUserByEmail(email: string)`
   - `createUser(data: CreateUserData)`
   - `updateLastLogin(userId: string)`
6. Create `src/modules/auth/auth.service.ts`:
   - `registerOrganizer(data)` — validate, check duplicate, hash, create user, return token
   - `loginOrganizer(data)` — validate, find user, compare password, return token
   - `getCurrentUser(userId)` — fetch user DTO
7. Create API route handlers in `src/app/api/v1/auth/`:
   - `register/route.ts` → POST
   - `login/route.ts` → POST
   - `logout/route.ts` → POST
   - `me/route.ts` → GET (protected)
8. Create auth guard helper `src/lib/auth/require-auth.ts`:
   - Reads `Authorization: Bearer <token>` header
   - Verifies JWT
   - Returns `{ userId: string }` or throws `UNAUTHORIZED`
9. Create Zustand auth store `src/stores/auth-store.ts`:
   - `user`, `accessToken`, `setAuth()`, `clearAuth()`
   - Persists to localStorage
10. Build login UI in `src/app/(public)/login/page.tsx`:
    - React Hook Form + Zod
    - Email + password fields
    - Error handling
    - Redirect to `/dashboard` on success
11. Build register UI in `src/app/(public)/register/page.tsx`:
    - Full name, email, password fields
    - Redirect to `/dashboard` on success
12. Protect dashboard route group with a client-side auth check.

## API Response Shape

All endpoints must return:
```json
{ "success": true, "data": { ... } }
```
or
```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

## Files and Folders Likely to Be Created or Modified

- `src/modules/auth/`
- `src/lib/auth/jwt.ts`
- `src/lib/auth/password.ts`
- `src/lib/auth/require-auth.ts`
- `src/app/api/v1/auth/register/route.ts`
- `src/app/api/v1/auth/login/route.ts`
- `src/app/api/v1/auth/logout/route.ts`
- `src/app/api/v1/auth/me/route.ts`
- `src/app/(public)/login/page.tsx`
- `src/app/(public)/register/page.tsx`
- `src/stores/auth-store.ts`

## Testing Requirements

- Register a new user — verify user is created in DB
- Login with correct credentials — verify token returned
- Login with wrong password — verify `UNAUTHORIZED` error
- Access `/api/v1/auth/me` with token — verify user data returned
- Access `/api/v1/auth/me` without token — verify `UNAUTHORIZED`
- Try duplicate email registration — verify `CONFLICT` error
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Register form at `/register` works
- [ ] After register, redirected to dashboard
- [ ] Login form at `/login` works
- [ ] Wrong password shows error message
- [ ] Duplicate email shows error message
- [ ] Accessing `/dashboard` while unauthenticated redirects to login
- [ ] Password is hashed in database (not plaintext)
- [ ] JWT is well-formed (can be verified)

## Acceptance Criteria

- [ ] Register endpoint creates user with bcrypt password
- [ ] Login endpoint returns JWT
- [ ] `/auth/me` returns user data for valid token
- [ ] Route handlers use service/repository pattern
- [ ] No Prisma calls in route handlers
- [ ] Login and register UI work end-to-end
- [ ] Dashboard is protected

## Git Commit Recommendation

```
feat: implement organizer authentication
```

## PROGRESS.md Update Instructions

After completing this phase, update `PROGRESS.md`:
- Move Phase 05 to Completed Phases
- Set Current Phase to Phase 06
- Record: auth endpoints built, login/register UI working
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 05: Auth Foundation.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 1 — Auth API section)
- docs/security.md

Your task is to implement organizer authentication end-to-end.

Backend:
1. Install bcryptjs, jsonwebtoken and their types.
2. Create src/lib/auth/password.ts — hashPassword and comparePassword utilities using bcrypt.
3. Create src/lib/auth/jwt.ts — signToken and verifyToken using JWT_SECRET and JWT_EXPIRES_IN env vars.
4. Create src/modules/auth/auth.schemas.ts — Zod schemas for register and login.
5. Create src/modules/auth/auth.repository.ts — findUserByEmail, createUser, updateLastLogin using Prisma via src/lib/db/prisma.ts.
6. Create src/modules/auth/auth.service.ts — registerOrganizer, loginOrganizer, getCurrentUser business logic.
7. Create API route handlers:
   - src/app/api/v1/auth/register/route.ts (POST)
   - src/app/api/v1/auth/login/route.ts (POST)
   - src/app/api/v1/auth/logout/route.ts (POST)
   - src/app/api/v1/auth/me/route.ts (GET, protected)
8. Create src/lib/auth/require-auth.ts — auth guard that reads Bearer token, verifies JWT, returns userId or throws UNAUTHORIZED.

Frontend:
9. Create src/stores/auth-store.ts — Zustand store with user, accessToken, setAuth, clearAuth (persisted to localStorage).
10. Build login page at src/app/(public)/login/page.tsx — React Hook Form, Zod, redirect to /dashboard on success.
11. Build register page at src/app/(public)/register/page.tsx — full name, email, password, redirect on success.
12. Protect the dashboard route group — redirect to /login if no valid auth.

Rules:
- Route handlers must not call Prisma directly — use services
- Passwords must be hashed with bcrypt — never store plaintext
- Use standard API response shape: { success: true, data: {} } or { success: false, error: {} }
- Auth errors must return safe messages (do not hint which field is wrong in login)

After completing:
- Test register, login, /auth/me, wrong password, duplicate email
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 05 completed, Current Phase → Phase 06.

Commit with:
git commit -m "feat: implement organizer authentication"

Report: endpoints built, UI pages built, security controls verified.
```
