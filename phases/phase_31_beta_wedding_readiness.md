# Phase 31 — Beta Wedding Readiness

## Goal

Complete all final preparation for inviting the first beta weddings: create the beta landing page, write the beta onboarding checklist, verify all operational flows work, prepare staff training materials, and confirm the support/debug process.

## Why This Phase Matters

Going from "technically deployed" to "ready for a real wedding" requires more than a working app. Organizers need to understand how to set up Event Mode. Staff need clear instructions for the first run. A debug checklist helps you support the first event remotely. This phase closes the gap between deployment and beta readiness.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/beta_plan.md`
- `docs/beta_wedding_checklist.md` (this is the per-wedding readiness checklist — use it as the source for the beta simulation and onboarding checklist UI)
- `docs/event_operations.md` (operational procedures to embed in the onboarding guide)
- `docs/staff_training_guide.md` (bilingual staff guide — link or embed in the app)
- `docs/risk_register.md`

## Dependencies

- Phase 30 complete (production deployed and working)

## Scope

### Product

- Beta landing/signup page at `/beta`:
  - "WedPass is currently in free beta"
  - Request access form (name, email, wedding date, expected guest count)
  - What to expect (free, offline check-in, media collection, beta feedback)

- Public landing page at `/`:
  - Simple hero section: product name, tagline, CTA to request beta access
  - Brief description of what WedPass does

### Documentation (in app or as static pages)

- Organizer onboarding checklist page (internal or in-app guide):
  - Step 1: Create your wedding
  - Step 2: Add or import your guest list
  - Step 3: Generate QR codes and share with guests
  - Step 4: Add staff access (generate one token per check-in device)
  - Step 5: Enable Event Mode (the day before or morning of)
  - Step 6: Each staff device downloads the offline pack
  - Step 7: Check in guests on the wedding day
  - Step 8: After the event — ensure all devices sync

- Beta Feedback Collection:
  - Verify `BetaFeedbackForm` is accessible and working
  - Send feedback link to beta organizers after their wedding

### Operational Checks

- Run through the full "Beta Wedding Simulation" manually:
  1. Organizer creates wedding
  2. Import 20 guests via CSV
  3. Generate and check QR codes
  4. Enable Event Mode
  5. Two staff devices download offline pack
  6. Both devices go offline
  7. Check in 10 guests each (with some duplicates)
  8. Come online and sync both devices
  9. Confirm dashboard stats are correct
  10. Upload 5 test photos via guest upload page
  11. Organizer moderates media
  12. Submit beta feedback

## Explicitly Out of Scope

- Full marketing website
- Payment processing
- Public waitlist automation
- Invitation emails

## Implementation Tasks

1. Build or enhance `src/app/(public)/page.tsx` (landing page):
   - Hero: WedPass logo/name, tagline: "Offline-first wedding guest check-in and memory collection"
   - Brief feature list: guest management, offline check-in, photo/video collection
   - CTA button: "Request Beta Access" → /beta

2. Build `src/app/(public)/beta/page.tsx`:
   - Beta request form: name, email, wedding date, country, estimated guest count, any questions
   - Stores in DB or sends to organizer email (or just a mailto: link if DB table not yet implemented)
   - "Thank you for requesting access" state

3. Create `src/app/dashboard/wedding/[weddingId]/checkins/page.tsx` (verify from Phase 20):
   - Ensure it shows the operational check-in stats needed on wedding day

4. Run the full beta wedding simulation (listed above).

5. Fix any issues found during simulation.

6. Prepare a simple beta support doc (can be a markdown file in repo):
   - Common issues and solutions
   - How to check sync logs
   - Emergency contacts (your email)
   - What to do if offline pack fails to download

## Files and Folders Likely to Be Created or Modified

- `src/app/(public)/page.tsx`
- `src/app/(public)/beta/page.tsx`
- `docs/beta_support_guide.md` (optional — for your own reference)

## Testing Requirements

- Landing page loads at production URL
- Beta request form works
- Full beta simulation completes without errors
- All previously passing tests still pass
- `npm run lint` passes

## Manual QA Checklist — Beta Wedding Simulation

- [ ] Organizer creates wedding and imports CSV
- [ ] QR codes generated for all guests
- [ ] Event Mode enabled without errors
- [ ] Staff device 1 downloads offline pack
- [ ] Staff device 2 downloads offline pack
- [ ] Both devices go offline — check-in works
- [ ] Both devices come online — sync works
- [ ] Dashboard shows correct check-in stats
- [ ] Guest upload works on mobile
- [ ] Organizer gallery shows photos
- [ ] Media hide/delete works
- [ ] Beta feedback form works

## Acceptance Criteria

- [ ] Landing page live at production URL
- [ ] Beta request page works
- [ ] Full beta wedding simulation completes without errors
- [ ] All tests pass
- [ ] Ready to invite first 3–5 beta weddings

## Git Commit Recommendation

```
docs: add beta wedding readiness workflow
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 31 to Completed Phases
- Set Current Phase: V1.0 Complete — Begin Beta
- Record: beta simulation results, production URL, invite status
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 31: Beta Wedding Readiness.

Before starting, read:
- CLAUDE.md
- docs/beta_plan.md
- docs/beta_wedding_checklist.md — use this as the step-by-step per-wedding checklist for the beta simulation and as the basis for the organizer onboarding checklist page
- docs/event_operations.md — use for operational guidance to include in the onboarding materials
- docs/staff_training_guide.md — this is the bilingual staff guide; consider linking to it or embedding key sections in the app's staff help page
- docs/risk_register.md

Your task is to complete final preparation for the first beta weddings.

1. Build/update src/app/(public)/page.tsx (landing page):
   - Clear product name and tagline
   - Brief description of what WedPass does
   - CTA: "Request Beta Access" → /beta

2. Build src/app/(public)/beta/page.tsx:
   - Beta request form: name, email, wedding date, country, estimated guest count
   - Store submission or display a thank-you message
   - Simple form, no complex validation needed

3. Run the full beta wedding simulation manually in production:
   a. Create wedding
   b. Import CSV with 20 test guests
   c. Generate QR codes
   d. Enable Event Mode
   e. Create two staff tokens
   f. Both devices download offline pack
   g. Both devices go offline, check in 10 guests each (with some duplicates)
   h. Sync both devices
   i. Verify dashboard stats
   j. Guest uploads 5 test photos via /w/[slug]/upload
   k. Organizer views and moderates gallery
   l. Submit beta feedback form

4. Fix any issues found during the simulation.

5. Verify the app is ready to receive the first 3–5 beta weddings.

After completing:
- Record beta simulation results in PROGRESS.md
- List the production URL

Update PROGRESS.md: Phase 31 completed, Current Phase → V1.0 Complete — Begin Beta.

Commit with:
git commit -m "docs: add beta wedding readiness workflow"

Final report: confirm WedPass is beta-ready, list any remaining concerns.
```
