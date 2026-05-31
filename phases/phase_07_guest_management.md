# Phase 07 — Guest Management

## Goal

Build complete organizer guest management: add guests manually, edit guests, delete guests (soft delete), list guests with search/filter, and display check-in status. No CSV import or QR generation yet (Phase 08).

## Why This Phase Matters

Guest management is the second most-used organizer workflow after wedding setup. The quality of the guest list directly determines the quality of Event Mode check-in. Getting guest CRUD right with proper Event Mode locking sets the stage for all offline check-in phases.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 3 — Guest API)
- `docs/database_schema.md` (guests table)
- `docs/components.md`
- `docs/v1_scope.md` (Section 7.3 — Guest Management)

## Dependencies

- Phase 06 complete (wedding CRUD)

## Scope

### Backend

- Guest module: `src/modules/guests/`
  - `guests.schemas.ts`
  - `guests.types.ts`
  - `guests.repository.ts`
  - `guests.service.ts`
  - `guests.dto.ts`
- API route handlers:
  - `POST /api/v1/weddings/:weddingId/guests`
  - `GET /api/v1/weddings/:weddingId/guests`
  - `PATCH /api/v1/weddings/:weddingId/guests/:guestId`
  - `DELETE /api/v1/weddings/:weddingId/guests/:guestId`
- QR token generation (random, high-entropy) for each guest on creation
- Event Mode lock enforcement (guests cannot be edited/deleted after Event Mode)

### Frontend

- `src/app/dashboard/wedding/[weddingId]/guests/page.tsx`:
  - Guest list table with: name, phone, email, allowed guests, QR token, check-in status
  - Search by name or phone
  - Pagination
  - Add guest button (opens dialog)
  - Edit guest (inline or dialog)
  - Delete guest (with ConfirmDialog)
- Guest form component: `src/components/guests/guest-form.tsx`
- Guest table component: `src/components/guests/guest-table.tsx`
- Guest card component: `src/components/guests/guest-card.tsx` (mobile fallback)

## Explicitly Out of Scope

- CSV import (Phase 08)
- QR code display page (Phase 08)
- Check-in action (Phase 14)

## Implementation Tasks

1. Create QR token utility `src/lib/utils/qr-token.ts`:
   ```ts
   export function generateQrToken(): string {
     return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
   }
   ```
2. Create `src/modules/guests/guests.schemas.ts`:
   ```ts
   export const createGuestSchema = z.object({
     fullName: z.string().min(2),
     phoneNumber: z.string().optional(),
     email: z.string().email().optional().or(z.literal("")),
     numberOfAllowedGuests: z.number().int().min(1).max(20).default(1),
   });
   ```
3. Create `src/modules/guests/guests.repository.ts`:
   - `createGuest(weddingId, data)` — generate QR token, insert
   - `findGuestsByWedding(weddingId, filters)` — paginated, search by fullName/phoneNumber
   - `findGuestByWeddingAndId(weddingId, guestId)` — never query by guestId alone
   - `updateGuest(weddingId, guestId, data)` — scoped update
   - `softDeleteGuest(weddingId, guestId)` — set deletedAt
4. Create `src/modules/guests/guests.service.ts`:
   - Enforce Event Mode lock: throw `EVENT_MODE_LOCKED` if wedding status is EVENT_MODE or COMPLETED
   - Detect possible duplicates on create (same phone number)
5. Create API route handlers:
   - `src/app/api/v1/weddings/[weddingId]/guests/route.ts` — GET, POST
   - `src/app/api/v1/weddings/[weddingId]/guests/[guestId]/route.ts` — PATCH, DELETE
6. Build `src/components/guests/guest-form.tsx` — form with React Hook Form + Zod.
7. Build `src/components/guests/guest-table.tsx` — table with shadcn Table.
8. Build `src/components/guests/guest-card.tsx` — mobile card view.
9. Build `src/app/dashboard/wedding/[weddingId]/guests/page.tsx` — list with search, add/edit/delete.
10. Update wedding dashboard to show real guest count.

## Files and Folders Likely to Be Created or Modified

- `src/modules/guests/`
- `src/lib/utils/qr-token.ts`
- `src/app/api/v1/weddings/[weddingId]/guests/route.ts`
- `src/app/api/v1/weddings/[weddingId]/guests/[guestId]/route.ts`
- `src/components/guests/`
- `src/app/dashboard/wedding/[weddingId]/guests/page.tsx`

## Testing Requirements

- Add a guest — verify in DB with unique qrToken
- Edit a guest — verify changes saved
- Delete a guest — verify soft delete (deletedAt set)
- Try adding guest to Event Mode wedding — verify `EVENT_MODE_LOCKED` error
- Search by name — verify filtered results
- Pagination — verify page 2 returns different guests
- Cross-wedding access — verify organizer A cannot modify organizer B's guests
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Guest list page shows guests in a table
- [ ] Add guest form opens in dialog, submits successfully
- [ ] Edit guest updates the record
- [ ] Delete guest shows confirm dialog, then removes from list
- [ ] Search input filters list in real-time or on submit
- [ ] Pagination works for large guest lists
- [ ] QR token is visible in the table or guest detail
- [ ] Status badge shows checked-in state correctly

## Acceptance Criteria

- [ ] Guest CRUD APIs work with ownership enforcement
- [ ] QR tokens are generated on creation (random, unique)
- [ ] Event Mode lock prevents edits when wedding is in EVENT_MODE
- [ ] Soft delete is used (not hard delete)
- [ ] Pagination and search work
- [ ] Frontend form and table work end-to-end

## Git Commit Recommendation

```
feat: implement guest management
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 07 to Completed Phases
- Set Current Phase to Phase 08
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 07: Guest Management.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 3 — Guest API)
- docs/database_schema.md (guests table)

Your task is to implement guest CRUD for organizers.

Backend:
1. Create src/lib/utils/qr-token.ts — generates high-entropy random QR token using crypto.randomUUID().
2. Create src/modules/guests/ with: guests.schemas.ts, guests.repository.ts, guests.service.ts, guests.dto.ts.
3. In guests.repository.ts — ALL queries must include weddingId. Never query by guestId alone.
4. In guests.service.ts — enforce Event Mode lock: if wedding.status is EVENT_MODE or COMPLETED, throw AppError("EVENT_MODE_LOCKED").
5. Create API route handlers:
   - src/app/api/v1/weddings/[weddingId]/guests/route.ts (GET list with search+pagination, POST create)
   - src/app/api/v1/weddings/[weddingId]/guests/[guestId]/route.ts (PATCH update, DELETE soft-delete)

Frontend:
6. Build guest form component (React Hook Form, Zod validation).
7. Build guest table component with shadcn Table.
8. Build guest list page at src/app/dashboard/wedding/[weddingId]/guests/page.tsx.
   Include: search input, add guest button (opens dialog), edit, delete (with ConfirmDialog).
9. Use TanStack Query for guest list data.

Rules:
- Soft delete — set deletedAt, do not remove from DB
- QR tokens must be generated by the server, not client
- Never expose deleted guests in list queries (filter where deletedAt is null)
- Route handlers → service → repository pattern

After completing:
- Test all guest operations
- Test Event Mode lock
- Run npm run lint — must pass
- Run npx tsc --noEmit — must pass

Update PROGRESS.md: Phase 07 completed, Current Phase → Phase 08.

Commit with:
git commit -m "feat: implement guest management"
```
