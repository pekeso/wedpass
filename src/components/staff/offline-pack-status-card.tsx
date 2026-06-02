"use client"

import { CheckCircle, AlertCircle, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/use-translations"

export type PackDownloadState = "not-prepared" | "downloading" | "ready" | "failed"

interface OfflinePackStatusCardProps {
  state: PackDownloadState
  guestCount?: number
  lastDownloadedAt?: string | null
  errorMessage?: string
}

function formatDownloadedAt(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return isToday ? `Today at ${time}` : date.toLocaleDateString([], { month: "short", day: "numeric" }) + ` at ${time}`
}

export function OfflinePackStatusCard({
  state,
  guestCount,
  lastDownloadedAt,
  errorMessage,
}: OfflinePackStatusCardProps) {
  const { t } = useTranslations()

  if (state === "ready") {
    return (
      <div className="rounded-xl border border-success bg-success-light p-5 space-y-1">
        <div className="flex items-center gap-2">
          <CheckCircle className="size-5 text-success shrink-0" />
          <p className="font-semibold text-success">{t("offlinePack.ready")}</p>
        </div>
        {guestCount !== undefined && (
          <p className="text-sm text-success pl-7">
            {t("offlinePack.guestCount", { count: guestCount })}
          </p>
        )}
        {lastDownloadedAt && (
          <p className="text-xs text-success/70 pl-7">
            {t("offlinePack.lastDownloaded", { time: formatDownloadedAt(lastDownloadedAt) })}
          </p>
        )}
      </div>
    )
  }

  if (state === "downloading") {
    return (
      <div className="rounded-xl border border-sync bg-sync-light p-5 space-y-1">
        <div className="flex items-center gap-2">
          <Loader2 className="size-5 text-sync shrink-0 animate-spin" />
          <p className="font-semibold text-sync">{t("offlinePack.downloading")}</p>
        </div>
        <p className="text-sm text-sync pl-7">{t("offlinePack.savingGuestList")}</p>
      </div>
    )
  }

  if (state === "failed") {
    return (
      <div className="rounded-xl border border-danger bg-danger-light p-5 space-y-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-5 text-danger shrink-0" />
          <p className="font-semibold text-danger">{t("offlinePack.downloadFailed")}</p>
        </div>
        {errorMessage && (
          <p className="text-sm text-danger pl-7">{errorMessage}</p>
        )}
        <p className="text-sm text-danger/80 pl-7">{t("offlinePack.downloadFailedDesc")}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-muted p-5 space-y-1">
      <div className="flex items-center gap-2">
        <Download className={cn("size-5 text-muted-foreground shrink-0")} />
        <p className="font-semibold text-foreground">{t("offlinePack.notPrepared")}</p>
      </div>
      <p className="text-sm text-muted-foreground pl-7">{t("offlinePack.noOfflineData")}</p>
    </div>
  )
}
