import { describe, it, expect, beforeEach } from "vitest"
import { offlineDb } from "@/lib/offline/db"
import {
  processSyncResult,
  type SyncResultItem,
} from "@/lib/offline/checkins/sync-result-processor"
import type { LocalGuest, LocalCheckinQueueItem } from "@/types/shared"

function makeGuest(guestId: string): LocalGuest {
  return {
    guestId,
    weddingId: "wedding-1",
    snapshotId: "snap-1",
    snapshotVersion: 1,
    fullName: "Test Guest",
    qrToken: `qr-${guestId}`,
    allowedGuests: 2,
    tableName: "Table 1",
    checkedIn: true,
    checkedInAt: "2026-08-14T14:00:00.000Z",
  }
}

function makeQueueItem(
  queueId: string,
  guestId: string
): LocalCheckinQueueItem {
  return {
    queueId,
    weddingId: "wedding-1",
    snapshotId: "snap-1",
    snapshotVersion: 1,
    guestId,
    checkedInAt: "2026-08-14T14:00:00.000Z",
    deviceId: "device-1",
    synced: false,
    syncAttempts: 1,
    lastSyncAttemptAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
}

beforeEach(async () => {
  await offlineDb.guests.clear()
  await offlineDb.checkinQueue.clear()
})

describe("processSyncResult", () => {
  it("ACCEPTED marks queue item synced and updates guest with authoritative timestamp", async () => {
    await offlineDb.guests.put(makeGuest("g1"))
    await offlineDb.checkinQueue.put(makeQueueItem("q1", "g1"))

    const result: SyncResultItem = {
      queueId: "q1",
      guestId: "g1",
      status: "ACCEPTED",
      authoritativeCheckedInAt: "2026-08-14T14:01:00.000Z",
    }

    const outcome = await processSyncResult(result, offlineDb)

    expect(outcome).toBe("continue")

    const item = await offlineDb.checkinQueue.get("q1")
    expect(item?.synced).toBe(true)
    expect(item?.syncError).toBeUndefined()

    const guest = await offlineDb.guests.get("g1")
    expect(guest?.checkedInAt).toBe("2026-08-14T14:01:00.000Z")
    expect(guest?.checkedIn).toBe(true)
  })

  it("DUPLICATE marks queue item synced with authoritative timestamp", async () => {
    await offlineDb.guests.put(makeGuest("g2"))
    await offlineDb.checkinQueue.put(makeQueueItem("q2", "g2"))

    const result: SyncResultItem = {
      queueId: "q2",
      guestId: "g2",
      status: "DUPLICATE",
      authoritativeCheckedInAt: "2026-08-14T13:59:00.000Z",
    }

    const outcome = await processSyncResult(result, offlineDb)

    expect(outcome).toBe("continue")

    const item = await offlineDb.checkinQueue.get("q2")
    expect(item?.synced).toBe(true)

    const guest = await offlineDb.guests.get("g2")
    expect(guest?.checkedInAt).toBe("2026-08-14T13:59:00.000Z")
  })

  it("ALREADY_PROCESSED marks queue item synced", async () => {
    await offlineDb.guests.put(makeGuest("g3"))
    await offlineDb.checkinQueue.put(makeQueueItem("q3", "g3"))

    const result: SyncResultItem = {
      queueId: "q3",
      guestId: "g3",
      status: "ALREADY_PROCESSED",
      authoritativeCheckedInAt: "2026-08-14T14:00:00.000Z",
    }

    const outcome = await processSyncResult(result, offlineDb)

    expect(outcome).toBe("continue")

    const item = await offlineDb.checkinQueue.get("q3")
    expect(item?.synced).toBe(true)
  })

  it("REJECTED keeps item unsynced and stores syncError", async () => {
    await offlineDb.guests.put(makeGuest("g4"))
    await offlineDb.checkinQueue.put(makeQueueItem("q4", "g4"))

    const result: SyncResultItem = {
      queueId: "q4",
      guestId: "g4",
      status: "REJECTED",
    }

    const outcome = await processSyncResult(result, offlineDb)

    expect(outcome).toBe("continue")

    const item = await offlineDb.checkinQueue.get("q4")
    expect(item?.synced).toBe(false)
    expect(item?.syncError).toBe("REJECTED")
  })

  it("INVALID_GUEST marks item failed with INVALID_GUEST syncError", async () => {
    await offlineDb.guests.put(makeGuest("g5"))
    await offlineDb.checkinQueue.put(makeQueueItem("q5", "g5"))

    const result: SyncResultItem = {
      queueId: "q5",
      guestId: "g5",
      status: "INVALID_GUEST",
    }

    const outcome = await processSyncResult(result, offlineDb)

    expect(outcome).toBe("continue")

    const item = await offlineDb.checkinQueue.get("q5")
    expect(item?.synced).toBe(false)
    expect(item?.syncError).toBe("INVALID_GUEST")
  })

  it("SNAPSHOT_MISMATCH returns stop_snapshot_mismatch without modifying DB", async () => {
    await offlineDb.checkinQueue.put(makeQueueItem("q6", "g6"))

    const result: SyncResultItem = {
      queueId: "q6",
      guestId: "g6",
      status: "SNAPSHOT_MISMATCH",
    }

    const outcome = await processSyncResult(result, offlineDb)

    expect(outcome).toBe("stop_snapshot_mismatch")

    const item = await offlineDb.checkinQueue.get("q6")
    expect(item?.synced).toBe(false)
    expect(item?.syncError).toBeUndefined()
  })
})
