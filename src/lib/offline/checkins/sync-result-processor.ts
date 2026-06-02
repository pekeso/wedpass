import type { WedPassOfflineDB } from "../db"

export type SyncResultStatus =
  | "ACCEPTED"
  | "DUPLICATE"
  | "ALREADY_PROCESSED"
  | "REJECTED"
  | "INVALID_GUEST"
  | "SNAPSHOT_MISMATCH"

export interface SyncResultItem {
  queueId: string
  guestId: string
  status: SyncResultStatus
  authoritativeCheckedInAt?: string
}

export type ProcessResultOutcome = "continue" | "stop_snapshot_mismatch"

export async function processSyncResult(
  result: SyncResultItem,
  db: WedPassOfflineDB
): Promise<ProcessResultOutcome> {
  if (result.status === "SNAPSHOT_MISMATCH") {
    return "stop_snapshot_mismatch"
  }

  await db.transaction("rw", db.checkinQueue, db.guests, async () => {
    if (
      result.status === "ACCEPTED" ||
      result.status === "DUPLICATE" ||
      result.status === "ALREADY_PROCESSED"
    ) {
      await db.checkinQueue.update(result.queueId, {
        synced: true,
        syncError: undefined,
      })

      if (result.authoritativeCheckedInAt) {
        await db.guests.update(result.guestId, {
          checkedIn: true,
          checkedInAt: result.authoritativeCheckedInAt,
          lastSyncedAt: new Date().toISOString(),
        })
      }
    } else if (result.status === "REJECTED") {
      await db.checkinQueue.update(result.queueId, {
        syncError: "REJECTED",
      })
    } else if (result.status === "INVALID_GUEST") {
      await db.checkinQueue.update(result.queueId, {
        syncError: "INVALID_GUEST",
      })
    }
  })

  return "continue"
}
