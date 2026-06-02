import { describe, it, expect, beforeEach, vi } from "vitest"
import { processSyncBatch, SyncSnapshotMismatchError } from "@/modules/sync/sync.service"
import {
  findAcceptedCheckinByGuest,
  createCheckin,
  markCheckinDuplicate,
  updateGuestCheckedIn,
} from "@/modules/checkins/checkins.repository"
import { findActiveSnapshot } from "@/modules/weddings/snapshot.repository"
import { findProcessedQueueItem, createSyncLog } from "@/modules/sync/sync.repository"

// Hoisted so it's available inside vi.mock factory
const mockSnapshotGuestFindFirst = vi.hoisted(() => vi.fn())

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) =>
      fn({ snapshotGuest: { findFirst: mockSnapshotGuestFindFirst } })
    ),
  },
}))

vi.mock("@/modules/weddings/snapshot.repository")
vi.mock("@/modules/checkins/checkins.repository")
vi.mock("@/modules/sync/sync.repository")

const mockedFindActiveSnapshot = vi.mocked(findActiveSnapshot)
const mockedFindProcessedQueueItem = vi.mocked(findProcessedQueueItem)
const mockedCreateSyncLog = vi.mocked(createSyncLog)
const mockedFindAcceptedCheckinByGuest = vi.mocked(findAcceptedCheckinByGuest)
const mockedCreateCheckin = vi.mocked(createCheckin)
const mockedMarkCheckinDuplicate = vi.mocked(markCheckinDuplicate)
const mockedUpdateGuestCheckedIn = vi.mocked(updateGuestCheckedIn)

// Stable UUIDs for test fixtures
const WEDDING_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
const SNAPSHOT_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
const GUEST_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc"
const DEVICE_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd"
const STAFF_DEVICE_ID = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
const CHECKIN_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff"

const ACTIVE_SNAPSHOT = {
  id: SNAPSHOT_ID,
  weddingId: WEDDING_ID,
  version: 1,
  isActive: true,
  guestCount: 10,
  createdAt: new Date("2026-08-14T00:00:00Z"),
  createdByUserId: "user-1",
}

const SNAPSHOT_GUEST = {
  id: "sg-1",
  snapshotId: SNAPSHOT_ID,
  weddingId: WEDDING_ID,
  guestId: GUEST_ID,
  fullName: "Jean-Pierre Mbala",
  phoneNumber: null,
  email: null,
  numberOfAllowedGuests: 2,
  qrToken: "qr-token-abc",
}

function makePayload(checkedInAt: string, queueId = "q-001") {
  return {
    snapshotId: SNAPSHOT_ID,
    snapshotVersion: 1,
    deviceId: DEVICE_ID,
    checkins: [
      {
        queueId,
        guestId: GUEST_ID,
        checkedInAt,
      },
    ],
  }
}

function makeCheckinRecord(checkedInAt: string, id = CHECKIN_ID) {
  return {
    id,
    weddingId: WEDDING_ID,
    guestId: GUEST_ID,
    snapshotId: SNAPSHOT_ID,
    staffDeviceId: STAFF_DEVICE_ID,
    checkedInAt: new Date(checkedInAt),
    sourceQueueId: "q-001",
    isDuplicate: false,
    duplicateOfId: null,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedCreateSyncLog.mockResolvedValue(undefined)
  mockedMarkCheckinDuplicate.mockResolvedValue(undefined)
  mockedUpdateGuestCheckedIn.mockResolvedValue(undefined)
})

describe("processSyncBatch — snapshot validation", () => {
  it("throws SyncSnapshotMismatchError when no active snapshot exists", async () => {
    mockedFindActiveSnapshot.mockResolvedValue(null)

    await expect(
      processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload("2026-08-14T14:01:00.000Z"))
    ).rejects.toBeInstanceOf(SyncSnapshotMismatchError)

    expect(mockedCreateSyncLog).toHaveBeenCalledOnce()
  })

  it("throws SyncSnapshotMismatchError when snapshotId does not match active", async () => {
    mockedFindActiveSnapshot.mockResolvedValue({
      ...ACTIVE_SNAPSHOT,
      id: "different-snapshot-id",
    })

    await expect(
      processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload("2026-08-14T14:01:00.000Z"))
    ).rejects.toBeInstanceOf(SyncSnapshotMismatchError)
  })

  it("throws SyncSnapshotMismatchError when snapshotVersion does not match active", async () => {
    mockedFindActiveSnapshot.mockResolvedValue({
      ...ACTIVE_SNAPSHOT,
      version: 2,
    })

    await expect(
      processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload("2026-08-14T14:01:00.000Z"))
    ).rejects.toBeInstanceOf(SyncSnapshotMismatchError)
  })
})

describe("processSyncBatch — INVALID_GUEST", () => {
  it("returns INVALID_GUEST when guest is not in snapshot", async () => {
    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(null)
    mockSnapshotGuestFindFirst.mockResolvedValue(null) // guest not in snapshot

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload("2026-08-14T14:01:00.000Z"))

    expect(result.results).toHaveLength(1)
    expect(result.results[0].status).toBe("INVALID_GUEST")
    expect(result.results[0].authoritativeCheckedInAt).toBeNull()
    expect(result.summary.rejected).toBe(1)

    expect(mockedCreateCheckin).not.toHaveBeenCalled()
  })
})

describe("processSyncBatch — ACCEPTED (first check-in)", () => {
  it("accepts first check-in and returns authoritative timestamp", async () => {
    const checkedInAt = "2026-08-14T14:01:00.000Z"

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(null)
    mockSnapshotGuestFindFirst.mockResolvedValue(SNAPSHOT_GUEST)
    mockedFindAcceptedCheckinByGuest.mockResolvedValue(null)
    mockedCreateCheckin.mockResolvedValue(makeCheckinRecord(checkedInAt))

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload(checkedInAt))

    expect(result.results).toHaveLength(1)
    expect(result.results[0].status).toBe("ACCEPTED")
    expect(result.results[0].authoritativeCheckedInAt).toBe(checkedInAt)
    expect(result.summary.accepted).toBe(1)
    expect(result.summary.duplicate).toBe(0)

    expect(mockedCreateCheckin).toHaveBeenCalledWith(
      expect.objectContaining({
        weddingId: WEDDING_ID,
        guestId: GUEST_ID,
        isDuplicate: false,
        syncStatus: "ACCEPTED",
      }),
      expect.anything()
    )
    expect(mockedUpdateGuestCheckedIn).toHaveBeenCalledWith(
      GUEST_ID, true, new Date(checkedInAt), expect.anything()
    )
    expect(mockedMarkCheckinDuplicate).not.toHaveBeenCalled()
  })
})

describe("processSyncBatch — DUPLICATE (later timestamp)", () => {
  it("stores as duplicate when an earlier accepted check-in already exists", async () => {
    const existingAt = "2026-08-14T14:01:00.000Z"
    const incomingAt = "2026-08-14T14:03:00.000Z" // later than existing

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(null)
    mockSnapshotGuestFindFirst.mockResolvedValue(SNAPSHOT_GUEST)
    mockedFindAcceptedCheckinByGuest.mockResolvedValue(makeCheckinRecord(existingAt))
    mockedCreateCheckin.mockResolvedValue(
      makeCheckinRecord(incomingAt, "new-checkin-id")
    )

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload(incomingAt))

    expect(result.results[0].status).toBe("DUPLICATE")
    expect(result.results[0].authoritativeCheckedInAt).toBe(existingAt)
    expect(result.summary.duplicate).toBe(1)

    expect(mockedCreateCheckin).toHaveBeenCalledWith(
      expect.objectContaining({
        isDuplicate: true,
        duplicateOfId: CHECKIN_ID,
        syncStatus: "DUPLICATE",
      }),
      expect.anything()
    )
    expect(mockedMarkCheckinDuplicate).not.toHaveBeenCalled()
    expect(mockedUpdateGuestCheckedIn).not.toHaveBeenCalled()
  })
})

describe("processSyncBatch — earlier timestamp overrides later (core multi-device scenario)", () => {
  it("replaces existing accepted with earlier incoming and marks old one as duplicate", async () => {
    // Device B synced first at 14:03 → ACCEPTED
    const existingAt = "2026-08-14T14:03:00.000Z"
    const existingCheckin = makeCheckinRecord(existingAt, "existing-id")

    // Device A syncs second at 14:01 → earlier, so it wins
    const incomingAt = "2026-08-14T14:01:00.000Z"
    const newCheckin = makeCheckinRecord(incomingAt, "new-accepted-id")

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(null)
    mockSnapshotGuestFindFirst.mockResolvedValue(SNAPSHOT_GUEST)
    mockedFindAcceptedCheckinByGuest.mockResolvedValue(existingCheckin)
    mockedCreateCheckin.mockResolvedValue(newCheckin)

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload(incomingAt))

    expect(result.results[0].status).toBe("ACCEPTED")
    expect(result.results[0].authoritativeCheckedInAt).toBe(incomingAt)
    expect(result.summary.accepted).toBe(1)

    // New accepted check-in must be created with isDuplicate: false
    expect(mockedCreateCheckin).toHaveBeenCalledWith(
      expect.objectContaining({
        checkedInAt: new Date(incomingAt),
        isDuplicate: false,
        syncStatus: "ACCEPTED",
      }),
      expect.anything()
    )

    // Existing (later) check-in must be demoted to duplicate
    expect(mockedMarkCheckinDuplicate).toHaveBeenCalledWith(
      "existing-id",
      "new-accepted-id",
      expect.anything()
    )

    // Guest checkedInAt must be updated to the earlier authoritative time
    expect(mockedUpdateGuestCheckedIn).toHaveBeenCalledWith(
      GUEST_ID, true, new Date(incomingAt), expect.anything()
    )
  })

  it("equal timestamps are treated as duplicate (not equal wins)", async () => {
    const timestamp = "2026-08-14T14:01:00.000Z"
    const existingCheckin = makeCheckinRecord(timestamp, "existing-id")
    const newCheckin = makeCheckinRecord(timestamp, "new-id")

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(null)
    mockSnapshotGuestFindFirst.mockResolvedValue(SNAPSHOT_GUEST)
    mockedFindAcceptedCheckinByGuest.mockResolvedValue(existingCheckin)
    mockedCreateCheckin.mockResolvedValue(newCheckin)

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload(timestamp))

    expect(result.results[0].status).toBe("DUPLICATE")
    expect(result.results[0].authoritativeCheckedInAt).toBe(timestamp)
  })
})

describe("processSyncBatch — ALREADY_PROCESSED (idempotent retry)", () => {
  it("returns previous authoritative result without creating a new check-in", async () => {
    const originalAt = "2026-08-14T14:01:00.000Z"
    const processedRecord = {
      id: CHECKIN_ID,
      checkedInAt: new Date(originalAt),
      isDuplicate: false,
      guestId: GUEST_ID,
    }
    const acceptedCheckin = makeCheckinRecord(originalAt)

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(processedRecord)
    mockedFindAcceptedCheckinByGuest.mockResolvedValue(acceptedCheckin)

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload(originalAt))

    expect(result.results[0].status).toBe("ALREADY_PROCESSED")
    expect(result.results[0].authoritativeCheckedInAt).toBe(originalAt)

    expect(mockedCreateCheckin).not.toHaveBeenCalled()
    expect(mockSnapshotGuestFindFirst).not.toHaveBeenCalled()
  })

  it("uses processedRecord timestamp when no accepted check-in is found (fallback)", async () => {
    const originalAt = "2026-08-14T14:01:00.000Z"
    const processedRecord = {
      id: CHECKIN_ID,
      checkedInAt: new Date(originalAt),
      isDuplicate: true,
      guestId: GUEST_ID,
    }

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(processedRecord)
    mockedFindAcceptedCheckinByGuest.mockResolvedValue(null)

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload(originalAt))

    expect(result.results[0].status).toBe("ALREADY_PROCESSED")
    expect(result.results[0].authoritativeCheckedInAt).toBe(originalAt)
  })
})

describe("processSyncBatch — sync log", () => {
  it("always writes a sync log with correct counts on success", async () => {
    const checkedInAt = "2026-08-14T14:01:00.000Z"

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(null)
    mockSnapshotGuestFindFirst.mockResolvedValue(SNAPSHOT_GUEST)
    mockedFindAcceptedCheckinByGuest.mockResolvedValue(null)
    mockedCreateCheckin.mockResolvedValue(makeCheckinRecord(checkedInAt))

    await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload(checkedInAt))

    expect(mockedCreateSyncLog).toHaveBeenCalledWith(
      expect.objectContaining({
        weddingId: WEDDING_ID,
        staffDeviceId: STAFF_DEVICE_ID,
        snapshotId: SNAPSHOT_ID,
        payloadCount: 1,
        acceptedCount: 1,
        duplicateCount: 0,
        rejectedCount: 0,
      })
    )
  })

  it("writes a sync log on SNAPSHOT_MISMATCH with full rejected count", async () => {
    mockedFindActiveSnapshot.mockResolvedValue(null)

    await expect(
      processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, makePayload("2026-08-14T14:01:00.000Z"))
    ).rejects.toBeInstanceOf(SyncSnapshotMismatchError)

    expect(mockedCreateSyncLog).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptedCount: 0,
        rejectedCount: 1,
      })
    )
  })
})

describe("processSyncBatch — batch summary", () => {
  it("returns correct summary for a batch with mixed results", async () => {
    const GUEST_ID_2 = "11111111-2222-3333-4444-555555555555"
    const GUEST_ID_3 = "66666666-7777-8888-9999-aaaaaaaaaaaa"

    const payload = {
      snapshotId: SNAPSHOT_ID,
      snapshotVersion: 1,
      deviceId: DEVICE_ID,
      checkins: [
        { queueId: "q-1", guestId: GUEST_ID, checkedInAt: "2026-08-14T14:01:00.000Z" },
        { queueId: "q-2", guestId: GUEST_ID_2, checkedInAt: "2026-08-14T14:03:00.000Z" },
        { queueId: "q-3", guestId: GUEST_ID_3, checkedInAt: "2026-08-14T14:05:00.000Z" },
      ],
    }

    const snapshotGuestFor = (guestId: string) => ({ ...SNAPSHOT_GUEST, guestId })

    mockedFindActiveSnapshot.mockResolvedValue(ACTIVE_SNAPSHOT)
    mockedFindProcessedQueueItem.mockResolvedValue(null)

    // Guest 1: ACCEPTED (no prior)
    // Guest 2: DUPLICATE (prior exists at 14:00, incoming at 14:03)
    // Guest 3: INVALID_GUEST (not in snapshot)
    mockSnapshotGuestFindFirst
      .mockResolvedValueOnce(snapshotGuestFor(GUEST_ID))
      .mockResolvedValueOnce(snapshotGuestFor(GUEST_ID_2))
      .mockResolvedValueOnce(null) // Guest 3 not found

    mockedFindAcceptedCheckinByGuest
      .mockResolvedValueOnce(null) // Guest 1: no existing
      .mockResolvedValueOnce({
        ...makeCheckinRecord("2026-08-14T14:00:00.000Z"),
        guestId: GUEST_ID_2,
      }) // Guest 2: existing earlier

    mockedCreateCheckin
      .mockResolvedValueOnce(makeCheckinRecord("2026-08-14T14:01:00.000Z")) // Guest 1
      .mockResolvedValueOnce(makeCheckinRecord("2026-08-14T14:03:00.000Z", "dup-id")) // Guest 2 duplicate

    const result = await processSyncBatch(WEDDING_ID, STAFF_DEVICE_ID, payload)

    expect(result.summary.accepted).toBe(1)
    expect(result.summary.duplicate).toBe(1)
    expect(result.summary.rejected).toBe(1)
    expect(result.results).toHaveLength(3)

    const statuses = result.results.map((r) => r.status)
    expect(statuses).toContain("ACCEPTED")
    expect(statuses).toContain("DUPLICATE")
    expect(statuses).toContain("INVALID_GUEST")
  })
})
