# Phase 21 — Guest Public Wedding Page

## Goal

Build the public guest-facing wedding landing page at `/w/[slug]`. Guests arrive here via a shared link or QR code, see the wedding details, and have clear CTAs to upload photos or view the gallery. No account required.

## Why This Phase Matters

The guest experience is how wedding memories are collected. The landing page sets the tone — it must be warm, elegant, and simple. If guests can't immediately understand how to upload photos, media participation will be low.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 10 — Public Guest Media API, Section 36)
- `docs/ui_ux.md` (Guest experience)
- `docs/routes.md`

## Dependencies

- Phase 06 complete (wedding CRUD)

## Scope

### Backend

- `GET /api/v1/public/weddings/:slug` — public endpoint
  - Returns: wedding name, couple names, event date, location, cover image, gallery enabled
  - Must NOT return: organizer email, guest list, staff info, internal IDs

### Frontend

- `src/app/w/[slug]/page.tsx` — Guest landing page:
  - Wedding cover photo (if set)
  - Wedding name (large, Playfair Display)
  - Couple names
  - Event date and location
  - CTA buttons: "Share Your Photos & Videos" and "View Gallery" (if enabled)
  - Warm, elegant styling (ivory background, champagne accents)

## Explicitly Out of Scope

- Media upload (Phase 22)
- Gallery (Phase 23)
- Guest account creation

## Implementation Tasks

1. Create public wedding route handler:
   `src/app/api/v1/public/weddings/[slug]/route.ts` (GET):
   - Find wedding by slug
   - Return only public fields (name, coupleNames, eventDate, location, coverImageUrl, galleryEnabled)
   - Never return guest list, organizer data, or internal IDs
2. Build `src/app/w/[slug]/page.tsx`:
   - Server component (Next.js) — fetch wedding data server-side for SEO
   - Warm design: ivory background, champagne text accents
   - Couple names in Playfair Display
   - If gallery enabled: show "View Gallery" button
   - Always show "Share Photos & Videos" button
   - If wedding date is in the future: show "See you soon" message
   - If wedding is past: show "Thank you for celebrating with us"
3. Update `src/app/w/[slug]/layout.tsx` to use `GuestLayout`.
4. Handle 404 gracefully (wedding not found or not active).
5. Meta tags for social sharing (og:title, og:image, og:description).

## Rate Limiting Note

Public routes should be rate-limited. For V1.0, this can be configured at the Vercel edge level or using middleware.

## Files and Folders Likely to Be Created or Modified

- `src/app/api/v1/public/weddings/[slug]/route.ts`
- `src/app/w/[slug]/page.tsx`
- `src/app/w/[slug]/layout.tsx`

## Testing Requirements

- Get wedding by slug — verify only public fields returned
- Unknown slug — verify 404 response
- Access slug of another organizer's wedding — verify it returns (it's public) but no private data
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] `/w/[slug]` shows wedding name and couple names
- [ ] Cover image displays (if set)
- [ ] "Share Photos" CTA button visible
- [ ] "View Gallery" button shown only when gallery is enabled
- [ ] 404 page for unknown slug
- [ ] Organizer email not visible in source
- [ ] Guest list not visible in source
- [ ] Mobile layout is warm and elegant

## Acceptance Criteria

- [ ] Public API returns only safe public fields
- [ ] Guest landing page renders correctly
- [ ] No private data exposed
- [ ] 404 handled
- [ ] Social meta tags set

## Git Commit Recommendation

```
feat: add guest public wedding page
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 21 to Completed Phases
- Set Current Phase to Phase 22
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 21: Guest Public Wedding Page.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 10 — Public Guest API, Section 36)
- docs/ui_ux.md (Guest experience section)

Your task is to build the public wedding landing page for guests.

Backend:
1. Create GET /api/v1/public/weddings/:slug route handler.
   SECURITY: Return ONLY public fields: name, coupleNames, eventDate, location, coverImageUrl, galleryEnabled.
   NEVER return: organizer email, guest list, staff info, check-in data, internal UUIDs not needed for display.
   Return 404 if wedding not found.

Frontend:
2. Build src/app/w/[slug]/page.tsx (Next.js Server Component):
   - Fetch wedding data server-side
   - Wedding name in Playfair Display font (large)
   - Couple names below
   - Event date and location
   - Cover image if set
   - CTAs: "Share Your Photos & Videos" → /w/[slug]/upload, "View Gallery" → /w/[slug]/gallery (only if galleryEnabled)
   - Add og:title, og:description, og:image meta tags
   - Graceful 404 page

3. Wire GuestLayout to src/app/w/[slug]/layout.tsx.

UI: Ivory background, champagne accents, warm and elegant. Couple names in Playfair Display.

After completing:
- Verify no private data in response
- Check mobile viewport looks correct
- Run npm run lint — must pass

Update PROGRESS.md: Phase 21 completed, Current Phase → Phase 22.

Commit with:
git commit -m "feat: add guest public wedding page"
```
