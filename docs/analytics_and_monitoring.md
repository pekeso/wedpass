# WedPass Analytics and Monitoring

## 1. Document Purpose

This document defines the analytics and monitoring strategy for **WedPass V1.0**.

WedPass is an offline-first wedding guest check-in and photo/video collection platform. Because the app will be used during real events, monitoring must focus on reliability, data safety, and beta learning.

This document covers:

- Product analytics
- Technical monitoring
- Error tracking
- Offline sync observability
- Media upload monitoring
- Security monitoring
- Beta metrics
- Event logging
- Dashboards and reports
- Alerting priorities

---

## 2. Monitoring Philosophy

WedPass monitoring should answer three questions:

1. **Is the system reliable during real weddings?**
2. **Are users completing the core workflows?**
3. **Where are failures happening?**

The most important monitoring area is:

> Offline check-in and synchronization reliability.

If check-ins are lost, delayed, or duplicated incorrectly, the product loses trust.

---

## 3. Analytics Goals

WedPass V1.0 analytics should help measure:

- Wedding setup completion
- Guest import success
- Event Mode readiness
- Staff device preparation
- Offline check-in usage
- Sync success/failure
- Media upload participation
- Media upload reliability
- Gallery engagement
- Beta feedback quality

---

## 4. Monitoring Goals

WedPass V1.0 monitoring should help detect:

- API errors
- Sync failures
- Snapshot download failures
- IndexedDB errors
- Upload failures
- Authentication failures
- Authorization failures
- Public upload abuse
- Unexpected frontend crashes
- Production deployment regressions

---

## 5. Recommended Tools

## 5.1 Sentry

Use Sentry for:

- Frontend errors
- Backend API errors
- Runtime exceptions
- Sync failures
- Upload failures
- IndexedDB errors
- Route crashes

Sentry is the priority monitoring tool for V1.0.

---

## 5.2 Product Analytics

Use product analytics later if needed.

Possible tools:

- PostHog
- Plausible
- Vercel Analytics
- Custom event table

For V1.0 beta, a simple custom event table or PostHog can be enough.

Recommended practical approach:

```text
Start with Sentry + server logs + database sync/media logs.
Add full product analytics after the core beta flow is stable.
```

---

## 6. Analytics Principles

1. Track only useful events.
2. Do not collect unnecessary personal data.
3. Avoid storing guest names in analytics tools.
4. Use IDs and counts where possible.
5. Track outcomes, not just clicks.
6. Separate product analytics from audit/security logs.
7. Make beta learning easy to review.

---

# Part 1 — Core Product Analytics

---

## 7. Wedding Setup Events

Track these events:

```text
wedding_created
wedding_updated
guest_added
guest_import_started
guest_import_completed
guest_import_failed
qr_codes_viewed
qr_code_downloaded
event_mode_readiness_viewed
event_mode_enabled
```

### Event: wedding_created

Properties:

```json
{
  "weddingId": "uuid",
  "country": "Nigeria",
  "eventDate": "2026-08-14"
}
```

Do not include sensitive guest data.

---

## 8. Guest Management Events

Track:

```text
guest_added
guest_updated
guest_deleted
guest_search_performed
guest_import_started
guest_import_completed
guest_import_failed
guest_import_validation_error
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "guestCount": 300,
  "errorCount": 5,
  "source": "csv"
}
```

Do not include guest names, phone numbers, or emails in analytics.

---

## 9. Event Mode Events

Track:

```text
event_mode_readiness_checked
event_mode_enable_attempted
event_mode_enabled
event_mode_enable_failed
snapshot_created
snapshot_downloaded
snapshot_download_failed
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "snapshotId": "uuid",
  "snapshotVersion": 1,
  "guestCount": 300
}
```

---

## 10. Staff Device Events

Track:

```text
staff_device_created
staff_device_revoked
staff_login_attempted
staff_login_succeeded
staff_login_failed
offline_pack_download_started
offline_pack_download_completed
offline_pack_download_failed
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "staffDeviceId": "uuid",
  "guestCount": 300
}
```

---

# Part 2 — Offline Check-In Monitoring

---

## 11. Staff Check-In Events

Track:

```text
staff_checkin_home_opened
qr_scan_started
qr_scan_succeeded
qr_scan_failed
manual_search_used
guest_checkin_attempted
guest_checked_in_locally
guest_already_checked_in_locally
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "staffDeviceId": "uuid",
  "isOnline": false,
  "pendingSyncCount": 12
}
```

Do not send guest personal data to analytics.

---

## 12. Sync Events

Track:

```text
sync_started
sync_completed
sync_failed
sync_retry_scheduled
sync_result_accepted
sync_result_duplicate
sync_result_rejected
sync_snapshot_mismatch
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "staffDeviceId": "uuid",
  "snapshotId": "uuid",
  "snapshotVersion": 1,
  "batchSize": 100,
  "acceptedCount": 96,
  "duplicateCount": 3,
  "rejectedCount": 1,
  "durationMs": 850
}
```

---

## 13. Offline State Events

Track:

```text
device_went_offline
device_came_online
offline_checkin_performed
pending_sync_count_changed
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "staffDeviceId": "uuid",
  "pendingSyncCount": 15
}
```

---

## 14. Sync Health Metrics

Measure:

```text
Total sync attempts
Successful sync attempts
Failed sync attempts
Average sync batch size
Average sync duration
Duplicate conflict count
Rejected sync item count
Snapshot mismatch count
Max pending sync count per device
Time from local check-in to successful sync
```

Critical metric:

```text
Unsynced check-ins after event
```

This should be zero after event closeout.

---

## 15. Sync Logs in Database

Use the `sync_logs` table for operational monitoring.

Recommended fields:

```text
wedding_id
staff_device_id
snapshot_id
payload_count
accepted_count
duplicate_count
rejected_count
error_count
sync_started_at
sync_completed_at
created_at
```

Purpose:

- Beta debugging
- Event support
- Post-event review
- Risk monitoring

---

# Part 3 — Media Upload Monitoring

---

## 16. Media Upload Events

Track:

```text
guest_upload_page_opened
media_file_selected
media_validation_failed
media_upload_url_requested
media_upload_started
media_upload_progress
media_upload_completed
media_upload_failed
media_upload_retry_clicked
media_upload_confirmed
media_upload_queued_offline
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "mediaType": "IMAGE",
  "fileSizeBytes": 2048000,
  "uploadDurationMs": 4200,
  "networkState": "online"
}
```

Do not send file names if they may contain personal information.

---

## 17. Gallery Events

Track:

```text
guest_gallery_opened
guest_gallery_filter_changed
media_viewed
organizer_media_moderation_opened
media_hidden
media_deleted
media_downloaded
```

Useful properties:

```json
{
  "weddingId": "uuid",
  "mediaType": "VIDEO",
  "status": "HIDDEN"
}
```

---

## 18. Media Health Metrics

Measure:

```text
Upload attempts
Successful uploads
Failed uploads
Upload success rate
Average upload file size
Average upload duration
Image uploads
Video uploads
Video failure rate
Upload retries
Queued uploads
Gallery views
Hidden media count
Deleted media count
```

Important beta metric:

```text
Guest upload participation rate
```

Example:

```text
media_uploading_guests / total_guests
```

This will be approximate if guests do not identify themselves.

---

## 19. Media Cost Metrics

Track:

```text
Total storage per wedding
Total number of media files
Total video storage
Total image storage
Average file size
Largest uploaded file
```

These metrics inform future storage limits and paid plans.

---

# Part 4 — Technical Monitoring

---

## 20. Sentry Error Categories

Tag Sentry errors by category:

```text
auth
api
database
offline
sync
indexeddb
media_upload
r2
gallery
staff_mode
guest_page
dashboard
```

Example Sentry tags:

```json
{
  "module": "sync",
  "weddingId": "uuid",
  "staffDeviceId": "uuid",
  "environment": "production"
}
```

Avoid adding guest PII to Sentry.

---

## 21. API Monitoring

Monitor:

```text
API error rate
API latency
Auth failures
Sync endpoint latency
Upload URL endpoint failures
Media confirm failures
Public gallery response time
Database query failures
```

V1.0 can rely on:

- Vercel logs
- Sentry
- Database logs
- Custom sync logs

---

## 22. Critical API Endpoints to Watch

High priority:

```text
POST /api/v1/staff/weddings/:weddingId/checkins/sync
GET  /api/v1/staff/weddings/:weddingId/snapshot
POST /api/v1/weddings/:weddingId/event-mode/enable
POST /api/v1/weddings/:weddingId/media/upload-url
POST /api/v1/weddings/:weddingId/media/confirm
GET  /api/v1/public/weddings/:slug/media
```

---

## 23. IndexedDB Monitoring

Client-side IndexedDB errors should be captured in Sentry.

Track:

```text
indexeddb_open_failed
snapshot_save_failed
local_checkin_transaction_failed
queue_read_failed
queue_write_failed
media_queue_write_failed
```

These errors are critical because offline functionality depends on IndexedDB.

---

## 24. PWA/Offline Monitoring

Track:

```text
service_worker_registered
service_worker_registration_failed
offline_fallback_shown
device_offline_duration
```

PWA monitoring is secondary to IndexedDB and sync monitoring but still useful.

---

# Part 5 — Security Monitoring

---

## 25. Security Events to Log

Log:

```text
login_failed
rate_limit_triggered
forbidden_access_attempt
invalid_staff_token
revoked_staff_device_attempt
invalid_qr_token
unsupported_file_upload_attempt
oversized_file_upload_attempt
snapshot_mismatch
```

Do not log:

- Passwords
- Full JWTs
- Refresh tokens
- R2 secret keys
- Full signed URLs
- Guest phone numbers/emails unless absolutely necessary

---

## 26. Authorization Monitoring

Track suspicious cases:

- User attempts to access another wedding.
- Staff token attempts organizer API.
- Public user attempts protected route.
- Revoked staff device attempts sync.

These should be logged with:

```text
requester type
wedding ID
endpoint
timestamp
result
```

Avoid PII.

---

## 27. Upload Abuse Monitoring

Track:

- Upload URL requests per wedding
- Upload URL requests per IP
- Rejected file types
- Oversized file attempts
- Failed upload confirmations

Early warning signs:

- Sudden upload spike
- Many unsupported file attempts
- Repeated upload attempts from one IP
- Large number of video uploads

---

# Part 6 — Beta Monitoring

---

## 28. Beta Wedding Dashboard

For each beta wedding, track:

```text
Wedding ID
Wedding date
Country
Guest count
Staff device count
Snapshot downloaded devices
Total check-ins
Offline check-ins
Pending sync after event
Duplicate conflicts
Sync failures
Media uploads
Upload failures
Gallery views
Feedback submitted
```

This can initially be a manual internal report.

---

## 29. Beta Success Metrics

Target beta success criteria:

```text
No lost check-in data
Pending sync count reaches zero after event
Offline check-in works on prepared devices
Staff can check in guests without developer assistance
At least 90% of upload attempts succeed or remain safely retryable
Organizer submits feedback
```

---

## 30. Beta Review Report

After each beta wedding, create a short report:

```text
Wedding summary
Guest count
Staff devices used
Offline usage
Check-in results
Sync results
Media upload results
Issues encountered
User feedback
Action items
Go/no-go for next beta
```

---

# Part 7 — Alerts

---

## 31. Critical Alerts

Set up alerting manually or through Sentry for:

```text
Sync endpoint error spike
Snapshot download failures
IndexedDB transaction failures
Media upload URL failures
API 500 errors
Authorization errors spike
```

During beta, manual monitoring may be enough if events are few.

---

## 32. Alert Severity

### Critical

Immediate attention:

- Check-in sync failing
- Snapshot download failing
- Cross-wedding access detected
- Production app unavailable
- Media upload abuse spike

### High

Investigate soon:

- Upload failure spike
- Repeated staff token failures
- IndexedDB errors
- Event Mode enable failures

### Medium

Review after event:

- Duplicate conflicts
- Slow gallery performance
- Guest upload abandonment

---

# Part 8 — Analytics Event Naming

---

## 33. Naming Convention

Use lowercase snake_case.

Examples:

```text
wedding_created
event_mode_enabled
snapshot_downloaded
guest_checked_in_locally
sync_completed
media_upload_failed
gallery_viewed
```

Avoid inconsistent names like:

```text
WeddingCreated
wedding-created
User did wedding create
```

---

## 34. Required Event Properties

Most events should include:

```json
{
  "weddingId": "uuid",
  "environment": "production",
  "timestamp": "ISO_DATE"
}
```

Staff events should include:

```json
{
  "staffDeviceId": "uuid"
}
```

Sync events should include:

```json
{
  "snapshotId": "uuid",
  "snapshotVersion": 1
}
```

---

## 35. PII Rules for Analytics

Do not send:

- Guest full names
- Guest phone numbers
- Guest emails
- Uploaded file original names
- Full QR tokens
- Full signed URLs
- Access tokens

Allowed:

- Counts
- IDs
- Status
- Durations
- File size
- Media type
- Country
- Wedding ID

---

# Part 9 — Implementation Guidance

---

## 36. Analytics Module Structure

Suggested folder:

```text
src/lib/analytics/
  analytics.ts
  events.ts
  server-events.ts
  client-events.ts
```

For V1.0, analytics can start simple.

Example:

```ts
trackEvent("guest_checked_in_locally", {
  weddingId,
  staffDeviceId,
  isOnline,
  pendingSyncCount,
});
```

If product analytics tool is not configured, this function can no-op in development.

---

## 37. Monitoring Module Structure

Suggested folder:

```text
src/lib/monitoring/
  sentry.ts
  logger.ts
  error-tags.ts
```

---

## 38. Server Logging Rules

Use structured logs where possible.

Example:

```json
{
  "level": "info",
  "event": "sync_completed",
  "weddingId": "uuid",
  "staffDeviceId": "uuid",
  "acceptedCount": 96,
  "duplicateCount": 3,
  "rejectedCount": 1
}
```

---

# Part 10 — Claude Code Prompts

---

## 39. Prompt: Add Analytics Foundation

```text
Implement a lightweight analytics foundation for WedPass.

Create:
- src/lib/analytics/events.ts
- src/lib/analytics/analytics.ts
- typed event names for core V1 events

Requirements:
- Use lowercase snake_case event names.
- Do not send PII.
- In development, log events to console.
- In production, keep implementation ready for PostHog or another provider.
- Do not add external analytics provider yet unless configured.
```

---

## 40. Prompt: Add Sentry Monitoring

```text
Set up Sentry monitoring for WedPass.

Requirements:
- Configure Sentry for Next.js.
- Add environment variable support.
- Tag errors by module where possible.
- Do not send passwords, tokens, signed URLs, or guest PII.
- Capture sync, media upload, and API errors with useful context.
```

---

## 41. Prompt: Add Sync Logging

```text
Implement sync logging for WedPass.

Use sync_logs table from database_schema.md.
Every sync attempt should record:
- weddingId
- staffDeviceId
- snapshotId
- payloadCount
- acceptedCount
- duplicateCount
- rejectedCount
- errorCount
- syncStartedAt
- syncCompletedAt

Do not store full guest personal data in sync logs.
```

---

# Part 11 — Monitoring Anti-Patterns

---

## 42. Avoid These

Do not:

- Track everything without purpose.
- Send guest personal data to analytics tools.
- Log full JWTs.
- Log signed upload URLs.
- Ignore sync failures during beta.
- Only monitor server errors and ignore client offline errors.
- Treat media upload failure as low priority.
- Wait until public launch to add monitoring.
- Use analytics as a substitute for direct beta feedback.

---

## 43. Summary

WedPass analytics and monitoring should focus on reliability first.

The most important metrics are:

- Offline check-ins completed
- Pending sync count
- Sync success/failure
- Duplicate conflicts
- Media upload success/failure
- Guest upload participation
- Organizer feedback

The most important monitoring principle is:

> If a wedding is using WedPass, we must know whether check-in data is safe.
