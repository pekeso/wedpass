"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import { useSyncStatus } from "@/hooks/use-sync-status"
import { getMetadata } from "@/lib/offline/metadata"

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function StaffSyncPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { isOnline, pendingCount, lastSyncedAt, syncState, triggerSync } =
    useSyncStatus(weddingId)
  const [hasSnapshotMismatch, setHasSnapshotMismatch] = useState(false)

  useEffect(() => {
    getMetadata("snapshotMismatch")
      .then((val) => setHasSnapshotMismatch(val === "true"))
      .catch(() => {})
  }, [syncState])

  const isSyncing = syncState === "syncing"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        lastSyncedAt={lastSyncedAt}
        syncState={syncState}
      />

      <div className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Sync Status</h1>
        </div>

        {hasSnapshotMismatch && (
          <div className="flex items-start gap-3 rounded-2xl border border-warning bg-warning-light p-4 text-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              This device is using an outdated event snapshot. Please refresh
              the offline pack before continuing.
            </p>
          </div>
        )}

        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Pending check-ins
            </span>
            <span className="text-2xl font-bold text-foreground">
              {pendingCount}
            </span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Last synced
            </span>
            <span className="text-sm font-medium text-foreground">
              {lastSyncedAt ? formatDateTime(lastSyncedAt) : "Never"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Connection
            </span>
            <span
              className={`text-sm font-semibold ${isOnline ? "text-success" : "text-offline"}`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <Button
          disabled={!isOnline || isSyncing}
          onClick={() => void triggerSync()}
          className="h-14 w-full gap-3 rounded-2xl text-base font-semibold"
        >
          <RefreshCw
            className={`size-5 ${isSyncing ? "animate-spin" : ""}`}
          />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>

        {!isOnline && (
          <p className="text-center text-xs text-muted-foreground">
            Offline mode active. Check-ins are safely saved on this device and
            will sync when internet returns.
          </p>
        )}

        {syncState === "failed" && !hasSnapshotMismatch && (
          <p className="text-center text-xs text-danger">
            Sync failed. Your check-ins are still saved on this device. We will
            retry automatically.
          </p>
        )}
      </div>
    </div>
  )
}
