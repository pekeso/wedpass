export interface GuestDTO {
  id: string
  weddingId: string
  fullName: string
  phoneNumber: string | null
  email: string | null
  numberOfAllowedGuests: number
  qrToken: string
  isCheckedIn: boolean
  checkedInAt: string | null
  createdAt: string
  updatedAt: string
}

export interface GuestListItemDTO {
  id: string
  fullName: string
  phoneNumber: string | null
  email: string | null
  numberOfAllowedGuests: number
  qrToken: string
  isCheckedIn: boolean
  checkedInAt: string | null
}

export interface GuestResponseDTO {
  guest: GuestDTO
}

export interface ListGuestsResponseDTO {
  items: GuestListItemDTO[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export interface DeleteGuestResponseDTO {
  deleted: boolean
}
