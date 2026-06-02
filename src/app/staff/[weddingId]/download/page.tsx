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
          <h1 className="text-2xl font-bold text-foreground">Offline Pack</h1>
          <p className="text-sm text-muted-foreground">
            Prepare this device for event-day check-in.
          </p>
        </div>

        {!isReady && (
          <div className="rounded-xl border border-warning bg-warning-light px-4 py-3">
            <p className="text-sm font-medium text-warning">
              Download this offline pack before guests arrive.
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
              <p className="text-lg font-bold text-success">Ready for Event Day</p>
              <p className="text-sm text-success/80 mt-0.5">
                This device is prepared for offline check-in.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              <ChecklistItem
                label="Offline pack downloaded"
                value={null}
                isReady={true}
              />
              <ChecklistItem
                label="Guests loaded"
                value={
                  status.guestCount > 0
                    ? `${status.guestCount} guests`
                    : "0 guests"
                }
                isReady={status.guestCount > 0}
              />
              <ChecklistItem
                label="Last downloaded"
                value={
                  status.lastDownloadedAt
                    ? formatDownloadedAt(status.lastDownloadedAt)
                    : "Unknown"
                }
                isReady={!!status.lastDownloadedAt}
              />
              <ChecklistItem
                label="Snapshot version"
                value={
                  status.snapshotVersion != null ? `v${status.snapshotVersion}` : "Unknown"
                }
                isReady={status.snapshotVersion != null}
              />
            </div>
          </>
        )}

        {isReady ? (
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

        <button
          onClick={() => router.push(`/staff/${weddingId}/help`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <HelpCircle className="size-4 shrink-0" />
          View full staff help guide
        </button>

        <StaffHelpMessages />

        <p className="text-xs text-center text-muted-foreground">
          Guest data is stored on this device only. Keep this tab open during
          the event.
        </p>
      </div>
    </div>
  )
}
