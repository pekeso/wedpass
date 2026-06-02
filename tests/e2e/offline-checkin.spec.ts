/**
 * E2E: Offline Check-In and Browser Refresh Persistence
 *
 * Covers:
 * - Scenario 1: Single device offline check-in + sync
 * - Scenario 4: Browser refresh persistence
 *
 * These tests mock all API calls so they do not require a real database.
 * They do require the Next.js dev server running on localhost:3000.
 */

import { test, expect } from "@playwright/test"
import { seedOfflineDb, getGuestFromDb, getCheckinQueue, getMetadataFromDb } from "./helpers/idb"

const WEDDING_ID = "11111111-1111-1111-1111-111111111111"
const SNAPSHOT_ID = "33333333-3333-3333-3333-333333333333"
const STAFF_DEVICE_ID = "44444444-4444-4444-4444-444444444444"
const DEVICE_ID = "55555555-5555-5555-5555-555555555555"
const STAFF_TOKEN = "test-staff-token-offline-spec"

const GUESTS = [
  { guestId: "aaaaaaaa-0000-0000-0000-000000000001", fullName: "Adebayo Johnson", qrToken: "qr-001", allowedGuests: 2 },
  { guestId: "aaaaaaaa-0000-0000-0000-000000000002", fullName: "Marie-Claire N'Guessan", qrToken: "qr-002", allowedGuests: 1 },
  { guestId: "aaaaaaaa-0000-0000-0000-000000000003", fullName: "Kwame Mensah", qrToken: "qr-003", allowedGuests: 3 },
]

const [GUEST_A, GUEST_B, GUEST_C] = GUESTS

function makeSyncOkResponse(results: object[]) {
  return {
    success: true,
    data: {
      results,
      summary: { accepted: results.length, duplicate: 0, rejected: 0 },
    },
  }
}

test.describe("Single device offline check-in", () => {
  test.beforeEach(async ({ page }) => {
    // Seed IndexedDB with snapshot data before navigating
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

  test("checks in a guest offline and shows success state", async ({ context, page }) => {
    await context.setOffline(true)

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await expect(page.getByText(GUEST_A.fullName)).toBeVisible()

    await page.getByRole("button", { name: /check in/i }).click()

    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    const guestRecord = await getGuestFromDb(page, GUEST_A.guestId)
    expect(guestRecord?.checkedIn).toBe(true)
    expect(guestRecord?.checkedInAt).toBeTruthy()

    const queue = await getCheckinQueue(page)
    const item = queue.find((q) => q.guestId === GUEST_A.guestId)
    expect(item).toBeDefined()
    expect(item?.synced).toBe(false)
  })

  test("already-checked-in guest shows warning, not duplicate queue item", async ({ context, page }) => {
    await context.setOffline(true)

    // First check-in
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_B.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    // Navigate back to same guest and attempt again
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_B.guestId}`)
    await expect(page.getByText(/already checked in/i)).toBeVisible()

    const queue = await getCheckinQueue(page)
    const items = queue.filter((q) => q.guestId === GUEST_B.guestId)
    expect(items).toHaveLength(1)
  })

  test("queue items persist after browser page reload (Scenario 4)", async ({ context, page }) => {
    await context.setOffline(true)

    // Check in two guests
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_B.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    // Hard reload — IndexedDB must survive
    await page.reload()

    const queue = await getCheckinQueue(page)
    const unsyncedItems = queue.filter((q) => !q.synced)
    expect(unsyncedItems.length).toBeGreaterThanOrEqual(2)

    const guestARecord = await getGuestFromDb(page, GUEST_A.guestId)
    expect(guestARecord?.checkedIn).toBe(true)

    const guestBRecord = await getGuestFromDb(page, GUEST_B.guestId)
    expect(guestBRecord?.checkedIn).toBe(true)
  })

  test("queue items are preserved (never deleted) when sync has not been acknowledged", async ({
    context,
    page,
  }) => {
    await context.setOffline(true)

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_C.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    // While still offline, verify queue item exists and is NOT synced
    const queue = await getCheckinQueue(page)
    const item = queue.find((q) => q.guestId === GUEST_C.guestId)
    expect(item).toBeDefined()
    expect(item?.synced).toBe(false)
  })

  test("sync marks all queue items as synced when server responds with ACCEPTED", async ({
    context,
    page,
  }) => {
    await context.setOffline(true)

    // Check in one guest
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    // Come back online
    await context.setOffline(false)

    // Mock the sync endpoint to return ACCEPTED
    await page.route(`/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`, async (route) => {
      const queue = await getCheckinQueue(page)
      const item = queue.find((q) => q.guestId === GUEST_A.guestId)

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          makeSyncOkResponse([
            {
              queueId: item?.queueId ?? "q-1",
              guestId: GUEST_A.guestId,
              status: "ACCEPTED",
              authoritativeCheckedInAt: new Date().toISOString(),
            },
          ])
        ),
      })
    })

    // Navigate to sync page and trigger sync
    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await page.getByRole("button", { name: /sync now/i }).click()

    // Wait for pending count to reach 0
    await expect(page.getByText("0")).toBeVisible({ timeout: 10_000 })

    // Verify queue item is now marked synced
    const finalQueue = await getCheckinQueue(page)
    const syncedItems = finalQueue.filter((q) => q.synced)
    expect(syncedItems).toHaveLength(finalQueue.length)

    // lastSuccessfulSyncAt should be set
    const lastSync = await getMetadataFromDb(page, "lastSuccessfulSyncAt")
    expect(lastSync).toBeTruthy()
  })
})
