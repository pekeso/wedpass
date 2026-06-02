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

export interface PublicGalleryMediaItemDTO {
  id: string
  mediaType: "IMAGE" | "VIDEO"
  fileUrl: string
  thumbnailUrl: string | null
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
