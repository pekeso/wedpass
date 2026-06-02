"use client"

import { offlineDb } from "@/lib/offline/db"
import type { LocalMediaUpload } from "@/types/shared"

export async function queueMediaUpload(
  weddingId: string,
  weddingSlug: string,
  file: File,
  uploadedByName?: string
): Promise<string> {
  const uploadId = crypto.randomUUID()
  const mediaType: LocalMediaUpload["mediaType"] = file.type.startsWith("video/")
    ? "video"
    : "image"
  const now = new Date().toISOString()

  const item: LocalMediaUpload = {
    uploadId,
    weddingId,
    weddingSlug,
    fileName: file.name,
    mimeType: file.type,
    mediaType,
    fileSizeBytes: file.size,
    fileBlob: file,
    uploadStatus: "pending",
    progress: 0,
    uploadedByName,
    createdAt: now,
    updatedAt: now,
  }

  await offlineDb.mediaQueue.add(item)
  return uploadId
}

export async function processMediaQueue(weddingId: string, weddingSlug: string): Promise<void> {
  const pending = await offlineDb.mediaQueue
    .where("weddingId")
    .equals(weddingId)
    .and((item) => item.uploadStatus === "pending" || item.uploadStatus === "failed")
    .toArray()

  for (const item of pending) {
    await offlineDb.mediaQueue.update(item.uploadId, {
      uploadStatus: "uploading",
      updatedAt: new Date().toISOString(),
    })

    try {
      const urlResponse = await fetch(
        `/api/v1/weddings/${weddingId}/media/upload-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaType: item.mediaType === "video" ? "VIDEO" : "IMAGE",
            mimeType: item.mimeType,
            fileSizeBytes: item.fileSizeBytes,
            originalFileName: item.fileName,
            durationSeconds: item.durationSeconds ?? null,
            uploadedByName: item.uploadedByName,
          }),
        }
      )

      if (!urlResponse.ok) {
        throw new Error(`upload-url failed: ${urlResponse.status}`)
      }

      const { data: urlData } = await urlResponse.json()

      await fetch(urlData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": item.mimeType },
        body: item.fileBlob,
      })

      await fetch(`/api/v1/weddings/${weddingId}/media/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId: urlData.uploadId,
          fileKey: urlData.fileKey,
          mediaType: item.mediaType === "video" ? "VIDEO" : "IMAGE",
          mimeType: item.mimeType,
          fileSizeBytes: item.fileSizeBytes,
          durationSeconds: item.durationSeconds ?? null,
          uploadedByName: item.uploadedByName,
        }),
      })

      await offlineDb.mediaQueue.update(item.uploadId, {
        uploadStatus: "uploaded",
        progress: 100,
        updatedAt: new Date().toISOString(),
      })
    } catch {
      await offlineDb.mediaQueue.update(item.uploadId, {
        uploadStatus: "failed",
        updatedAt: new Date().toISOString(),
      })
    }
  }

  void weddingSlug
}

export async function getQueueStatus(
  weddingId: string
): Promise<{ pending: number; uploading: number; failed: number }> {
  const items = await offlineDb.mediaQueue.where("weddingId").equals(weddingId).toArray()
  return {
    pending: items.filter((i) => i.uploadStatus === "pending").length,
    uploading: items.filter((i) => i.uploadStatus === "uploading").length,
    failed: items.filter((i) => i.uploadStatus === "failed").length,
  }
}
