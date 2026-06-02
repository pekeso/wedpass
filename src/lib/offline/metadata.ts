import { offlineDb } from "./db"

export async function getMetadata(key: string): Promise<string | undefined> {
  const record = await offlineDb.metadata.get(key)
  return record?.value
}

export async function setMetadata(key: string, value: string): Promise<void> {
  await offlineDb.metadata.put({
    key,
    value,
    updatedAt: new Date().toISOString(),
  })
}

export async function clearMetadata(): Promise<void> {
  await offlineDb.metadata.clear()
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getMetadata("deviceId")
  if (existing) return existing

  const deviceId = crypto.randomUUID()
  await setMetadata("deviceId", deviceId)
  return deviceId
}

/**
 * Clears all local event data for a wedding after confirming no unsynced check-ins remain.
 * NEVER deletes unsynced queue items — the caller must verify pendingCount === 0 first.
 * Throws if any unsynced items exist.
 */
export async function clearLocalEventData(weddingId: string): Promise<void> {
  const unsyncedCount = await offlineDb.checkinQueue
    .where("weddingId")
    .equals(weddingId)
    .filter((item) => !item.synced)
    .count()

  if (unsyncedCount > 0) {
    throw new Error(
      `Cannot clear local data: ${unsyncedCount} unsynced check-in${unsyncedCount === 1 ? "" : "s"} remain on this device.`
    )
  }

  await offlineDb.transaction(
    "rw",
    offlineDb.guests,
    offlineDb.checkinQueue,
    offlineDb.metadata,
    async () => {
      await offlineDb.guests.where("weddingId").equals(weddingId).delete()
      await offlineDb.checkinQueue
        .where("weddingId")
        .equals(weddingId)
        .filter((item) => item.synced)
        .delete()
      await offlineDb.metadata.clear()
    }
  )
}
