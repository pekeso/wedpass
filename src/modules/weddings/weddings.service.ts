import { generateSlug } from "@/lib/utils/slug"
import {
  createWedding as repoCreateWedding,
  findWeddingsByOrganizer,
  findWeddingById,
  findWeddingBySlug,
  updateWedding as repoUpdateWedding,
} from "./weddings.repository"
import type { CreateWeddingInput, UpdateWeddingInput } from "./weddings.schemas"
import type {
  WeddingDTO,
  WeddingListItemDTO,
  ListWeddingsResponseDTO,
  WeddingResponseDTO,
  PublicWeddingDTO,
  PublicWeddingResponseDTO,
} from "./weddings.dto"

export class WeddingNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Wedding not found")
    this.name = "WeddingNotFoundError"
  }
}

export class WeddingForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("You do not have access to this wedding")
    this.name = "WeddingForbiddenError"
  }
}

export class WeddingCompletedError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("Completed weddings cannot be edited")
    this.name = "WeddingCompletedError"
  }
}

function toWeddingDTO(wedding: {
  id: string
  name: string
  coupleNames: string | null
  slug: string
  status: string
  eventDate: Date | null
  location: string | null
  country: string | null
  galleryEnabled: boolean
  coverImageUrl: string | null
  createdAt: Date
  updatedAt: Date
}): WeddingDTO {
  return {
    id: wedding.id,
    name: wedding.name,
    coupleNames: wedding.coupleNames,
    slug: wedding.slug,
    status: wedding.status as WeddingDTO["status"],
    eventDate: wedding.eventDate ? wedding.eventDate.toISOString().split("T")[0] : null,
    location: wedding.location,
    country: wedding.country,
    galleryEnabled: wedding.galleryEnabled,
    coverImageUrl: wedding.coverImageUrl,
    createdAt: wedding.createdAt.toISOString(),
    updatedAt: wedding.updatedAt.toISOString(),
  }
}

function toWeddingListItemDTO(wedding: {
  id: string
  name: string
  coupleNames: string | null
  status: string
  eventDate: Date | null
  location: string | null
  createdAt: Date
}): WeddingListItemDTO {
  return {
    id: wedding.id,
    name: wedding.name,
    coupleNames: wedding.coupleNames,
    status: wedding.status as WeddingListItemDTO["status"],
    eventDate: wedding.eventDate ? wedding.eventDate.toISOString().split("T")[0] : null,
    location: wedding.location,
    createdAt: wedding.createdAt.toISOString(),
  }
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let attempt = 0
  while (await findWeddingBySlug(slug)) {
    attempt++
    slug = `${baseSlug}-${attempt}`
  }
  return slug
}

export async function createWedding(
  organizerId: string,
  input: CreateWeddingInput
): Promise<WeddingResponseDTO> {
  const baseSlug = generateSlug(input.name)
  const slug = await ensureUniqueSlug(baseSlug)
  const wedding = await repoCreateWedding({ ...input, organizerId, slug })
  return { wedding: toWeddingDTO(wedding) }
}

export async function listWeddings(organizerId: string): Promise<ListWeddingsResponseDTO> {
  const weddings = await findWeddingsByOrganizer(organizerId)
  return { items: weddings.map(toWeddingListItemDTO) }
}

export async function getWeddingForOrganizer(
  weddingId: string,
  organizerId: string
): Promise<WeddingResponseDTO> {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new WeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new WeddingForbiddenError()
  return { wedding: toWeddingDTO(wedding) }
}

function toPublicWeddingDTO(wedding: {
  name: string
  coupleNames: string | null
  eventDate: Date | null
  location: string | null
  coverImageUrl: string | null
  galleryEnabled: boolean
}): PublicWeddingDTO {
  return {
    name: wedding.name,
    coupleNames: wedding.coupleNames,
    eventDate: wedding.eventDate ? wedding.eventDate.toISOString().split("T")[0] : null,
    location: wedding.location,
    coverImageUrl: wedding.coverImageUrl,
    galleryEnabled: wedding.galleryEnabled,
  }
}

export async function getPublicWedding(slug: string): Promise<PublicWeddingResponseDTO> {
  const wedding = await findWeddingBySlug(slug)
  if (!wedding) throw new WeddingNotFoundError()
  return { wedding: toPublicWeddingDTO(wedding) }
}

export async function getWeddingForUploadPage(slug: string): Promise<{
  weddingId: string
  wedding: PublicWeddingDTO
}> {
  const wedding = await findWeddingBySlug(slug)
  if (!wedding) throw new WeddingNotFoundError()
  return { weddingId: wedding.id, wedding: toPublicWeddingDTO(wedding) }
}

export async function updateWedding(
  weddingId: string,
  organizerId: string,
  input: UpdateWeddingInput
): Promise<WeddingResponseDTO> {
  const existing = await findWeddingById(weddingId)
  if (!existing) throw new WeddingNotFoundError()
  if (existing.organizerId !== organizerId) throw new WeddingForbiddenError()
  if (existing.status === "COMPLETED") throw new WeddingCompletedError()

  const updated = await repoUpdateWedding(weddingId, {
    name: input.name,
    coupleNames: input.coupleNames,
    eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
    location: input.location,
    country: input.country,
    galleryEnabled: input.galleryEnabled,
  })
  return { wedding: toWeddingDTO(updated) }
}
