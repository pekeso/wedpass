"use client"

import { useState, useRef, useCallback, useId } from "react"
import Link from "next/link"
import {
  Image as ImageIcon,
  Camera,
  User,
  Check,
  Clock,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Pause,
  WifiOff,
  RefreshCw,
  Video,
} from "lucide-react"
import { queueMediaUpload } from "@/lib/offline/media/media-upload-queue"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useTranslations } from "@/lib/i18n/use-translations"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4"]

type ItemStatus =
  | { kind: "uploading"; progress: number }
  | { kind: "paused" }
  | { kind: "queued" }
  | { kind: "done" }
  | { kind: "failed"; message: string }
  | { kind: "toobig" }

interface UploadItem {
  id: string
  file: File
  name: string
  mediaKind: "photo" | "video"
  status: ItemStatus
  xhrRef: XMLHttpRequest | null
}

interface MediaUploadFormProps {
  weddingId: string
  weddingSlug: string
}

function UploadItemRow({
  item,
  onRetry,
}: {
  item: UploadItem
  onRetry: (id: string) => void
}) {
  const { t } = useTranslations()
  const { status, name, mediaKind } = item

  const statusConfig = {
    done: {
      color: "text-[#16A34A]",
      label: t("upload.statusUploaded"),
      icon: <CheckCircle2 className="h-[13px] w-[13px]" />,
    },
    uploading: {
      color: "text-[#2563EB]",
      label: t("upload.statusUploading"),
      icon: null,
    },
    paused: {
      color: "text-[#D97706]",
      label: t("upload.statusPaused"),
      icon: <Pause className="h-[13px] w-[13px]" />,
    },
    queued: {
      color: "text-navy/50",
      label: t("upload.statusQueued"),
      icon: <WifiOff className="h-[13px] w-[13px]" />,
    },
    failed: {
      color: "text-[#DC2626]",
      label: t("upload.statusFailed"),
      icon: <RefreshCw className="h-[13px] w-[13px]" />,
    },
    toobig: {
      color: "text-[#DC2626]",
      label: t("upload.statusTooLarge"),
      icon: <AlertTriangle className="h-[13px] w-[13px]" />,
    },
  }[status.kind]

  return (
    <div
      className="flex items-center gap-[11px] rounded-xl border border-[#efeae0] bg-white p-3"
      role="listitem"
    >
      {/* Thumbnail placeholder */}
      <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[9px] bg-[#FAF7F1]">
        {mediaKind === "video" ? (
          <Video className="h-[18px] w-[18px] text-navy/40" aria-hidden="true" />
        ) : (
          <ImageIcon className="h-[18px] w-[18px] text-navy/40" aria-hidden="true" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-navy">{name}</p>

        {status.kind === "uploading" ? (
          <div className="mt-1.5 h-[6px] w-full overflow-hidden rounded-full bg-[#DBEAFE]">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${status.progress}%` }}
              role="progressbar"
              aria-valuenow={status.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={status.kind === "failed" ? () => onRetry(item.id) : undefined}
            disabled={status.kind !== "failed"}
            className={`mt-0.5 flex items-center gap-[5px] text-[11.5px] font-semibold ${statusConfig.color} disabled:cursor-default`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </button>
        )}
      </div>

      {/* Right side */}
      {status.kind === "uploading" && (
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[#2563EB]">
          {status.progress}%
        </span>
      )}
      {status.kind === "done" && (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />
      )}
    </div>
  )
}

export function MediaUploadForm({ weddingId, weddingSlug }: MediaUploadFormProps) {
  const { isOnline } = useNetworkStatus()
  const { t } = useTranslations()
  const [items, setItems] = useState<UploadItem[]>([])
  const [uploaderName, setUploaderName] = useState("")
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const formId = useId()

  const hasAnyUploading = items.some((i) => i.status.kind === "uploading")
  const hasOfflineItems = items.some(
    (i) => i.status.kind === "paused" || i.status.kind === "queued"
  )

  function validateFile(file: File): { error: ItemStatus } | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: { kind: "failed", message: t("upload.unsupportedType") } }
    }
    if (file.type.startsWith("image/") && file.size > MAX_IMAGE_BYTES) {
      return { error: { kind: "failed", message: t("upload.photoTooLarge") } }
    }
    if (file.type === "video/mp4" && file.size > MAX_VIDEO_BYTES) {
      return { error: { kind: "toobig" } }
    }
    return null
  }

  const uploadFile = useCallback(
    async (itemId: string, file: File) => {
      const mediaType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE"

      const updateStatus = (status: ItemStatus) => {
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, status } : i))
        )
      }

      // Offline path
      if (!isOnline) {
        try {
          await queueMediaUpload(weddingId, weddingSlug, file, uploaderName || undefined)
          updateStatus({ kind: "queued" })
        } catch {
          updateStatus({ kind: "failed", message: t("upload.failedToSave") })
        }
        return
      }

      updateStatus({ kind: "uploading", progress: 0 })

      try {
        const urlRes = await fetch(`/api/v1/weddings/${weddingId}/media/upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaType,
            mimeType: file.type,
            fileSizeBytes: file.size,
            originalFileName: file.name,
            durationSeconds: null,
            uploadedByName: uploaderName || undefined,
          }),
        })

        if (!urlRes.ok) {
          const errData = await urlRes.json().catch(() => ({}))
          throw new Error(errData?.error?.message ?? "Failed to get upload URL")
        }

        const { data: urlData } = await urlRes.json()

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, xhrRef: xhr } : i))
          )

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 90)
              updateStatus({ kind: "uploading", progress: pct })
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error(`Upload failed with status ${xhr.status}`))
          })
          xhr.addEventListener("error", () => reject(new Error(t("upload.failed"))))
          xhr.addEventListener("abort", () => reject(new Error("Cancelled")))

          xhr.open("PUT", urlData.uploadUrl)
          xhr.setRequestHeader("Content-Type", file.type)
          xhr.send(file)
        })

        updateStatus({ kind: "uploading", progress: 95 })

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
            uploadedByName: uploaderName || undefined,
          }),
        })

        if (!confirmRes.ok) throw new Error(t("upload.failed"))

        updateStatus({ kind: "done" })
      } catch (err) {
        const message = err instanceof Error ? err.message : t("upload.failed")
        updateStatus({ kind: "failed", message })
      }
    },
    [weddingId, weddingSlug, uploaderName, isOnline, t]
  )

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return

    const newItems: UploadItem[] = []
    for (const file of Array.from(files)) {
      const validationResult = validateFile(file)
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const mediaKind: "photo" | "video" = file.type.startsWith("video/") ? "video" : "photo"

      if (validationResult) {
        newItems.push({
          id,
          file,
          name: file.name,
          mediaKind,
          status: validationResult.error,
          xhrRef: null,
        })
      } else {
        newItems.push({
          id,
          file,
          name: file.name,
          mediaKind,
          status: { kind: "uploading", progress: 0 },
          xhrRef: null,
        })
      }
    }

    setItems((prev) => [...prev, ...newItems])

    // Start valid uploads
    for (const item of newItems) {
      if (item.status.kind === "uploading") {
        uploadFile(item.id, item.file)
      }
    }
  }

  async function handleRetry(itemId: string) {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, status: { kind: "uploading", progress: 0 } } : i
      )
    )
    uploadFile(itemId, item.file)
  }

  return (
    <div className="flex flex-col">
      {/* Scrollable content */}
      <div className="px-5 pb-[88px] pt-[18px]">
        {/* Heading */}
        <h1 className="mb-1 text-[22px] font-bold text-navy">
          {t("upload.pageTitle")}
        </h1>
        <p className="mb-[18px] text-[13.5px] text-navy/50">
          {t("upload.pageSubtitle")}
        </p>

        {/* Upload buttons — 2-column grid */}
        <div className="grid grid-cols-2 gap-[11px]">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-[9px] rounded-[14px] border-[1.5px] border-dashed border-[#e7e1d6] bg-white px-3 py-[22px] text-[13px] font-semibold text-navy transition-colors hover:border-champagne hover:bg-champagne/5"
          >
            <ImageIcon className="h-[26px] w-[26px]" aria-hidden="true" />
            <span>{t("upload.fromGallery")}</span>
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-[9px] rounded-[14px] border-[1.5px] border-dashed border-[#e7e1d6] bg-white px-3 py-[22px] text-[13px] font-semibold text-navy transition-colors hover:border-champagne hover:bg-champagne/5"
          >
            <Camera className="h-[26px] w-[26px]" aria-hidden="true" />
            <span>{t("upload.takePhotoVideo")}</span>
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,video/mp4"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
          aria-label="Choose from gallery"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,video/mp4"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
          aria-label="Take photo or video"
        />

        {/* Optional name input */}
        <div className="mt-[14px] flex items-center gap-[11px] rounded-[12px] border border-[#e7e1d6] bg-white px-[15px] py-[13px]">
          <User className="h-[18px] w-[18px] shrink-0 text-navy/30" aria-hidden="true" />
          <input
            type="text"
            id={`${formId}-name`}
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder={t("upload.yourName")}
            className="flex-1 bg-transparent text-[15px] text-navy outline-none placeholder:text-navy/30"
            maxLength={80}
          />
        </div>

        {/* Guidelines */}
        <div className="mt-[14px] rounded-[12px] bg-[#DBEAFE] px-[13px] py-[13px]">
          <div className="space-y-[6px] text-[12.5px] leading-[1.6] text-[#1e40af]">
            <div className="flex items-center gap-[7px]">
              <Check className="h-[14px] w-[14px] shrink-0 stroke-[3]" aria-hidden="true" />
              <span>{t("upload.guidelinePhotosVideos")}</span>
            </div>
            <div className="flex items-center gap-[7px]">
              <Clock className="h-[14px] w-[14px] shrink-0" aria-hidden="true" />
              <span>{t("upload.guidelineVideosSlower")}</span>
            </div>
            <div className="flex items-center gap-[7px]">
              <AlertTriangle className="h-[14px] w-[14px] shrink-0" aria-hidden="true" />
              <span>{t("upload.guidelineLargeRejected")}</span>
            </div>
          </div>
        </div>

        {/* Upload list */}
        {items.length > 0 && (
          <div className="mt-[18px]">
            <p className="mb-[10px] text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/40">
              {t("upload.yourUploads")}
            </p>
            <div className="flex flex-col gap-[9px]" role="list">
              {items.map((item) => (
                <UploadItemRow key={item.id} item={item} onRetry={handleRetry} />
              ))}
            </div>
          </div>
        )}

        {/* Offline warning */}
        {(hasOfflineItems || (!isOnline && items.length === 0)) && (
          <div className="mt-[14px] flex gap-[10px] rounded-[12px] bg-[#FEF3C7] px-[13px] py-[13px]">
            <WifiOff
              className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[#b45309]"
              aria-hidden="true"
            />
            <p className="text-[12.5px] leading-[1.45] text-[#92400e]">
              {t("upload.offlinePaused")}
            </p>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-[10px] px-5 pb-4 pt-3"
        style={{ background: "linear-gradient(transparent, #FAF7F1 30%)" }}
      >
        <Link
          href={`/w/${weddingSlug}/gallery`}
          className="flex h-[50px] flex-1 items-center justify-center rounded-[12px] border border-[#e7e1d6] bg-white text-[15px] font-semibold text-navy transition-colors hover:bg-[#F2ECE0]"
        >
          {t("upload.viewGallery")}
        </Link>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={hasAnyUploading}
          className="flex h-[50px] flex-1 items-center justify-center gap-[9px] rounded-[12px] bg-navy text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-[18px] w-[18px] text-champagne" aria-hidden="true" />
          {t("upload.addMore")}
        </button>
      </div>
    </div>
  )
}
