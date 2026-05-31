# Phase 25 — Gallery Privacy Settings

## Goal

Add gallery privacy controls to the wedding settings: enable/disable the public gallery, and a default media visibility setting. Wire these settings to the guest gallery and upload pages. Also build the wedding settings page with all available V1.0 settings.

## Why This Phase Matters

Organizers must be able to control who sees the wedding gallery. Some couples want a private gallery (only accessible with the wedding link), while others may want it disabled entirely. This phase also creates the wedding settings page that will hold all configuration options.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Wedding update API, Section 13)
- `docs/v1_scope.md` (Section 7.9)
- `docs/database_schema.md` (weddings.galleryEnabled)

## Dependencies

- Phase 23 complete (guest gallery exists)
- Phase 24 complete (organizer moderation exists)

## Scope

### Backend

- `PATCH /api/v1/weddings/:weddingId` (extend to include gallery settings):
  - `galleryEnabled: boolean`

### Frontend

- `src/app/dashboard/wedding/[weddingId]/settings/page.tsx` — Wedding settings page
  - Wedding details (name, couple names, date, location, country)
  - Gallery settings:
    - Gallery Enabled toggle (switch)
    - Description: "When enabled, guests can view the gallery at [wedding link]"
  - Cover image upload (if not already in wedding creation)
  - Danger zone: maybe "Reset Event Mode" link (for beta debugging only)

### Guest Gallery Integration

- If `galleryEnabled === false`, show a friendly "Gallery not available" page at `/w/[slug]/gallery`
- Upload page should work regardless of gallery setting (guests can still upload)

## Explicitly Out of Scope

- Password-protected gallery
- Guest-specific gallery access controls
- Media approval workflow (auto-approve stays as default V1 behavior)

## Implementation Tasks

1. Verify `weddings.updateWedding()` supports `galleryEnabled` field (should be from Phase 06).
2. Build `src/app/dashboard/wedding/[weddingId]/settings/page.tsx`:
   - Form with: name, coupleNames, eventDate, location, country (editable if not in EVENT_MODE)
   - Gallery Enabled toggle (shadcn Switch component)
   - Save changes button
   - Show which fields are locked in EVENT_MODE
   - React Hook Form + Zod + TanStack Query mutation
3. Update guest gallery at `/w/[slug]/gallery`:
   - If `wedding.galleryEnabled === false`: show "The wedding gallery is private or unavailable"
4. Ensure upload page still works even when gallery is disabled (guests can still upload regardless).
5. Update wedding dashboard to reflect gallery status in a badge or info card.

## Files and Folders Likely to Be Created or Modified

- `src/app/dashboard/wedding/[weddingId]/settings/page.tsx`
- `src/app/w/[slug]/gallery/page.tsx` (update with gallery-disabled check)

## Testing Requirements

- Toggle gallery off — verify guest gallery shows disabled message
- Toggle gallery on — verify guest gallery shows media
- Settings form saves correctly
- EVENT_MODE locks some fields
- `npm run lint` passes

## Manual QA Checklist

- [ ] Settings page loads with current values
- [ ] Gallery toggle works and saves
- [ ] With gallery off: `/w/[slug]/gallery` shows disabled message
- [ ] With gallery on: gallery shows media
- [ ] Upload still works even with gallery disabled
- [ ] Fields locked in EVENT_MODE show locked state

## Acceptance Criteria

- [ ] Gallery enable/disable toggle works
- [ ] Guest gallery respects galleryEnabled flag
- [ ] Settings page form works end-to-end
- [ ] Build and lint pass

## Git Commit Recommendation

```
feat: add gallery privacy settings
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 25 to Completed Phases
- Set Current Phase to Phase 26 and Phase 27
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 25: Gallery Privacy Settings.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Wedding update API)

Your task is to build the wedding settings page and gallery privacy controls.

1. Build src/app/dashboard/wedding/[weddingId]/settings/page.tsx:
   - Form fields: name, coupleNames, eventDate, location, country
   - Gallery Enabled: shadcn Switch toggle
   - Fields should show as locked (disabled) when wedding is in EVENT_MODE
   - Submit button calls PATCH /api/v1/weddings/:weddingId
   - Uses React Hook Form + Zod + TanStack Query mutation

2. Update src/app/w/[slug]/gallery/page.tsx:
   - If wedding.galleryEnabled === false: show "This gallery is private or unavailable"
   - Upload page should still work regardless of gallery setting

3. Ensure the wedding settings page is only accessible by the authenticated organizer.

After completing:
- Toggle gallery off, verify guest gallery shows disabled message
- Toggle gallery on, verify guest gallery shows media
- Run npm run lint — must pass

Update PROGRESS.md: Phase 25 completed, Current Phase → Phase 26.

Commit with:
git commit -m "feat: add gallery privacy settings"
```
