import { signStaffToken } from "@/lib/auth/staff-jwt"
import { findWeddingById } from "@/modules/weddings/weddings.repository"
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

function toStaffDeviceListItemDTO(device: {
  id: string
  label: string | null
  status: "ACTIVE" | "REVOKED"
  lastSeenAt: Date | null
  createdAt: Date
}): StaffDeviceListItemDTO {
  return {
    id: device.id,
    label: device.label,
    status: device.status,
    lastSeenAt: device.lastSeenAt ? device.lastSeenAt.toISOString() : null,
    createdAt: device.createdAt.toISOString(),
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

  const devices = await findStaffDevicesByWedding(weddingId)
  return { items: devices.map(toStaffDeviceListItemDTO) }
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
