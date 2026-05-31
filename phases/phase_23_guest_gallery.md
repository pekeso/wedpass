# Phase 23 — Guest Gallery

## Goal

Build the public guest-facing gallery page that shows approved/visible wedding media. Includes paginated lazy-loaded grid, photo lightbox preview, video play indicator, and media type filtering.

## Why This Phase Matters

The gallery is how guests relive the wedding and discover others' uploads. It must be beautiful, fast-loading, and mobile-first. Lazy loading and pagination are required to prevent loading hundreds of images at once on mobile networks.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 10 — Public Gallery API, Section 37)
- `docs/v1_scope.md` (Section 7.9)
- `docs/ui_ux.md` (Guest experience)

## Dependencies

- Phase 22 complete (media upload creates records)
- Phase 21 complete (public wedding page exists)

## Scope

### Backend

- `GET /api/v1/public/weddings/:slug/media` — public paginated media list
  - Returns only VISIBLE media (status UPLOADED/APPROVED, not HIDDEN/DELETED)
  - Paginated: page + pageSize
  - Filterable: mediaType (IMAGE/VIDEO)

### Frontend

- `src/app/w/[slug]/gallery/page.tsx` — Guest gallery
  - Photo/video grid (responsive: 2–3 columns mobile, 3–4 desktop)
  - Lazy loading
  - Pagination or infinite scroll
  - Photo/video filter tabs
  - Video items show play button overlay
  - Clicking photo: opens lightbox preview
  - Clicking video: plays in modal or lightbox
  - Empty state if no media
  - Shows gallery-disabled message if gallery is off

### Components

- `src/components/media/media-grid.tsx` — responsive grid
- `src/components/media/media-card.tsx` — single media item (image thumbnail or video thumbnail with play icon)
- `src/components/media/media-lightbox.tsx` — full-screen preview for photos and videos

## Explicitly Out of Scope

- Comments, likes, reactions
- Download all as ZIP
- Social sharing buttons
- AI curation

## Implementation Tasks

1. Create `src/modules/media/media.repository.ts` additions:
   - `findPublicGalleryMedia(weddingId, filters, page, pageSize)` — only non-hidden, non-deleted
2. Create or update route: `GET /api/v1/public/weddings/:slug/media`:
   - Find wedding by slug
   - Check `galleryEnabled` — if false, return empty or 403
   - Query visible media paginated
3. Build `src/components/media/media-card.tsx`:
   - Renders image thumbnail using `next/image` with lazy loading
   - Video: shows thumbnail + play icon overlay
   - Tap/click handler for lightbox
4. Build `src/components/media/media-grid.tsx`:
   - Responsive grid
   - Maps `MediaCard` items
   - Handles loading skeleton state
5. Build `src/components/media/media-lightbox.tsx`:
   - Full-screen overlay for photo or video
   - Photo: full-size image
   - Video: `<video>` element with controls (no autoplay)
   - Close button, keyboard ESC support
6. Build `src/app/w/[slug]/gallery/page.tsx`:
   - TanStack Query for media pagination
   - Filter tabs: All / Photos / Videos
   - Shows `MediaGrid` and `MediaLightbox`
   - Empty state and gallery-disabled state
7. Do not autoplay videos — must require user action.
8. Add pagination or "Load More" button.

## Files and Folders Likely to Be Created or Modified

- `src/modules/media/media.repository.ts` (add public query)
- `src/app/api/v1/public/weddings/[slug]/media/route.ts`
- `src/components/media/media-card.tsx`
- `src/components/media/media-grid.tsx`
- `src/components/media/media-lightbox.tsx`
- `src/app/w/[slug]/gallery/page.tsx`

## Testing Requirements

- Gallery shows only visible media (not hidden/deleted)
- Pagination returns different pages
- MediaType filter returns correct results
- Gallery disabled → empty/disabled state shown
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Gallery page at `/w/[slug]/gallery` loads
- [ ] Photos display in grid
- [ ] Videos show play icon overlay
- [ ] Clicking photo opens lightbox
- [ ] Lightbox video plays on click, no autoplay
- [ ] "All / Photos / Videos" filter tabs work
- [ ] Pagination or "Load More" works
- [ ] Hidden media NOT visible
- [ ] Gallery disabled → appropriate message shown
- [ ] Mobile layout: 2-column grid
- [ ] Lazy loading: images below fold not loaded until scrolled

## Acceptance Criteria

- [ ] Public gallery API returns only visible media
- [ ] Gallery is paginated
- [ ] Hidden/deleted media excluded
- [ ] Lightbox works for photos and videos
- [ ] No autoplay for videos
- [ ] Mobile-first layout

## Git Commit Recommendation

```
feat: add guest gallery
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 23 to Completed Phases
- Set Current Phase to Phase 24
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 23: Guest Gallery.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 10 — Public Gallery, Section 37)
- docs/ui_ux.md (Guest gallery section)

Your task is to build the public guest gallery.

Backend:
1. Create GET /api/v1/public/weddings/:slug/media:
   - Find wedding by slug
   - If galleryEnabled is false: return empty data or appropriate response
   - Query visible media only (status not HIDDEN and not DELETED)
   - Support mediaType filter and pagination (page, pageSize)

Frontend:
2. Build src/components/media/media-card.tsx:
   - Uses next/image for lazy-loaded thumbnails
   - Video items show play icon overlay
   - Tappable with onSelect callback

3. Build src/components/media/media-grid.tsx:
   - Responsive CSS grid: 2 cols mobile, 3-4 desktop
   - Loading skeleton state

4. Build src/components/media/media-lightbox.tsx:
   - Full-screen overlay for photo or video
   - Photo: full-size image
   - Video: <video controls> with NO autoplay
   - Close on ESC key and close button

5. Build src/app/w/[slug]/gallery/page.tsx:
   - Filter tabs: All / Photos / Videos
   - TanStack Query for paginated data
   - MediaGrid + MediaLightbox
   - Empty state
   - Gallery-disabled message if galleryEnabled is false
   - Pagination or "Load More" button

RULES:
- No autoplay for videos
- Only show media with status UPLOADED or APPROVED
- Never show status HIDDEN or DELETED
- Lazy-load images (use next/image with loading="lazy" or priority=false)

After completing:
- Test filtering, pagination, hidden media exclusion
- Test on mobile viewport
- Run npm run lint — must pass

Update PROGRESS.md: Phase 23 completed, Current Phase → Phase 24.

Commit with:
git commit -m "feat: add guest gallery"
```
