/**
 * E2E: Multi-Device Conflict Handling
 *
 * Covers:
 * - Scenario 2: Two devices check in the same guest offline at different times.
 *   Device B (later timestamp) syncs first → ACCEPTED at 14:03.
 *   Device A (earlier timestamp) syncs second → server overrides authority to 14:01.
 *   Both clients show authoritative timestamp of 14:01.
 *
 * These tests mock the sync API so they do not require a real database.
 * They do require the Next.js dev server running on localhost:3000.
 */

import { test, expect, BrowserContext, Page } from "@playwright/test"
import { seedOfflineDb, getGuestFromDb, getCheckinQueue } from "./helpers/idb"

const WEDDING_ID = "22222222-2222-2222-2222-222222222222"
const SNAPSHOT_ID = "33333333-3333-3333-3333-333333333333"
const STAFF_DEVICE_ID_A = "aaaaaaaa-dddd-dddd-dddd-dddddddddddd"
const STAFF_DEVICE_ID_B = "bbbbbbbb-dddd-dddd-dddd-dddddddddddd"
const DEVICE_ID_A = "aaaaaaaa-5555-5555-5555-555555555555"
const DEVICE_ID_B = "bbbbbbbb-5555-5555-5555-555555555555"
const STAFF_TOKEN_A = "staff-token-device-a"
const STAFF_TOKEN_B = "staff-token-device-b"

const SHARED_GUEST = {
  guestId: "cccccccc-0000-0000-0000-000000000001",
  fullName: "Jean-Pierre Mbala",
  qrToken: "qr-shared-001",
  allowedGuests: 2,
}

const OTHER_GUEST = {
  guestId: "cccccccc-0000-0000-0000-000000000002",
  fullName: "Sarah Mukamana",
  qrToken: "qr-other-002",
  allowedGuests: 1,
}

const GUESTS = [SHARED_GUEST, OTHER_GUEST]

// Device A checks in at 14:01 (earlier — should win)
const DEVICE_A_CHECKIN_TIME = "2026-08-14T14:01:00.000Z"
// Device B checks in at 14:03 (later — should become duplicate)
const DEVICE_B_CHECKIN_TIME = "2026-08-14T14:03:00.000Z"
// Authoritative time is always the earliest
const AUTHORITATIVE_TIME = DEVICE_A_CHECKIN_TIME

async function setupDevice(
  context: BrowserContext,
  page: Page,
  opts: {
    staffDeviceId: string
    deviceId: string
    staffToken: string
  }
) {
  await page.goto(`/staff/${WEDDING_ID}/checkin`)
  await seedOfflineDb(page, {
    weddingId: WEDDING_ID,
    snapshotId: SNAPSHOT_ID,
    snapshotVersion: 1,
    staffDeviceId: opts.staffDeviceId,
    deviceId: opts.deviceId,
    staffToken: opts.staffToken,
    guests: GUESTS,
  })
}

test.describe("Multi-device conflict: earlier timestamp wins", () => {
  test("Device B syncs first (14:03), Device A syncs second (14:01) — server authority becomes 14:01", async ({
    browser,
  }) => {
    // Create two isolated browser contexts simulating two staff devices
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    try {
      // Prepare both devices with the same snapshot
      await setupDevice(contextA, pageA, {
        staffDeviceId: STAFF_DEVICE_ID_A,
        deviceId: DEVICE_ID_A,
        staffToken: STAFF_TOKEN_A,
      })
      await setupDevice(contextB, pageB, {
        staffDeviceId: STAFF_DEVICE_ID_B,
        deviceId: DEVICE_ID_B,
        staffToken: STAFF_TOKEN_B,
      })

      // Both devices go offline
      await contextA.setOffline(true)
      await contextB.setOffline(true)

      // Device A checks in the shared guest at 14:01 (earlier)
      await pageA.goto(`/staff/${WEDDING_ID}/checkin/${SHARED_GUEST.guestId}`)
      await pageA.getByRole("button", { name: /check in/i }).click()
      await expect(pageA.getByText(/checked in successfully/i)).toBeVisible()

      // Device B checks in the same guest at 14:03 (later)
      await pageB.goto(`/staff/${WEDDING_ID}/checkin/${SHARED_GUEST.guestId}`)
      await pageB.getByRole("button", { name: /check in/i }).click()
      await expect(pageB.getByText(/checked in successfully/i)).toBeVisible()

      // Confirm both devices have the shared guest locally checked in
      const guestOnA = await getGuestFromDb(pageA, SHARED_GUEST.guestId)
      expect(guestOnA?.checkedIn).toBe(true)

      const guestOnB = await getGuestFromDb(pageB, SHARED_GUEST.guestId)
      expect(guestOnB?.checkedIn).toBe(true)

      // Both queue items should exist and be unsynced
      const queueA = await getCheckinQueue(pageA)
      const queueB = await getCheckinQueue(pageB)
      expect(queueA.some((q) => q.guestId === SHARED_GUEST.guestId && !q.synced)).toBe(true)
      expect(queueB.some((q) => q.guestId === SHARED_GUEST.guestId && !q.synced)).toBe(true)

      // Come back online
      await contextB.setOffline(false)
      await contextA.setOffline(false)

      // Step 1: Device B syncs first → server accepts 14:03 as authoritative
      const queueBItems = await getCheckinQueue(pageB)
      const queueBItem = queueBItems.find((q) => q.guestId === SHARED_GUEST.guestId)

      await pageB.route(
        `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                results: [
                  {
                    queueId: queueBItem?.queueId ?? "q-b",
                    guestId: SHARED_GUEST.guestId,
                    status: "ACCEPTED",
                    authoritativeCheckedInAt: DEVICE_B_CHECKIN_TIME,
                  },
                ],
                summary: { accepted: 1, duplicate: 0, rejected: 0 },
              },
            }),
          })
        }
      )

      await pageB.goto(`/staff/${WEDDING_ID}/sync`)
      await pageB.getByRole("button", { name: /sync now/i }).click()
      await expect(pageB.getByText("0")).toBeVisible({ timeout: 10_000 })

      // Device B queue item should be marked synced
      const finalQueueB = await getCheckinQueue(pageB)
      const syncedB = finalQueueB.find((q) => q.guestId === SHARED_GUEST.guestId)
      expect(syncedB?.synced).toBe(true)

      // Device B guest should show 14:03 (what B knows so far)
      const guestBAfterSync = await getGuestFromDb(pageB, SHARED_GUEST.guestId)
      expect(guestBAfterSync?.checkedIn).toBe(true)
      expect(guestBAfterSync?.checkedInAt).toBe(DEVICE_B_CHECKIN_TIME)

      // Step 2: Device A syncs second → server overrides authority to 14:01 (earlier wins)
      const queueAItems = await getCheckinQueue(pageA)
      const queueAItem = queueAItems.find((q) => q.guestId === SHARED_GUEST.guestId)

      await pageA.route(
        `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
        async (route) => {
          // Server returns ACCEPTED for A's earlier timestamp, overriding B's
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                results: [
                  {
                    queueId: queueAItem?.queueId ?? "q-a",
                    guestId: SHARED_GUEST.guestId,
                    status: "ACCEPTED",
                    authoritativeCheckedInAt: AUTHORITATIVE_TIME,
                  },
                ],
                summary: { accepted: 1, duplicate: 0, rejected: 0 },
              },
            }),
          })
        }
      )

      await pageA.goto(`/staff/${WEDDING_ID}/sync`)
      await pageA.getByRole("button", { name: /sync now/i }).click()
      await expect(pageA.getByText("0")).toBeVisible({ timeout: 10_000 })

      // Device A queue item should be marked synced
      const finalQueueA = await getCheckinQueue(pageA)
      const syncedA = finalQueueA.find((q) => q.guestId === SHARED_GUEST.guestId)
      expect(syncedA?.synced).toBe(true)

      // Device A guest should now show the authoritative time (14:01)
      const guestAAfterSync = await getGuestFromDb(pageA, SHARED_GUEST.guestId)
      expect(guestAAfterSync?.checkedIn).toBe(true)
      expect(guestAAfterSync?.checkedInAt).toBe(AUTHORITATIVE_TIME)
    } finally {
      await contextA.close()
      await contextB.close()
    }
  })

  test("Queue items on both devices are never deleted before server acknowledgement", async ({
    browser,
  }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    try {
      await setupDevice(contextA, pageA, {
        staffDeviceId: STAFF_DEVICE_ID_A,
        deviceId: DEVICE_ID_A,
        staffToken: STAFF_TOKEN_A,
      })
      await setupDevice(contextB, pageB, {
        staffDeviceId: STAFF_DEVICE_ID_B,
        deviceId: DEVICE_ID_B,
        staffToken: STAFF_TOKEN_B,
      })

      await contextA.setOffline(true)
      await contextB.setOffline(true)

      // Both devices check in the same guest offline
      await pageA.goto(`/staff/${WEDDING_ID}/checkin/${SHARED_GUEST.guestId}`)
      await pageA.getByRole("button", { name: /check in/i }).click()
      await expect(pageA.getByText(/checked in successfully/i)).toBeVisible()

      await pageB.goto(`/staff/${WEDDING_ID}/checkin/${SHARED_GUEST.guestId}`)
      await pageB.getByRole("button", { name: /check in/i }).click()
      await expect(pageB.getByText(/checked in successfully/i)).toBeVisible()

      // While still offline, verify queue items exist and are NOT synced on both devices
      const queueA = await getCheckinQueue(pageA)
      const queueB = await getCheckinQueue(pageB)

      const itemA = queueA.find((q) => q.guestId === SHARED_GUEST.guestId)
      const itemB = queueB.find((q) => q.guestId === SHARED_GUEST.guestId)

      expect(itemA).toBeDefined()
      expect(itemA?.synced).toBe(false)

      expect(itemB).toBeDefined()
      expect(itemB?.synced).toBe(false)
    } finally {
      await contextA.close()
      await contextB.close()
    }
  })

  test("Device B receives DUPLICATE status when device A's earlier check-in already accepted", async ({
    browser,
  }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    try {
      await setupDevice(contextA, pageA, {
        staffDeviceId: STAFF_DEVICE_ID_A,
        deviceId: DEVICE_ID_A,
        staffToken: STAFF_TOKEN_A,
      })
      await setupDevice(contextB, pageB, {
        staffDeviceId: STAFF_DEVICE_ID_B,
        deviceId: DEVICE_ID_B,
        staffToken: STAFF_TOKEN_B,
      })

      await contextA.setOffline(true)
      await contextB.setOffline(true)

      // Device A checks in at 14:01
      await pageA.goto(`/staff/${WEDDING_ID}/checkin/${SHARED_GUEST.guestId}`)
      await pageA.getByRole("button", { name: /check in/i }).click()
      await expect(pageA.getByText(/checked in successfully/i)).toBeVisible()

      // Device B checks in at 14:03
      await pageB.goto(`/staff/${WEDDING_ID}/checkin/${SHARED_GUEST.guestId}`)
      await pageB.getByRole("button", { name: /check in/i }).click()
      await expect(pageB.getByText(/checked in successfully/i)).toBeVisible()

      await contextA.setOffline(false)
      await contextB.setOffline(false)

      // Device A syncs first and gets ACCEPTED
      const queueAItems = await getCheckinQueue(pageA)
      const queueAItem = queueAItems.find((q) => q.guestId === SHARED_GUEST.guestId)

      await pageA.route(
        `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                results: [
                  {
                    queueId: queueAItem?.queueId ?? "q-a",
                    guestId: SHARED_GUEST.guestId,
                    status: "ACCEPTED",
                    authoritativeCheckedInAt: DEVICE_A_CHECKIN_TIME,
                  },
                ],
                summary: { accepted: 1, duplicate: 0, rejected: 0 },
              },
            }),
          })
        }
      )

      await pageA.goto(`/staff/${WEDDING_ID}/sync`)
      await pageA.getByRole("button", { name: /sync now/i }).click()
      await expect(pageA.getByText("0")).toBeVisible({ timeout: 10_000 })

      // Device B syncs and gets DUPLICATE — server already has A's earlier timestamp
      const queueBItems = await getCheckinQueue(pageB)
      const queueBItem = queueBItems.find((q) => q.guestId === SHARED_GUEST.guestId)

      await pageB.route(
        `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                results: [
                  {
                    queueId: queueBItem?.queueId ?? "q-b",
                    guestId: SHARED_GUEST.guestId,
                    status: "DUPLICATE",
                    authoritativeCheckedInAt: DEVICE_A_CHECKIN_TIME,
                  },
                ],
                summary: { accepted: 0, duplicate: 1, rejected: 0 },
              },
            }),
          })
        }
      )

      await pageB.goto(`/staff/${WEDDING_ID}/sync`)
      await pageB.getByRole("button", { name: /sync now/i }).click()
      await expect(pageB.getByText("0")).toBeVisible({ timeout: 10_000 })

      // Device B's queue item is marked synced despite being a duplicate
      const finalQueueB = await getCheckinQueue(pageB)
      const syncedB = finalQueueB.find((q) => q.guestId === SHARED_GUEST.guestId)
      expect(syncedB?.synced).toBe(true)

      // Device B's guest is updated to the authoritative timestamp (14:01, not 14:03)
      const guestBFinal = await getGuestFromDb(pageB, SHARED_GUEST.guestId)
      expect(guestBFinal?.checkedIn).toBe(true)
      expect(guestBFinal?.checkedInAt).toBe(DEVICE_A_CHECKIN_TIME)
    } finally {
      await contextA.close()
      await contextB.close()
    }
  })
})
