import { describe, it, expect, beforeEach, vi } from "vitest"
import { offlineDb } from "@/lib/offline/db"
import { setMetadata } from "@/lib/offline/metadata"
import { checkInGuestLocally } from "@/lib/offline/checkins/checkin-local-service"
import type { LocalGuest } from "@/types/shared"

function makeGuest(
  overrides: Partial<LocalGuest> & { guestId: string }
): LocalGuest {
  return {
    weddingId: "wedding-1",
    snapshotId: "snap-1",
    snapshotVersion: 1,
    fullName: "Test Guest",
    qrToken: `qr-${overrides.guestId}`,
    allowedGuests: 2,
    checkedIn: false,
    ...overrides,
  }
}

async function setupMetadata() {
  await setMetadata("deviceId", "device-abc")
  await setMetadata("snapshotId", "snap-1")
  await setMetadata("snapshotVersion", "1")
  await setMetadata("weddingId", "wedding-1")
}

beforeEach(async () => {
  await offlineDb.guests.clear()
  await offlineDb.checkinQueue.clear()
  await offlineDb.metadata.clear()
})

describe("checkInGuestLocally", () => {
  it("returns guest_not_found when guest does not exist in IndexedDB", async () => {
    await setupMetadata()

    const result = await checkInGuestLocally("nonexistent-guest")

    expect(result.status).toBe("guest_not_found")
  })

  it("returns checked_in_locally for a new guest and creates a queue item", async () => {
    await setupMetadata()
    await offlineDb.guests.put(makeGuest({ guestId: "g1" }))

    const result = await checkInGuestLocally("g1")

    expect(result.status).toBe("checked_in_locally")
    if (result.status !== "checked_in_locally") return

    expect(result.checkedInAt).toBeTruthy()
    expect(result.queueId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )

    const queueItems = await offlineDb.checkinQueue.toArray()
    expect(queueItems).toHaveLength(1)
    expect(queueItems[0].queueId).toBe(result.queueId)
  })

  it("updates the guest checkedIn flag in IndexedDB after check-in", async () => {
    await setupMetadata()
    await offlineDb.guests.put(makeGuest({ guestId: "g1" }))

    await checkInGuestLocally("g1")

    const updated = await offlineDb.guests.get("g1")
    expect(updated?.checkedIn).toBe(true)
    expect(updated?.checkedInAt).toBeTruthy()
  })

  it("returns already_checked_in when guest is already checked in", async () => {
    await setupMetadata()
    const alreadyCheckedInAt = "2026-06-01T10:00:00.000Z"
    await offlineDb.guests.put(
      makeGuest({ guestId: "g1", checkedIn: true, checkedInAt: alreadyCheckedInAt })
    )

    const result = await checkInGuestLocally("g1")

    expect(result.status).toBe("already_checked_in")
    if (result.status !== "already_checked_in") return
    expect(result.checkedInAt).toBe(alreadyCheckedInAt)
  })

  it("does not create a queue item for an already-checked-in guest", async () => {
    await setupMetadata()
    await offlineDb.guests.put(
      makeGuest({ guestId: "g1", checkedIn: true, checkedInAt: "2026-06-01T10:00:00.000Z" })
    )

    await checkInGuestLocally("g1")

    const queueItems = await offlineDb.checkinQueue.toArray()
    expect(queueItems).toHaveLength(0)
  })

  it("queue item has all required fields with correct values", async () => {
    await setupMetadata()
    await offlineDb.guests.put(makeGuest({ guestId: "g1" }))

    const result = await checkInGuestLocally("g1")
    if (result.status !== "checked_in_locally") throw new Error("Expected checked_in_locally")

    const item = await offlineDb.checkinQueue.get(result.queueId)
    expect(item).toBeDefined()
    if (!item) return

    expect(item.queueId).toBe(result.queueId)
    expect(item.weddingId).toBe("wedding-1")
    expect(item.snapshotId).toBe("snap-1")
    expect(item.snapshotVersion).toBe(1)
    expect(item.guestId).toBe("g1")
    expect(item.checkedInAt).toBe(result.checkedInAt)
    expect(item.deviceId).toBe("device-abc")
    expect(item.synced).toBe(false)
    expect(item.syncAttempts).toBe(0)
    expect(item.createdAt).toBeTruthy()
  })

  it("queue item checkedInAt matches the returned checkedInAt", async () => {
    await setupMetadata()
    await offlineDb.guests.put(makeGuest({ guestId: "g1" }))

    const result = await checkInGuestLocally("g1")
    if (result.status !== "checked_in_locally") throw new Error("Expected checked_in_locally")

    const item = await offlineDb.checkinQueue.get(result.queueId)
    expect(item?.checkedInAt).toBe(result.checkedInAt)
  })

  it("second call for same guest returns already_checked_in without a new queue item", async () => {
    await setupMetadata()
    await offlineDb.guests.put(makeGuest({ guestId: "g1" }))

    await checkInGuestLocally("g1")
    const secondResult = await checkInGuestLocally("g1")

    expect(secondResult.status).toBe("already_checked_in")
    const queueItems = await offlineDb.checkinQueue.toArray()
    expect(queueItems).toHaveLength(1)
  })

  it("rolls back guest update if queue add throws (transaction atomicity)", async () => {
    await setupMetadata()
    await offlineDb.guests.put(makeGuest({ guestId: "g1" }))

    const spy = vi
      .spyOn(offlineDb.checkinQueue, "add")
      .mockRejectedValueOnce(new Error("forced failure"))

    await expect(checkInGuestLocally("g1")).rejects.toThrow("forced failure")

    const guest = await offlineDb.guests.get("g1")
    expect(guest?.checkedIn).toBe(false)
    expect(guest?.checkedInAt).toBeUndefined()

    const queueCount = await offlineDb.checkinQueue.count()
    expect(queueCount).toBe(0)

    spy.mockRestore()
  })

  it("uses metadata snapshotId and deviceId in queue item", async () => {
    await setMetadata("deviceId", "my-device-xyz")
    await setMetadata("snapshotId", "snap-999")
    await setMetadata("snapshotVersion", "3")
    await setMetadata("weddingId", "wedding-1")

    await offlineDb.guests.put(
      makeGuest({ guestId: "g1", snapshotId: "snap-old", snapshotVersion: 1 })
    )

    const result = await checkInGuestLocally("g1")
    if (result.status !== "checked_in_locally") throw new Error("Expected checked_in_locally")

    const item = await offlineDb.checkinQueue.get(result.queueId)
    expect(item?.deviceId).toBe("my-device-xyz")
    expect(item?.snapshotId).toBe("snap-999")
    expect(item?.snapshotVersion).toBe(3)
  })
})
