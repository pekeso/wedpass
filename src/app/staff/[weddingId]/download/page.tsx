"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  OfflinePackStatusCard,
  type PackDownloadState,
} from "@/components/staff/offline-pack-status-card"
import { useOfflinePackStatus } from "@/hooks/use-offline-pack-status"
import { downloadAndSaveSnapshot } from "@/lib/offline/checkins/snapshot-download"

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 px-4 py-8 max-w-lg mx-auto w-full space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Offline Pack</h1>
          <p className="text-sm text-muted-foreground">
            Prepare this device for event-day check-in.
          </p>
        </div>

        <div className="rounded-xl border border-warning bg-warning-light px-4 py-3">
          <p className="text-sm font-medium text-warning">
            Download this offline pack before guests arrive.
          </p>
        </div>

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

        {cardState === "ready" ? (
          <div className="space-y-3">
            <Button
              className="h-14 w-full text-base gap-2"
              onClick={() => router.push(`/staff/${weddingId}/checkin`)}
            >
              Start Check-In
              <ArrowRight className="size-5" />
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full gap-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <RefreshCw className="size-4" />
              Re-download Pack
            </Button>
          </div>
        ) : (
          <Button
            className="h-14 w-full text-base gap-2"
            onClick={handleDownload}
            disabled={isDownloading || status.isLoading}
          >
            {isDownloading ? (
              <>
                <RefreshCw className="size-5 animate-spin" />
                Downloading...
              </>
            ) : cardState === "failed" ? (
              <>
                <RefreshCw className="size-5" />
                Retry Download
              </>
            ) : (
              <>
                <Download className="size-5" />
                Download Offline Pack
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Guest data is stored on this device only. Keep this tab open during
          the event.
        </p>
      </div>
    </div>
  )
}
