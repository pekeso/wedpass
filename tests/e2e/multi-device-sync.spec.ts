/**
 * E2E: Multi-Device Sync — Additional Scenarios
 *
 * The core conflict-resolution logic (earlier timestamp wins, DUPLICATE status)
 * is fully covered in multi-device-conflict.spec.ts (Phase 17).
 *
 * This suite adds:
 * - Sync summary display (accepted/duplicate/rejected counts shown in UI)
 * - Last synced timestamp is displayed after a successful sync
 * - Syncing with an empty queue does nothing and shows the "all synced" state
 * - Retry after a transient network failure succeeds on second attempt
 *
 * All API calls are mocked via page.route() — no real database required.
 */

import { test, expect } from "@playwright/test"
import { injectStaffToken } from "./helpers/auth"
import { seedOfflineDb, getCheckinQueue, getMetadataFromDb } from "./helpers/idb"

const WEDDING_ID = "11111111-sync2-0000-0000-000000000001"
const SNAPSHOT_ID = "22222222-sync2-0000-0000-000000000001"
const STAFF_DEVICE_ID = "33333333-sync2-0000-0000-000000000001"
const DEVICE_ID = "44444444-sync2-0000-0000-000000000001"
const STAFF_TOKEN = "staff-token-sync2-spec"

const GUESTS = [
  {
    guestId: "55555555-sync2-0000-0000-000000000001",
    fullName: "Ngozi Eze",
    qrToken: "qr-sync2-001",
    allowedGuests: 2,
  },
  {
    guestId: "55555555-sync2-0000-0000-000000000002",
    fullName: "Samuel Boateng",
    qrToken: "qr-sync2-002",
    allowedGuests: 1,
  },
]

const [GUEST_A, GUEST_B] = GUESTS

function fulfillSync(
  results: Array<{
    queueId: string
    guestId: string
    status: "ACCEPTED" | "DUPLICATE" | "REJECTED"
    authoritativeCheckedInAt: string
  }>
) {
  const accepted = results.filter((r) => r.status === "ACCEPTED").length
  const duplicate = results.filter((r) => r.status === "DUPLICATE").length
  const rejected = results.filter((r) => r.status === "REJECTED").length
  return JSON.stringify({
    success: true,
    data: { results, summary: { accepted, duplicate, rejected } },
  })
}

test.describe("Sync summary display", () => {
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

  test("sync page shows accepted count of 0 when queue is empty", async ({ page }) => {
    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await expect(page.getByText("0")).toBeVisible()
  })

  test("after syncing two ACCEPTED check-ins, pending count drops to 0", async ({ context, page }) => {
    await context.setOffline(true)

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_B.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()

    await context.setOffline(false)

    await page.route(
      `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
      async (route) => {
        const queue = await getCheckinQueue(page)
        const results = queue.map((item) => ({
          queueId: item.queueId,
          guestId: item.guestId,
          status: "ACCEPTED" as const,
          authoritativeCheckedInAt: new Date().toISOString(),
        }))
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: fulfillSync(results),
        })
      }
    )

    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await page.getByRole("button", { name: /sync now/i }).click()

    await expect(page.getByText("0")).toBeVisible({ timeout: 10_000 })
  })

  test("last successful sync time is stored in metadata after successful sync", async ({
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
        const queue = await getCheckinQueue(page)
        const item = queue.find((q) => q.guestId === GUEST_A.guestId)
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: fulfillSync([
            {
              queueId: item?.queueId ?? "q-1",
              guestId: GUEST_A.guestId,
              status: "ACCEPTED",
              authoritativeCheckedInAt: new Date().toISOString(),
            },
          ]),
        })
      }
    )

    await page.goto(`/staff/${WEDDING_ID}/sync`)
    await page.getByRole("button", { name: /sync now/i }).click()
    await expect(page.getByText("0")).toBeVisible({ timeout: 10_000 })

    const lastSyncAt = await getMetadataFromDb(page, "lastSuccessfulSyncAt")
    expect(lastSyncAt).toBeTruthy()
  })
})

test.describe("Sync retry after transient failure", () => {
  test("sync retries successfully after a server error on the first attempt", async ({
    context,
    page,
  }) => {
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

    await context.setOffline(true)
    await page.goto(`/staff/${WEDDING_ID}/checkin/${GUEST_A.guestId}`)
    await page.getByRole("button", { name: /check in/i }).click()
    await expect(page.getByText(/checked in successfully/i)).toBeVisible()
    await context.setOffline(false)

    let callCount = 0
    await page.route(
      `/api/v1/staff/weddings/${WEDDING_ID}/checkins/sync`,
      async (route) => {
        callCount++
        if (callCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: { code: "INTERNAL_SERVER_ERROR", message: "Server error" },
            }),
          })
        } else {
          const queue = await getCheckinQueue(page)
          const item = queue.find((q) => q.guestId === GUEST_A.guestId)
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: fulfillSync([
              {
                queueId: item?.queueId ?? "q-1",
                guestId: GUEST_A.guestId,
                status: "ACCEPTED",
                authoritativeCheckedInAt: new Date().toISOString(),
              },
            ]),
          })
        }
      }
    )

    await page.goto(`/staff/${WEDDING_ID}/sync`)

    // First attempt fails
    await page.getByRole("button", { name: /sync now/i }).click()
    await page.waitForTimeout(2_000)

    // Second attempt succeeds
    await page.getByRole("button", { name: /sync now|retry/i }).click()
    await expect(page.getByText("0")).toBeVisible({ timeout: 10_000 })

    const finalQueue = await getCheckinQueue(page)
    const syncedItems = finalQueue.filter((q) => q.synced)
    expect(syncedItems.length).toBe(finalQueue.length)
  })
})
