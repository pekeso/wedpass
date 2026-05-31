# Phase 19 — Staff Device Readiness UI

## Goal

Build the staff-facing device readiness screen that shows whether the staff device is prepared for event day. Adds clear visual confirmation of: offline pack downloaded, snapshot version, last download time, and the help/emergency instructions staff see if something goes wrong on the day.

## Why This Phase Matters

Staff members on a wedding day are often not technical. They need a clear, unambiguous "ready / not ready" indicator before the event starts. Staff help messages also give them confidence to operate independently without calling the organizer.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/offline_sync.md` (Section 31 — Offline Pack Readiness UI)
- `docs/staff_training_guide.md` (staff help content — use as source for help messages)
- `docs/event_operations.md` (operational fallback procedures)
- `docs/ui_ux.md` (Staff mode UX)

## Dependencies

- Phase 12 complete (offline pack download)
- Phase 14B complete (staff check-in UI)

## Scope

### Frontend

- Enhance `src/app/staff/[weddingId]/download/page.tsx` (from Phase 12) with:
  - Richer readiness checklist:
    - Offline pack downloaded: ✅
    - Guest count loaded: 300 guests
    - Last downloaded: Today at 08:30 AM
    - Snapshot version: v1
  - "You are ready for event day" confirmation message when all green
  - Clear download/refresh button when not ready
  - Staff help section at the bottom

- `src/components/staff/staff-help-messages.tsx`:
  - Collapsible help panel with key troubleshooting steps
  - "What if QR scan fails?" → Use Manual Search
  - "What if I lose internet?" → Keep checking in offline, sync later
  - "What if a guest is not in the list?" → Try searching by phone, then contact organizer
  - "What if my device crashes?" → Use another device with the same staff token

- `src/app/staff/[weddingId]/help/page.tsx` (optional help page):
  - Expanded staff help guide
  - All emergency procedures visible on one page
  - Works offline (static content)

## Explicitly Out of Scope

- Editing staff access (organizer only)
- Re-downloading snapshot with different snapshot version (auto-handles in Phase 12)

## Implementation Tasks

1. Create `src/components/staff/staff-help-messages.tsx`:
   - Accordion-style help items
   - Mobile-friendly collapsible sections
   - Static content (no API calls needed)
2. Enhance `src/app/staff/[weddingId]/download/page.tsx`:
   - Add readiness checklist items using `useOfflinePackStatus`
   - Clear "Ready for Event Day" confirmation banner when all items pass
   - Add link to help page
3. Create `src/app/staff/[weddingId]/help/page.tsx`:
   - Staff help guide with troubleshooting steps
   - Works offline (all static text)
4. Link to help page from check-in home and download page.
5. Test the staff device preparation flow from login → download → check-in.

## Files and Folders Likely to Be Created or Modified

- `src/components/staff/staff-help-messages.tsx`
- `src/app/staff/[weddingId]/download/page.tsx` (enhance)
- `src/app/staff/[weddingId]/help/page.tsx`

## Testing Requirements

- Download page shows correct readiness state
- Help page loads and works offline
- All help text is accurate and clear
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Download page shows readiness checklist after download
- [ ] All checklist items show ✅ when ready
- [ ] "Ready for Event Day" banner visible when all items green
- [ ] Help messages are visible and collapsible
- [ ] Help page loads offline
- [ ] Staff help covers all main failure scenarios
- [ ] Mobile-friendly layout

## Acceptance Criteria

- [ ] Staff device readiness checklist works
- [ ] Help messages cover key scenarios
- [ ] Help page is accessible offline
- [ ] No API calls for help content
- [ ] Build and lint pass

## Git Commit Recommendation

```
feat: add staff device readiness ui
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 19 to Completed Phases
- Set Current Phase to Phase 20
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 19: Staff Device Readiness UI.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Section 31 — Offline Pack Readiness UI)
- docs/staff_training_guide.md (use the help content from this guide as the source for staff help messages — it is available in English and French)
- docs/event_operations.md (operational fallback procedures — use to inform the emergency instructions component)
- docs/ui_ux.md (Staff mode section)

Your task is to build the staff device readiness experience.

1. Create src/components/staff/staff-help-messages.tsx:
   Accordion-style collapsible help panel with:
   - "QR scan failed" → Use Manual Search
   - "No internet" → Keep checking in offline, sync later
   - "Guest not in list" → Search by phone, contact organizer if needed
   - "Device crashed" → Use another device with same staff token

2. Enhance src/app/staff/[weddingId]/download/page.tsx:
   - Show readiness checklist using useOfflinePackStatus:
     Offline pack downloaded: ✅ / ❌
     Guest count: {n} guests loaded
     Last downloaded: {time}
     Snapshot version: v{n}
   - Show green "Ready for Event Day" banner when all items pass
   - Include link to help page
   - Show staff help messages at bottom

3. Create src/app/staff/[weddingId]/help/page.tsx:
   - Full staff help guide (static content)
   - Works offline
   - Link back to download/check-in

UI rules: Mobile-first, h-14 minimum touch targets, large text.

After completing:
- Test readiness checklist with and without downloaded snapshot
- Test help page loads offline (DevTools → Offline)
- Run npm run lint — must pass

Update PROGRESS.md: Phase 19 completed, Current Phase → Phase 20.

Commit with:
git commit -m "feat: add staff device readiness ui"
```
