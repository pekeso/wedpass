import { prisma } from "@/lib/db/prisma"
import type { MediaStatus, MediaType, UploadSource } from "@/generated/prisma/enums"

export interface CreateMediaUploadData {
  id: string
  weddingId: string
  mediaType: MediaType
  mimeType: string
  fileKey: string
  fileSizeBytes: number
  durationSeconds?: number | null
  originalFileName?: string
  uploadedByName?: string
  uploadSource: UploadSource
}

export async function createMediaUpload(data: CreateMediaUploadData) {
  return prisma.mediaUpload.create({
    data: {
      id: data.id,
      weddingId: data.weddingId,
      mediaType: data.mediaType,
      mimeType: data.mimeType,
      fileKey: data.fileKey,
      fileSizeBytes: BigInt(data.fileSizeBytes),
      durationSeconds: data.durationSeconds ?? null,
      originalFileName: data.originalFileName ?? null,
      uploadedByName: data.uploadedByName ?? null,
      uploadSource: data.uploadSource,
    },
  })
}

export interface OrganizerGalleryFilters {
  mediaType?: "IMAGE" | "VIDEO"
  status?: MediaStatus
  page: number
  pageSize: number
}

export async function findGalleryMediaByWedding(
  weddingId: string,
  filters: OrganizerGalleryFilters
) {
  const where = {
    weddingId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.mediaType ? { mediaType: filters.mediaType as MediaType } : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.mediaUpload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        id: true,
        mediaType: true,
        status: true,
        fileKey: true,
        fileUrl: true,
        thumbnailKey: true,
        thumbnailUrl: true,
        uploadedByName: true,
        createdAt: true,
        hiddenAt: true,
        deletedAt: true,
      },
    }),
    prisma.mediaUpload.count({ where }),
  ])

  return { items, total }
}

export async function findMediaByWeddingAndId(weddingId: string, mediaId: string) {
  return prisma.mediaUpload.findFirst({
    where: { id: mediaId, weddingId },
  })
}

export async function hideMedia(weddingId: string, mediaId: string) {
  return prisma.mediaUpload.updateMany({
    where: { id: mediaId, weddingId },
    data: { status: "HIDDEN", hiddenAt: new Date() },
  })
}

export async function showMedia(weddingId: string, mediaId: string) {
  return prisma.mediaUpload.updateMany({
    where: { id: mediaId, weddingId },
    data: { status: "UPLOADED", hiddenAt: null },
  })
}

export async function deleteMedia(weddingId: string, mediaId: string) {
  return prisma.mediaUpload.updateMany({
    where: { id: mediaId, weddingId },
    data: { status: "DELETED", deletedAt: new Date() },
  })
}

const VISIBLE_STATUSES = ["UPLOADED", "APPROVED"] as const

export interface GalleryMediaFilters {
  mediaType?: "IMAGE" | "VIDEO"
  page: number
  pageSize: number
}

export async function findPublicGalleryMedia(
  weddingId: string,
  filters: GalleryMediaFilters
) {
  const where = {
    weddingId,
    status: { in: VISIBLE_STATUSES as unknown as ("UPLOADED" | "APPROVED")[] },
    ...(filters.mediaType ? { mediaType: filters.mediaType as MediaType } : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.mediaUpload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        id: true,
        mediaType: true,
        fileKey: true,
        fileUrl: true,
        thumbnailKey: true,
        thumbnailUrl: true,
        createdAt: true,
      },
    }),
    prisma.mediaUpload.count({ where }),
  ])

  return { items, total }
}
