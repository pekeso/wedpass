import { offlineDb } from "../db"
import { getMetadata } from "../metadata"
import { generateUUID } from "@/lib/utils/uuid"

export type CheckInLocalResult =
  | { status: "checked_in_locally"; checkedInAt: string; queueId: string }
  | { status: "already_checked_in"; checkedInAt: string }
  | { status: "guest_not_found" }

export async function checkInGuestLocally(
  guestId: string
): Promise<CheckInLocalResult> {
  const deviceId = await getMetadata("deviceId")
  const snapshotId = await getMetadata("snapshotId")
  const snapshotVersionStr = await getMetadata("snapshotVersion")
  const snapshotVersion = Number(snapshotVersionStr)

  const guest = await offlineDb.guests.get(guestId)

  if (!guest) {
    return { status: "guest_not_found" }
  }

  if (guest.checkedIn) {
    return {
      status: "already_checked_in",
      checkedInAt: guest.checkedInAt ?? new Date().toISOString(),
    }
  }

  const checkedInAt = new Date().toISOString()
  const queueId = generateUUID()

  await offlineDb.transaction(
    "rw",
    offlineDb.guests,
    offlineDb.checkinQueue,
    async () => {
      await offlineDb.guests.update(guestId, {
        checkedIn: true,
        checkedInAt,
      })

      await offlineDb.checkinQueue.add({
        queueId,
        weddingId: guest.weddingId,
        snapshotId: snapshotId ?? guest.snapshotId,
        snapshotVersion: snapshotVersion || guest.snapshotVersion,
        guestId,
        checkedInAt,
        deviceId: deviceId ?? "unknown",
        synced: false,
        syncAttempts: 0,
        createdAt: new Date().toISOString(),
      })
    }
  )

  return { status: "checked_in_locally", checkedInAt, queueId }
}
