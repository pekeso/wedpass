import { describe, it, expect, beforeEach } from "vitest"
import { offlineDb } from "@/lib/offline/db"
import { getMetadata, setMetadata, clearMetadata, getOrCreateDeviceId } from "@/lib/offline/metadata"
import { searchGuests } from "@/lib/offline/guests/guest-search"
import { clearGuestsByWedding, bulkSaveGuests } from "@/lib/offline/guests/guest-local-repository"
import type { LocalGuest } from "@/types/shared"

function makeGuest(overrides: Partial<LocalGuest> & { guestId: string; fullName: string }): LocalGuest {
  return {
    weddingId: "wedding-1",
    snapshotId: "snap-1",
    snapshotVersion: 1,
    qrToken: `qr-${overrides.guestId}`,
    allowedGuests: 1,
    tableName: "Table 1",
    checkedIn: false,
    ...overrides,
  }
}

beforeEach(async () => {
  await offlineDb.guests.clear()
  await offlineDb.checkinQueue.clear()
  await offlineDb.metadata.clear()
  await offlineDb.mediaQueue.clear()
})

// --- metadata ---

describe("setMetadata / getMetadata", () => {
  it("round-trips a value", async () => {
    await setMetadata("testKey", "testValue")
    const val = await getMetadata("testKey")
    expect(val).toBe("testValue")
  })

  it("returns undefined for missing key", async () => {
    const val = await getMetadata("missing")
    expect(val).toBeUndefined()
  })

  it("overwrites existing value", async () => {
    await setMetadata("k", "first")
    await setMetadata("k", "second")
    expect(await getMetadata("k")).toBe("second")
  })

  it("clearMetadata removes all keys", async () => {
    await setMetadata("a", "1")
    await setMetadata("b", "2")
    await clearMetadata()
    expect(await getMetadata("a")).toBeUndefined()
    expect(await getMetadata("b")).toBeUndefined()
  })
})

// --- device ID ---

describe("getOrCreateDeviceId", () => {
  it("generates a UUID on first call", async () => {
    const id = await getOrCreateDeviceId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it("returns the same ID on repeated calls", async () => {
    const first = await getOrCreateDeviceId()
    const second = await getOrCreateDeviceId()
    expect(first).toBe(second)
  })
})

// --- guest search ---

describe("searchGuests", () => {
  const guests: LocalGuest[] = [
    makeGuest({ guestId: "g1", fullName: "Alice Johnson", phoneNumber: "0701234567" }),
    makeGuest({ guestId: "g2", fullName: "Bob Smith", phoneNumber: "0712345678" }),
    makeGuest({ guestId: "g3", fullName: "alice Wonderland", phoneNumber: "0723456789" }),
    makeGuest({ guestId: "g4", fullName: "Charlie Brown", phoneNumber: "0734567890" }),
  ]

  beforeEach(async () => {
    await bulkSaveGuests(guests)
  })

  it("returns all guests when search term is empty", async () => {
    const results = await searchGuests("wedding-1", "")
    expect(results.length).toBe(4)
  })

  it("filters by fullName prefix (case-insensitive)", async () => {
    const results = await searchGuests("wedding-1", "ali")
    expect(results.length).toBe(2)
    const names = results.map((g) => g.fullName)
    expect(names).toContain("Alice Johnson")
    expect(names).toContain("alice Wonderland")
  })

  it("filters by phoneNumber prefix", async () => {
    const results = await searchGuests("wedding-1", "0701")
    expect(results.length).toBe(1)
    expect(results[0].guestId).toBe("g1")
  })

  it("returns empty array when no match", async () => {
    const results = await searchGuests("wedding-1", "zzz")
    expect(results).toHaveLength(0)
  })

  it("respects weddingId scope", async () => {
    await bulkSaveGuests([
      makeGuest({ guestId: "other-1", fullName: "Alice Other", weddingId: "wedding-99" }),
    ])
    const results = await searchGuests("wedding-1", "alice")
    const ids = results.map((g) => g.guestId)
    expect(ids).not.toContain("other-1")
  })

  it("returns at most 20 results", async () => {
    const many: LocalGuest[] = Array.from({ length: 30 }, (_, i) =>
      makeGuest({ guestId: `bulk-${i}`, fullName: `Bulk Guest ${i}` })
    )
    await bulkSaveGuests(many)
    const results = await searchGuests("wedding-1", "bulk")
    expect(results.length).toBeLessThanOrEqual(20)
  })
})

// --- clearGuestsByWedding ---

describe("clearGuestsByWedding", () => {
  it("removes only guests for the target wedding", async () => {
    await bulkSaveGuests([
      makeGuest({ guestId: "w1-g1", fullName: "Guest A", weddingId: "wedding-1" }),
      makeGuest({ guestId: "w2-g1", fullName: "Guest B", weddingId: "wedding-2" }),
    ])

    await clearGuestsByWedding("wedding-1")

    const remaining = await offlineDb.guests.toArray()
    expect(remaining.length).toBe(1)
    expect(remaining[0].weddingId).toBe("wedding-2")
  })
})
