import { prisma } from "@/lib/db/prisma"

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export type CheckinRecord = {
  id: string
  weddingId: string
  guestId: string
  snapshotId: string
  staffDeviceId: string | null
  checkedInAt: Date
  sourceQueueId: string | null
  isDuplicate: boolean
  duplicateOfId: string | null
}

export async function findAcceptedCheckinByGuest(
  weddingId: string,
  guestId: string,
  tx?: TxClient
): Promise<CheckinRecord | null> {
  const client = tx ?? prisma
  return client.checkIn.findFirst({
    where: { weddingId, guestId, isDuplicate: false },
  })
}

export async function createCheckin(
  data: {
    weddingId: string
    guestId: string
    snapshotId: string
    staffDeviceId: string | null
    checkedInAt: Date
    sourceQueueId: string | null
    isDuplicate: boolean
    duplicateOfId: string | null
    syncStatus?: "ACCEPTED" | "DUPLICATE" | "REJECTED"
  },
  tx?: TxClient
): Promise<CheckinRecord> {
  const client = tx ?? prisma
  const { syncStatus, ...rest } = data
  return client.checkIn.create({
    data: { ...rest, ...(syncStatus ? { syncStatus } : {}) },
  })
}

export async function markCheckinDuplicate(
  checkinId: string,
  duplicateOfId: string,
  tx?: TxClient
): Promise<void> {
  const client = tx ?? prisma
  await client.checkIn.update({
    where: { id: checkinId },
    data: { isDuplicate: true, duplicateOfId, syncStatus: "DUPLICATE" },
  })
}

export async function updateGuestCheckedIn(
  guestId: string,
  isCheckedIn: boolean,
  checkedInAt: Date,
  tx?: TxClient
): Promise<void> {
  const client = tx ?? prisma
  await client.guest.update({
    where: { id: guestId },
    data: { isCheckedIn, checkedInAt },
  })
}
