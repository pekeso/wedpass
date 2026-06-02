"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Download,
  HelpCircle,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  OfflinePackStatusCard,
  type PackDownloadState,
} from "@/components/staff/offline-pack-status-card"
import { StaffHelpMessages } from "@/components/staff/staff-help-messages"
import { useOfflinePackStatus } from "@/hooks/use-offline-pack-status"
import { downloadAndSaveSnapshot } from "@/lib/offline/checkins/snapshot-download"
import { useTranslations } from "@/lib/i18n/use-translations"

function formatDownloadedAt(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return isToday
    ? `Today at ${time}`
    : date.toLocaleDateString([], { month: "short", day: "numeric" }) + ` at ${time}`
}

type ChecklistItemProps = {
  label: string
  value: string | null
  isReady: boolean
}

function ChecklistItem({ label, value, isReady }: ChecklistItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {isReady ? (
          <CheckCircle2 className="size-5 text-success shrink-0" />
        ) : (
          <XCircle className="size-5 text-danger shrink-0" />
        )}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {value && (
        <span className="text-sm text-muted-foreground text-right shrink-0">{value}</span>
      )}
    </div>
  )
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

  function getCardState(): PackDownloadState {
    if (isDownloading) return "downloading"
    if (errorMessage) return "failed"
    if (!status.isLoading && status.isReady) return "ready"
    return "not-prepared"
  }

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

  const cardState = getCardState()
  const isReady = cardState === "ready"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 px-4 py-8 max-w-lg mx-auto w-full space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">{t("download.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("download.prepareDevice")}
          </p>
        </div>

        {!isReady && (
          <div className="rounded-xl border border-warning bg-warning-light px-4 py-3">
            <p className="text-sm font-medium text-warning">
              {t("download.downloadBefore")}
            </p>
          </div>
        )}

        {status.isLoading ? (
          <div className="rounded-xl border border-border bg-muted p-5 animate-pulse h-20" />
        ) : (
          <OfflinePackStatusCard
            state={cardState}
            guestCount={status.guestCount}
            lastDownloadedAt={status.lastDownloadedAt}
            errorMessage={errorMessage ?? undefined}
          />
        )}

        {isReady && !status.isLoading && (
          <>
            <div className="rounded-xl border border-success bg-success-light px-5 py-4">
              <p className="text-lg font-bold text-success">{t("download.readyForEventDay")}</p>
              <p className="text-sm text-success/80 mt-0.5">
                {t("download.devicePrepared")}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              <ChecklistItem
                label={t("download.offlinePackDownloaded")}
                value={null}
                isReady={true}
              />
              <ChecklistItem
                label={t("download.guestsLoaded")}
                value={
                  status.guestCount > 0
                    ? t("download.guestCount", { count: status.guestCount })
                    : t("download.zeroGuests")
                }
                isReady={status.guestCount > 0}
              />
              <ChecklistItem
                label={t("download.lastDownloaded")}
                value={
                  status.lastDownloadedAt
                    ? formatDownloadedAt(status.lastDownloadedAt)
                    : t("download.unknown")
                }
                isReady={!!status.lastDownloadedAt}
              />
              <ChecklistItem
                label={t("download.snapshotVersion")}
                value={
                  status.snapshotVersion != null ? `v${status.snapshotVersion}` : t("download.unknown")
                }
                isReady={status.snapshotVersion != null}
              />
            </div>
          </>
        )}

        {isReady ? (
          <div className="space-y-3">
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
              variant="outline"
              className="h-12 w-full gap-2"
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
                <RefreshCw className="size-5 animate-spin" />
                {t("download.downloading")}
              </>
            ) : cardState === "failed" ? (
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

        <button
          onClick={() => router.push(`/staff/${weddingId}/help`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <HelpCircle className="size-4 shrink-0" />
          {t("download.viewHelpGuide")}
        </button>

        <StaffHelpMessages />

        <p className="text-xs text-center text-muted-foreground">
          {t("download.guestDataNote")}
        </p>
      </div>
    </div>
  )
}
