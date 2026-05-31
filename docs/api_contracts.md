# WedPass API Contracts

## 1. Document Purpose

This document defines the API contracts for **WedPass V1.0**.

It describes:

- API conventions
- Authentication requirements
- Authorization rules
- Request and response formats
- Error response format
- REST endpoints
- Offline sync contracts
- Media upload contracts
- Public guest media contracts

These contracts must be followed by both frontend and backend implementation.

---

## 2. API Design Principles

WedPass API design follows these principles:

1. RESTful JSON APIs.
2. All APIs are versioned under `/api/v1`.
3. All request payloads must be validated with Zod.
4. All responses must use a consistent response shape.
5. Every protected resource must be wedding-scoped.
6. Public endpoints must be rate-limited.
7. Staff endpoints must use scoped staff tokens.
8. Sync endpoints must be idempotent and retry-safe.
9. Media files must upload directly to object storage using signed URLs.
10. API routes must not contain business logic directly.

---

## 3. Base URL

Local development:

```text
http://localhost:3000/api/v1
```

Production:

```text
https://<production-domain>/api/v1
```

---

## 4. Standard Response Format

## 4.1 Success Response

```json
{
  "success": true,
  "data": {}
}
```

For list responses:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  }
}
```

---

## 4.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

`details` is optional.

---

## 4.3 Common Error Codes

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
EVENT_MODE_LOCKED
INVALID_TOKEN
SNAPSHOT_MISMATCH
INVALID_QR_TOKEN
UPLOAD_NOT_ALLOWED
FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
INTERNAL_SERVER_ERROR
```

---

## 5. Authentication

## 5.1 Organizer Authentication

Organizer endpoints use JWT authentication.

Recommended header:

```http
Authorization: Bearer <access_token>
```

Refresh token may be stored in an HTTP-only secure cookie.

---

## 5.2 Staff Authentication

Staff endpoints use scoped staff tokens.

Recommended header:

```http
Authorization: Bearer <staff_token>
```

Staff tokens must only allow:

- Snapshot download
- Offline pack preparation
- Check-in sync
- Staff device status update

Staff tokens must not allow:

- Guest editing
- Wedding editing
- Media moderation
- Account management

---

## 5.3 Guest/Public Access

Guest media routes use public wedding slug access or scoped media access tokens depending on implementation.

Public guest endpoints must be rate-limited.

---

# Part 1 — Auth API

---

## 6. Register Organizer

```http
POST /api/v1/auth/register
```

### Auth

Public.

### Request

```json
{
  "fullName": "Joel Mbiye",
  "email": "joel@example.com",
  "password": "StrongPassword123"
}
```

### Validation

- `fullName`: required, string, min 2 characters
- `email`: required, valid email
- `password`: required, min 8 characters

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Joel Mbiye",
      "email": "joel@example.com"
    },
    "accessToken": "jwt_access_token"
  }
}
```

### Errors

- `VALIDATION_ERROR`
- `CONFLICT`
- `RATE_LIMITED`

---

## 7. Login Organizer

```http
POST /api/v1/auth/login
```

### Auth

Public.

### Request

```json
{
  "email": "joel@example.com",
  "password": "StrongPassword123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Joel Mbiye",
      "email": "joel@example.com"
    },
    "accessToken": "jwt_access_token"
  }
}
```

### Errors

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `RATE_LIMITED`

---

## 8. Logout

```http
POST /api/v1/auth/logout
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 9. Get Current User

```http
GET /api/v1/auth/me
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Joel Mbiye",
      "email": "joel@example.com"
    }
  }
}
```

---

# Part 2 — Wedding API

---

## 10. Create Wedding

```http
POST /api/v1/weddings
```

### Auth

Organizer.

### Request

```json
{
  "name": "Sarah & Daniel Wedding",
  "coupleNames": "Sarah & Daniel",
  "eventDate": "2026-08-14",
  "location": "Lagos, Nigeria",
  "country": "Nigeria"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "wedding": {
      "id": "uuid",
      "name": "Sarah & Daniel Wedding",
      "coupleNames": "Sarah & Daniel",
      "slug": "sarah-daniel-wedding",
      "status": "DRAFT",
      "eventDate": "2026-08-14",
      "location": "Lagos, Nigeria",
      "country": "Nigeria"
    }
  }
}
```

### Errors

- `VALIDATION_ERROR`
- `UNAUTHORIZED`

---

## 11. List Weddings

```http
GET /api/v1/weddings
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Sarah & Daniel Wedding",
        "coupleNames": "Sarah & Daniel",
        "status": "DRAFT",
        "eventDate": "2026-08-14",
        "location": "Lagos, Nigeria"
      }
    ]
  }
}
```

---

## 12. Get Wedding Details

```http
GET /api/v1/weddings/:weddingId
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "wedding": {
      "id": "uuid",
      "name": "Sarah & Daniel Wedding",
      "coupleNames": "Sarah & Daniel",
      "slug": "sarah-daniel-wedding",
      "status": "ACTIVE",
      "eventDate": "2026-08-14",
      "location": "Lagos, Nigeria",
      "country": "Nigeria",
      "galleryEnabled": true,
      "coverImageUrl": null
    }
  }
}
```

### Errors

- `NOT_FOUND`
- `FORBIDDEN`

---

## 13. Update Wedding

```http
PATCH /api/v1/weddings/:weddingId
```

### Auth

Organizer.

### Request

```json
{
  "name": "Sarah & Daniel Wedding",
  "coupleNames": "Sarah & Daniel",
  "eventDate": "2026-08-14",
  "location": "Lagos, Nigeria",
  "country": "Nigeria",
  "galleryEnabled": true
}
```

### Rules

- Wedding cannot be edited after it is completed.
- Certain fields may be locked in Event Mode.

### Response

```json
{
  "success": true,
  "data": {
    "wedding": {
      "id": "uuid",
      "name": "Sarah & Daniel Wedding",
      "status": "ACTIVE"
    }
  }
}
```

---

# Part 3 — Guest API

---

## 14. Add Guest

```http
POST /api/v1/weddings/:weddingId/guests
```

### Auth

Organizer.

### Request

```json
{
  "fullName": "Michael Okoro",
  "phoneNumber": "+2348012345678",
  "email": "michael@example.com",
  "numberOfAllowedGuests": 2
}
```

### Rules

- Wedding must not be in Event Mode.
- QR token is generated by server.

### Response

```json
{
  "success": true,
  "data": {
    "guest": {
      "id": "uuid",
      "fullName": "Michael Okoro",
      "phoneNumber": "+2348012345678",
      "email": "michael@example.com",
      "numberOfAllowedGuests": 2,
      "qrToken": "secure_random_token",
      "isCheckedIn": false
    }
  }
}
```

### Errors

- `EVENT_MODE_LOCKED`
- `VALIDATION_ERROR`
- `FORBIDDEN`

---

## 15. List Guests

```http
GET /api/v1/weddings/:weddingId/guests
```

### Auth

Organizer.

### Query Params

```text
search optional
checkedIn optional true|false
page optional
pageSize optional
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "fullName": "Michael Okoro",
        "phoneNumber": "+2348012345678",
        "email": "michael@example.com",
        "numberOfAllowedGuests": 2,
        "qrToken": "secure_random_token",
        "isCheckedIn": false,
        "checkedInAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 300
    }
  }
}
```

---

## 16. Update Guest

```http
PATCH /api/v1/weddings/:weddingId/guests/:guestId
```

### Auth

Organizer.

### Request

```json
{
  "fullName": "Michael Okoro",
  "phoneNumber": "+2348012345678",
  "email": "michael@example.com",
  "numberOfAllowedGuests": 2
}
```

### Rules

- Not allowed in Event Mode.

### Response

```json
{
  "success": true,
  "data": {
    "guest": {
      "id": "uuid",
      "fullName": "Michael Okoro"
    }
  }
}
```

---

## 17. Delete Guest

```http
DELETE /api/v1/weddings/:weddingId/guests/:guestId
```

### Auth

Organizer.

### Rules

- Soft delete recommended.
- Not allowed in Event Mode.

### Response

```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## 18. Import Guests CSV

```http
POST /api/v1/weddings/:weddingId/guests/import
```

### Auth

Organizer.

### Request

For implementation simplicity, CSV can initially be parsed client-side and submitted as JSON:

```json
{
  "guests": [
    {
      "fullName": "Michael Okoro",
      "phoneNumber": "+2348012345678",
      "email": "michael@example.com",
      "numberOfAllowedGuests": 2
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "importedCount": 120,
    "failedCount": 2,
    "errors": [
      {
        "row": 15,
        "message": "Full name is required"
      }
    ]
  }
}
```

---

# Part 4 — QR Code API

---

## 19. Get Guest QR Data

```http
GET /api/v1/weddings/:weddingId/guests/:guestId/qr
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "guestId": "uuid",
    "fullName": "Michael Okoro",
    "qrToken": "secure_random_token",
    "qrPayload": "wedpass://checkin/secure_random_token"
  }
}
```

### Notes

The frontend may generate the QR image from `qrPayload`.

---

## 20. Get All QR Data

```http
GET /api/v1/weddings/:weddingId/qr-codes
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "guestId": "uuid",
        "fullName": "Michael Okoro",
        "qrToken": "secure_random_token",
        "qrPayload": "wedpass://checkin/secure_random_token"
      }
    ]
  }
}
```

---

# Part 5 — Event Mode and Snapshot API

---

## 21. Get Event Mode Readiness

```http
GET /api/v1/weddings/:weddingId/event-mode/readiness
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "ready": true,
    "checks": [
      {
        "key": "wedding_details",
        "label": "Wedding details completed",
        "passed": true
      },
      {
        "key": "guest_list",
        "label": "Guest list imported",
        "passed": true
      },
      {
        "key": "qr_codes",
        "label": "QR codes generated",
        "passed": true
      },
      {
        "key": "staff_access",
        "label": "Staff access prepared",
        "passed": false
      }
    ]
  }
}
```

---

## 22. Enable Event Mode

```http
POST /api/v1/weddings/:weddingId/event-mode/enable
```

### Auth

Organizer.

### Request

```json
{
  "confirmGuestListLock": true
}
```

### Server Actions

- Validate wedding ownership
- Validate readiness
- Create snapshot
- Copy guests into snapshot_guests
- Set snapshot active
- Change wedding status to EVENT_MODE

### Response

```json
{
  "success": true,
  "data": {
    "weddingId": "uuid",
    "status": "EVENT_MODE",
    "snapshot": {
      "id": "uuid",
      "version": 1,
      "guestCount": 300,
      "createdAt": "2026-08-14T08:00:00Z"
    }
  }
}
```

### Errors

- `VALIDATION_ERROR`
- `CONFLICT`
- `FORBIDDEN`

---

## 23. Get Active Snapshot Metadata

```http
GET /api/v1/weddings/:weddingId/snapshot/active
```

### Auth

Organizer or staff.

### Response

```json
{
  "success": true,
  "data": {
    "snapshot": {
      "id": "uuid",
      "version": 1,
      "guestCount": 300,
      "createdAt": "2026-08-14T08:00:00Z"
    }
  }
}
```

---

# Part 6 — Staff API

---

## 24. Create Staff Device Access

```http
POST /api/v1/weddings/:weddingId/staff/devices
```

### Auth

Organizer.

### Request

```json
{
  "label": "Entrance A Phone"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "device": {
      "id": "uuid",
      "label": "Entrance A Phone",
      "status": "ACTIVE"
    },
    "staffToken": "scoped_staff_jwt"
  }
}
```

### Notes

The staff token should be shown once or regenerated if needed.

---

## 25. List Staff Devices

```http
GET /api/v1/weddings/:weddingId/staff/devices
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "label": "Entrance A Phone",
        "status": "ACTIVE",
        "lastSeenAt": "2026-08-14T14:10:00Z"
      }
    ]
  }
}
```

---

## 26. Revoke Staff Device

```http
POST /api/v1/weddings/:weddingId/staff/devices/:deviceId/revoke
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "revoked": true
  }
}
```

---

## 27. Staff Download Snapshot

```http
GET /api/v1/staff/weddings/:weddingId/snapshot
```

### Auth

Staff token.

### Response

```json
{
  "success": true,
  "data": {
    "wedding": {
      "id": "uuid",
      "name": "Sarah & Daniel Wedding",
      "coupleNames": "Sarah & Daniel"
    },
    "snapshot": {
      "id": "uuid",
      "version": 1,
      "guestCount": 300
    },
    "guests": [
      {
        "guestId": "uuid",
        "snapshotId": "uuid",
        "snapshotVersion": 1,
        "fullName": "Michael Okoro",
        "phoneNumber": "+2348012345678",
        "email": "michael@example.com",
        "qrToken": "secure_random_token",
        "allowedGuests": 2
      }
    ]
  }
}
```

### Notes

This endpoint is critical for offline Event Mode.

---

# Part 7 — Check-In Sync API

---

## 28. Sync Check-Ins

```http
POST /api/v1/staff/weddings/:weddingId/checkins/sync
```

### Auth

Staff token.

### Request

```json
{
  "snapshotId": "uuid",
  "snapshotVersion": 1,
  "deviceId": "uuid",
  "checkins": [
    {
      "queueId": "local_queue_uuid",
      "guestId": "uuid",
      "checkedInAt": "2026-08-14T14:03:00Z"
    }
  ]
}
```

### Server Validation

Server must validate:

- Staff token is valid
- Staff token belongs to wedding
- Staff device is active
- Snapshot exists
- Snapshot version matches active snapshot
- Guest belongs to wedding
- Guest belongs to snapshot
- Timestamp is valid
- Queue item has not already been processed

### Conflict Rule

```text
Earliest valid check-in timestamp wins.
```

### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "queueId": "local_queue_uuid",
        "guestId": "uuid",
        "status": "ACCEPTED",
        "authoritativeCheckedInAt": "2026-08-14T14:03:00Z"
      },
      {
        "queueId": "local_queue_uuid_2",
        "guestId": "uuid_2",
        "status": "DUPLICATE",
        "authoritativeCheckedInAt": "2026-08-14T13:59:00Z"
      }
    ],
    "summary": {
      "accepted": 1,
      "duplicate": 1,
      "rejected": 0
    }
  }
}
```

### Possible Result Statuses

```text
ACCEPTED
DUPLICATE
REJECTED
INVALID_GUEST
SNAPSHOT_MISMATCH
ALREADY_PROCESSED
```

### Idempotency

The endpoint must use:

```text
staffDeviceId + queueId
```

to prevent duplicate processing.

### Errors

- `UNAUTHORIZED`
- `FORBIDDEN`
- `SNAPSHOT_MISMATCH`
- `VALIDATION_ERROR`

---

# Part 8 — Dashboard Stats API

---

## 29. Get Wedding Stats

```http
GET /api/v1/weddings/:weddingId/stats
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "totalGuests": 300,
    "checkedInGuests": 172,
    "pendingGuests": 128,
    "checkinPercentage": 57.33,
    "totalMediaUploads": 240,
    "lastSyncAt": "2026-08-14T15:20:00Z"
  }
}
```

---

## 30. Get Check-In Stats

```http
GET /api/v1/weddings/:weddingId/checkins/stats
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "totalGuests": 300,
    "checkedInGuests": 172,
    "pendingGuests": 128,
    "devices": [
      {
        "deviceId": "uuid",
        "label": "Entrance A Phone",
        "lastSeenAt": "2026-08-14T15:12:00Z"
      }
    ]
  }
}
```

---

# Part 9 — Media API

---

## 31. Request Signed Upload URL

```http
POST /api/v1/weddings/:weddingId/media/upload-url
```

### Auth

Guest/public scoped access or organizer.

### Request

```json
{
  "mediaType": "IMAGE",
  "mimeType": "image/jpeg",
  "fileSizeBytes": 2048000,
  "originalFileName": "photo.jpg",
  "durationSeconds": null,
  "uploadedByName": "Michael"
}
```

### Validation

Allowed MIME types:

```text
image/jpeg
image/png
video/mp4
```

Recommended V1 limits:

```text
image max: 10MB
video max: 100MB
```

### Response

```json
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "fileKey": "weddings/uuid/media/upload_uuid.jpg",
    "uploadUrl": "https://signed-r2-upload-url",
    "expiresInSeconds": 900
  }
}
```

### Errors

- `FILE_TOO_LARGE`
- `UNSUPPORTED_FILE_TYPE`
- `UPLOAD_NOT_ALLOWED`
- `RATE_LIMITED`

---

## 32. Confirm Media Upload

```http
POST /api/v1/weddings/:weddingId/media/confirm
```

### Auth

Guest/public scoped access or organizer.

### Request

```json
{
  "uploadId": "uuid",
  "fileKey": "weddings/uuid/media/upload_uuid.jpg",
  "mediaType": "IMAGE",
  "mimeType": "image/jpeg",
  "fileSizeBytes": 2048000,
  "durationSeconds": null,
  "uploadedByName": "Michael"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "media": {
      "id": "uuid",
      "mediaType": "IMAGE",
      "status": "UPLOADED",
      "fileKey": "weddings/uuid/media/upload_uuid.jpg",
      "createdAt": "2026-08-14T16:00:00Z"
    }
  }
}
```

### Notes

Media metadata should only be created after confirmation.

---

## 33. List Gallery Media

```http
GET /api/v1/weddings/:weddingId/media
```

### Auth

Organizer.

### Query Params

```text
mediaType optional IMAGE|VIDEO
status optional UPLOADED|APPROVED|HIDDEN|DELETED
page optional
pageSize optional
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "mediaType": "IMAGE",
        "status": "UPLOADED",
        "fileUrl": "signed_or_public_read_url",
        "thumbnailUrl": "signed_or_public_thumbnail_url",
        "createdAt": "2026-08-14T16:00:00Z",
        "uploadedByName": "Michael"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 30,
      "total": 240
    }
  }
}
```

---

## 34. Hide Media

```http
POST /api/v1/weddings/:weddingId/media/:mediaId/hide
```

### Auth

Organizer.

### Response

```json
{
  "success": true,
  "data": {
    "mediaId": "uuid",
    "status": "HIDDEN"
  }
}
```

---

## 35. Delete Media

```http
DELETE /api/v1/weddings/:weddingId/media/:mediaId
```

### Auth

Organizer.

### Rules

- Requires confirmation in UI.
- Soft delete metadata first.
- Physical R2 deletion can be immediate or delayed.

### Response

```json
{
  "success": true,
  "data": {
    "mediaId": "uuid",
    "status": "DELETED"
  }
}
```

---

# Part 10 — Public Guest Media API

---

## 36. Get Public Wedding Page

```http
GET /api/v1/public/weddings/:slug
```

### Auth

Public.

### Response

```json
{
  "success": true,
  "data": {
    "wedding": {
      "id": "uuid",
      "name": "Sarah & Daniel Wedding",
      "coupleNames": "Sarah & Daniel",
      "eventDate": "2026-08-14",
      "location": "Lagos, Nigeria",
      "coverImageUrl": null,
      "galleryEnabled": true
    }
  }
}
```

---

## 37. List Public Gallery Media

```http
GET /api/v1/public/weddings/:slug/media
```

### Auth

Public, but rate-limited.

### Query Params

```text
mediaType optional IMAGE|VIDEO
page optional
pageSize optional
```

### Rules

- Return only visible media.
- Do not return hidden/deleted media.

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "mediaType": "IMAGE",
        "fileUrl": "signed_or_public_read_url",
        "thumbnailUrl": "signed_or_public_thumbnail_url",
        "createdAt": "2026-08-14T16:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 30,
      "total": 240
    }
  }
}
```

---

# Part 11 — Feedback API

---

## 38. Submit Beta Feedback

```http
POST /api/v1/weddings/:weddingId/feedback
```

### Auth

Organizer.

### Request

```json
{
  "rating": 9,
  "workedWell": "Offline check-in worked well.",
  "confusing": "Staff setup was not obvious.",
  "offlineFeedback": "Worked without internet.",
  "mediaFeedback": "Guests uploaded many photos.",
  "generalComment": "Great beta experience."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "feedbackId": "uuid"
  }
}
```

---

# Part 12 — Validation Standards

---

## 39. Zod Validation

Every request body must have a Zod schema.

Example:

```ts
export const createGuestSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  numberOfAllowedGuests: z.number().int().min(1).max(20),
});
```

Use inferred types:

```ts
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
```

---

## 40. Pagination Standard

List endpoints should support:

```text
page
pageSize
```

Default:

```text
page = 1
pageSize = 20
```

Maximum:

```text
pageSize = 100
```

---

## 41. Date Format

Use ISO 8601 strings for timestamps.

Example:

```text
2026-08-14T14:03:00Z
```

Use date-only string for wedding date where time is not required:

```text
2026-08-14
```

---

# Part 13 — Security Requirements Per API

---

## 42. Required Security Checks

Every protected endpoint must:

1. Validate token.
2. Validate wedding ownership or staff scope.
3. Validate request payload.
4. Validate resource belongs to wedding.
5. Return safe error messages.
6. Avoid leaking internal DB errors.

---

## 43. Rate-Limited Endpoints

Must be rate-limited:

```text
POST /auth/login
POST /auth/register
POST /media/upload-url
POST /media/confirm
GET /public/weddings/:slug/media
POST /staff/weddings/:weddingId/checkins/sync
```

---

## 44. Public Endpoint Rules

Public endpoints must not reveal:

- Organizer email
- Guest list
- Staff device info
- Hidden/deleted media
- Internal IDs unless necessary
- QR token data

---

# Part 14 — API Implementation Rules

---

## 45. Route Handler Rule

API route handlers must:

- Validate request
- Check auth
- Call service
- Return standardized response

They must not:

- Call Prisma directly
- Implement complex business logic
- Contain sync conflict logic

---

## 46. Service Rule

Services contain business logic.

Examples:

```text
weddings.service.ts
guests.service.ts
sync.service.ts
media.service.ts
```

---

## 47. Repository Rule

Repositories contain database access only.

Examples:

```text
weddings.repository.ts
guests.repository.ts
checkins.repository.ts
media.repository.ts
```

---

## 48. Error Handling Rule

Use typed application errors.

Example:

```ts
throw new AppError("EVENT_MODE_LOCKED", "Guests cannot be edited after Event Mode is enabled.");
```

---

# Part 15 — API Summary

## Auth

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Weddings

```text
POST  /api/v1/weddings
GET   /api/v1/weddings
GET   /api/v1/weddings/:weddingId
PATCH /api/v1/weddings/:weddingId
```

## Guests

```text
POST   /api/v1/weddings/:weddingId/guests
GET    /api/v1/weddings/:weddingId/guests
PATCH  /api/v1/weddings/:weddingId/guests/:guestId
DELETE /api/v1/weddings/:weddingId/guests/:guestId
POST   /api/v1/weddings/:weddingId/guests/import
```

## QR Codes

```text
GET /api/v1/weddings/:weddingId/guests/:guestId/qr
GET /api/v1/weddings/:weddingId/qr-codes
```

## Event Mode

```text
GET  /api/v1/weddings/:weddingId/event-mode/readiness
POST /api/v1/weddings/:weddingId/event-mode/enable
GET  /api/v1/weddings/:weddingId/snapshot/active
```

## Staff

```text
POST /api/v1/weddings/:weddingId/staff/devices
GET  /api/v1/weddings/:weddingId/staff/devices
POST /api/v1/weddings/:weddingId/staff/devices/:deviceId/revoke
GET  /api/v1/staff/weddings/:weddingId/snapshot
POST /api/v1/staff/weddings/:weddingId/checkins/sync
```

## Stats

```text
GET /api/v1/weddings/:weddingId/stats
GET /api/v1/weddings/:weddingId/checkins/stats
```

## Media

```text
POST   /api/v1/weddings/:weddingId/media/upload-url
POST   /api/v1/weddings/:weddingId/media/confirm
GET    /api/v1/weddings/:weddingId/media
POST   /api/v1/weddings/:weddingId/media/:mediaId/hide
DELETE /api/v1/weddings/:weddingId/media/:mediaId
```

## Public

```text
GET /api/v1/public/weddings/:slug
GET /api/v1/public/weddings/:slug/media
```

## Feedback

```text
POST /api/v1/weddings/:weddingId/feedback
```

---

## 49. Summary

This API contract supports WedPass V1.0 by providing:

- Organizer authentication
- Wedding setup
- Guest management
- QR generation
- Offline Event Mode preparation
- Staff snapshot download
- Multi-device offline check-in sync
- Media upload through signed URLs
- Gallery and moderation APIs
- Basic dashboard stats
- Beta feedback collection

All implementations must follow these contracts unless the scope is formally updated.
