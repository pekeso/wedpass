# Phase 29 — End-to-End Testing

## Goal

Write the full suite of Playwright E2E tests covering the complete WedPass user journeys: organizer setup, staff offline check-in, multi-device sync, media upload, and gallery moderation. These tests prove the system is beta-ready.

## Why This Phase Matters

Unit tests verify individual functions. E2E tests verify that the entire system works together as a user would experience it. Before a real wedding, you need confidence that the complete flow — from organizer creating a wedding to staff syncing check-ins — works without failures.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/testing_strategy.md`
- `docs/v1_scope.md` (Definition of Done — Section 14)
- `docs/beta_wedding_checklist.md` (use this as the source for which E2E scenarios must pass before beta)

## Dependencies

- Phase 28 complete (security hardened)
- Phase 17 complete (offline conflict tests)

## Scope

### E2E Test Suites

1. **Organizer Flows** (`tests/e2e/organizer.spec.ts`)
2. **Guest Management** (`tests/e2e/guests.spec.ts`)
3. **Staff Offline Check-In** (`tests/e2e/staff-checkin.spec.ts`)
4. **Multi-Device Sync** (`tests/e2e/multi-device-sync.spec.ts`)
5. **Media Upload and Gallery** (`tests/e2e/media.spec.ts`)
6. **Security Boundaries** (`tests/e2e/security.spec.ts`)
7. **Mobile Viewport** (`tests/e2e/mobile.spec.ts`)

## Key E2E Scenarios to Cover

### Organizer Flows

- Register → Login → Create wedding → Add guests → Enable Event Mode
- Create staff access → Share staff token
- View dashboard stats after check-ins

### Staff Offline Check-In

- Log in with staff token → Download offline pack → Go offline → Check in guest by QR → Check in guest by search → Sync → Verify server

### Multi-Device Sync

- Two Playwright browser contexts simulate two devices
- Both check in same guest offline
- Sync order: later timestamp first, then earlier
- Verify earlier timestamp is authoritative

### Media Upload

- Open guest upload page → Upload valid JPEG → Upload valid MP4 → Verify gallery shows
- Try uploading SVG → verify rejected
- Try uploading 11MB+ file → verify rejected

### Media Gallery and Moderation

- Organizer hides a media item → Verify guest gallery excludes it
- Organizer deletes a media item → Verify excluded from all views

### Security

- Access another organizer's wedding → 403
- Use staff token on organizer route → 403
- Access public gallery of private wedding → gallery-disabled message

### Mobile Viewport

- Staff check-in home is usable at 375px width
- Touch targets are large enough
- Guest upload page is usable on mobile

## Implementation Tasks

1. Ensure Playwright is installed (from Phase 17):
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```
2. Create `playwright.config.ts` if not already:
   ```ts
   import { defineConfig } from "@playwright/test";
   export default defineConfig({
     testDir: "./tests/e2e",
     use: {
       baseURL: "http://localhost:3000",
       screenshot: "on",
       video: "retain-on-failure",
     },
     projects: [
       { name: "Desktop", use: { viewport: { width: 1280, height: 720 } } },
       { name: "Mobile", use: { viewport: { width: 375, height: 812 } } },
     ],
   });
   ```
3. Create test setup helpers:
   - `tests/helpers/setup.ts` — create organizer, wedding, guests via API
   - `tests/helpers/auth.ts` — login and store token
4. Write all E2E test files listed above.
5. Run all tests, fix any failures.

## Files and Folders Likely to Be Created or Modified

- `playwright.config.ts`
- `tests/e2e/organizer.spec.ts`
- `tests/e2e/guests.spec.ts`
- `tests/e2e/staff-checkin.spec.ts`
- `tests/e2e/multi-device-sync.spec.ts`
- `tests/e2e/media.spec.ts`
- `tests/e2e/security.spec.ts`
- `tests/e2e/mobile.spec.ts`
- `tests/helpers/`

## Testing Requirements

```bash
npm run test              # all Vitest unit tests pass
npx playwright test       # all E2E tests pass
```

## Acceptance Criteria

- [ ] Full organizer setup flow passes E2E
- [ ] Staff offline check-in flow passes E2E
- [ ] Multi-device sync conflict resolves correctly in E2E
- [ ] Media upload and gallery flow passes E2E
- [ ] Security boundary tests pass
- [ ] Mobile viewport tests pass

## Git Commit Recommendation

```
test: add end-to-end beta readiness tests
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 29 to Completed Phases
- Set Current Phase to Phase 30
- Record: total E2E test count, pass count, any skipped tests
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 29: End-to-End Testing.

Before starting, read:
- CLAUDE.md
- docs/testing_strategy.md
- docs/v1_scope.md (Section 14 — Definition of Done)

Your task is to write the full suite of E2E tests proving WedPass is beta-ready.

Ensure Playwright is installed and configured (playwright.config.ts with Desktop + Mobile viewports).

Create test helper files in tests/helpers/:
- setup.ts — utilities to create test organizer, wedding, guests via API calls
- auth.ts — login and get access token

Write these E2E test files:

1. tests/e2e/organizer.spec.ts:
   - Register → Login → Create wedding → Add guest → Enable Event Mode
   - View dashboard stats

2. tests/e2e/guests.spec.ts:
   - Add guest → Edit guest → Delete guest → CSV import
   - Verify Event Mode lock prevents editing

3. tests/e2e/staff-checkin.spec.ts:
   - Log in with staff token → Download offline pack → Go offline (page.context().setOffline(true))
   - Search for guest → Check in → Verify pending count
   - Come online → Sync → Verify server has check-in

4. tests/e2e/multi-device-sync.spec.ts:
   - Two browser contexts simulate two staff devices
   - Both check in same guest offline at different times
   - Sync later-timestamp first, then earlier-timestamp
   - Verify authoritative timestamp is the earlier one

5. tests/e2e/media.spec.ts:
   - Upload JPEG → Verify in gallery
   - Upload MP4 → Verify in gallery
   - Upload SVG → Verify rejected
   - Organizer hides media → Verify excluded from guest gallery

6. tests/e2e/security.spec.ts:
   - Access another organizer's wedding → 403
   - Staff token on organizer route → 403
   - Revoked device sync attempt → 401

7. tests/e2e/mobile.spec.ts:
   - Staff check-in home at 375px is functional
   - Guest upload page at 375px is functional

Run all tests:
npx playwright test

Fix any failures before committing.

Update PROGRESS.md: Phase 29 completed, Current Phase → Phase 30.
Record total test count and pass rate.

Commit with:
git commit -m "test: add end-to-end beta readiness tests"
```
