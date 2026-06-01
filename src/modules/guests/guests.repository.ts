import { prisma } from "@/lib/db/prisma"
import type { CreateGuestData, GuestFilters } from "./guests.types"

export async function createGuest(data: CreateGuestData) {
  return prisma.guest.create({
    data: {
      weddingId: data.weddingId,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber ?? null,
      email: data.email || null,
      numberOfAllowedGuests: data.numberOfAllowedGuests ?? 1,
      qrToken: data.qrToken,
    },
  })
}

export async function findGuestsByWedding(weddingId: string, filters: GuestFilters) {
  const { search, checkedIn, page, pageSize } = filters
  const skip = (page - 1) * pageSize

  const where = {
    weddingId,
    deletedAt: null,
    ...(checkedIn !== undefined && { isCheckedIn: checkedIn }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" as const } },
        { phoneNumber: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  }

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.guest.count({ where }),
  ])

  return { guests, total }
}

export async function findGuestByWeddingAndId(weddingId: string, guestId: string) {
  return prisma.guest.findFirst({
    where: { id: guestId, weddingId, deletedAt: null },
  })
}

export async function findGuestByPhoneAndWedding(weddingId: string, phoneNumber: string) {
  return prisma.guest.findFirst({
    where: { weddingId, phoneNumber, deletedAt: null },
  })
}

export async function updateGuest(weddingId: string, guestId: string, data: Partial<{
  fullName: string
  phoneNumber: string | null
  email: string | null
  numberOfAllowedGuests: number
}>) {
  return prisma.guest.update({
    where: { id: guestId, weddingId },
    data,
  })
}

export async function softDeleteGuest(weddingId: string, guestId: string) {
  return prisma.guest.update({
    where: { id: guestId, weddingId },
    data: { deletedAt: new Date() },
  })
}

export async function countGuestsByWedding(weddingId: string) {
  return prisma.guest.count({
    where: { weddingId, deletedAt: null },
  })
}
