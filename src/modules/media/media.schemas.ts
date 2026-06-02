import { z } from "zod"

export const requestUploadUrlSchema = z.object({
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  mimeType: z.enum(["image/jpeg", "image/png", "video/mp4"]),
  fileSizeBytes: z.number().positive(),
  originalFileName: z.string().optional(),
  durationSeconds: z.number().optional().nullable(),
  uploadedByName: z.string().optional(),
})

export const confirmUploadSchema = z.object({
  uploadId: z.string().uuid(),
  fileKey: z.string().min(1),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  mimeType: z.enum(["image/jpeg", "image/png", "video/mp4"]),
  fileSizeBytes: z.number().positive(),
  durationSeconds: z.number().optional().nullable(),
  uploadedByName: z.string().optional(),
})

export const publicGalleryQuerySchema = z.object({
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
})

export type RequestUploadUrlInput = z.infer<typeof requestUploadUrlSchema>
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>
export type PublicGalleryQuery = z.infer<typeof publicGalleryQuerySchema>
