import { prisma } from "@/lib/db/prisma"

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export async function findProcessedQueueItem(
  staffDeviceId: string,
  queueId: string
): Promise<{ id: string; checkedInAt: Date; isDuplicate: boolean; guestId: string } | null> {
  return prisma.checkIn.findFirst({
    where: { staffDeviceId, sourceQueueId: queueId },
    select: { id: true, checkedInAt: true, isDuplicate: true, guestId: true },
  })
}

export async function createSyncLog(
  data: {
    weddingId: string
    staffDeviceId: string | null
    snapshotId: string | null
    payloadCount: number
    acceptedCount: number
    duplicateCount: number
    rejectedCount: number
    errorCount: number
    syncStartedAt: Date
    syncCompletedAt: Date | null
  },
  tx?: TxClient
): Promise<void> {
  const client = tx ?? prisma
  await client.syncLog.create({ data })
}
