import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export type SyncState = "idle" | "syncing" | "failed" | "offline"

export interface SyncStatusBarProps {
  isOnline: boolean
  pendingCount: number
  lastSyncedAt?: string
  syncState: SyncState
}

const stateConfig: Record<
  SyncState,
  { className: string; icon: React.ReactNode }
> = {
  idle: {
    className: "bg-success-light text-success",
    icon: <Wifi className="size-3.5 shrink-0" />,
  },
  syncing: {
    className: "bg-sync-light text-sync",
    icon: <RefreshCw className="size-3.5 shrink-0 animate-spin" />,
  },
  failed: {
    className: "bg-danger-light text-danger",
    icon: <AlertTriangle className="size-3.5 shrink-0" />,
  },
  offline: {
    className: "bg-offline-light text-offline",
    icon: <WifiOff className="size-3.5 shrink-0" />,
  },
}

function getStatusText(
  isOnline: boolean,
  pendingCount: number,
  syncState: SyncState
): string {
  if (!isOnline) {
    return pendingCount > 0
      ? `Offline · ${pendingCount} pending`
      : "Offline · No pending"
  }
  if (syncState === "syncing") {
    return pendingCount > 0
      ? `Syncing · ${pendingCount} pending`
      : "Syncing..."
  }
  if (syncState === "failed") return "Sync failed · Retrying"
  return "Online · All synced"
}

export function SyncStatusBar({
  isOnline,
  pendingCount,
  lastSyncedAt,
  syncState,
}: SyncStatusBarProps) {
  const config = stateConfig[syncState]
  const statusText = getStatusText(isOnline, pendingCount, syncState)

  return (
    <div
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-2 text-xs font-medium",
        config.className
      )}
    >
      <div className="flex items-center gap-1.5">
        {config.icon}
        <span>{statusText}</span>
      </div>
      {lastSyncedAt && syncState === "idle" && (
        <span className="opacity-70">Synced {lastSyncedAt}</span>
      )}
    </div>
  )
}
