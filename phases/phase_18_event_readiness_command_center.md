# Phase 18 — Event Readiness Command Center

## Goal

Build the organizer-facing Event Readiness Command Center: a consolidated screen showing pre-event readiness checklist, active snapshot status, staff device readiness, sync summary, and manual desk guidance. This is the organizer's control screen on the day of the wedding.

## Why This Phase Matters

The Event Readiness Command Center gives organizers confidence that everything is prepared before guests arrive. It aggregates readiness signals from different parts of the system into one clear screen. Without this, organizers have no single place to verify that staff devices are ready and the snapshot is current.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Stats API — Section 30)
- `docs/offline_sync.md` (Section 45 — Operational Checklist)
- `docs/event_operations.md` (event-day operations model, fallback procedures)
- `docs/v1_scope.md` (Section 7.10)
- `docs/components.md`

## Dependencies

- Phase 11 complete (Event Mode and snapshots)
- Phase 10 complete (staff devices)

## Scope

### Backend

- Enhance wedding stats endpoint or create event readiness endpoint:
  - `GET /api/v1/weddings/:weddingId/event-mode/readiness` (already from Phase 11, extend it)
  - Or add `GET /api/v1/weddings/:weddingId/event-day-status` combining:
    - Snapshot status (active, version, guest count, created time)
    - Staff device list (label, status, last seen)
    - Check-in stats (total, checked in, pending)
    - Latest sync times by device

### Frontend

- `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx` (extend from Phase 11):
  - Pre-event readiness checklist section (when status is ACTIVE/DRAFT)
  - Event Day Command Center section (when status is EVENT_MODE):
    - Snapshot summary card (version, guest count, created at)
    - Staff device cards (each device: label, status, last seen, downloaded?)
    - Check-in summary (total / checked in / pending)
    - Manual Desk Guidance (what to do if QR fails, who to call)
    - Emergency Instructions card (keep visible for staff)
    - "End Event / Sync Closeout" link (Phase 20)

### Components

- `src/components/wedding/event-readiness-card.tsx` — readiness checklist item
- `src/components/staff/staff-device-status-card.tsx` — per-device status card
- `src/components/wedding/snapshot-summary-card.tsx` — snapshot info
- `src/components/wedding/manual-desk-guidance.tsx` — instructions for manual fallback
- `src/components/wedding/emergency-instructions.tsx` — key contact info and fallback steps

## Explicitly Out of Scope

- Real-time updates (polling is fine, no WebSockets)
- Staff device management (Phase 10)
- Post-event closeout screen (Phase 20)

## Implementation Tasks

1. Extend `event-mode.service.ts` (or create new) to return event day status:
   - `getEventDayStatus(weddingId)`:
     - Active snapshot info
     - Staff devices with last seen time
     - Check-in count (total vs checked in)
     - Last sync time per device
2. Create or update `GET /api/v1/weddings/:weddingId/event-day-status` route handler.
3. Build `src/components/wedding/event-readiness-card.tsx`.
4. Build `src/components/staff/staff-device-status-card.tsx`.
5. Build `src/components/wedding/snapshot-summary-card.tsx`.
6. Build `src/components/wedding/manual-desk-guidance.tsx`:
   - "If QR scan fails, use Manual Search on the check-in screen"
   - "If a guest doesn't appear, check spelling or search by phone"
   - "If device loses power, check in on another device — sync later"
7. Build `src/components/wedding/emergency-instructions.tsx`:
   - Steps for staff if device crashes
   - Manual paper backup suggestion
   - Contact info placeholder
8. Update `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx`:
   - When status is EVENT_MODE: show command center layout
   - When status is DRAFT/ACTIVE: show pre-event readiness checklist
9. Add auto-refresh (polling with TanStack Query every 30 seconds) for check-in stats.

## Files and Folders Likely to Be Created or Modified

- `src/modules/weddings/event-mode.service.ts`
- `src/app/api/v1/weddings/[weddingId]/event-day-status/route.ts`
- `src/components/wedding/event-readiness-card.tsx`
- `src/components/staff/staff-device-status-card.tsx`
- `src/components/wedding/snapshot-summary-card.tsx`
- `src/components/wedding/manual-desk-guidance.tsx`
- `src/components/wedding/emergency-instructions.tsx`
- `src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx`

## Testing Requirements

- Event day status API returns correct snapshot, devices, and stats
- Snapshot details match what is in DB
- Staff device last seen updates correctly after sync
- Check-in counts match DB state
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Event Mode page shows readiness checklist when status is ACTIVE
- [ ] After enabling Event Mode, page shows command center view
- [ ] Snapshot summary card shows correct guest count
- [ ] Staff device cards show correct label and status
- [ ] Check-in stats count updates (30s polling)
- [ ] Manual desk guidance text is visible and helpful
- [ ] Emergency instructions are visible

## Acceptance Criteria

- [ ] Event day status API works
- [ ] Command center UI shows snapshot, staff devices, check-in stats
- [ ] Manual desk and emergency guidance visible
- [ ] Polling updates stats
- [ ] Build and lint pass

## Git Commit Recommendation

```
feat: add event readiness command center
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 18 to Completed Phases
- Set Current Phase to Phase 19 and Phase 20
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 18: Event Readiness Command Center.

Before starting, read:
- CLAUDE.md
- docs/offline_sync.md (Section 45 — Operational Checklist for Real Weddings)
- docs/event_operations.md (practical event-day operations, fallback procedures, manual desk guidance)
- docs/api_contracts.md (Stats section)

Your task is to build the organizer Event Readiness Command Center.

Backend:
1. Create or extend service to return event day status:
   - Active snapshot (id, version, guestCount, createdAt)
   - Staff devices (label, status, lastSeenAt)
   - Check-in counts (total, checkedIn, pending)

2. Create GET /api/v1/weddings/:weddingId/event-day-status route handler.

Frontend:
3. Build these components:
   - event-readiness-card.tsx — shows one readiness checklist item
   - staff-device-status-card.tsx — shows one staff device (label, status, last seen)
   - snapshot-summary-card.tsx — shows snapshot version, guest count, created time
   - manual-desk-guidance.tsx — instructions for QR scan failures and edge cases
   - emergency-instructions.tsx — what to do if devices crash

4. Update src/app/dashboard/wedding/[weddingId]/event-mode/page.tsx:
   - If wedding status is DRAFT or ACTIVE: show pre-event readiness checklist (from Phase 11)
   - If wedding status is EVENT_MODE: show Event Day Command Center with all component cards
   - Add TanStack Query polling (30s interval) for check-in stats

Manual desk guidance must include:
- "If QR scan fails, use Manual Search"
- "If guest not found, search by phone number"
- "If device loses power, use another device — sync later"

After completing:
- Test event day status API with an EVENT_MODE wedding
- Verify polling updates check-in counts
- Run npm run lint — must pass

Update PROGRESS.md: Phase 18 completed, Current Phase → Phase 19.

Commit with:
git commit -m "feat: add event readiness command center"
```
