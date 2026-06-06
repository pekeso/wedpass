import { prisma } from "@/lib/db/prisma"

export type SnapshotGuestData = {
  weddingId: string
  guestId: string
  fullName: string
  phoneNumber: string | null
  email: string | null
  numberOfAllowedGuests: number
  tableName: string | null
  seatNumber: string | null
  qrToken: string
}

export async function findActiveSnapshot(weddingId: string) {
  return prisma.weddingSnapshot.findFirst({
    where: { weddingId, isActive: true },
  })
}

export async function findActiveSnapshotWithGuests(weddingId: string) {
  return prisma.weddingSnapshot.findFirst({
    where: { weddingId, isActive: true },
    include: { snapshotGuests: true },
  })
}

export async function findLatestSnapshotVersion(weddingId: string): Promise<number> {
  const latest = await prisma.weddingSnapshot.findFirst({
    where: { weddingId },
    orderBy: { version: "desc" },
    select: { version: true },
  })
  return latest?.version ?? 0
}

export async function createSnapshotWithGuests(
  weddingId: string,
  userId: string,
  guests: SnapshotGuestData[],
  version: number
) {
  return prisma.$transaction(async (tx) => {
    const snapshot = await tx.weddingSnapshot.create({
      data: {
        weddingId,
        version,
        isActive: true,
        guestCount: guests.length,
        createdByUserId: userId,
      },
    })

    await tx.snapshotGuest.createMany({
      data: guests.map((g) => ({
        snapshotId: snapshot.id,
        weddingId: g.weddingId,
        guestId: g.guestId,
        fullName: g.fullName,
        phoneNumber: g.phoneNumber,
        email: g.email,
        numberOfAllowedGuests: g.numberOfAllowedGuests,
        tableName: g.tableName,
        seatNumber: g.seatNumber,
        qrToken: g.qrToken,
      })),
    })

    await tx.wedding.update({
      where: { id: weddingId },
      data: { status: "EVENT_MODE" },
    })

    return snapshot
  })
}
