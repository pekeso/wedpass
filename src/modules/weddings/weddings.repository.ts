import { prisma } from "@/lib/db/prisma"
import type { CreateWeddingData, UpdateWeddingData } from "./weddings.types"

export async function createWedding(data: CreateWeddingData) {
  return prisma.wedding.create({
    data: {
      organizerId: data.organizerId,
      name: data.name,
      coupleNames: data.coupleNames ?? null,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
      location: data.location ?? null,
      country: data.country ?? null,
      slug: data.slug,
    },
  })
}

export async function findWeddingsByOrganizer(organizerId: string) {
  return prisma.wedding.findMany({
    where: { organizerId },
    orderBy: { createdAt: "desc" },
  })
}

export async function findWeddingById(weddingId: string) {
  return prisma.wedding.findUnique({
    where: { id: weddingId },
  })
}

export async function findWeddingBySlug(slug: string) {
  return prisma.wedding.findUnique({
    where: { slug },
  })
}

export async function updateWedding(weddingId: string, data: UpdateWeddingData) {
  return prisma.wedding.update({
    where: { id: weddingId },
    data,
  })
}
