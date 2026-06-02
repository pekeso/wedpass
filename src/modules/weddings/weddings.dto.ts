import type { WeddingStatus } from "@/generated/prisma/enums"

export interface WeddingDTO {
  id: string
  name: string
  coupleNames: string | null
  slug: string
  status: WeddingStatus
  eventDate: string | null
  location: string | null
  country: string | null
  galleryEnabled: boolean
  coverImageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface WeddingListItemDTO {
  id: string
  name: string
  coupleNames: string | null
  status: WeddingStatus
  eventDate: string | null
  location: string | null
  createdAt: string
}

export interface ListWeddingsResponseDTO {
  items: WeddingListItemDTO[]
}

export interface WeddingResponseDTO {
  wedding: WeddingDTO
}

export interface PublicWeddingDTO {
  name: string
  coupleNames: string | null
  eventDate: string | null
  location: string | null
  coverImageUrl: string | null
  galleryEnabled: boolean
}

export interface PublicWeddingResponseDTO {
  wedding: PublicWeddingDTO
}
