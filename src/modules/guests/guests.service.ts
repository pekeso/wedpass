import { generateQrToken } from "@/lib/utils/qr-token"
import {
  createGuest as repoCreateGuest,
  findGuestsByWedding,
  findGuestByWeddingAndId,
  findGuestByPhoneAndWedding,
  updateGuest as repoUpdateGuest,
  softDeleteGuest as repoSoftDeleteGuest,
} from "./guests.repository"
import { findWeddingById } from "@/modules/weddings/weddings.repository"
import type { CreateGuestInput, UpdateGuestInput, ListGuestsQuery } from "./guests.schemas"
import type {
  GuestDTO,
  GuestListItemDTO,
  GuestResponseDTO,
  ListGuestsResponseDTO,
  DeleteGuestResponseDTO,
} from "./guests.dto"

export class GuestNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Guest not found")
    this.name = "GuestNotFoundError"
  }
}

export class GuestForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("You do not have access to this guest")
    this.name = "GuestForbiddenError"
  }
}

export class EventModeLockedError extends Error {
  readonly code = "EVENT_MODE_LOCKED"
  constructor() {
    super("Guests cannot be edited after Event Mode is enabled")
    this.name = "EventModeLockedError"
  }
}

export class WeddingNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Wedding not found")
    this.name = "WeddingNotFoundError"
  }
}

function toGuestDTO(guest: {
  id: string
  weddingId: string
  fullName: string
  phoneNumber: string | null
  email: string | null
  numberOfAllowedGuests: number
  qrToken: string
  isCheckedIn: boolean
  checkedInAt: Date | null
  createdAt: Date
  updatedAt: Date
}): GuestDTO {
  return {
    id: guest.id,
    weddingId: guest.weddingId,
    fullName: guest.fullName,
    phoneNumber: guest.phoneNumber,
    email: guest.email,
    numberOfAllowedGuests: guest.numberOfAllowedGuests,
    qrToken: guest.qrToken,
    isCheckedIn: guest.isCheckedIn,
    checkedInAt: guest.checkedInAt ? guest.checkedInAt.toISOString() : null,
    createdAt: guest.createdAt.toISOString(),
    updatedAt: guest.updatedAt.toISOString(),
  }
}

function toGuestListItemDTO(guest: {
  id: string
  fullName: string
  phoneNumber: string | null
  email: string | null
  numberOfAllowedGuests: number
  qrToken: string
  isCheckedIn: boolean
  checkedInAt: Date | null
}): GuestListItemDTO {
  return {
    id: guest.id,
    fullName: guest.fullName,
    phoneNumber: guest.phoneNumber,
    email: guest.email,
    numberOfAllowedGuests: guest.numberOfAllowedGuests,
    qrToken: guest.qrToken,
    isCheckedIn: guest.isCheckedIn,
    checkedInAt: guest.checkedInAt ? guest.checkedInAt.toISOString() : null,
  }
}

async function ensureWeddingEditable(weddingId: string, organizerId: string) {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new WeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new GuestForbiddenError()
  if (wedding.status === "EVENT_MODE" || wedding.status === "COMPLETED") {
    throw new EventModeLockedError()
  }
  return wedding
}

export async function addGuest(
  weddingId: string,
  organizerId: string,
  input: CreateGuestInput
): Promise<GuestResponseDTO> {
  await ensureWeddingEditable(weddingId, organizerId)

  if (input.phoneNumber) {
    const duplicate = await findGuestByPhoneAndWedding(weddingId, input.phoneNumber)
    if (duplicate) {
      // Warn but do not block — phone duplicate is a soft warning in V1
      console.warn(`[guests.service] Possible duplicate phone: ${input.phoneNumber} in wedding ${weddingId}`)
    }
  }

  const qrToken = generateQrToken()
  const guest = await repoCreateGuest({
    weddingId,
    fullName: input.fullName,
    phoneNumber: input.phoneNumber,
    email: input.email,
    numberOfAllowedGuests: input.numberOfAllowedGuests ?? 1,
    qrToken,
  })
  return { guest: toGuestDTO(guest) }
}

export async function listGuests(
  weddingId: string,
  organizerId: string,
  query: ListGuestsQuery
): Promise<ListGuestsResponseDTO> {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new WeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new GuestForbiddenError()

  const { guests, total } = await findGuestsByWedding(weddingId, {
    search: query.search,
    checkedIn: query.checkedIn,
    page: query.page,
    pageSize: query.pageSize,
  })

  return {
    items: guests.map(toGuestListItemDTO),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
    },
  }
}

export async function updateGuest(
  weddingId: string,
  guestId: string,
  organizerId: string,
  input: UpdateGuestInput
): Promise<GuestResponseDTO> {
  await ensureWeddingEditable(weddingId, organizerId)

  const existing = await findGuestByWeddingAndId(weddingId, guestId)
  if (!existing) throw new GuestNotFoundError()

  const updated = await repoUpdateGuest(weddingId, guestId, {
    fullName: input.fullName,
    phoneNumber: input.phoneNumber !== undefined ? (input.phoneNumber ?? null) : undefined,
    email: input.email !== undefined ? (input.email || null) : undefined,
    numberOfAllowedGuests: input.numberOfAllowedGuests,
  })
  return { guest: toGuestDTO(updated) }
}

export async function deleteGuest(
  weddingId: string,
  guestId: string,
  organizerId: string
): Promise<DeleteGuestResponseDTO> {
  await ensureWeddingEditable(weddingId, organizerId)

  const existing = await findGuestByWeddingAndId(weddingId, guestId)
  if (!existing) throw new GuestNotFoundError()

  await repoSoftDeleteGuest(weddingId, guestId)
  return { deleted: true }
}
