/**
 * E2E: Staff Check-In UI Flows
 *
 * Covers UI interactions for the staff experience that are NOT covered by the
 * offline-checkin.spec.ts and multi-device-conflict.spec.ts suites (which focus
 * on IndexedDB state and sync correctness).
 *
 * Specifically tests:
 * - Staff login page: valid token entry → redirect to download
 * - Staff login page: invalid token shows error
 * - Staff check-in home: scan and search action cards are visible
 * - Staff search page: finds guests by name
 * - Staff sync page: pending count and sync button are visible
 *
 * All API calls are mocked via page.route() — no real database required.
 */

import { test, expect } from "@playwright/test"
import { injectStaffToken } from "./helpers/auth"
import { seedOfflineDb } from "./helpers/idb"

const WEDDING_ID = "aaaaaaaa-9999-9999-9999-000000000001"
const SNAPSHOT_ID = "bbbbbbbb-9999-9999-9999-000000000001"
const STAFF_DEVICE_ID = "cccccccc-9999-9999-9999-000000000001"
const DEVICE_ID = "dddddddd-9999-9999-9999-000000000001"
const STAFF_TOKEN = "valid-staff-token-e2e-test"

const GUESTS = [
  { guestId: "eeeeeeee-9999-9999-9999-000000000001", fullName: "Chisom Okafor", qrToken: "qr-staff-001", allowedGuests: 2 },
  { guestId: "eeeeeeee-9999-9999-9999-000000000002", fullName: "Fatima Al-Hassan", qrToken: "qr-staff-002", allowedGuests: 1 },
  { guestId: "eeeeeeee-9999-9999-9999-000000000003", fullName: "Kofi Asante", qrToken: "qr-staff-003", allowedGuests: 3 },
]

test.describe("Staff Login", () => {
  test("valid token is saved and redirects to download page", async ({ page }) => {
    await page.route(`/api/v1/staff/weddings/${WEDDING_ID}/verify`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { valid: true, weddingId: WEDDING_ID, deviceId: STAFF_DEVICE_ID },
        }),
      })
    })

    await page.route(`/api/v1/staff/weddings/${WEDDING_ID}/snapshot`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            snapshotId: SNAPSHOT_ID,
            snapshotVersion: 1,
            guestCount: GUESTS.length,
            guests: GUESTS.map((g) => ({
              guestId: g.guestId,
              fullName: g.fullName,
              qrToken: g.qrToken,
              allowedGuests: g.allowedGuests,
              checkedIn: false,
              checkedInAt: null,
            })),
          },
        }),
      })
    })

    await page.goto(`/staff/${WEDDING_ID}/login`)
    await expect(page.getByRole("heading")).toBeVisible()

    const tokenInput = page.getByRole("textbox")
    await tokenInput.fill(STAFF_TOKEN)
    await page.getByRole("button", { name: /continue|access|verify/i }).click()

    await expect(page).toHaveURL(new RegExp(`/staff/${WEDDING_ID}/download`), { timeout: 8_000 })
  })

  test("invalid token shows an error message", async ({ page }) => {
    await page.route(`/api/v1/staff/weddings/${WEDDING_ID}/verify`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid staff token" },
        }),
      })
    })

    await page.goto(`/staff/${WEDDING_ID}/login`)
    const tokenInput = page.getByRole("textbox")
    await tokenInput.fill("bad-token")
    await page.getByRole("button", { name: /continue|access|verify/i }).click()

    await expect(page.getByText(/invalid|incorrect|unauthorized/i)).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/staff/${WEDDING_ID}/login`))
  })
})

test.describe("Staff Check-In Home", () => {
  test.beforeEach(async ({ page }) => {
    await injectStaffToken(page, WEDDING_ID, STAFF_TOKEN)
    await page.goto(`/staff/${WEDDING_ID}/checkin`)
    await seedOfflineDb(page, {
      weddingId: WEDDING_ID,
      snapshotId: SNAPSHOT_ID,
      snapshotVersion: 1,
      staffDeviceId: STAFF_DEVICE_ID,
      deviceId: DEVICE_ID,
      staffToken: STAFF_TOKEN,
      guests: GUESTS,
    })
  })

  test("scan and search action cards are visible", async ({ page }) => {
    await page.goto(`/staff/${WEDDING_ID}/checkin`)
    await expect(page.getByRole("button", { name: /scan|qr/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /search|manual/i })).toBeVisible()
  })

  test("search button navigates to search page", async ({ page }) => {
    await page.goto(`/staff/${WEDDING_ID}/checkin`)
    await page.getByRole("button", { name: /search|manual/i }).click()
    await expect(page).toHaveURL(new RegExp(`/staff/${WEDDING_ID}/search`))
  })
})

test.describe("Staff Search", () => {
  test.beforeEach(async ({ page }) => {
    await injectStaffToken(page, WEDDING_ID, STAFF_TOKEN)
    await page.goto(`/staff/${WEDDING_ID}/checkin`)
    await seedOfflineDb(page, {
      weddingId: WEDDING_ID,
      snapshotId: SNAPSHOT_ID,
      snapshotVersion: 1,
      staffDeviceId: STAFF_DEVICE_ID,
      deviceId: DEVICE_ID,
      staffToken: STAFF_TOKEN,
      guests: GUESTS,
    })
  })

  test("typing a name filters guests from IndexedDB", async ({ page }) => {
    await page.goto(`/staff/${WEDDING_ID}/search`)
    const searchInput = page.getByRole("searchbox").or(page.getByPlaceholder(/search|name|guest/i))
    await searchInput.fill("Chisom")

    await expect(page.getByText("Chisom Okafor")).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("Fatima Al-Hassan")).not.toBeVisible()
    await expect(page.getByText("Kofi Asante")).not.toBeVisible()
  })

  test("selecting a guest navigates to their check-in page", async ({ page }) => {
    await page.goto(`/staff/${WEDDING_ID}/search`)
    const searchInput = page.getByRole("searchbox").or(page.getByPlaceholder(/search|name|guest/i))
    await searchInput.fill("Fatima")

    await page.getByText("Fatima Al-Hassan").click()
    await expect(page).toHaveURL(
      new RegExp(`/staff/${WEDDING_ID}/checkin/${GUESTS[1].guestId}`)
    )
  })
})

test.describe("Staff Sync Page", () => {
  test("sync page shows pending count before syncing", async ({ page }) => {
    await injectStaffToken(page, WEDDING_ID, STAFF_TOKEN)
    await page.goto(`/staff/${WEDDING_ID}/checkin`)
    await seedOfflineDb(page, {
      weddingId: WEDDING_ID,
      snapshotId: SNAPSHOT_ID,
      snapshotVersion: 1,
      staffDeviceId: STAFF_DEVICE_ID,
      deviceId: DEVICE_ID,
      staffToken: STAFF_TOKEN,
      guests: GUESTS,
    })

    await page.context().setOffline(true)
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUESTS[0].guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    await page.context().setOffline(false)
    await page.goto(`/staff/${WEDDING_ID}/sync`)

    await expect(page.getByRole("button", { name: /sync now/i })).toBeVisible()
    await expect(page.getByText(/1|pending/i)).toBeVisible()
  })
})
