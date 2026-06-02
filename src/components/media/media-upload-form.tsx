"use client"

import { useState, useRef, useCallback } from "react"
import { ImagePlus, VideoIcon, CheckCircle2, AlertCircle, WifiOff } from "lucide-react"
import { UploadProgress } from "./upload-progress"
import { queueMediaUpload } from "@/lib/offline/media/media-upload-queue"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useTranslations } from "@/lib/i18n/use-translations"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4"]

type UploadState =
  | { kind: "idle" }
  | { kind: "validating" }
  | { kind: "uploading"; progress: number }
  | { kind: "queued" }
  | { kind: "success" }
  | { kind: "error"; message: string }

interface MediaUploadFormProps {
  weddingId: string
  weddingSlug: string
  uploaderName?: string
}

export function MediaUploadForm({ weddingId, weddingSlug, uploaderName }: MediaUploadFormProps) {
  const { isOnline } = useNetworkStatus()
  const { t } = useTranslations()
  const [uploadState, setUploadState] = useState<UploadState>({ kind: "idle" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t("upload.unsupportedType")
    }
    if (file.type.startsWith("image/") && file.size > MAX_IMAGE_BYTES) {
      return t("upload.photoTooLarge")
    }
    if (file.type === "video/mp4" && file.size > MAX_VIDEO_BYTES) {
      return t("upload.videoTooLarge")
    }
    return null
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadState({ kind: "idle" })
    setSelectedFile(file)
  }

  const uploadOnline = useCallback(
    async (file: File) => {
      setUploadState({ kind: "uploading", progress: 0 })

      const mediaType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE"

      const urlRes = await fetch(`/api/v1/weddings/${weddingId}/media/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType,
          mimeType: file.type,
          fileSizeBytes: file.size,
          originalFileName: file.name,
          durationSeconds: null,
          uploadedByName: uploaderName,
        }),
      })

      if (!urlRes.ok) {
        const errData = await urlRes.json().catch(() => ({}))
        throw new Error(errData?.error?.message ?? "Failed to get upload URL")
      }

      const { data: urlData } = await urlRes.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 90)
            setUploadState({ kind: "uploading", progress: pct })
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`R2 upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener("error", () => reject(new Error(t("upload.failed"))))
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")))

        xhr.open("PUT", urlData.uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.send(file)
      })

      setUploadState({ kind: "uploading", progress: 95 })

      const confirmRes = await fetch(`/api/v1/weddings/${weddingId}/media/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId: urlData.uploadId,
          fileKey: urlData.fileKey,
          mediaType,
          mimeType: file.type,
          fileSizeBytes: file.size,
          durationSeconds: null,
          uploadedByName: uploaderName,
        }),
      })

      if (!confirmRes.ok) {
        throw new Error(t("upload.failed"))
      }

      setUploadState({ kind: "success" })
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ""
    },
    [weddingId, uploaderName, t]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return

    setUploadState({ kind: "validating" })
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setUploadState({ kind: "error", message: validationError })
      return
    }

    if (!isOnline) {
      try {
        await queueMediaUpload(weddingId, weddingSlug, selectedFile, uploaderName)
        setUploadState({ kind: "queued" })
        setSelectedFile(null)
        if (inputRef.current) inputRef.current.value = ""
      } catch {
        setUploadState({ kind: "error", message: t("upload.failedToSave") })
      }
      return
    }

    try {
      await uploadOnline(selectedFile)
    } catch (err) {
      const message = err instanceof Error ? err.message : t("upload.failed")
      setUploadState({ kind: "error", message })
    }
  }

  function handleReset() {
    if (xhrRef.current) xhrRef.current.abort()
    setUploadState({ kind: "idle" })
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-xl border border-offline/30 bg-offline/10 px-4 py-3 text-sm text-offline">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t("upload.offlineQueue")}</span>
        </div>
      )}

      {/* File picker */}
      <div className="space-y-2">
        <label
          htmlFor="media-file"
          className="block text-sm font-medium text-navy"
        >
          {t("upload.selectFile")}
        </label>
        <div className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-champagne/40 bg-champagne/5 px-4 py-6 text-center transition-colors hover:border-champagne hover:bg-champagne/10">
          <div className="flex gap-4 text-champagne">
            <ImagePlus className="h-8 w-8" aria-hidden="true" />
            <VideoIcon className="h-8 w-8" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-navy">
              {selectedFile ? selectedFile.name : t("upload.tapToChoose")}
            </p>
            <p className="mt-1 text-xs text-navy/50">{t("upload.hint")}</p>
          </div>
          <input
            ref={inputRef}
            id="media-file"
            type="file"
            accept="image/jpeg,image/png,video/mp4"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileChange}
            disabled={uploadState.kind === "uploading"}
          />
        </div>
      </div>

      {/* Upload progress */}
      {uploadState.kind === "uploading" && (
        <UploadProgress
          progress={uploadState.progress}
          label={selectedFile?.type.startsWith("video/") ? t("upload.uploadingVideo") : t("upload.uploadingPhoto")}
        />
      )}

      {/* Success state */}
      {uploadState.kind === "success" && (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{t("upload.success")}</span>
        </div>
      )}

      {/* Queued state */}
      {uploadState.kind === "queued" && (
        <div className="flex items-center gap-3 rounded-xl border border-offline/30 bg-offline/10 px-4 py-3 text-sm text-offline">
          <WifiOff className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{t("upload.savedForLater")}</span>
        </div>
      )}

      {/* Error state */}
      {uploadState.kind === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{uploadState.message}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {(uploadState.kind === "success" || uploadState.kind === "queued") ? (
          <button
            type="button"
            onClick={handleReset}
            className="flex h-14 w-full items-center justify-center rounded-xl border border-navy/20 bg-white text-base font-semibold text-navy shadow-sm transition-colors hover:bg-ivory active:bg-ivory"
          >
            {t("upload.shareAnother")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={!selectedFile || uploadState.kind === "uploading" || uploadState.kind === "validating"}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-champagne text-base font-semibold text-white shadow-card transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploadState.kind === "uploading"
              ? t("upload.progress")
              : isOnline
              ? t("upload.shareButton")
              : t("upload.saveForLater")}
          </button>
        )}

        {uploadState.kind === "error" && selectedFile && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-navy/60 underline underline-offset-2"
          >
            {t("upload.tryDifferent")}
          </button>
        )}
      </div>
    </form>
  )
}
