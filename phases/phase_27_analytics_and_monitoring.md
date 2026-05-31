# Phase 27 — Analytics and Monitoring Foundation

## Goal

Set up Sentry for error monitoring, add structured logging for key operational events, build the organizer dashboard with real stats, and create the beta feedback form. This is the observability layer that makes beta debugging possible.

## Why This Phase Matters

WedPass is being used at real weddings where problems are high-stakes. Sentry ensures errors are caught before beta users report them. Structured logging of sync attempts, failures, and duplicates is essential for diagnosing event-day issues. The feedback form collects the data needed to improve the product.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/analytics_and_monitoring.md`
- `docs/api_contracts.md` (Part 11 — Feedback API, Part 8 — Stats API)
- `docs/env_and_deployment.md` (Sentry setup section)

## Dependencies

- Phase 20 complete (stats endpoints)

## Scope

### Error Monitoring

- Sentry integration for Next.js
- Captures frontend and backend errors
- Environment-specific configuration

### Structured Logging

- Log key events (using console.log with structured JSON for now, or Pino/Winston):
  - Snapshot downloads (staffDeviceId, weddingId, guestCount)
  - Sync attempts (weddingId, deviceId, payloadCount)
  - Sync failures (weddingId, deviceId, error)
  - Duplicate check-ins (weddingId, guestId, timestamps)
  - Media upload failures (weddingId, mimeType, fileSizeBytes)
  - Media moderation actions (weddingId, mediaId, action)

### Dashboard Stats

- `src/app/dashboard/wedding/[weddingId]/page.tsx` — update with real data:
  - Total guests
  - Checked-in guests
  - Pending guests
  - Check-in percentage
  - Total media uploads
  - Last sync time

### Beta Feedback Form

- `src/components/shared/beta-feedback-form.tsx`
- `src/app/dashboard/wedding/[weddingId]/settings/page.tsx` — add feedback section
- `POST /api/v1/weddings/:weddingId/feedback` (should exist from API contracts)

## Explicitly Out of Scope

- Advanced analytics dashboards
- BI/reporting tools
- External analytics integrations (Mixpanel, Amplitude)
- Alerts/PagerDuty

## Implementation Tasks

1. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
2. Configure `sentry.client.config.ts` and `sentry.server.config.ts`.
3. Add `SENTRY_DSN` to `.env.example` (already should be there).
4. Create a logging utility `src/lib/utils/logger.ts`:
   ```ts
   export function logEvent(event: string, data: Record<string, unknown>) {
     console.log(JSON.stringify({ event, ...data, timestamp: new Date().toISOString() }));
   }
   ```
5. Add `logEvent` calls in:
   - Snapshot download endpoint
   - Sync service (attempt, success, failure, duplicate)
   - Media upload confirm endpoint
   - Media moderation endpoints
6. Update `src/app/dashboard/wedding/[weddingId]/page.tsx`:
   - Use TanStack Query to fetch `/api/v1/weddings/:weddingId/stats`
   - Show real stat cards
7. Create `src/modules/feedback/` module:
   - `feedback.schemas.ts` — Zod schema
   - `feedback.repository.ts` — create beta_feedback record
   - `feedback.service.ts`
8. Create `POST /api/v1/weddings/:weddingId/feedback` route handler.
9. Build `src/components/shared/beta-feedback-form.tsx`:
   - Rating (1–10)
   - "What worked well?" text area
   - "What was confusing?" text area
   - "How was offline check-in?" text area
   - "How was media upload?" text area
   - Submit button
10. Add feedback form to settings page.

## Files and Folders Likely to Be Created or Modified

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `src/lib/utils/logger.ts`
- `src/modules/feedback/`
- `src/app/api/v1/weddings/[weddingId]/feedback/route.ts`
- `src/components/shared/beta-feedback-form.tsx`
- `src/app/dashboard/wedding/[weddingId]/page.tsx`
- Various service files (add logEvent calls)

## Testing Requirements

- Sentry captures an intentional test error in dev mode
- Stats API returns correct data
- Feedback form submits successfully
- feedback table has record after submit
- `npm run lint` passes

## Manual QA Checklist

- [ ] Dashboard shows real guest/check-in/media stats
- [ ] Stats update after new check-ins sync
- [ ] Feedback form visible in settings
- [ ] Feedback form submits and shows confirmation
- [ ] Sentry dashboard shows test error
- [ ] Log output contains structured JSON events

## Acceptance Criteria

- [ ] Sentry configured and working
- [ ] Key events are logged
- [ ] Dashboard shows real stats
- [ ] Beta feedback form submits correctly
- [ ] Build and lint pass

## Git Commit Recommendation

```
feat: add analytics and monitoring foundation
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 27 to Completed Phases
- Set Current Phase to Phase 28
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 27: Analytics and Monitoring Foundation.

Before starting, read:
- CLAUDE.md
- docs/analytics_and_monitoring.md
- docs/api_contracts.md (Part 11 — Feedback API)
- docs/env_and_deployment.md (Sentry section)

Your task is to add observability and the beta feedback form.

1. Install @sentry/nextjs and run the Sentry wizard for Next.js App Router.
   Configure sentry.client.config.ts and sentry.server.config.ts.
   Add SENTRY_DSN to .env.example.

2. Create src/lib/utils/logger.ts — structured event logging utility:
   logEvent(event: string, data: Record<string, unknown>): void
   Logs JSON to console (can be upgraded to a proper logging service later).

3. Add logEvent calls in:
   - Snapshot download endpoint (snapshot downloaded event)
   - Sync service (sync attempt, sync success, sync failure, duplicate check-in)
   - Media upload confirm (upload confirmed event)
   - Media moderation (hide/delete events)

4. Update dashboard page src/app/dashboard/wedding/[weddingId]/page.tsx:
   - Use TanStack Query to fetch /api/v1/weddings/:weddingId/stats
   - Display real stat cards: totalGuests, checkedInGuests, pendingGuests, checkinPercentage, totalMediaUploads

5. Create feedback module: src/modules/feedback/
   - feedback.schemas.ts (Zod: rating 1-10, workedWell, confusing, offlineFeedback, mediaFeedback, generalComment)
   - feedback.repository.ts
   - feedback.service.ts

6. Create POST /api/v1/weddings/:weddingId/feedback route handler.

7. Build src/components/shared/beta-feedback-form.tsx and add to settings page.

After completing:
- Test Sentry by triggering an intentional error (throw new Error in dev)
- Test feedback form submission
- Verify dashboard shows real stats
- Run npm run lint — must pass

Update PROGRESS.md: Phase 27 completed, Current Phase → Phase 28.

Commit with:
git commit -m "feat: add analytics and monitoring foundation"
```
