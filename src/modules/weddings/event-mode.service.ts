import { prisma } from "@/lib/db/prisma"
import { findWeddingById } from "./weddings.repository"
import {
  findActiveSnapshot,
  findActiveSnapshotWithGuests,
  findLatestSnapshotVersion,
  createSnapshotWithGuests,
} from "./snapshot.repository"
import { updateLastSeen } from "@/modules/staff/staff.repository"

export type StaffDeviceStatusDTO = {
  id: string
  label: string | null
  status: "ACTIVE" | "REVOKED"
  lastSeenAt: string | null
}

export type EventDayStatusDTO = {
  weddingId: string
  weddingStatus: "DRAFT" | "ACTIVE" | "EVENT_MODE" | "COMPLETED"
  snapshot: {
    id: string
    version: number
    guestCount: number
    createdAt: string
  } | null
  staffDevices: StaffDeviceStatusDTO[]
  checkinStats: {
    total: number
    checkedIn: number
    pending: number
  }
}

export class EventModeWeddingNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Wedding not found")
    this.name = "EventModeWeddingNotFoundError"
  }
}

export class EventModeForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("You do not have access to this wedding")
    this.name = "EventModeForbiddenError"
  }
}

export class EventModeAlreadyEnabledError extends Error {
  readonly code = "CONFLICT"
  constructor() {
    super("Event Mode is already enabled for this wedding")
    this.name = "EventModeAlreadyEnabledError"
  }
}

export class EventModeNotReadyError extends Error {
  readonly code = "VALIDATION_ERROR"
  constructor(message: string) {
    super(message)
    this.name = "EventModeNotReadyError"
  }
}

export class EventModeSnapshotNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("No active snapshot found for this wedding")
    this.name = "EventModeSnapshotNotFoundError"
  }
}

export type ReadinessCheck = {
  key: string
  label: string
  passed: boolean
}

export type ReadinessResult = {
  ready: boolean
  checks: ReadinessCheck[]
}

async function ensureWeddingAccess(weddingId: string, organizerId: string) {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new EventModeWeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new EventModeForbiddenError()
  return wedding
}

export async function getReadinessChecks(
  weddingId: string,
  organizerId: string
): Promise<ReadinessResult> {
  const wedding = await ensureWeddingAccess(weddingId, organizerId)

  const [guestCount, guestsWithoutQr, activeStaffCount] = await Promise.all([
    prisma.guest.count({ where: { weddingId, deletedAt: null } }),
    prisma.guest.count({
      where: { weddingId, deletedAt: null, qrToken: { equals: "" } },
    }),
    prisma.staffDevice.count({ where: { weddingId, status: "ACTIVE" } }),
  ])

  const checks: ReadinessCheck[] = [
    {
      key: "wedding_details",
      label: "Wedding details completed",
      passed: !!(wedding.name && wedding.eventDate),
    },
    {
      key: "guest_list",
      label: "Guest list imported",
      passed: guestCount > 0,
    },
    {
      key: "qr_codes",
      label: "QR codes generated",
      passed: guestCount > 0 && guestsWithoutQr === 0,
    },
    {
      key: "staff_access",
      label: "Staff access prepared",
      passed: activeStaffCount > 0,
    },
  ]

  return { ready: checks.every((c) => c.passed), checks }
}

export async function enableEventMode(weddingId: string, organizerId: string) {
  const wedding = await ensureWeddingAccess(weddingId, organizerId)

  if (wedding.status === "EVENT_MODE" || wedding.status === "COMPLETED") {
    throw new EventModeAlreadyEnabledError()
  }

  if (wedding.status !== "DRAFT" && wedding.status !== "ACTIVE") {
    throw new EventModeNotReadyError("Wedding must be in DRAFT or ACTIVE state to enable Event Mode")
  }

  const guests = await prisma.guest.findMany({
    where: { weddingId, deletedAt: null },
    select: {
      id: true,
      weddingId: true,
      fullName: true,
      phoneNumber: true,
      email: true,
      numberOfAllowedGuests: true,
      qrToken: true,
    },
  })

  if (guests.length === 0) {
    throw new EventModeNotReadyError("Cannot enable Event Mode with no guests in the list")
  }

  const nextVersion = (await findLatestSnapshotVersion(weddingId)) + 1

  const snapshot = await createSnapshotWithGuests(
    weddingId,
    organizerId,
    guests.map((g) => ({
      weddingId: g.weddingId,
      guestId: g.id,
      fullName: g.fullName,
      phoneNumber: g.phoneNumber,
      email: g.email,
      numberOfAllowedGuests: g.numberOfAllowedGuests,
      qrToken: g.qrToken,
    })),
    nextVersion
  )

  return {
    weddingId,
    status: "EVENT_MODE" as const,
    snapshot: {
      id: snapshot.id,
      version: snapshot.version,
      guestCount: snapshot.guestCount,
      createdAt: snapshot.createdAt.toISOString(),
    },
  }
}

export async function getActiveSnapshotForOrganizer(weddingId: string, organizerId: string) {
  await ensureWeddingAccess(weddingId, organizerId)

  const snapshot = await findActiveSnapshot(weddingId)
  if (!snapshot) return null

  return {
    id: snapshot.id,
    version: snapshot.version,
    guestCount: snapshot.guestCount,
    createdAt: snapshot.createdAt.toISOString(),
  }
}

export async function getEventDayStatus(
  weddingId: string,
  organizerId: string
): Promise<EventDayStatusDTO> {
  const wedding = await ensureWeddingAccess(weddingId, organizerId)

  const [snapshot, staffDevices, totalGuests, checkedInGuests] = await Promise.all([
    findActiveSnapshot(weddingId),
    prisma.staffDevice.findMany({
      where: { weddingId },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, status: true, lastSeenAt: true },
    }),
    prisma.guest.count({ where: { weddingId, deletedAt: null } }),
    prisma.guest.count({ where: { weddingId, deletedAt: null, isCheckedIn: true } }),
  ])

  return {
    weddingId,
    weddingStatus: wedding.status as EventDayStatusDTO["weddingStatus"],
    snapshot: snapshot
      ? {
          id: snapshot.id,
          version: snapshot.version,
          guestCount: snapshot.guestCount,
          createdAt: snapshot.createdAt.toISOString(),
        }
      : null,
    staffDevices: staffDevices.map((d) => ({
      id: d.id,
      label: d.label,
      status: d.status as "ACTIVE" | "REVOKED",
      lastSeenAt: d.lastSeenAt ? d.lastSeenAt.toISOString() : null,
    })),
    checkinStats: {
      total: totalGuests,
      checkedIn: checkedInGuests,
      pending: totalGuests - checkedInGuests,
    },
  }
}

export async function getSnapshotForStaffDownload(weddingId: string, staffDeviceId: string) {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new EventModeWeddingNotFoundError()

  const snapshot = await findActiveSnapshotWithGuests(weddingId)
  if (!snapshot) throw new EventModeSnapshotNotFoundError()

  await updateLastSeen(staffDeviceId)

  return {
    wedding: {
      id: wedding.id,
      name: wedding.name,
      coupleNames: wedding.coupleNames ?? null,
    },
    snapshot: {
      id: snapshot.id,
      version: snapshot.version,
      guestCount: snapshot.guestCount,
    },
    staffDeviceId,
    guests: snapshot.snapshotGuests.map((sg) => ({
      guestId: sg.guestId,
      snapshotId: sg.snapshotId,
      snapshotVersion: snapshot.version,
      fullName: sg.fullName,
      phoneNumber: sg.phoneNumber ?? undefined,
      email: sg.email ?? undefined,
      qrToken: sg.qrToken,
      allowedGuests: sg.numberOfAllowedGuests,
    })),
  }
}
