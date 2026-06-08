import { signStaffToken } from "@/lib/auth/staff-jwt"
import { findWeddingById } from "@/modules/weddings/weddings.repository"
import { findActiveSnapshot } from "@/modules/weddings/snapshot.repository"
import {
  createStaffDevice as repoCreate,
  findStaffDevicesByWedding,
  findStaffDeviceById,
  revokeStaffDevice as repoRevoke,
} from "./staff.repository"
import type { CreateStaffDeviceInput } from "./staff.schemas"
import type {
  StaffDeviceDTO,
  StaffDeviceListItemDTO,
  CreateStaffDeviceResponseDTO,
  ListStaffDevicesResponseDTO,
  RevokeStaffDeviceResponseDTO,
} from "./staff.dto"

export class StaffWeddingNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Wedding not found")
    this.name = "StaffWeddingNotFoundError"
  }
}

export class StaffForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("You do not have access to this wedding")
    this.name = "StaffForbiddenError"
  }
}

export class StaffDeviceNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Staff device not found")
    this.name = "StaffDeviceNotFoundError"
  }
}

function toStaffDeviceDTO(device: {
  id: string
  weddingId: string
  label: string | null
  status: "ACTIVE" | "REVOKED"
  lastSeenAt: Date | null
  createdAt: Date
  revokedAt: Date | null
}): StaffDeviceDTO {
  return {
    id: device.id,
    weddingId: device.weddingId,
    label: device.label,
    status: device.status,
    lastSeenAt: device.lastSeenAt ? device.lastSeenAt.toISOString() : null,
    createdAt: device.createdAt.toISOString(),
    revokedAt: device.revokedAt ? device.revokedAt.toISOString() : null,
  }
}

function toStaffDeviceListItemDTO(
  device: {
    id: string
    label: string | null
    status: "ACTIVE" | "REVOKED"
    lastSeenAt: Date | null
    createdAt: Date
    pendingCheckinCount: number | null
    _count: { checkIns: number }
  },
  activeSnapshot: { version: number; guestCount: number } | null
): StaffDeviceListItemDTO {
  return {
    id: device.id,
    label: device.label,
    status: device.status,
    lastSeenAt: device.lastSeenAt ? device.lastSeenAt.toISOString() : null,
    createdAt: device.createdAt.toISOString(),
    snapshotVersion: activeSnapshot?.version ?? null,
    guestCount: activeSnapshot?.guestCount ?? null,
    checkinCount: device._count.checkIns,
    pendingCheckinCount: device.pendingCheckinCount,
  }
}

async function ensureWeddingOwner(weddingId: string, organizerId: string) {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new StaffWeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new StaffForbiddenError()
  return wedding
}

export async function createStaffDevice(
  weddingId: string,
  organizerId: string,
  input: CreateStaffDeviceInput
): Promise<CreateStaffDeviceResponseDTO> {
  await ensureWeddingOwner(weddingId, organizerId)

  const device = await repoCreate(weddingId, input.label)
  const staffToken = signStaffToken({ staffDeviceId: device.id, weddingId })

  return { device: toStaffDeviceDTO(device), staffToken }
}

export async function listStaffDevices(
  weddingId: string,
  organizerId: string
): Promise<ListStaffDevicesResponseDTO> {
  await ensureWeddingOwner(weddingId, organizerId)

  const [devices, activeSnapshot] = await Promise.all([
    findStaffDevicesByWedding(weddingId),
    findActiveSnapshot(weddingId),
  ])

  return { items: devices.map((d) => toStaffDeviceListItemDTO(d, activeSnapshot)) }
}

export async function reissueStaffToken(
  weddingId: string,
  deviceId: string,
  organizerId: string
): Promise<{ staffToken: string }> {
  await ensureWeddingOwner(weddingId, organizerId)

  const device = await findStaffDeviceById(weddingId, deviceId)
  if (!device) throw new StaffDeviceNotFoundError()

  const staffToken = signStaffToken({ staffDeviceId: device.id, weddingId })
  return { staffToken }
}

export async function revokeStaffDevice(
  weddingId: string,
  deviceId: string,
  organizerId: string
): Promise<RevokeStaffDeviceResponseDTO> {
  await ensureWeddingOwner(weddingId, organizerId)

  const existing = await findStaffDeviceById(weddingId, deviceId)
  if (!existing) throw new StaffDeviceNotFoundError()

  await repoRevoke(weddingId, deviceId)
  return { revoked: true }
}
