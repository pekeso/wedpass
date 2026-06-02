import { prisma } from "@/lib/db/prisma"
import { findActiveSnapshot } from "@/modules/weddings/snapshot.repository"
import {
  findAcceptedCheckinByGuest,
  createCheckin,
  markCheckinDuplicate,
  updateGuestCheckedIn,
} from "@/modules/checkins/checkins.repository"
import { findProcessedQueueItem, createSyncLog } from "./sync.repository"
import { logEvent } from "@/lib/utils/logger"
import type { SyncPayloadInput } from "./sync.schemas"
import type { SyncBatchResult, SyncItemResult } from "./sync.types"

export class SyncSnapshotMismatchError extends Error {
  readonly code = "SNAPSHOT_MISMATCH"
  constructor() {
    super("Snapshot version does not match active snapshot")
    this.name = "SyncSnapshotMismatchError"
  }
}

export async function processSyncBatch(
  weddingId: string,
  staffDeviceId: string,
  payload: SyncPayloadInput
): Promise<SyncBatchResult> {
  const syncStartedAt = new Date()

  const activeSnapshot = await findActiveSnapshot(weddingId)

  logEvent("sync_attempt", {
    weddingId,
    staffDeviceId,
    payloadCount: payload.checkins.length,
    snapshotId: payload.snapshotId,
  })

  if (
    !activeSnapshot ||
    activeSnapshot.id !== payload.snapshotId ||
    activeSnapshot.version !== payload.snapshotVersion
  ) {
    await createSyncLog({
      weddingId,
      staffDeviceId,
      snapshotId: activeSnapshot?.id ?? null,
      payloadCount: payload.checkins.length,
      acceptedCount: 0,
      duplicateCount: 0,
      rejectedCount: payload.checkins.length,
      errorCount: 0,
      syncStartedAt,
      syncCompletedAt: new Date(),
    })
    logEvent("sync_failed", {
      weddingId,
      staffDeviceId,
      error: "SNAPSHOT_MISMATCH",
    })
    throw new SyncSnapshotMismatchError()
  }

  const results: SyncItemResult[] = []
  let acceptedCount = 0
  let duplicateCount = 0
  let rejectedCount = 0
  let errorCount = 0

  await prisma.$transaction(async (tx) => {
    for (const item of payload.checkins) {
      try {
        // Idempotency: if already processed, return previous authoritative result
        const alreadyProcessed = await findProcessedQueueItem(staffDeviceId, item.queueId)
        if (alreadyProcessed) {
          const authoritativeCheckin = await findAcceptedCheckinByGuest(
            weddingId,
            alreadyProcessed.guestId,
            tx
          )
          results.push({
            queueId: item.queueId,
            guestId: alreadyProcessed.guestId,
            status: "ALREADY_PROCESSED",
            authoritativeCheckedInAt: authoritativeCheckin
              ? authoritativeCheckin.checkedInAt.toISOString()
              : alreadyProcessed.checkedInAt.toISOString(),
          })
          continue
        }

        // Validate guest exists in snapshot
        const snapshotGuest = await tx.snapshotGuest.findFirst({
          where: { snapshotId: activeSnapshot.id, guestId: item.guestId },
        })

        if (!snapshotGuest) {
          results.push({
            queueId: item.queueId,
            guestId: item.guestId,
            status: "INVALID_GUEST",
            authoritativeCheckedInAt: null,
          })
          rejectedCount++
          continue
        }

        const incomingCheckedInAt = new Date(item.checkedInAt)
        const existingAccepted = await findAcceptedCheckinByGuest(weddingId, item.guestId, tx)

        if (!existingAccepted) {
          // No prior check-in — accept this one
          const newCheckin = await createCheckin(
            {
              weddingId,
              guestId: item.guestId,
              snapshotId: activeSnapshot.id,
              staffDeviceId,
              checkedInAt: incomingCheckedInAt,
              sourceQueueId: item.queueId,
              isDuplicate: false,
              duplicateOfId: null,
              syncStatus: "ACCEPTED",
            },
            tx
          )
          await updateGuestCheckedIn(item.guestId, true, incomingCheckedInAt, tx)

          results.push({
            queueId: item.queueId,
            guestId: item.guestId,
            status: "ACCEPTED",
            authoritativeCheckedInAt: newCheckin.checkedInAt.toISOString(),
          })
          acceptedCount++
        } else if (incomingCheckedInAt < existingAccepted.checkedInAt) {
          // Incoming timestamp is earlier — it becomes the new authoritative check-in.
          // Create the incoming as accepted first, then mark the old one as a duplicate of it.
          const newCheckin = await createCheckin(
            {
              weddingId,
              guestId: item.guestId,
              snapshotId: activeSnapshot.id,
              staffDeviceId,
              checkedInAt: incomingCheckedInAt,
              sourceQueueId: item.queueId,
              isDuplicate: false,
              duplicateOfId: null,
              syncStatus: "ACCEPTED",
            },
            tx
          )
          await markCheckinDuplicate(existingAccepted.id, newCheckin.id, tx)
          await updateGuestCheckedIn(item.guestId, true, incomingCheckedInAt, tx)

          results.push({
            queueId: item.queueId,
            guestId: item.guestId,
            status: "ACCEPTED",
            authoritativeCheckedInAt: newCheckin.checkedInAt.toISOString(),
          })
          acceptedCount++
        } else {
          // Incoming timestamp is later or equal — store as duplicate for audit trail
          await createCheckin(
            {
              weddingId,
              guestId: item.guestId,
              snapshotId: activeSnapshot.id,
              staffDeviceId,
              checkedInAt: incomingCheckedInAt,
              sourceQueueId: item.queueId,
              isDuplicate: true,
              duplicateOfId: existingAccepted.id,
              syncStatus: "DUPLICATE",
            },
            tx
          )

          results.push({
            queueId: item.queueId,
            guestId: item.guestId,
            status: "DUPLICATE",
            authoritativeCheckedInAt: existingAccepted.checkedInAt.toISOString(),
          })
          duplicateCount++
        }
      } catch {
        results.push({
          queueId: item.queueId,
          guestId: item.guestId,
          status: "REJECTED",
          authoritativeCheckedInAt: null,
        })
        rejectedCount++
        errorCount++
      }
    }
  })

  const syncCompletedAt = new Date()

  // Sync log is always written, even after partial failures, outside the main transaction
  await createSyncLog({
    weddingId,
    staffDeviceId,
    snapshotId: activeSnapshot.id,
    payloadCount: payload.checkins.length,
    acceptedCount,
    duplicateCount,
    rejectedCount,
    errorCount,
    syncStartedAt,
    syncCompletedAt,
  })

  logEvent("sync_completed", {
    weddingId,
    staffDeviceId,
    snapshotId: activeSnapshot.id,
    payloadCount: payload.checkins.length,
    acceptedCount,
    duplicateCount,
    rejectedCount,
    errorCount,
    durationMs: syncCompletedAt.getTime() - syncStartedAt.getTime(),
  })

  if (duplicateCount > 0) {
    logEvent("sync_duplicate_checkins", {
      weddingId,
      staffDeviceId,
      duplicateCount,
    })
  }

  return {
    results,
    summary: { accepted: acceptedCount, duplicate: duplicateCount, rejected: rejectedCount },
  }
}
