export interface UploadUrlResponseDTO {
  uploadId: string
  fileKey: string
  uploadUrl: string
  expiresInSeconds: number
}

export interface MediaUploadDTO {
  id: string
  mediaType: "IMAGE" | "VIDEO"
  status: string
  fileKey: string
  createdAt: string
}

export interface ConfirmUploadResponseDTO {
  media: MediaUploadDTO
}

export interface OrganizerMediaItemDTO {
  id: string
  mediaType: "IMAGE" | "VIDEO"
  status: "UPLOADED" | "APPROVED" | "HIDDEN" | "DELETED"
  fileUrl: string
  thumbnailUrl: string | null
  uploadedByName: string | null
  createdAt: string
  hiddenAt: string | null
  deletedAt: string | null
}

export interface OrganizerMediaListResponseDTO {
  items: OrganizerMediaItemDTO[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export interface MediaModerationResponseDTO {
  mediaId: string
  status: "HIDDEN" | "UPLOADED" | "DELETED"
}

export interface MediaDownloadUrlResponseDTO {
  downloadUrl: string
  expiresInSeconds: number
}

export interface PublicGalleryMediaItemDTO {
  id: string
  mediaType: "IMAGE" | "VIDEO"
  fileUrl: string
  thumbnailUrl: string | null
  uploadedByName: string | null
  createdAt: string
}

export interface PublicGalleryPaginationDTO {
  page: number
  pageSize: number
  total: number
}

export interface PublicGalleryResponseDTO {
  items: PublicGalleryMediaItemDTO[]
  pagination: PublicGalleryPaginationDTO
}
