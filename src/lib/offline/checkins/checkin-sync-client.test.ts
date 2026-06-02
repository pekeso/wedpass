import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { offlineDb } from "@/lib/offline/db"
import { setMetadata } from "@/lib/offline/metadata"
import {
  syncCheckins,
  SnapshotMismatchError,
} from "@/lib/offline/checkins/checkin-sync-client"
import type { LocalCheckinQueueItem, LocalGuest } from "@/types/shared"

function makeQueueItem(
  overrides: Partial<LocalCheckinQueueItem> & { queueId: string }
): LocalCheckinQueueItem {
  return {
    weddingId: "wedding-1",
    snapshotId: "snap-1",
    snapshotVersion: 1,
    guestId: "g1",
    checkedInAt: "2026-08-14T14:00:00.000Z",
    deviceId: "device-1",
    synced: false,
    syncAttempts: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeGuest(guestId: string): LocalGuest {
  return {
    guestId,
    weddingId: "wedding-1",
    snapshotId: "snap-1",
    snapshotVersion: 1,
    fullName: "Test Guest",
    qrToken: `qr-${guestId}`,
    allowedGuests: 2,
    checkedIn: false,
  }
}

async function setupMetadataAndToken() {
  await setMetadata("snapshotId", "snap-1")
  await setMetadata("snapshotVersion", "1")
  await setMetadata("deviceId", "device-1")
  await setMetadata("staffDeviceId", "staff-device-1")
  localStorage.setItem("wedpass-staff-token-wedding-1", "staff-token-abc")
}

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", {
    value,
    configurable: true,
    writable: true,
  })
}

function makeOkResponse(results: object[]) {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        results,
        summary: { accepted: results.length, duplicate: 0, rejected: 0 },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}

beforeEach(async () => {
  await offlineDb.guests.clear()
  await offlineDb.checkinQueue.clear()
  await offlineDb.metadata.clear()
  localStorage.clear()
  setOnline(true)
})

afterEach(() => {
  vi.restoreAllMocks()
  setOnline(true)
})

describe("syncCheckins", () => {
  it("skips sync when offline", async () => {
    setOnline(false)
    const fetchSpy = vi.spyOn(global, "fetch")

    await syncCheckins("wedding-1")

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("skips sync when no unsynced items exist", async () => {
    await setupMetadataAndToken()
    const fetchSpy = vi.spyOn(global, "fetch")

    await syncCheckins("wedding-1")

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("skips sync when staff token is missing", async () => {
    await setMetadata("snapshotId", "snap-1")
    await setMetadata("snapshotVersion", "1")
    await setMetadata("deviceId", "device-1")
    await offlineDb.checkinQueue.put(makeQueueItem({ queueId: "q1" }))

    const fetchSpy = vi.spyOn(global, "fetch")

    await syncCheckins("wedding-1")

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("increments syncAttempts on network failure", async () => {
    await setupMetadataAndToken()
    await offlineDb.guests.put(makeGuest("g1"))
    await offlineDb.checkinQueue.put(makeQueueItem({ queueId: "q1" }))

    vi.spyOn(global, "fetch").mockRejectedValueOnce(
      new Error("Network error")
    )

    await expect(syncCheckins("wedding-1")).rejects.toThrow("Network error")

    const item = await offlineDb.checkinQueue.get("q1")
    expect(item?.syncAttempts).toBe(1)
    expect(item?.syncError).toBe("Network error")
  })

  it("batches at most 100 items per request", async () => {
    await setupMetadataAndToken()

    const items = Array.from({ length: 150 }, (_, i) =>
      makeQueueItem({ queueId: `q${i}`, guestId: `g${i}` })
    )
    await offlineDb.checkinQueue.bulkPut(items)

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        makeOkResponse(
          items.slice(0, 100).map((item) => ({
            queueId: item.queueId,
            guestId: item.guestId,
            status: "ACCEPTED",
            authoritativeCheckedInAt: item.checkedInAt,
          }))
        )
      )

    await syncCheckins("wedding-1")

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
    expect(body.checkins).toHaveLength(100)
  })

  it("marks items synced and updates guest on ACCEPTED response", async () => {
    await setupMetadataAndToken()
    await offlineDb.guests.put(makeGuest("g1"))
    await offlineDb.checkinQueue.put(makeQueueItem({ queueId: "q1" }))

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      makeOkResponse([
        {
          queueId: "q1",
          guestId: "g1",
          status: "ACCEPTED",
          authoritativeCheckedInAt: "2026-08-14T14:01:00.000Z",
        },
      ])
    )

    await syncCheckins("wedding-1")

    const item = await offlineDb.checkinQueue.get("q1")
    expect(item?.synced).toBe(true)

    const guest = await offlineDb.guests.get("g1")
    expect(guest?.checkedInAt).toBe("2026-08-14T14:01:00.000Z")
  })

  it("throws SnapshotMismatchError on SNAPSHOT_MISMATCH HTTP error response", async () => {
    await setupMetadataAndToken()
    await offlineDb.checkinQueue.put(makeQueueItem({ queueId: "q1" }))

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "SNAPSHOT_MISMATCH", message: "Snapshot mismatch" },
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      )
    )

    await expect(syncCheckins("wedding-1")).rejects.toBeInstanceOf(
      SnapshotMismatchError
    )
  })

  it("throws SnapshotMismatchError when result item has SNAPSHOT_MISMATCH status", async () => {
    await setupMetadataAndToken()
    await offlineDb.checkinQueue.put(makeQueueItem({ queueId: "q1" }))

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      makeOkResponse([
        { queueId: "q1", guestId: "g1", status: "SNAPSHOT_MISMATCH" },
      ])
    )

    await expect(syncCheckins("wedding-1")).rejects.toBeInstanceOf(
      SnapshotMismatchError
    )
  })

  it("sets lastSuccessfulSyncAt in metadata after successful sync", async () => {
    await setupMetadataAndToken()
    await offlineDb.guests.put(makeGuest("g1"))
    await offlineDb.checkinQueue.put(makeQueueItem({ queueId: "q1" }))

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      makeOkResponse([
        {
          queueId: "q1",
          guestId: "g1",
          status: "ACCEPTED",
          authoritativeCheckedInAt: "2026-08-14T14:01:00.000Z",
        },
      ])
    )

    await syncCheckins("wedding-1")

    const { getMetadata: gm } = await import("@/lib/offline/metadata")
    const lastSync = await gm("lastSuccessfulSyncAt")
    expect(lastSync).toBeTruthy()
  })

  it("does not retry INVALID_GUEST items", async () => {
    await setupMetadataAndToken()
    await offlineDb.checkinQueue.put(
      makeQueueItem({ queueId: "q1", syncError: "INVALID_GUEST" })
    )

    const fetchSpy = vi.spyOn(global, "fetch")

    await syncCheckins("wedding-1")

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
