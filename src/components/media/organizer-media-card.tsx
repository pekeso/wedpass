"use client"

import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff, Trash2, Download, Play } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import type { OrganizerMediaItemDTO } from "@/modules/media/media.dto"

interface OrganizerMediaCardProps {
  item: OrganizerMediaItemDTO
  onHide: (mediaId: string) => Promise<void>
  onShow: (mediaId: string) => Promise<void>
  onDelete: (mediaId: string) => Promise<void>
  onDownload: (mediaId: string) => Promise<void>
}

const STATUS_BADGE: Record<OrganizerMediaItemDTO["status"], { label: string; className: string }> =
  {
    UPLOADED: { label: "Uploaded", className: "bg-success/10 text-success" },
    APPROVED: { label: "Approved", className: "bg-success/20 text-success" },
    HIDDEN: { label: "Hidden", className: "bg-warning/20 text-warning" },
    DELETED: { label: "Deleted", className: "bg-danger/20 text-danger" },
  }

export function OrganizerMediaCard({
  item,
  onHide,
  onShow,
  onDelete,
  onDownload,
}: OrganizerMediaCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const badge = STATUS_BADGE[item.status]
  const isHidden = item.status === "HIDDEN"
  const isDeleted = item.status === "DELETED"

  async function handle(action: () => Promise<void>) {
    if (busy) return
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-square w-full bg-muted">
          {item.mediaType === "VIDEO" ? (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="h-10 w-10 text-muted-foreground" />
            </div>
          ) : (
            <Image
              src={item.fileUrl}
              alt={item.uploadedByName ? `Photo by ${item.uploadedByName}` : "Wedding photo"}
              fill
              className={`object-cover transition-opacity ${isHidden ? "opacity-40" : isDeleted ? "opacity-20" : "opacity-100"}`}
              unoptimized
            />
          )}

          {(isHidden || isDeleted) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                {isDeleted ? "Deleted" : "Hidden"}
              </span>
            </div>
          )}

          <span
            className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        <div className="p-2">
          {item.uploadedByName && (
            <p className="truncate text-xs text-muted-foreground">{item.uploadedByName}</p>
          )}

          <div className="mt-2 flex gap-1.5">
            {!isDeleted && (
              <>
                {isHidden ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handle(() => onShow(item.id))}
                    className="flex flex-1 items-center justify-center gap-1 rounded border border-border py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    title="Make visible"
                  >
                    <Eye className="h-3 w-3" />
                    Show
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handle(() => onHide(item.id))}
                    className="flex flex-1 items-center justify-center gap-1 rounded border border-border py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    title="Hide from gallery"
                  >
                    <EyeOff className="h-3 w-3" />
                    Hide
                  </button>
                )}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handle(() => onDownload(item.id))}
                  className="flex items-center justify-center rounded border border-border p-1 text-foreground hover:bg-muted disabled:opacity-50"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center justify-center rounded border border-danger/40 p-1 text-danger hover:bg-danger/10 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this item?"
        description="This will permanently remove the item from the gallery. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => handle(() => onDelete(item.id))}
      />
    </>
  )
}
