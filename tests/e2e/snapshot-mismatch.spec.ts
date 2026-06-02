/**
 * E2E: Snapshot Mismatch Handling
 *
 * Covers:
 * - Scenario 5: Staff device has an old snapshot, server has a different active snapshot.
 *   Server returns SNAPSHOT_MISMATCH → client stops syncing, shows a warning, and preserves the queue.
 *
 * These tests mock the sync API so they do not require a real database.
 * They do require the Next.js dev server running on localhost:3000.
 */

import { test, expect } from "@playwright/test"
import { seedOfflineDb, getCheckinQueue, getMetadataFromDb } from "./helpers/idb"

const WEDDING_ID = "55555555-5555-5555-5555-555555555555"
const SNAPSHOT_ID = "66666666-6666-6666-6666-666666666666"
const STAFF_DEVICE_ID = "77777777-7777-7777-7777-777777777777"
const DEVICE_ID = "88888888-8888-8888-8888-888888888888"
const STAFF_TOKEN = "test-staff-token-snapshot-mismatch"

const GUESTS = [
  {
    guestId: "dddddddd-0000-0000-0000-000000000001",
    fullName: "Kwame Mensah",
    qrToken: "qr-snap-001",
    allowedGuests: 2,
  },
  {
    guestId: "dddddddd-0000-0000-0000-000000000002",
    fullName: "Adebayo Johnson",
    qrToken: "qr-snap-002",
    allowedGuests: 1,
  },
]

const [GUEST_A, GUEST_B] = GUESTS

test.describe("Snapshot mismatch handling", () => {
  test.beforeEach(async ({ page }) => {
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

  test("client stops syncing and shows snapshot mismatch warning when server returns SNAPSHOT_MISMATCH", async ({
    context,
    page,
  }) => {
    // Go offline and check in a guest
    await context.setOffline(true)

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    // Come back online
    await context.setOffline(false)

    // Mock the sync endpoint to return SNAPSHOT_MISMATCH
    await page.route(
      `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
      async (route) => {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: {
              code: "SNAPSHOT_MISMATCH",
              message:
                "Client snapshot does not match the active server snapshot. Please refresh your offline pack.",
            },
          }),
        })
      }
    )

    // Navigate to sync page and trigger sync
    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await page.getByRole("button", { name: /sync now/i }).click()

    // Client should show a snapshot mismatch warning
    await expect(
      page.getByText(/snapshot|outdated|refresh/i)
    ).toBeVisible({ timeout: 10_000 })
  })

  test("queue is preserved (not deleted) after SNAPSHOT_MISMATCH response", async ({
    context,
    page,
  }) => {
    await context.setOffline(true)

    // Check in two guests offline
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_B.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    // Verify both items are queued
    const queueBefore = await getCheckinQueue(page)
    const unsyncedBefore = queueBefore.filter((q) => !q.synced)
    expect(unsyncedBefore.length).toBe(2)

    await context.setOffline(false)

    // Server returns SNAPSHOT_MISMATCH
    await page.route(
      `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
      async (route) => {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: {
              code: "SNAPSHOT_MISMATCH",
              message: "Snapshot mismatch.",
            },
          }),
        })
      }
    )

    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await page.getByRole("button", { name: /sync now/i }).click()

    // Wait for UI to react
    await page.waitForTimeout(3_000)

    // Queue must still have both unsynced items — nothing deleted
    const queueAfter = await getCheckinQueue(page)
    const unsyncedAfter = queueAfter.filter((q) => !q.synced)
    expect(unsyncedAfter.length).toBe(2)

    // Both guest IDs must still be in the queue
    const guestIds = unsyncedAfter.map((q) => q.guestId)
    expect(guestIds).toContain(GUEST_A.guestId)
    expect(guestIds).toContain(GUEST_B.guestId)
  })

  test("SNAPSHOT_MISMATCH stored in metadata so warning persists across page refreshes", async ({
    context,
    page,
  }) => {
    await context.setOffline(true)

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    await context.setOffline(false)

    await page.route(
      `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
      async (route) => {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: {
              code: "SNAPSHOT_MISMATCH",
              message: "Snapshot mismatch.",
            },
          }),
        })
      }
    )

    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await page.getByRole("button", { name: /sync now/i }).click()
    await page.waitForTimeout(3_000)

    // The client should write snapshotMismatch to metadata so the warning persists
    const mismatchValue = await getMetadataFromDb(page, "snapshotMismatch")
    expect(mismatchValue).toBeTruthy()
  })

  test("unsynced queue items before snapshot mismatch remain retryable after snapshot refresh", async ({
    context,
    page,
  }) => {
    await context.setOffline(true)

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    const queueBefore = await getCheckinQueue(page)
    const itemBefore = queueBefore.find((q) => q.guestId === GUEST_A.guestId)
    expect(itemBefore?.synced).toBe(false)

    await context.setOffline(false)

    // First sync returns SNAPSHOT_MISMATCH
    let syncCallCount = 0
    await page.route(
      `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
      async (route) => {
        syncCallCount++
        if (syncCallCount === 1) {
          await route.fulfill({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: { code: "SNAPSHOT_MISMATCH", message: "Mismatch." },
            }),
          })
        } else {
          // Subsequent call (after simulated refresh) returns ACCEPTED
          const queue = await getCheckinQueue(page)
          const item = queue.find((q) => q.guestId === GUEST_A.guestId)
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                results: [
                  {
                    queueId: item?.queueId ?? "q-1",
                    guestId: GUEST_A.guestId,
                    status: "ACCEPTED",
                    authoritativeCheckedInAt: new Date().toISOString(),
                  },
                ],
                summary: { accepted: 1, duplicate: 0, rejected: 0 },
              },
            }),
          })
        }
      }
    )

    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await page.getByRole("button", { name: /sync now/i }).click()
    await page.waitForTimeout(3_000)

    // After SNAPSHOT_MISMATCH, the queue item is still unsynced
    const queueAfterMismatch = await getCheckinQueue(page)
    const itemAfterMismatch = queueAfterMismatch.find((q) => q.guestId === GUEST_A.guestId)
    expect(itemAfterMismatch?.synced).toBe(false)

    // Simulate snapshot refresh by clearing the mismatch flag in metadata
    await page.evaluate(async () => {
      const DB_NAME = "wedpass_offline_db"
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME)
        req.onsuccess = () => {
          const db = req.result
          const tx = db.transaction("metadata", "readwrite")
          const store = tx.objectStore("metadata")
          store.delete("snapshotMismatch")
          tx.oncomplete = () => {
            db.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
        req.onerror = () => reject(req.error)
      })
    })

    // Retry sync — should now succeed
    await page.getByRole("button", { name: /sync now/i }).click()
    await expect(page.getByText("0")).toBeVisible({ timeout: 10_000 })

    const finalQueue = await getCheckinQueue(page)
    const syncedItem = finalQueue.find((q) => q.guestId === GUEST_A.guestId)
    expect(syncedItem?.synced).toBe(true)
  })
})
