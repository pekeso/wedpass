# WedPass Security Design

## 1. Document Purpose

This document defines the security requirements and security-by-design rules for **WedPass V1.0**.

WedPass handles wedding guest data, event check-in data, and guest-uploaded photos/videos. Even though it does not handle payments or highly regulated data in V1.0, security is still critical because the platform will manage private events and personal memories.

This document covers:

- Authentication
- Authorization
- Staff access
- QR token security
- Offline device security
- Media upload security
- API validation
- Rate limiting
- Data privacy
- Infrastructure security
- Logging and auditability
- Incident response basics

---

## 2. Security Philosophy

WedPass follows this security principle:

> Trust nothing from the client. Validate everything on the server.

This applies to:

- Organizer requests
- Staff device requests
- Offline sync payloads
- QR tokens
- Public wedding links
- Media upload requests
- File metadata
- User-generated content

The client may be offline and useful, but it is never authoritative from a security perspective.

---

## 3. Primary Security Objectives

WedPass V1.0 must protect:

1. Organizer accounts
2. Wedding data
3. Guest personal information
4. Check-in integrity
5. Media uploads
6. Staff access
7. Public wedding links
8. Local offline data
9. API availability
10. Object storage access

---

## 4. Main Threats

Realistic threats for WedPass V1.0 include:

- Unauthorized access to a wedding dashboard
- Guest list leakage
- Guessable QR tokens
- Staff token misuse
- Public upload abuse
- Uploading malicious files
- Uploading very large files to abuse storage
- Cross-wedding data access bugs
- Sync payload tampering
- Duplicate check-in manipulation
- Lost or stolen staff device
- Exposed environment variables
- Broken authorization in API handlers

WedPass V1.0 does not need to defend against every advanced threat, but it must be robust against common web application risks.

---

## 5. Authentication Security

## 5.1 Organizer Authentication

V1.0 uses email and password authentication for organizers.

Required controls:

- Password hashing using bcrypt
- Minimum password length of 8 characters
- JWT access token
- Refresh token stored in secure HTTP-only cookie if refresh tokens are implemented
- Login rate limiting
- Safe login error messages

Do not reveal whether an email exists during login.

Example safe error:

```text
Invalid email or password.
```

---

## 5.2 Password Hashing

Use bcrypt.

Recommended settings:

```text
bcrypt cost factor: 12 or higher
```

Rules:

- Never store plain-text passwords
- Never log passwords
- Never return password hash in API responses
- Never expose password hash in frontend code

---

## 5.3 Password Reset

Password reset may be deferred during beta if users are manually onboarded.

If implemented:

- Use short-lived reset tokens
- Store reset token hash, not raw token
- Expire reset token after 15–30 minutes
- Invalidate token after use
- Rate-limit password reset requests

---

## 6. Session and Token Security

## 6.1 Access Tokens

Access tokens should be short-lived.

Recommended:

```text
15–30 minutes
```

Access tokens should contain:

- user ID
- role
- issued at
- expiration

They should not contain sensitive personal data.

---

## 6.2 Refresh Tokens

If refresh tokens are implemented:

- Store in HTTP-only cookie
- Use `Secure`
- Use `SameSite=Strict` or `SameSite=Lax`
- Rotate refresh tokens if feasible
- Allow logout to invalidate session

Cookie requirements:

```text
httpOnly: true
secure: true in production
sameSite: strict or lax
```

---

## 6.3 Staff Tokens

Staff tokens are scoped tokens.

They must include:

- wedding ID
- staff device ID
- allowed actions
- expiration time

Staff tokens must not allow:

- Guest editing
- Wedding editing
- Media deletion
- Account settings access
- Billing access
- Organizer dashboard access

Recommended staff token lifetime:

```text
Event day or short beta-defined period
```

---

## 7. Authorization Security

## 7.1 Wedding-Scoped Access

Every protected query must enforce wedding ownership or staff scope.

The API must never rely only on:

```text
guestId
mediaId
checkinId
```

Instead, always validate:

```text
resource belongs to weddingId
AND requester has access to weddingId
```

Example rule:

```text
Organizer can access wedding only if wedding.organizerId == currentUser.id
```

Staff rule:

```text
Staff can access wedding only if staffToken.weddingId == requested weddingId
```

---

## 7.2 Role Boundaries

V1.0 roles:

```text
ORGANIZER
STAFF
GUEST_PUBLIC
```

### Organizer

Can:

- Create/edit wedding
- Manage guests before Event Mode
- Enable Event Mode
- Create/revoke staff devices
- View stats
- Moderate media

### Staff

Can:

- Download snapshot
- Search/check in guests locally
- Sync check-ins
- Update device last seen

### Guest/Public

Can:

- View public wedding page
- Upload media if allowed
- View approved gallery media

---

## 7.3 Authorization Anti-Pattern

Do not do this:

```ts
const guest = await prisma.guest.findUnique({ where: { id: guestId } });
```

Then return the guest.

Correct pattern:

```ts
const guest = await prisma.guest.findFirst({
  where: {
    id: guestId,
    weddingId,
    wedding: {
      organizerId: currentUser.id
    }
  }
});
```

Every access must be scoped.

---

## 8. QR Token Security

## 8.1 QR Token Requirements

QR tokens must be:

- Non-predictable
- High entropy
- Unique
- Wedding-scoped during validation
- Revocable by regenerating guest token if needed

Recommended:

```text
crypto.randomUUID()
or
random 32-byte URL-safe token
```

Avoid:

- Incrementing IDs
- Phone numbers
- Guest names
- Short numeric codes only
- Plain `/guest/123` style links

---

## 8.2 QR Payload

QR payload should contain only what is needed.

Example:

```text
wedpass://checkin/<qr_token>
```

or:

```text
https://app.wedpass.com/staff/checkin?token=<qr_token>
```

Do not embed:

- Full guest name
- Phone number
- Email
- Wedding private data

The QR token should be a lookup key, not a data container.

---

## 8.3 QR Validation

When QR token is scanned:

- Staff client looks up token locally in snapshot.
- During sync, server validates the guest belongs to the wedding and snapshot.
- QR token alone must never grant dashboard access.

---

## 9. Offline Device Security

WedPass stores some guest data locally for offline check-in.

This introduces local-device risk.

## 9.1 Local Data Minimization

IndexedDB should store only data required for event operation:

- Guest full name
- Phone number if needed for search
- Email only if needed
- QR token
- Allowed guest count
- Check-in status
- Sync queue

Do not store:

- Organizer password
- Password hash
- Refresh tokens
- Payment data
- Unrelated wedding data
- Sensitive notes

---

## 9.2 Device Revocation

Organizer must be able to revoke staff device access.

Revocation affects:

- Future snapshot downloads
- Future sync attempts
- Future staff API access

Note:

A revoked device may still have local offline data until cleared. This is unavoidable in a browser offline model.

Mitigation:

- Staff tokens expire
- Local data can be cleared after event
- Staff access is limited
- Offline data is minimized

---

## 9.3 Local Data Clearing

Provide a way to clear local event data after the event.

But protect unsynced check-ins:

If unsynced check-ins exist:

- Warn user
- Block clearing by default
- Require explicit admin override if implemented

Message:

```text
This device still has unsynced check-ins. Sync before clearing local data.
```

---

## 9.4 Shared Device Warning

Staff devices may be personal phones.

UX should remind staff:

```text
This device will temporarily store guest check-in data for this wedding.
```

After event:

```text
All check-ins are synced. You may now clear this device's offline data.
```

---

## 10. API Security

## 10.1 Input Validation

Every API endpoint must validate:

- Request body
- Query params
- Route params

Use Zod.

Example:

```ts
const result = schema.safeParse(input);

if (!result.success) {
  throw new AppError("VALIDATION_ERROR", "Invalid request data.");
}
```

Never trust frontend validation alone.

---

## 10.2 Standard Error Handling

Do not expose internal errors.

Bad:

```text
PrismaClientKnownRequestError: Unique constraint failed...
```

Good:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A guest with this QR token already exists."
  }
}
```

---

## 10.3 Rate Limiting

Rate-limit endpoints that can be abused.

Required rate-limited endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/weddings/:weddingId/media/upload-url
POST /api/v1/weddings/:weddingId/media/confirm
GET  /api/v1/public/weddings/:slug/media
POST /api/v1/staff/weddings/:weddingId/checkins/sync
```

Suggested V1 limits:

```text
Login: 5 attempts/minute/IP
Upload URL: 30 requests/minute/IP or wedding
Public gallery: 120 requests/minute/IP
Sync: reasonable batch rate per staff device
```

---

## 10.4 CORS

Restrict CORS in production.

Allowed origins should be:

- WedPass production domain
- WedPass preview/staging domains where needed

Do not allow unrestricted wildcard origins for authenticated endpoints.

---

## 10.5 HTTP Methods

Use correct HTTP methods:

- GET for reads
- POST for create/action
- PATCH for updates
- DELETE for deletion

Reject unsupported methods.

---

## 11. Sync Security

Offline sync is a critical attack surface.

## 11.1 Sync Payload Validation

The server must validate:

- Staff token
- Wedding ID
- Staff device status
- Snapshot ID
- Snapshot version
- Guest ID
- Guest belongs to wedding
- Guest belongs to snapshot
- Timestamp format
- Queue ID

Never accept check-ins blindly.

---

## 11.2 Sync Idempotency

Use:

```text
staffDeviceId + queueId
```

to avoid duplicate processing.

This protects against:

- Retry storms
- Browser refresh
- Network timeout ambiguity
- User tapping Sync Now multiple times

---

## 11.3 Timestamp Trust

Client timestamps are useful but not fully trusted.

Rules:

- Reject invalid timestamps.
- Reject timestamps too far in the future.
- Optionally reject timestamps too far before event date.
- Store server received timestamp for audit.

Recommended fields:

```text
checked_in_at       client timestamp
created_at          server timestamp
```

---

## 11.4 Conflict Rule

WedPass uses:

```text
Earliest valid check-in timestamp wins.
```

But server must determine validity.

If timestamp is suspicious, reject or flag.

---

## 12. Media Upload Security

Media upload is one of the largest security risks in WedPass.

## 12.1 Direct-to-Storage Upload

Media files must not pass through the application server.

Correct flow:

```text
Client requests signed URL
Client uploads directly to R2
Client confirms upload
Server stores metadata
```

This protects the app server from bandwidth and memory pressure.

---

## 12.2 Signed URL Requirements

Signed upload URLs must:

- Expire quickly
- Be scoped to one file key
- Be scoped to allowed content type if possible
- Use unpredictable file keys
- Not allow listing bucket contents

Recommended expiry:

```text
5–15 minutes
```

---

## 12.3 File Type Validation

Validate:

- MIME type
- File extension
- Ideally file signature where feasible

Allowed V1 types:

```text
image/jpeg
image/png
video/mp4
```

Avoid allowing SVG in V1 because SVG can create XSS risks.

---

## 12.4 File Size Limits

Recommended V1 limits:

```text
Image: 10MB max
Video: 100MB max
```

These values can be adjusted after beta.

Server must enforce limits before issuing signed URL.

Client must also warn users.

---

## 12.5 File Key Strategy

Use unpredictable object keys.

Example:

```text
weddings/{weddingId}/media/{uploadId}.{extension}
```

Do not use original filename as storage key.

Original filename may be stored as metadata if needed.

---

## 12.6 Upload Confirmation Security

On confirm:

- Validate upload ID
- Validate file key belongs to wedding
- Validate file type and size metadata
- Do not trust client file URL
- Server should construct or derive file reference

---

## 12.7 Media Visibility

V1.0 default can be:

Option A:

```text
Uploaded media visible unless hidden
```

Option B:

```text
Uploaded media hidden until approved
```

Safer option:

```text
Hidden until approved
```

Better UX option:

```text
Visible by default, organizer can hide/delete
```

Recommended beta decision:

```text
Visible by default but with easy hide/delete, unless a couple requests moderation-first.
```

---

## 12.8 Malware Scanning

Full malware scanning is out of scope for V1.0.

Future improvement:

- Background malware scanning
- Image validation worker
- Video transcoding pipeline

For V1.0, reduce risk through:

- Strict MIME allowlist
- File size limits
- No executable file types
- No SVG
- Signed upload constraints

---

## 13. Public Page Security

Public guest pages should expose minimal information.

Public wedding page may show:

- Couple names
- Wedding date
- Cover image
- Upload CTA
- Gallery if enabled

Public page must not expose:

- Guest list
- Staff devices
- Organizer email
- Internal sync logs
- Hidden/deleted media
- QR token list

---

## 14. Data Privacy

WedPass handles personal guest information.

## 14.1 Guest Data

Guest data may include:

- Name
- Phone number
- Email
- Check-in status

Security requirements:

- Use HTTPS
- Scope access by wedding
- Minimize offline data
- Allow organizer to delete guest data
- Do not expose guest list publicly

---

## 14.2 Media Privacy

Wedding photos/videos may be sensitive.

Security requirements:

- Do not expose hidden/deleted media
- Use signed read URLs if bucket is private
- Avoid public bucket listing
- Allow organizer to hide/delete media
- Provide gallery visibility toggle

---

## 14.3 Data Retention

V1.0 should define a simple beta retention policy.

Recommended beta policy:

```text
Media and event data are retained during beta unless the organizer requests deletion.
```

Future:

- Auto-delete media after a defined retention period
- Paid storage plans
- Export and delete workflows

---

## 15. Frontend Security

## 15.1 XSS Prevention

Do not render raw HTML from users.

User-generated fields include:

- Guest names
- Uploaded by name
- Feedback comments
- Wedding name
- Location

Always render as text.

Avoid:

```tsx
dangerouslySetInnerHTML
```

Unless absolutely necessary and sanitized.

---

## 15.2 Content Security Policy

Use a strict Content Security Policy when feasible.

CSP should restrict:

- Scripts
- Image sources
- Media sources
- Frame ancestors

Allow media from:

- Cloudflare R2/CDN domain
- WedPass domain

---

## 15.3 Client Secrets

Never expose server secrets in frontend.

Public frontend variables must use safe `NEXT_PUBLIC_` prefix only when they are truly public.

Do not expose:

- JWT secret
- Database URL
- R2 secret key
- R2 access key
- Email provider secrets

---

## 16. Database Security

## 16.1 Least Privilege

Production database user should have only required permissions.

Avoid using superuser credentials in production.

---

## 16.2 Backups

Use managed PostgreSQL backups.

Minimum:

```text
Daily backups
```

For beta, confirm Supabase backup availability.

---

## 16.3 Soft Deletes

Use soft deletes for:

- Guests
- Media metadata

This helps recover from accidental deletion during beta.

---

## 16.4 Database Constraints

Use constraints and indexes to enforce integrity:

- Unique email
- Unique wedding slug
- Unique guest QR token
- Unique processed sync queue item
- Valid enum values
- Guest belongs to wedding
- Snapshot guest belongs to snapshot

---

## 17. Infrastructure Security

## 17.1 HTTPS

HTTPS is mandatory in all production environments.

No production traffic should use HTTP.

---

## 17.2 Environment Variables

Secrets must be stored in environment variables.

Required secrets may include:

```text
DATABASE_URL
JWT_SECRET
REFRESH_TOKEN_SECRET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ACCOUNT_ID
SENTRY_DSN
```

Rules:

- Never commit `.env`
- Provide `.env.example`
- Rotate secrets if leaked
- Use separate dev/prod values

---

## 17.3 Vercel Security

Use Vercel environment variables.

Limit team access to deployment settings.

Review preview deployment exposure before sharing.

---

## 17.4 Cloudflare R2 Security

Rules:

- Bucket listing disabled
- Signed URLs only for upload
- Private bucket by default
- Public CDN only if intentional
- Separate folders per wedding
- File keys must be unpredictable

---

## 18. Logging and Audit

Log security-relevant events.

## 18.1 Events to Log

- Organizer login failures
- Staff device creation
- Staff device revocation
- Snapshot download
- Sync attempt
- Sync failure
- Duplicate check-in conflict
- Media hide/delete
- Upload failures
- Rate limit triggers

---

## 18.2 Do Not Log

Do not log:

- Passwords
- Raw tokens
- Full JWTs
- R2 secret keys
- Full signed URLs if avoidable
- Sensitive personal data unnecessarily

If logging tokens is required for debugging, mask them.

---

## 19. Monitoring

Use Sentry for:

- Frontend errors
- Backend API errors
- Sync-related exceptions
- Upload-related exceptions

During beta, pay special attention to:

- Sync failures
- Snapshot mismatch
- Upload failures
- QR scan errors
- Staff token errors

---

## 20. Incident Response Basics

For V1.0 beta, define a simple incident process.

## 20.1 If Staff Device Is Lost

Steps:

1. Organizer revokes staff device.
2. Confirm whether all check-ins from device were synced.
3. If not synced, mark potential data gap.
4. Ask staff if device can be recovered.
5. Clear local data if possible.

---

## 20.2 If Upload Abuse Happens

Steps:

1. Disable gallery or uploads for the wedding.
2. Hide/delete abusive media.
3. Review upload logs.
4. Tighten rate limits.
5. Regenerate guest/public access if needed.

---

## 20.3 If Organizer Account Is Compromised

Steps:

1. Reset password.
2. Revoke active sessions.
3. Review wedding data changes.
4. Review staff device creation.
5. Rotate tokens if needed.

---

## 20.4 If Secrets Are Leaked

Steps:

1. Rotate leaked secret immediately.
2. Redeploy application.
3. Review logs for misuse.
4. Invalidate affected tokens.
5. Document incident.

---

## 21. Security Checklist Before Beta

Before first real wedding beta:

- [ ] HTTPS enabled
- [ ] Passwords hashed
- [ ] Auth endpoints rate-limited
- [ ] JWT secret configured securely
- [ ] Wedding-scoped authorization implemented
- [ ] Staff tokens scoped and expiring
- [ ] QR tokens non-predictable
- [ ] Media upload signed URLs implemented
- [ ] File size limits enforced
- [ ] File type allowlist enforced
- [ ] Hidden media not shown publicly
- [ ] IndexedDB does not store secrets
- [ ] Sync endpoint validates snapshot and guest
- [ ] Sync endpoint idempotency implemented
- [ ] Sentry configured
- [ ] `.env.example` exists
- [ ] `.env` is gitignored
- [ ] R2 bucket listing disabled
- [ ] Basic audit logging implemented

---

## 22. Security Anti-Patterns

Do not:

- Use predictable guest IDs in QR codes
- Trust client-provided wedding IDs without authorization checks
- Store passwords in IndexedDB
- Store refresh tokens in IndexedDB
- Upload files through the app server in V1
- Allow any file type upload
- Allow SVG uploads in V1
- Expose hidden media publicly
- Return raw database errors
- Log JWTs or signed URLs
- Call Prisma directly from frontend components
- Use wildcard CORS for authenticated APIs
- Skip rate limiting for public upload endpoints
- Allow staff tokens to access organizer APIs

---

## 23. Future Security Improvements

Possible V1.1+ improvements:

- Email verification
- Password reset
- Token rotation
- More advanced rate limiting
- Malware scanning
- Media moderation workflow
- Audit log UI
- Data export/delete tools
- Better device management
- Optional event PIN for staff mode
- Multi-factor authentication for organizers
- Storage quotas per wedding

---

## 24. Summary

WedPass security relies on:

- Strong authentication
- Wedding-scoped authorization
- Scoped staff tokens
- Non-predictable QR tokens
- Server-side validation
- Signed media uploads
- Local data minimization
- Rate limiting
- Audit logging
- Clear operational controls

The most important security rule is:

> Every resource must be validated against the wedding context before access is granted.
