import type { ApiResponse } from "@/types/api"
import type {
  GuestResponseDTO,
  ListGuestsResponseDTO,
  DeleteGuestResponseDTO,
  ImportGuestsResponseDTO,
  QrDataItemDTO,
  AllQrDataResponseDTO,
} from "@/modules/guests/guests.dto"
import type { CreateGuestInput, UpdateGuestInput } from "@/modules/guests/guests.schemas"

function guestsBase(weddingId: string) {
  return `/api/v1/weddings/${weddingId}/guests`
}

export interface ListGuestsParams {
  search?: string
  checkedIn?: boolean
  page?: number
  pageSize?: number
}

export async function listGuests(
  weddingId: string,
  params: ListGuestsParams,
  accessToken: string
): Promise<ApiResponse<ListGuestsResponseDTO>> {
  const query = new URLSearchParams()
  if (params.search) query.set("search", params.search)
  if (params.checkedIn !== undefined) query.set("checkedIn", String(params.checkedIn))
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))

  const res = await fetch(`${guestsBase(weddingId)}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function createGuest(
  weddingId: string,
  data: CreateGuestInput,
  accessToken: string
): Promise<ApiResponse<GuestResponseDTO>> {
  const res = await fetch(guestsBase(weddingId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateGuest(
  weddingId: string,
  guestId: string,
  data: UpdateGuestInput,
  accessToken: string
): Promise<ApiResponse<GuestResponseDTO>> {
  const res = await fetch(`${guestsBase(weddingId)}/${guestId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteGuest(
  weddingId: string,
  guestId: string,
  accessToken: string
): Promise<ApiResponse<DeleteGuestResponseDTO>> {
  const res = await fetch(`${guestsBase(weddingId)}/${guestId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function importGuests(
  weddingId: string,
  guests: unknown[],
  accessToken: string
): Promise<ApiResponse<ImportGuestsResponseDTO>> {
  const res = await fetch(`${guestsBase(weddingId)}/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ guests }),
  })
  return res.json()
}

export async function getGuestQr(
  weddingId: string,
  guestId: string,
  accessToken: string
): Promise<ApiResponse<QrDataItemDTO>> {
  const res = await fetch(`${guestsBase(weddingId)}/${guestId}/qr`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function getAllQrCodes(
  weddingId: string,
  accessToken: string
): Promise<ApiResponse<AllQrDataResponseDTO>> {
  const res = await fetch(`/api/v1/weddings/${weddingId}/qr-codes`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}
