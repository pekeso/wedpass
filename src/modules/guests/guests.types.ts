import type { CreateGuestInput, UpdateGuestInput } from "./guests.schemas"

export interface CreateGuestData extends CreateGuestInput {
  weddingId: string
  qrToken: string
}

export interface UpdateGuestData extends UpdateGuestInput {}

export interface GuestFilters {
  search?: string
  checkedIn?: boolean
  page: number
  pageSize: number
}
