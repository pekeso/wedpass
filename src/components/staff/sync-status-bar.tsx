"use client"

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

export type SyncState = "idle" | "syncing" | "failed" | "offline"

export interface SyncStatusBarProps {
  isOnline: boolean
  pendingCount: number
  lastSyncedAt?: string
  syncState: SyncState
}

const stateConfig: Record<
  SyncState,
  { bg: string; dot: string; icon: React.ReactNode; savedLocally: boolean }
> = {
  idle: {
    bg: "#0f3d24",
    dot: "#3ddc84",
    icon: <Wifi className="size-4 shrink-0" style={{ color: "rgba(255,255,255,0.85)" }} />,
    savedLocally: false,
  },
  syncing: {
    bg: "#15294d",
    dot: "#5b9bff",
    icon: <RefreshCw className="size-4 shrink-0 animate-spin" style={{ color: "rgba(255,255,255,0.85)" }} />,
    savedLocally: false,
  },
  failed: {
    bg: "#3a1717",
    dot: "#f06b6b",
    icon: <AlertTriangle className="size-4 shrink-0" style={{ color: "rgba(255,255,255,0.85)" }} />,
    savedLocally: true,
  },
  offline: {
    bg: "#2b2118",
    dot: "#f0b463",
    icon: <WifiOff className="size-4 shrink-0" style={{ color: "rgba(255,255,255,0.85)" }} />,
    savedLocally: true,
  },
}

export function SyncStatusBar({
  isOnline,
  pendingCount,
  lastSyncedAt,
  syncState,
}: SyncStatusBarProps) {
  const { t } = useTranslations()
  const cfg = stateConfig[syncState]

  let statusText: string
  if (!isOnline) {
    statusText =
      pendingCount > 0
        ? t("syncBar.offlineWithCount", { count: pendingCount })
        : t("syncBar.offlineNone")
  } else if (syncState === "syncing") {
    statusText =
      pendingCount > 0
        ? t("syncBar.syncingWithCount", { count: pendingCount })
        : t("syncBar.syncing")
  } else if (syncState === "failed") {
    statusText = t("syncBar.failed")
  } else {
    statusText = t("syncBar.allSynced")
  }

  return (
    <div
      style={{ background: cfg.bg }}
      className="sticky top-0 z-40 flex items-center gap-2.5 px-4 py-2.5 text-white"
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: cfg.dot,
          boxShadow: `0 0 0 4px ${cfg.dot}22`,
          flexShrink: 0,
        }}
      />
      {cfg.icon}
      <span className="text-[13.5px] font-semibold tracking-[0.01em]">{statusText}</span>
      {lastSyncedAt && syncState === "idle" && (
        <span className="ml-auto text-[12px] opacity-70">
          {t("syncBar.syncedAt", {
            time: new Date(lastSyncedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          })}
        </span>
      )}
      {cfg.savedLocally && (
        <span className="ml-auto text-[12px] font-semibold" style={{ color: cfg.dot }}>
          Saved locally
        </span>
      )}
    </div>
  )
}
