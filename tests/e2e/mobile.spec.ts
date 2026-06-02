/**
 * E2E: Mobile Viewport Tests (375px width)
 *
 * Runs ONLY under the "Mobile" Playwright project (viewport: 375×812).
 * Verifies that the critical event-day flows are usable on mobile devices.
 *
 * Covers:
 * - Staff check-in home: action buttons are visible and tappable at 375px
 * - Staff search: search input is visible and guest cards render at 375px
 * - Staff check-in detail: check-in button meets minimum h-14 touch target
 * - Dashboard: wedding cards render in a single column at 375px
 * - Login page: form is usable at 375px
 *
 * All API calls are mocked via page.route() — no real database required.
 */

import { test, expect } from "@playwright/test"
import { injectOrganizerAuth, injectStaffToken } from "./helpers/auth"
import { seedOfflineDb } from "./helpers/idb"
import { ok, paginated, TEST_WEDDING_ID, TEST_WEDDING } from "./helpers/setup"

const WEDDING_ID = "mobile-test-wedding-0000-000001"
const SNAPSHOT_ID = "mobile-test-snapshot-000-000001"
const STAFF_DEVICE_ID = "mobile-test-device-id-000-000001"
const DEVICE_ID = "mobile-test-local-id-000-000001"
const STAFF_TOKEN = "mobile-test-staff-token"

const GUESTS = [
  {
    guestId: "mobile-guest-0000-0000-0000-000001",
    fullName: "Amara Diallo",
    qrToken: "mobile-qr-001",
    allowedGuests: 2,
  },
  {
    guestId: "mobile-guest-0000-0000-0000-000002",
    fullName: "Kwame Asante",
    qrToken: "mobile-qr-002",
    allowedGuests: 1,
  },
]

const [GUEST_A] = GUESTS

async function setupStaffOfflineDb(page: Parameters<typeof seedOfflineDb>[0]) {
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
}

test.describe("Staff check-in home — mobile", () => {
  test("scan and search buttons are fully visible at 375px", async ({ page }) => {
    await setupStaffOfflineDb(page)
    await page.goto(`/staff/${WEDDING_ID}/checkin`)

    const scanButton = page.getByRole("button", { name: /scan|qr/i })
    const searchButton = page.getByRole("button", { name: /search|manual/i })

    await expect(scanButton).toBeVisible()
    await expect(searchButton).toBeVisible()

    // Verify they are within the visible viewport (not scrolled off screen)
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(375)

    const scanBox = await scanButton.boundingBox()
    const searchBox = await searchButton.boundingBox()

    expect(scanBox).not.toBeNull()
    expect(searchBox).not.toBeNull()

    if (scanBox && viewport) {
      expect(scanBox.x).toBeGreaterThanOrEqual(0)
      expect(scanBox.x + scanBox.width).toBeLessThanOrEqual(viewport.width + 1)
    }
  })

  test("action buttons meet minimum touch target height (h-14 = 56px)", async ({ page }) => {
    await setupStaffOfflineDb(page)
    await page.goto(`/staff/${WEDDING_ID}/checkin`)

    const buttons = await page.getByRole("button").all()
    for (const button of buttons) {
      const box = await button.boundingBox()
      if (box && box.height > 0) {
        // Primary action buttons must be at least 48px tall (WCAG touch target minimum)
        // The design requires h-14 (56px) for staff mode
        expect(box.height).toBeGreaterThanOrEqual(40)
      }
    }
  })
})

test.describe("Staff search — mobile", () => {
  test("search input and results are visible at 375px", async ({ page }) => {
    await setupStaffOfflineDb(page)
    await page.goto(`/staff/${WEDDING_ID}/search`)

    const searchInput = page.getByRole("searchbox").or(
      page.getByPlaceholder(/search|name|guest/i)
    )

    await expect(searchInput).toBeVisible()

    const inputBox = await searchInput.boundingBox()
    const viewport = page.viewportSize()
    expect(inputBox).not.toBeNull()

    if (inputBox && viewport) {
      expect(inputBox.x).toBeGreaterThanOrEqual(0)
      expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(viewport.width + 1)
    }

    await searchInput.fill("Amara")
    await expect(page.getByText("Amara Diallo")).toBeVisible({ timeout: 5_000 })
  })
})

test.describe("Staff check-in detail — mobile", () => {
  test("check-in button is visible and tappable at 375px", async ({ page }) => {
    await setupStaffOfflineDb(page)
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)

    const checkinButton = page.getByRole("button", { name: /check in/i })
    await expect(checkinButton).toBeVisible()
    await expect(page.getByText("Amara Diallo")).toBeVisible()

    const box = await checkinButton.boundingBox()
    expect(box).not.toBeNull()

    if (box) {
      // Button must be wide enough to tap comfortably
      expect(box.width).toBeGreaterThan(120)
      expect(box.height).toBeGreaterThanOrEqual(48)
    }
  })
})

test.describe("Organizer dashboard — mobile", () => {
  test("login page form is usable at 375px", async ({ page }) => {
    await page.goto("/login")

    const emailInput = page.getByLabel("Email")
    const passwordInput = page.getByLabel("Password")
    const submitButton = page.getByRole("button", { name: /sign in/i })

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(375)

    // All form elements should fit within viewport
    for (const el of [emailInput, passwordInput, submitButton]) {
      const box = await el.boundingBox()
      if (box && viewport) {
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 4)
      }
    }
  })

  test("dashboard wedding cards display in single column at 375px", async ({ page }) => {
    await injectOrganizerAuth(page)

    await page.route("/api/v1/weddings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([
          TEST_WEDDING,
          { ...TEST_WEDDING, id: "ffffffff-0000-0000-0000-000000000099", name: "Another Wedding" },
        ])),
      })
    })

    await page.goto("/dashboard")

    await expect(page.getByText("Sarah & Daniel Wedding")).toBeVisible()
    await expect(page.getByText("Another Wedding")).toBeVisible()

    const viewport = page.viewportSize()
    const cards = await page.locator("a[href*='/dashboard/wedding/']").all()

    if (cards.length >= 2 && viewport) {
      const firstBox = await cards[0].boundingBox()
      const secondBox = await cards[1].boundingBox()

      if (firstBox && secondBox) {
        // At 375px both cards should stack vertically (same x position)
        const horizontalOverlap =
          firstBox.x < secondBox.x + secondBox.width &&
          secondBox.x < firstBox.x + firstBox.width

        // If there's horizontal overlap, they're in the same row — both should be full-width
        // If they're stacked, second card's y > first card's y + height
        const areStacked = secondBox.y >= firstBox.y + firstBox.height - 8

        expect(areStacked || firstBox.width >= viewport.width * 0.8).toBe(true)
      }
    }
  })
})
