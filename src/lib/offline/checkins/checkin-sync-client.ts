import { offlineDb } from "../db"
import { getMetadata, setMetadata } from "../metadata"
import { processSyncResult, type SyncResultItem } from "./sync-result-processor"

const STAFF_TOKEN_KEY = (weddingId: string) =>
  `wedpass-staff-token-${weddingId}`

export class SnapshotMismatchError extends Error {
  constructor() {
    super(
      "Snapshot mismatch: please refresh the offline pack before continuing."
    )
    this.name = "SnapshotMismatchError"
  }
}

export async function syncCheckins(weddingId: string): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return

  const staffToken =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(STAFF_TOKEN_KEY(weddingId))
      : null
  if (!staffToken) return

  const snapshotId = await getMetadata("snapshotId")
  const snapshotVersionStr = await getMetadata("snapshotVersion")
  const deviceId = await getMetadata("deviceId")

  if (!snapshotId || !snapshotVersionStr || !deviceId) return

  const snapshotVersion = Number(snapshotVersionStr)

  const unsyncedItems = await offlineDb.checkinQueue
    .where("weddingId")
    .equals(weddingId)
    .filter((item) => !item.synced && item.syncError !== "INVALID_GUEST")
    .limit(100)
    .toArray()

  if (unsyncedItems.length === 0) return

  const now = new Date().toISOString()
  await Promise.all(
    unsyncedItems.map((item) =>
      offlineDb.checkinQueue.update(item.queueId, {
        syncAttempts: item.syncAttempts + 1,
        lastSyncAttemptAt: now,
      })
    )
  )

  const payload = {
    snapshotId,
    snapshotVersion,
    deviceId,
    checkins: unsyncedItems.map((item) => ({
      queueId: item.queueId,
      guestId: item.guestId,
      checkedInAt: item.checkedInAt,
    })),
  }

  let response: Response
  try {
    response = await fetch(
      `/api/v1/staff/weddings/${weddingId}/checkins/sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify(payload),
      }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error"
    await Promise.all(
      unsyncedItems.map((item) =>
        offlineDb.checkinQueue.update(item.queueId, { syncError: message })
      )
    )
    throw error
  }

  if (!response.ok) {
    const json = await response.json().catch(() => null)
    const code = json?.error?.code ?? `HTTP_${response.status}`

    if (code === "SNAPSHOT_MISMATCH") {
      await setMetadata("snapshotMismatch", "true")
      throw new SnapshotMismatchError()
    }

    const message =
      json?.error?.message ?? `HTTP error ${response.status}`
    await Promise.all(
      unsyncedItems.map((item) =>
        offlineDb.checkinQueue.update(item.queueId, { syncError: message })
      )
    )
    throw new Error(message)
  }

  const json = await response.json()
  const results: SyncResultItem[] = json.data.results

  for (const result of results) {
    const outcome = await processSyncResult(result, offlineDb)
    if (outcome === "stop_snapshot_mismatch") {
      await setMetadata("snapshotMismatch", "true")
      throw new SnapshotMismatchError()
    }
  }

  await setMetadata("lastSuccessfulSyncAt", new Date().toISOString())
}
