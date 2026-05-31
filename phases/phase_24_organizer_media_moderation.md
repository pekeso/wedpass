# Phase 24 — Organizer Media Moderation

## Goal

Build the organizer media moderation interface: view all uploaded media, hide media, delete media (with confirmation), download individual items, and filter by type/status. This is the organizer's tool for managing wedding memories.

## Why This Phase Matters

Without moderation, any content uploaded to a wedding gallery is public. Organizers need easy tools to hide inappropriate content and clean up low-quality uploads. Media moderation must be straightforward and require confirmation for destructive actions.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 9 — Media API, Sections 33–35)
- `docs/v1_scope.md` (Section 7.9)
- `docs/components.md`

## Dependencies

- Phase 22 complete (media upload exists)
- Phase 24 depends on authenticated organizer (Phase 05)

## Scope

### Backend

- Extend media module:
  - `GET /api/v1/weddings/:weddingId/media` — organizer view (all statuses)
  - `POST /api/v1/weddings/:weddingId/media/:mediaId/hide`
  - `DELETE /api/v1/weddings/:weddingId/media/:mediaId`
- Media download URL (signed read URL from R2)

### Frontend

- `src/app/dashboard/wedding/[weddingId]/gallery/page.tsx`:
  - Organizer media grid (shows all media including hidden)
  - Filter tabs: All / Photos / Videos / Hidden
  - Status badge on each item
  - Per-item actions: Hide / Show / Delete / Download
  - Delete requires ConfirmDialog
  - Batch hide (nice-to-have if time permits)

### Components

- `src/components/media/organizer-media-card.tsx` — card with moderation actions
- Update `src/components/media/media-grid.tsx` if needed for organizer context

## Explicitly Out of Scope

- Bulk delete/hide (V1.0 per-item only)
- Comments/reactions
- ZIP download of all media
- Video transcoding

## Implementation Tasks

1. Create media repository additions:
   - `findGalleryMediaByWedding(weddingId, filters)` — organizer can see all statuses
   - `hideMedia(weddingId, mediaId)` — set status HIDDEN, set hiddenAt
   - `deleteMedia(weddingId, mediaId)` — set status DELETED, set deletedAt
   - `findMediaByWeddingAndId(weddingId, mediaId)` — ownership scoped
2. Add signed read URL generation for download:
   - `getReadSignedUrl(fileKey)` — generate short-lived read URL from R2
3. Create API route handlers:
   - `GET /api/v1/weddings/:weddingId/media` (organizer)
   - `POST /api/v1/weddings/:weddingId/media/:mediaId/hide`
   - `DELETE /api/v1/weddings/:weddingId/media/:mediaId`
4. Build `src/components/media/organizer-media-card.tsx`:
   - Thumbnail with status badge overlay
   - Action buttons: Hide/Show, Delete, Download
   - Hidden items shown with reduced opacity or "Hidden" overlay
5. Build `src/app/dashboard/wedding/[weddingId]/gallery/page.tsx`:
   - Filter tabs: All / Photos / Videos / Hidden
   - Organizer media grid using `OrganizerMediaCard`
   - Delete confirmation dialog
   - TanStack Query with cache invalidation on mutations
6. Ensure guest gallery (`/w/[slug]/gallery`) excludes hidden/deleted media.

## Files and Folders Likely to Be Created or Modified

- `src/modules/media/media.repository.ts` (add moderation queries)
- `src/lib/storage/r2-client.ts` (add read signed URL)
- `src/app/api/v1/weddings/[weddingId]/media/route.ts`
- `src/app/api/v1/weddings/[weddingId]/media/[mediaId]/hide/route.ts`
- `src/app/api/v1/weddings/[weddingId]/media/[mediaId]/route.ts` (DELETE)
- `src/components/media/organizer-media-card.tsx`
- `src/app/dashboard/wedding/[weddingId]/gallery/page.tsx`

## Testing Requirements

- List all media (including hidden) as organizer
- Hide a media item — verify it disappears from public gallery
- Delete a media item — verify it's soft-deleted and excluded everywhere
- Download media — verify signed URL generated
- Cross-wedding media access — verify organizer B cannot moderate organizer A's media
- Delete requires confirmation (test UI flow)
- `npm run lint` passes

## Manual QA Checklist

- [ ] Organizer gallery shows all media
- [ ] Filter tabs work (All / Photos / Videos / Hidden)
- [ ] Hide button marks item as hidden with visual indicator
- [ ] Hidden item no longer appears in guest gallery
- [ ] Delete button shows confirmation dialog
- [ ] After delete, item removed from organizer view
- [ ] Download link opens or downloads the file
- [ ] Ownership enforced (can't moderate another wedding's media)

## Acceptance Criteria

- [ ] All media API endpoints require organizer auth and wedding ownership
- [ ] Hide and delete are soft operations
- [ ] Guest gallery excludes hidden/deleted media
- [ ] Download uses R2 signed read URL
- [ ] Delete requires UI confirmation

## Git Commit Recommendation

```
feat: add organizer media moderation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 24 to Completed Phases
- Set Current Phase to Phase 25
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 24: Organizer Media Moderation.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 9 — Media API, Sections 33–35)

Your task is to build the organizer media moderation interface.

Backend:
1. Add to media.repository.ts:
   - findGalleryMediaByWedding(weddingId, filters) — organizer sees all statuses
   - hideMedia(weddingId, mediaId) — set status HIDDEN, hiddenAt
   - deleteMedia(weddingId, mediaId) — set status DELETED, deletedAt
   - findMediaByWeddingAndId(weddingId, mediaId) — ownership scoped

2. Add getReadSignedUrl(fileKey) to r2-client.ts.

3. Create route handlers (organizer auth required):
   GET /api/v1/weddings/:weddingId/media — all statuses, filterable
   POST /api/v1/weddings/:weddingId/media/:mediaId/hide
   DELETE /api/v1/weddings/:weddingId/media/:mediaId

Frontend:
4. Build src/components/media/organizer-media-card.tsx:
   - Thumbnail with status badge
   - Action buttons: Hide/Show, Delete, Download
   - Hidden items shown with overlay

5. Build src/app/dashboard/wedding/[weddingId]/gallery/page.tsx:
   - Filter tabs: All / Photos / Videos / Hidden
   - Organizer media grid
   - Delete with ConfirmDialog
   - TanStack Query mutations

RULES:
- All organizer media routes must verify wedding ownership
- Delete and hide are SOFT operations (set status, set timestamp) — never physically delete from DB in this phase
- Guest gallery (/w/[slug]/gallery) must exclude HIDDEN and DELETED media (verify this still works)

After completing:
- Test hide, delete, download, cross-wedding access denial
- Verify guest gallery excludes hidden media
- Run npm run lint — must pass

Update PROGRESS.md: Phase 24 completed, Current Phase → Phase 25.

Commit with:
git commit -m "feat: add organizer media moderation"
```
