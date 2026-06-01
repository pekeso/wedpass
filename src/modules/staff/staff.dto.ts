export interface StaffDeviceDTO {
  id: string
  weddingId: string
  label: string | null
  status: "ACTIVE" | "REVOKED"
  lastSeenAt: string | null
  createdAt: string
  revokedAt: string | null
}

export interface StaffDeviceListItemDTO {
  id: string
  label: string | null
  status: "ACTIVE" | "REVOKED"
  lastSeenAt: string | null
  createdAt: string
}

export interface CreateStaffDeviceResponseDTO {
  device: StaffDeviceDTO
  staffToken: string
}

export interface ListStaffDevicesResponseDTO {
  items: StaffDeviceListItemDTO[]
}

export interface RevokeStaffDeviceResponseDTO {
  revoked: boolean
}
