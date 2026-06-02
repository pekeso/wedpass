import { prisma } from "@/lib/db/prisma"
import { findWeddingById } from "./weddings.repository"

export class AnalyticsWeddingNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Wedding not found")
    this.name = "AnalyticsWeddingNotFoundError"
  }
}

export class AnalyticsForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("You do not have access to this wedding")
    this.name = "AnalyticsForbiddenError"
  }
}

async function ensureWeddingAccess(weddingId: string, organizerId: string) {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new AnalyticsWeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new AnalyticsForbiddenError()
  return wedding
}

export async function getWeddingStats(weddingId: string, organizerId: string) {
  await ensureWeddingAccess(weddingId, organizerId)

  const [totalGuests, checkedInGuests, totalMediaUploads, lastSync] = await Promise.all([
    prisma.guest.count({ where: { weddingId, deletedAt: null } }),
    prisma.guest.count({ where: { weddingId, deletedAt: null, isCheckedIn: true } }),
    prisma.mediaUpload.count({ where: { weddingId, status: { not: "DELETED" } } }),
    prisma.syncLog.findFirst({
      where: { weddingId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ])

  const pendingGuests = totalGuests - checkedInGuests
  const checkinPercentage =
    totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 10000) / 100 : 0

  return {
    totalGuests,
    checkedInGuests,
    pendingGuests,
    checkinPercentage,
    totalMediaUploads,
    lastSyncAt: lastSync?.createdAt.toISOString() ?? null,
  }
}

export type DeviceCheckinStat = {
  deviceId: string
  label: string
  status: "ACTIVE" | "REVOKED"
  lastSeenAt: string | null
  checkinCount: number
}

export async function getCheckinStats(weddingId: string, organizerId: string) {
  await ensureWeddingAccess(weddingId, organizerId)

  const [totalGuests, checkedInGuests, devices] = await Promise.all([
    prisma.guest.count({ where: { weddingId, deletedAt: null } }),
    prisma.guest.count({ where: { weddingId, deletedAt: null, isCheckedIn: true } }),
    prisma.staffDevice.findMany({
      where: { weddingId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        status: true,
        lastSeenAt: true,
        _count: {
          select: { checkIns: { where: { isDuplicate: false } } },
        },
      },
    }),
  ])

  return {
    totalGuests,
    checkedInGuests,
    pendingGuests: totalGuests - checkedInGuests,
    devices: devices.map((d) => ({
      deviceId: d.id,
      label: d.label ?? "Unnamed Device",
      status: d.status as "ACTIVE" | "REVOKED",
      lastSeenAt: d.lastSeenAt?.toISOString() ?? null,
      checkinCount: d._count.checkIns,
    })),
  }
}
