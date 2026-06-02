"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, CheckCircle2, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useSyncStatus } from "@/hooks/use-sync-status"
import { getMetadata, clearLocalEventData } from "@/lib/offline/metadata"
import { useTranslations } from "@/lib/i18n/use-translations"

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
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const { t } = useTranslations()

  useEffect(() => {
    getMetadata("snapshotMismatch")
      .then((val) => setHasSnapshotMismatch(val === "true"))
      .catch(() => {})
  }, [syncState])

  const isSyncing = syncState === "syncing"
  const allSynced = pendingCount === 0

  async function handleClearData() {
    setClearError(null)
    setIsClearing(true)
    try {
      await clearLocalEventData(weddingId)
      router.push(`/staff/${weddingId}/login`)
    } catch (err) {
      setClearError(err instanceof Error ? err.message : "Failed to clear local data.")
    } finally {
      setIsClearing(false)
    }
  }

  function handleClearRequest() {
    if (pendingCount > 0) {
      setClearError(t("sync.cannotClear", { count: pendingCount }))
      return
    }
    setClearError(null)
    setShowClearDialog(true)
  }

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
          <h1 className="text-xl font-bold text-foreground">{t("sync.title")}</h1>
        </div>

        {hasSnapshotMismatch && (
          <div className="flex items-start gap-3 rounded-2xl border border-warning bg-warning-light p-4 text-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{t("sync.snapshotMismatch")}</p>
          </div>
        )}

        {allSynced && lastSyncedAt && !isSyncing && (
          <div className="flex items-center gap-3 rounded-2xl border border-success bg-success-light/40 p-4 text-sm text-success">
            <CheckCircle2 className="size-5 shrink-0" />
            <p className="font-medium">{t("sync.allSynced")}</p>
          </div>
        )}

        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t("sync.pendingCheckins")}
            </span>
            <span
              className={`text-2xl font-bold ${pendingCount > 0 ? "text-warning" : "text-success"}`}
            >
              {pendingCount}
            </span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t("sync.lastSynced")}
            </span>
            <span className="text-sm font-medium text-foreground">
              {lastSyncedAt ? formatDateTime(lastSyncedAt) : t("sync.never")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t("sync.connection")}
            </span>
            <span
              className={`text-sm font-semibold ${isOnline ? "text-success" : "text-offline"}`}
            >
              {isOnline ? t("sync.online") : t("sync.offline")}
            </span>
          </div>
        </div>

        <Button
          disabled={!isOnline || isSyncing}
          onClick={() => void triggerSync()}
          className="h-14 w-full gap-3 rounded-2xl text-base font-semibold"
        >
          <RefreshCw className={`size-5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? t("sync.syncing") : t("sync.syncNow")}
        </Button>

        {!isOnline && (
          <p className="text-center text-xs text-muted-foreground">
            {t("sync.offlineModeActive")}
          </p>
        )}

        {syncState === "failed" && !hasSnapshotMismatch && (
          <p className="text-center text-xs text-danger">
            {t("sync.syncFailed")}
          </p>
        )}

        <div className="rounded-2xl border border-danger/30 bg-danger-light/20 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t("sync.clearLocalData")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("sync.clearLocalDataDesc")}
            </p>
          </div>

          {clearError && (
            <div className="flex items-start gap-2 rounded-xl border border-danger bg-danger-light/40 p-3 text-xs text-danger">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <p>{clearError}</p>
            </div>
          )}

          <Button
            variant="outline"
            disabled={isClearing}
            onClick={handleClearRequest}
            className="h-12 w-full gap-2 rounded-xl border-danger/40 text-danger hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="size-4" />
            {isClearing ? t("sync.clearing") : t("sync.clearButton")}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        variant="danger"
        title={t("sync.clearDialogTitle")}
        description={t("sync.clearDialogDesc")}
        confirmLabel={t("sync.yesClearData")}
        cancelLabel={t("sync.keepData")}
        onConfirm={handleClearData}
      />
    </div>
  )
}
