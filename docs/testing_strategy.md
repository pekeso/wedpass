# WedPass Testing Strategy

## 1. Document Purpose

This document defines the testing strategy for **WedPass V1.0**.

WedPass is an offline-first wedding guest check-in and photo/video collection platform. The most important product promise is reliability during real weddings, especially when the internet is unreliable.

This testing strategy focuses on:

- Offline check-in reliability
- Multi-device synchronization
- Data integrity
- Media upload reliability
- Mobile-first usability
- Security validation
- API correctness
- Beta readiness

---

## 2. Testing Philosophy

WedPass testing must focus on real event failure conditions, not only happy paths.

The core testing principle is:

> If the internet fails during a wedding, WedPass must still protect check-in data.

Therefore, the highest-priority tests are:

1. Offline check-in tests
2. Sync queue tests
3. Multi-device duplicate tests
4. Snapshot download tests
5. Media upload failure tests
6. Mobile staff workflow tests

---

## 3. Testing Goals

WedPass V1.0 testing must prove that:

- Organizer flows work end-to-end
- Staff devices can operate offline
- Local check-ins persist after browser refresh
- Sync is idempotent and retry-safe
- Duplicate check-ins are resolved deterministically
- Guest media uploads work safely
- Public gallery excludes hidden/deleted media
- Protected APIs enforce authorization
- App works on mobile screen sizes
- Beta users can complete real event flows

---

## 4. Testing Stack

Recommended tools:

```text
Unit tests:        Vitest
Component tests:   React Testing Library
E2E tests:         Playwright
API tests:         Vitest or Playwright API testing
Mocking:           MSW where useful
Linting:           ESLint
Type checking:     TypeScript
Error monitoring:  Sentry
```

---

## 5. Test Categories

WedPass should use the following test categories:

1. Unit tests
2. Component tests
3. Integration tests
4. API tests
5. Offline/PWA tests
6. E2E tests
7. Security tests
8. Performance tests
9. Manual beta acceptance tests

---

# Part 1 — Unit Testing

---

## 6. Unit Test Priorities

Unit tests should focus on pure logic and critical services.

Highest priority unit test areas:

- Offline local check-in service
- Sync result processing
- Conflict resolution logic
- Zod validation schemas
- QR token utilities
- Media validation utilities
- CSV parsing and validation
- Authorization helpers

---

## 7. Offline Local Check-In Tests

File example:

```text
src/lib/offline/checkins/checkin-local-service.test.ts
```

Test cases:

### 7.1 Guest Can Be Checked In Locally

Given:

- Guest exists in IndexedDB
- Guest is not checked in

When:

- `checkInGuestLocally(guestId)` is called

Then:

- Guest is marked checked in
- `checkedInAt` is set
- Sync queue item is created
- Result status is `checked_in_locally`

---

### 7.2 Duplicate Local Check-In Is Prevented

Given:

- Guest exists in IndexedDB
- Guest is already checked in

When:

- `checkInGuestLocally(guestId)` is called

Then:

- No new queue item is created
- Result status is `already_checked_in`
- Existing timestamp is preserved

---

### 7.3 Guest Not Found Locally

Given:

- Guest does not exist in IndexedDB

When:

- `checkInGuestLocally(guestId)` is called

Then:

- Error is returned or thrown
- No queue item is created

---

### 7.4 Check-In Writes Are Transactional

Given:

- Guest exists
- Queue write fails

Then:

- Guest should not be partially updated without queue item

This is important to avoid data corruption.

---

## 8. Sync Result Processing Tests

File example:

```text
src/lib/offline/checkins/sync-result-processor.test.ts
```

Test cases:

### 8.1 Accepted Result

Given:

```text
status = ACCEPTED
```

Then:

- Queue item is marked synced
- Guest is marked checked in
- Guest timestamp is updated to authoritative timestamp

---

### 8.2 Duplicate Result

Given:

```text
status = DUPLICATE
```

Then:

- Queue item is marked synced
- Guest is marked checked in
- Guest timestamp is updated to authoritative timestamp

---

### 8.3 Rejected Result

Given:

```text
status = REJECTED
```

Then:

- Queue item is not marked synced
- Error reason is stored
- Guest state is not silently erased

---

### 8.4 Snapshot Mismatch

Given:

```text
status = SNAPSHOT_MISMATCH
```

Then:

- Sync is stopped
- Warning state is set
- Queue is preserved

---

## 9. Conflict Resolution Unit Tests

File example:

```text
src/modules/sync/sync.service.test.ts
```

Test cases:

### 9.1 First Check-In Accepted

No existing check-in.

Incoming check-in should be accepted.

---

### 9.2 Later Duplicate Rejected as Duplicate

Existing accepted check-in:

```text
14:01
```

Incoming check-in:

```text
14:03
```

Result:

```text
DUPLICATE
```

Authoritative timestamp:

```text
14:01
```

---

### 9.3 Earlier Check-In Overrides Later Sync

Existing accepted check-in:

```text
14:03
```

Incoming check-in:

```text
14:01
```

Result:

- Incoming becomes accepted
- Existing becomes duplicate
- Authoritative timestamp becomes 14:01

---

### 9.4 Same Queue Item Retried

Given:

- Same `staffDeviceId + queueId` already processed

Then:

- Endpoint returns previous authoritative result
- No duplicate accepted check-in is created

---

## 10. Validation Schema Tests

Test Zod schemas for:

- Register input
- Login input
- Create wedding input
- Create guest input
- Import guests input
- Enable Event Mode input
- Sync check-ins input
- Media upload URL input
- Media confirm input
- Feedback input

Test:

- Valid payloads
- Missing required fields
- Invalid types
- Boundary values
- Over-limit values

---

## 11. Media Validation Unit Tests

Test:

- Allowed MIME types
- Rejected MIME types
- Image size limit
- Video size limit
- Missing file metadata
- Invalid duration
- Unsafe extensions

Allowed V1 types:

```text
image/jpeg
image/png
video/mp4
```

Rejected examples:

```text
image/svg+xml
application/javascript
text/html
application/x-msdownload
```

---

## 12. CSV Import Unit Tests

Test:

- Valid CSV rows
- Missing full name
- Invalid allowed guest number
- Duplicate rows
- Empty file
- Large file
- Extra columns
- Phone/email optional behavior

---

# Part 2 — Component Testing

---

## 13. Component Test Priorities

Component tests should focus on important state rendering.

Components to test:

- StatusBadge
- SyncStatusBar
- GuestCheckinCard
- EventReadinessChecklist
- UploadProgressItem
- MediaCard
- EmptyState
- ConfirmDialog

---

## 14. SyncStatusBar Tests

Test states:

```text
Online · All synced
Offline · 12 pending
Syncing · 8 pending
Sync failed · Retrying
```

Assertions:

- Correct label appears
- Correct variant/color class appears
- Pending count displays correctly

---

## 15. GuestCheckinCard Tests

Test states:

- Not checked in
- Already checked in
- Checked in locally
- Sync pending
- Loading/submitting

Assertions:

- Correct CTA displayed
- Already checked-in timestamp appears
- Check-in button disabled when appropriate

---

## 16. UploadProgressItem Tests

Test states:

- Pending
- Uploading
- Failed
- Uploaded

Assertions:

- Progress bar displays
- Retry button appears only when failed
- Success status appears when uploaded

---

# Part 3 — Integration Testing

---

## 17. Integration Test Priorities

Integration tests verify that modules work together.

Priority integration flows:

1. Organizer creates wedding
2. Organizer imports guests
3. Organizer enables Event Mode
4. Staff downloads snapshot
5. Staff checks in guest locally
6. Staff syncs queue
7. Guest uploads media
8. Organizer hides media
9. Public gallery excludes hidden media

---

## 18. Event Mode Integration Test

Flow:

1. Create organizer.
2. Create wedding.
3. Add guests.
4. Enable Event Mode.
5. Verify snapshot created.
6. Verify snapshot guest count.
7. Verify wedding status is `EVENT_MODE`.
8. Verify guest editing is blocked.

Expected result:

```text
Event Mode creates a consistent locked snapshot.
```

---

## 19. Snapshot Download Integration Test

Flow:

1. Create wedding in Event Mode.
2. Create staff device.
3. Request snapshot using staff token.
4. Verify response includes snapshot metadata.
5. Verify response includes guests.
6. Verify no unauthorized fields are returned.

Expected result:

```text
Staff receives only the data needed for offline check-in.
```

---

## 20. Sync Endpoint Integration Test

Flow:

1. Create wedding in Event Mode.
2. Create snapshot.
3. Create staff device.
4. Send sync payload.
5. Verify check-in stored.
6. Retry same payload.
7. Verify no duplicate accepted check-in.

Expected result:

```text
Sync endpoint is idempotent.
```

---

## 21. Media Upload Integration Test

Flow:

1. Request signed upload URL.
2. Verify file type validation.
3. Confirm upload metadata.
4. Verify media appears in organizer media list.
5. Verify media appears in public gallery if visible.

Expected result:

```text
Media metadata is created only after confirmation.
```

---

# Part 4 — API Testing

---

## 22. API Test Coverage

API tests should cover:

- Auth endpoints
- Wedding CRUD
- Guest CRUD
- CSV import
- Event Mode
- Staff devices
- Snapshot download
- Check-in sync
- Media upload URL
- Media confirm
- Public gallery
- Feedback

---

## 23. Auth API Tests

Test:

- Register success
- Register duplicate email
- Login success
- Login wrong password
- `/auth/me` with token
- `/auth/me` without token

---

## 24. Authorization API Tests

Test:

- Organizer cannot access another organizer's wedding
- Organizer cannot edit guest in another wedding
- Staff cannot access organizer APIs
- Public user cannot access dashboard APIs
- Revoked staff device cannot sync

---

## 25. Event Mode API Tests

Test:

- Enable Event Mode success
- Enable Event Mode without guests
- Enable Event Mode twice
- Guest editing blocked after Event Mode
- Snapshot active after enable

---

## 26. Sync API Tests

Test:

- Valid sync
- Invalid staff token
- Revoked staff device
- Invalid snapshot version
- Guest not in snapshot
- Duplicate queue ID
- Multi-device duplicate guest
- Future timestamp rejection

---

## 27. Media API Tests

Test:

- Valid image upload URL
- Valid video upload URL
- Unsupported MIME type rejected
- File too large rejected
- Confirm upload success
- Confirm invalid file key rejected
- Hidden media excluded from public gallery
- Deleted media excluded from public gallery

---

# Part 5 — Offline and PWA Testing

---

## 28. Offline Test Priorities

Offline behavior is mission-critical.

The following must be tested manually and with Playwright where possible.

---

## 29. Offline Pack Download Test

Flow:

1. Login as staff.
2. Download snapshot.
3. Turn off internet.
4. Refresh page.
5. Open check-in home.
6. Search guest.

Expected:

```text
Guest search works offline.
```

---

## 30. Offline Check-In Test

Flow:

1. Download snapshot.
2. Turn off internet.
3. Check in 10 guests.
4. Confirm pending sync count is 10.
5. Refresh browser.
6. Confirm check-ins still appear.
7. Restore internet.
8. Sync.
9. Confirm pending count becomes 0.

Expected:

```text
No check-in data is lost.
```

---

## 31. Multi-Device Offline Test

Use two browser contexts or two devices.

Flow:

1. Device A downloads snapshot.
2. Device B downloads same snapshot.
3. Both go offline.
4. Both check in the same guest.
5. Device B syncs later timestamp first.
6. Device A syncs earlier timestamp second.
7. Verify authoritative timestamp is earlier one.

Expected:

```text
Earliest timestamp wins.
```

---

## 32. Browser Refresh Test

Flow:

1. Go offline.
2. Check in guest.
3. Refresh browser.
4. Open sync status page.

Expected:

- Guest remains checked in locally
- Queue item still exists
- Pending count still correct

---

## 33. Device Sleep Test

Manual test:

1. Check in guests offline.
2. Lock phone screen or let device sleep.
3. Reopen browser.
4. Verify data remains.
5. Sync when online.

Expected:

```text
Data persists.
```

---

# Part 6 — End-to-End Testing

---

## 34. E2E Flow 1: Organizer Setup

Flow:

1. Register organizer.
2. Create wedding.
3. Add guests.
4. Import CSV.
5. View QR codes.
6. Enable Event Mode.

Expected:

```text
Organizer can prepare wedding for event day.
```

---

## 35. E2E Flow 2: Staff Check-In

Flow:

1. Staff logs in.
2. Staff downloads offline pack.
3. Staff opens check-in home.
4. Staff searches guest.
5. Staff checks in guest.
6. Staff syncs.

Expected:

```text
Staff can complete check-in workflow.
```

---

## 36. E2E Flow 3: Guest Upload

Flow:

1. Guest opens wedding page.
2. Guest selects image.
3. Upload starts.
4. Upload confirms.
5. Guest opens gallery.
6. Uploaded media appears.

Expected:

```text
Guest can upload and view wedding media.
```

---

## 37. E2E Flow 4: Media Moderation

Flow:

1. Organizer opens gallery management.
2. Organizer hides uploaded media.
3. Guest opens public gallery.
4. Hidden media does not appear.

Expected:

```text
Media visibility is enforced.
```

---

# Part 7 — Security Testing

---

## 38. Security Test Priorities

Test:

- Auth protection
- Wedding-scoped access
- Staff token scope
- Rate limiting
- File validation
- Public data exposure
- Hidden/deleted media visibility

---

## 39. Cross-Wedding Access Test

Scenario:

- User A owns Wedding A
- User B owns Wedding B

Test:

- User A cannot access Wedding B
- User A cannot access guests from Wedding B
- User A cannot access media from Wedding B

Expected:

```text
FORBIDDEN
```

---

## 40. Staff Token Scope Test

Staff token should not access:

- Guest edit APIs
- Wedding edit APIs
- Media moderation APIs
- Organizer dashboard APIs

Expected:

```text
FORBIDDEN
```

---

## 41. Upload Abuse Test

Test:

- Unsupported file rejected
- Oversized file rejected
- Repeated upload URL requests rate-limited
- SVG rejected
- HTML file rejected

---

## 42. Public Gallery Exposure Test

Test:

- Hidden media not visible
- Deleted media not visible
- Guest list not visible
- Staff devices not visible
- Organizer email not visible

---

# Part 8 — Performance Testing

---

## 43. Performance Targets

V1.0 targets:

```text
Local guest search: under 200ms for 1,000 guests
Local check-in write: under 500ms
Sync batch of 100: under 2 seconds under normal network
Guest gallery initial load: under 3 seconds on moderate mobile network
```

---

## 44. Guest List Performance Test

Test with:

```text
1,000 guests
```

Verify:

- Dashboard guest list paginates
- Staff local search is fast
- QR lookup is instant
- Mobile UI remains usable

---

## 45. Sync Performance Test

Test:

- 100 queued check-ins
- 500 queued check-ins
- Retry after failure
- 5 devices syncing around same time

Verify:

- No data loss
- No duplicate accepted check-ins
- Sync logs are created
- API does not timeout under expected load

---

## 46. Media Performance Test

Test:

- 100 images
- 500 images
- 10 videos
- Slow network upload
- Failed upload retry

Verify:

- Gallery pagination works
- Images lazy load
- Videos do not autoplay
- Upload progress remains clear

---

# Part 9 — Manual Beta Acceptance Tests

---

## 47. Pre-Beta Wedding Checklist

Before using WedPass at a real wedding:

- [ ] Organizer account created
- [ ] Wedding created
- [ ] Guest list imported
- [ ] QR codes generated
- [ ] Event Mode enabled
- [ ] Staff devices created
- [ ] Offline pack downloaded on each staff device
- [ ] Manual search tested on each device
- [ ] QR scan tested on each device
- [ ] Offline check-in tested
- [ ] Sync tested after reconnecting
- [ ] Guest upload page tested
- [ ] Gallery tested
- [ ] Organizer knows how to view pending sync count

---

## 48. During-Beta Observations

Track:

- Number of guests checked in
- Number of staff devices used
- Offline duration
- Pending sync count during event
- Sync failures
- Duplicate conflicts
- Number of media uploads
- Upload failures
- Guest confusion points
- Staff confusion points

---

## 49. Post-Beta Validation

After each wedding:

- Confirm all devices synced
- Confirm pending sync count is zero
- Compare expected check-in count with dashboard
- Review sync logs
- Review media upload count
- Collect organizer feedback
- Collect staff feedback if possible
- Document issues and improvements

---

# Part 10 — Regression Testing

---

## 50. Regression Test Suite

Before each beta deployment, run:

- Auth tests
- Guest CRUD tests
- Event Mode tests
- Offline check-in tests
- Sync tests
- Media upload tests
- Public gallery tests
- Authorization tests

No deployment should proceed if offline check-in tests fail.

---

## 51. Critical Regression Blockers

A release must be blocked if:

- Offline check-in fails
- Sync queue loses data
- Duplicate sync creates multiple accepted check-ins
- Staff cannot download snapshot
- Hidden media appears publicly
- Organizer can access another wedding
- Media upload accepts unsafe file types
- Production build fails

---

# Part 11 — Test Data

---

## 52. Recommended Test Weddings

Create seed data for:

### Small Wedding

```text
100 guests
1 staff device
50 media uploads
```

### Medium Wedding

```text
300 guests
3 staff devices
200 media uploads
```

### Large Wedding

```text
1,000 guests
5 staff devices
500 media uploads
```

---

## 53. Test Guest Variations

Include:

- Duplicate names
- Missing phone numbers
- Long names
- Special characters
- French names
- English names
- Names with accents
- Multiple allowed guests

Examples:

```text
Jean-Pierre Mbala
Marie-Claire N'Guessan
Adebayo Johnson
Kwame Mensah
Sarah Mukamana
```

---

# Part 12 — CI Testing

---

## 54. CI Checks

Every pull request or deployment should run:

```text
TypeScript check
ESLint
Unit tests
Prisma schema validation
Build check
```

Recommended commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

E2E tests may run manually at first if CI time is too high.

---

## 55. Minimum Package Scripts

Recommended scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

---

# Part 13 — Testing Anti-Patterns

---

## 56. Avoid These

Do not:

- Only test happy paths
- Skip offline tests
- Test sync manually only
- Ignore mobile viewport testing
- Depend on live R2 in all tests
- Test UI but not sync logic
- Allow deployment if offline check-in is broken
- Ignore duplicate check-in scenarios
- Hide sync failures from staff
- Use production data for tests

---

## 57. Summary

WedPass testing must prioritize the real-world wedding environment.

The most important test is not whether a form submits.

The most important test is:

> Can multiple staff devices check in guests offline, preserve data, and sync correctly later?

If that works reliably, WedPass has a strong foundation for beta.
