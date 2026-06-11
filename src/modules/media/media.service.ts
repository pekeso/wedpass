import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2Client, getReadSignedUrl } from "@/lib/storage/r2-client"
import { findWeddingById, findWeddingBySlug } from "@/modules/weddings/weddings.repository"
import { logEvent } from "@/lib/utils/logger"
import {
  createMediaUpload,
  findPublicGalleryMedia,
  findGalleryMediaByWedding,
  findMediaByWeddingAndId,
  hideMedia,
  showMedia,
  deleteMedia,
} from "./media.repository"
import type {
  RequestUploadUrlInput,
  ConfirmUploadInput,
  PublicGalleryQuery,
  OrganizerGalleryQuery,
} from "./media.schemas"
import type {
  UploadUrlResponseDTO,
  ConfirmUploadResponseDTO,
  PublicGalleryResponseDTO,
  OrganizerMediaListResponseDTO,
  OrganizerMediaItemDTO,
  MediaModerationResponseDTO,
  MediaDownloadUrlResponseDTO,
} from "./media.dto"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024
const SIGNED_URL_EXPIRES_SECONDS = 900

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "video/mp4": ".mp4",
}

export class MediaWeddingNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Wedding not found")
    this.name = "MediaWeddingNotFoundError"
  }
}

export class FileTooLargeError extends Error {
  readonly code = "FILE_TOO_LARGE"
  constructor(maxMb: number) {
    super(`File exceeds the ${maxMb}MB limit`)
    this.name = "FileTooLargeError"
  }
}

export class UnsupportedFileTypeError extends Error {
  readonly code = "UNSUPPORTED_FILE_TYPE"
  constructor() {
    super("Unsupported file type. Allowed: image/jpeg, image/png, video/mp4")
    this.name = "UnsupportedFileTypeError"
  }
}

export class InvalidFileKeyError extends Error {
  readonly code = "INVALID_FILE_KEY"
  constructor() {
    super("Invalid file key")
    this.name = "InvalidFileKeyError"
  }
}

export class MediaUploadNotAllowedError extends Error {
  readonly code = "UPLOAD_NOT_ALLOWED"
  constructor() {
    super("Wedding is not accepting uploads")
    this.name = "MediaUploadNotAllowedError"
  }
}

function validateFileSize(mediaType: string, fileSizeBytes: number): void {
  if (mediaType === "IMAGE" && fileSizeBytes > MAX_IMAGE_BYTES) {
    throw new FileTooLargeError(10)
  }
  if (mediaType === "VIDEO" && fileSizeBytes > MAX_VIDEO_BYTES) {
    throw new FileTooLargeError(100)
  }
}

export async function requestUploadUrl(
  weddingId: string,
  input: RequestUploadUrlInput
): Promise<UploadUrlResponseDTO> {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new MediaWeddingNotFoundError()

  if (wedding.status !== "ACTIVE" && wedding.status !== "EVENT_MODE") {
    throw new MediaUploadNotAllowedError()
  }

  validateFileSize(input.mediaType, input.fileSizeBytes)

  const ext = MIME_TO_EXT[input.mimeType]
  if (!ext) throw new UnsupportedFileTypeError()

  const uploadId = crypto.randomUUID()
  const fileKey = `weddings/${weddingId}/media/${uploadId}${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: fileKey,
    ContentType: input.mimeType,
  })

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: SIGNED_URL_EXPIRES_SECONDS,
  })

  return { uploadId, fileKey, uploadUrl, expiresInSeconds: SIGNED_URL_EXPIRES_SECONDS }
}

export async function confirmUpload(
  weddingId: string,
  input: ConfirmUploadInput
): Promise<ConfirmUploadResponseDTO> {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new MediaWeddingNotFoundError()

  const expectedPrefix = `weddings/${weddingId}/media/`
  if (!input.fileKey.startsWith(expectedPrefix)) {
    throw new InvalidFileKeyError()
  }

  const ext = MIME_TO_EXT[input.mimeType]
  if (!ext) throw new UnsupportedFileTypeError()
  validateFileSize(input.mediaType, input.fileSizeBytes)

  logEvent("media_upload_confirmed", {
    weddingId,
    mediaType: input.mediaType,
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
  })

  const media = await createMediaUpload({
    id: input.uploadId,
    weddingId,
    mediaType: input.mediaType,
    mimeType: input.mimeType,
    fileKey: input.fileKey,
    fileSizeBytes: input.fileSizeBytes,
    durationSeconds: input.durationSeconds,
    uploadedByName: input.uploadedByName,
    uploadSource: "GUEST",
  })

  return {
    media: {
      id: media.id,
      mediaType: media.mediaType,
      status: media.status,
      fileKey: media.fileKey,
      createdAt: media.createdAt.toISOString(),
    },
  }
}

export class MediaNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Media not found")
    this.name = "MediaNotFoundError"
  }
}

export class MediaForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("Access denied")
    this.name = "MediaForbiddenError"
  }
}

export class GalleryDisabledError extends Error {
  readonly code = "GALLERY_DISABLED"
  constructor() {
    super("Gallery is not enabled for this wedding")
    this.name = "GalleryDisabledError"
  }
}

function buildFileUrl(fileKey: string, storedUrl: string | null): string {
  if (storedUrl) return storedUrl
  const base = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? ""
  return `${base}/${fileKey}`
}

export async function getPublicGalleryMedia(
  slug: string,
  query: PublicGalleryQuery
): Promise<{ galleryEnabled: false } | { galleryEnabled: true; data: PublicGalleryResponseDTO }> {
  const wedding = await findWeddingBySlug(slug)
  if (!wedding) throw new MediaWeddingNotFoundError()

  if (!wedding.galleryEnabled) {
    return { galleryEnabled: false }
  }

  const { items, total } = await findPublicGalleryMedia(wedding.id, {
    mediaType: query.mediaType,
    page: query.page,
    pageSize: query.pageSize,
  })

  return {
    galleryEnabled: true,
    data: {
      items: items.map((item) => ({
        id: item.id,
        mediaType: item.mediaType,
        fileUrl: buildFileUrl(item.fileKey, item.fileUrl),
        thumbnailUrl: item.thumbnailUrl
          ? item.thumbnailUrl
          : item.thumbnailKey
            ? buildFileUrl(item.thumbnailKey, null)
            : null,
        uploadedByName: item.uploadedByName,
        createdAt: item.createdAt.toISOString(),
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
      },
    },
  }
}

async function requireWeddingOwnership(weddingId: string, organizerId: string) {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new MediaWeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new MediaForbiddenError()
}

export async function getOrganizerGalleryMedia(
  weddingId: string,
  organizerId: string,
  query: OrganizerGalleryQuery
): Promise<OrganizerMediaListResponseDTO> {
  await requireWeddingOwnership(weddingId, organizerId)

  const { items, total } = await findGalleryMediaByWedding(weddingId, {
    mediaType: query.mediaType,
    status: query.status as import("@/generated/prisma/enums").MediaStatus | undefined,
    page: query.page,
    pageSize: query.pageSize,
  })

  return {
    items: items.map(
      (item): OrganizerMediaItemDTO => ({
        id: item.id,
        mediaType: item.mediaType,
        status: item.status as OrganizerMediaItemDTO["status"],
        fileUrl: buildFileUrl(item.fileKey, item.fileUrl),
        thumbnailUrl: item.thumbnailUrl
          ? item.thumbnailUrl
          : item.thumbnailKey
            ? buildFileUrl(item.thumbnailKey, null)
            : null,
        uploadedByName: item.uploadedByName,
        createdAt: item.createdAt.toISOString(),
        hiddenAt: item.hiddenAt?.toISOString() ?? null,
        deletedAt: item.deletedAt?.toISOString() ?? null,
      })
    ),
    pagination: { page: query.page, pageSize: query.pageSize, total },
  }
}

export async function hideMediaItem(
  weddingId: string,
  mediaId: string,
  organizerId: string
): Promise<MediaModerationResponseDTO> {
  await requireWeddingOwnership(weddingId, organizerId)
  const media = await findMediaByWeddingAndId(weddingId, mediaId)
  if (!media) throw new MediaNotFoundError()
  await hideMedia(weddingId, mediaId)
  logEvent("media_moderation_action", { weddingId, mediaId, action: "HIDDEN" })
  return { mediaId, status: "HIDDEN" }
}

export async function showMediaItem(
  weddingId: string,
  mediaId: string,
  organizerId: string
): Promise<MediaModerationResponseDTO> {
  await requireWeddingOwnership(weddingId, organizerId)
  const media = await findMediaByWeddingAndId(weddingId, mediaId)
  if (!media) throw new MediaNotFoundError()
  await showMedia(weddingId, mediaId)
  logEvent("media_moderation_action", { weddingId, mediaId, action: "SHOW" })
  return { mediaId, status: "UPLOADED" }
}

export async function deleteMediaItem(
  weddingId: string,
  mediaId: string,
  organizerId: string
): Promise<MediaModerationResponseDTO> {
  await requireWeddingOwnership(weddingId, organizerId)
  const media = await findMediaByWeddingAndId(weddingId, mediaId)
  if (!media) throw new MediaNotFoundError()
  await deleteMedia(weddingId, mediaId)
  logEvent("media_moderation_action", { weddingId, mediaId, action: "DELETED" })
  return { mediaId, status: "DELETED" }
}

export async function getMediaDownloadUrl(
  weddingId: string,
  mediaId: string,
  organizerId: string
): Promise<MediaDownloadUrlResponseDTO> {
  await requireWeddingOwnership(weddingId, organizerId)
  const media = await findMediaByWeddingAndId(weddingId, mediaId)
  if (!media) throw new MediaNotFoundError()
  const downloadUrl = await getReadSignedUrl(media.fileKey)
  return { downloadUrl, expiresInSeconds: 300 }
}
