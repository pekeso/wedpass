import { prisma } from "@/lib/db/prisma"

export async function createStaffDevice(weddingId: string, label: string) {
  return prisma.staffDevice.create({
    data: { weddingId, label },
  })
}

export async function findStaffDevicesByWedding(weddingId: string) {
  return prisma.staffDevice.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          checkIns: { where: { syncStatus: "ACCEPTED", isDuplicate: false } },
        },
      },
    },
  })
}

export async function findStaffDeviceById(weddingId: string, deviceId: string) {
  return prisma.staffDevice.findFirst({
    where: { id: deviceId, weddingId },
  })
}

export async function revokeStaffDevice(weddingId: string, deviceId: string) {
  return prisma.staffDevice.update({
    where: { id: deviceId, weddingId },
    data: { status: "REVOKED", revokedAt: new Date() },
  })
}

export async function updateLastSeen(deviceId: string) {
  return prisma.staffDevice.update({
    where: { id: deviceId },
    data: { lastSeenAt: new Date() },
  })
}

export async function updateDeviceSyncState(
  deviceId: string,
  pendingCheckinCount: number
) {
  return prisma.staffDevice.update({
    where: { id: deviceId },
    data: { lastSeenAt: new Date(), pendingCheckinCount },
  })
}
