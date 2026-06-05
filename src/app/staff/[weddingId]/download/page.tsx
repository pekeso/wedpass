"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WMark } from "@/components/shared/wmark"
import { useOfflinePackStatus } from "@/hooks/use-offline-pack-status"
import { downloadAndSaveSnapshot } from "@/lib/offline/checkins/snapshot-download"
import { useTranslations } from "@/lib/i18n/use-translations"

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" })
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" })
}

export default function StaffDownloadPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const status = useOfflinePackStatus(weddingId)
  const [isDownloading, setIsDownloading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { t } = useTranslations()

  const isReady = !isDownloading && !errorMessage && !status.isLoading && status.isReady

  const weddingDisplay =
    status.weddingCoupleNames || status.weddingName || "—"
  const dateDisplay = status.weddingEventDate
    ? formatEventDate(status.weddingEventDate)
    : "—"
  const guestDisplay = status.isLoading ? "—" : String(status.guestCount)

  async function handleDownload() {
    setIsDownloading(true)
    setErrorMessage(null)
    try {
      await downloadAndSaveSnapshot(weddingId)
      await status.refetch()
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      {/* Navy header */}
      <div className="bg-navy text-white px-5 pt-5 pb-7">
        <div className="flex items-center gap-2.5 mb-5">
          <WMark size={24} variant="mono-ivory" />
          <span className="font-bold text-[15px]">{t("download.eventMode")}</span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-champagne mb-2">
          {t("download.step")}
        </p>
        <h1 className="text-[22px] font-bold leading-tight">{t("download.title")}</h1>
      </div>

      {/* Content area — overlaps header slightly */}
      <div className="flex-1 px-[18px] -mt-3.5 space-y-3.5 pb-10">
        {/* Wedding info card */}
        <div className="rounded-2xl bg-white border border-border shadow-sm p-4">
          {status.isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                {[
                  [t("download.weddingLabel"), weddingDisplay],
                  [t("download.dateLabel"), dateDisplay],
                  [t("download.guestsLabel"), guestDisplay],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {label}
                    </div>
                    <div className="font-bold text-navy text-[16px] mt-0.5 tabular-nums">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border my-1" />
              <div className="flex items-center gap-2.5 mt-3">
                <span className="text-[13px] text-muted-foreground">
                  {t("download.snapshotVersion")}
                </span>
                <Badge variant="outline" className="text-navy border-navy/20 bg-navy/5 font-semibold px-2 py-0.5 text-[12px]">
                  {status.snapshotVersion != null ? `v${status.snapshotVersion}` : "—"}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Warning banner — shown when not yet ready */}
        {!isReady && !isDownloading && (
          <div className="flex items-start gap-3 px-3.5 py-3.5 bg-warning-light rounded-xl">
            <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
            <p className="text-[13.5px] font-semibold text-warning leading-snug">
              {t("download.downloadBefore")}
            </p>
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <div className="rounded-xl border border-danger bg-danger-light px-4 py-3">
            <p className="text-sm font-medium text-danger">{errorMessage}</p>
          </div>
        )}

        {/* Downloading state */}
        {isDownloading && (
          <div className="rounded-2xl border border-sync bg-sync-light p-5 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 text-sync animate-spin" />
              <p className="font-semibold text-sync">{t("download.downloadingPack")}</p>
            </div>
            <p className="text-sm text-sync/80">{t("download.savingGuestList")}</p>
          </div>
        )}

        {/* Success state */}
        {isReady && (
          <div className="rounded-2xl bg-white border border-success/30 p-5 text-center">
            <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="size-7 text-success" />
            </div>
            <p className="font-bold text-[16px] text-navy">{t("offlinePack.ready")}</p>
            <p className="text-[13px] text-muted-foreground mx-4 mt-1.5 leading-snug">
              {t("download.canCheckinOffline")}
            </p>
            <div className="flex items-center justify-center gap-3 mt-3.5 text-[12px] text-muted-foreground">
              <span>{t("download.guestCount", { count: status.guestCount })}</span>
              <span>·</span>
              <span>
                {status.lastDownloadedAt
                  ? formatRelativeTime(status.lastDownloadedAt)
                  : t("download.unknown")}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        {isReady ? (
          <div className="space-y-2.5 pt-1">
            <Button
              variant="navy"
              size="xl"
              className="w-full"
              onClick={() => router.push(`/staff/${weddingId}/checkin`)}
            >
              {t("download.startCheckin")}
              <ArrowRight className="size-5" />
            </Button>
            <Button
              variant="ghost"
              className="h-12 w-full gap-2 text-muted-foreground"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <RefreshCw className="size-4" />
              {t("download.redownloadPack")}
            </Button>
          </div>
        ) : (
          <Button
            variant="navy"
            size="xl"
            className="w-full"
            onClick={handleDownload}
            disabled={isDownloading || status.isLoading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                {t("download.downloading")}
              </>
            ) : errorMessage ? (
              <>
                <RefreshCw className="size-5" />
                {t("download.retryDownload")}
              </>
            ) : (
              <>
                <Download className="size-5" />
                {t("download.downloadOfflinePack")}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
