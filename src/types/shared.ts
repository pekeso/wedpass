export type UUID = string

export type ISODateString = string

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface LocalGuest {
  guestId: string
  weddingId: string
  snapshotId: string
  snapshotVersion: number
  fullName: string
  phoneNumber?: string
  email?: string
  qrToken: string
  allowedGuests: number
  tableName: string
  seatNumber?: string
  checkedIn: boolean
  checkedInAt?: string
  lastSyncedAt?: string
}

export interface LocalCheckinQueueItem {
  queueId: string
  weddingId: string
  snapshotId: string
  snapshotVersion: number
  guestId: string
  checkedInAt: string
  deviceId: string
  synced: boolean
  syncAttempts: number
  lastSyncAttemptAt?: string
  syncError?: string
  createdAt: string
}

export interface LocalMetadata {
  key: string
  value: string
  updatedAt: string
}

export interface LocalMediaUpload {
  uploadId: string
  weddingId: string
  weddingSlug: string
  fileName: string
  mimeType: string
  mediaType: "image" | "video"
  fileSizeBytes: number
  durationSeconds?: number
  fileBlob: Blob
  uploadStatus: "pending" | "uploading" | "failed" | "uploaded"
  progress: number
  uploadedByName?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}
