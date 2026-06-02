/**
 * Shared test data and response builders used across E2E test suites.
 */

export const TEST_WEDDING_ID = "ffffffff-0000-0000-0000-000000000001"
export const TEST_WEDDING_SLUG = "sarah-daniel-2026"
export const TEST_ORGANIZER_ID = "eeeeeeee-0000-0000-0000-000000000001"
export const TEST_ORGANIZER_EMAIL = "test-organizer@wedpass.test"
export const TEST_ORGANIZER_TOKEN = "test-organizer-jwt-token"

export const OTHER_WEDDING_ID = "ffffffff-0000-0000-0000-000000000002"
export const OTHER_ORGANIZER_ID = "eeeeeeee-0000-0000-0000-000000000002"
export const OTHER_ORGANIZER_TOKEN = "test-other-organizer-jwt-token"

export const STAFF_TOKEN = "staff-device-access-token-abc"
export const STAFF_DEVICE_ID = "dddddddd-0000-0000-0000-000000000001"

export const TEST_WEDDING = {
  id: TEST_WEDDING_ID,
  name: "Sarah & Daniel Wedding",
  coupleNames: "Sarah & Daniel",
  slug: TEST_WEDDING_SLUG,
  status: "ACTIVE" as const,
  eventDate: "2026-12-01T00:00:00.000Z",
  location: "Lagos, Nigeria",
  country: "Nigeria",
  galleryEnabled: true,
  guestCount: 3,
  checkedInCount: 0,
  mediaCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

export const TEST_WEDDING_PRIVATE = {
  ...TEST_WEDDING,
  galleryEnabled: false,
}

export const TEST_GUEST_A = {
  id: "aaaaaaaa-0000-0000-0000-000000000011",
  fullName: "Adebayo Johnson",
  phoneNumber: "+234 800 000 0001",
  email: null,
  numberOfAllowedGuests: 2,
  qrToken: "qr-test-001",
  checkedIn: false,
  checkedInAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

export const TEST_GUEST_B = {
  id: "aaaaaaaa-0000-0000-0000-000000000012",
  fullName: "Marie Nkosi",
  phoneNumber: null,
  email: "marie@example.com",
  numberOfAllowedGuests: 1,
  qrToken: "qr-test-002",
  checkedIn: false,
  checkedInAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

export const TEST_MEDIA_ITEM = {
  id: "bbbbbbbb-0000-0000-0000-000000000001",
  weddingId: TEST_WEDDING_ID,
  mediaType: "IMAGE" as const,
  mimeType: "image/jpeg",
  status: "UPLOADED" as const,
  fileKey: "uploads/test-photo.jpg",
  fileSizeBytes: 2_000_000,
  uploadedByName: null,
  thumbnailUrl: null,
  downloadUrl: "https://storage.example.com/test-photo.jpg",
  createdAt: "2026-01-15T10:00:00.000Z",
}

/** Wraps data in the standard WedPass success response envelope. */
export function ok<T>(data: T) {
  return { success: true, data }
}

/** Wraps an error in the standard WedPass failure response envelope. */
export function fail(code: string, message: string) {
  return { success: false, error: { code, message } }
}

/** Builds a paginated list response. */
export function paginated<T>(items: T[], total?: number) {
  return ok({
    items,
    pagination: {
      total: total ?? items.length,
      page: 1,
      pageSize: 50,
    },
  })
}
