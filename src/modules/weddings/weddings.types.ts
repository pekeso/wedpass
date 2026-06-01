import type { WeddingStatus } from "@/generated/prisma/enums"
import type { CreateWeddingInput } from "./weddings.schemas"

export type { WeddingStatus }

export interface CreateWeddingData extends CreateWeddingInput {
  organizerId: string
  slug: string
}

export interface UpdateWeddingData {
  name?: string
  coupleNames?: string
  eventDate?: Date | null
  location?: string
  country?: string
  galleryEnabled?: boolean
}
