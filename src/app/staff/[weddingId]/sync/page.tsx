"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import { useSyncStatus } from "@/hooks/use-sync-status"
import { useTranslations } from "@/lib/i18n/use-translations"

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
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
  const { isOnline, pendingCount, savedLocally, syncedCount, failedCount, lastSyncedAt, syncState, triggerSync } =
    useSyncStatus(weddingId)
  const { t } = useTranslations()
  const isSyncing = syncState === "syncing"

  const stats = [
    { label: t("sync.savedLocally"), value: savedLocally, color: "#172033" },
    { label: t("sync.syncedToCloud"), value: syncedCount, color: "#15803d" },
    { label: t("sync.pendingStat"), value: pendingCount, color: "#b45309" },
    { label: t("sync.failedStat"), value: failedCount, color: "#172033" },
  ]

  return (
    <div style={{ background: "#FAF7F1", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        lastSyncedAt={lastSyncedAt}
        syncState={syncState}
      />

      {/* Header */}
      <div style={{ padding: "16px 18px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            background: "#fff",
            border: "1px solid rgba(23,32,51,0.12)",
            borderRadius: 10,
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} color="#172033" />
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#172033" }}>
          {t("sync.title")}
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: 18, flex: 1 }}>
        {/* Hero card */}
        <div
          style={{
            background: "#172033",
            borderRadius: 16,
            padding: 22,
            textAlign: "center",
          }}
        >
          <ShieldCheck size={36} color="#C8A45D" style={{ margin: "0 auto 10px", display: "block" }} />
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1,
              color: "#fff",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pendingCount}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
            {t("sync.pendingCheckins")}
          </div>
          <p
            style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.85)",
              margin: "14px 14px 0",
              lineHeight: 1.5,
            }}
          >
            {t("sync.pendingSafeMessage")}
          </p>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 14,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                border: "1px solid rgba(23,32,51,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: stat.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Warning box */}
        {pendingCount > 0 && (
          <div
            style={{
              display: "flex",
              gap: 11,
              padding: 14,
              background: "#FEF3C7",
              borderRadius: 12,
              marginTop: 14,
            }}
          >
            <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0 }} />
            <div
              style={{
                fontSize: 13,
                color: "#92400e",
                fontWeight: 500,
                lineHeight: 1.45,
              }}
            >
              {t("sync.doNotClearWarning")}
            </div>
          </div>
        )}

        {/* Last sync timestamp */}
        {lastSyncedAt && (
          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginTop: 14,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t("sync.lastSuccessfulSync")} · {formatTime(lastSyncedAt)}
          </div>
        )}
      </div>

      {/* Sticky bottom */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          padding: "12px 18px 18px",
          background: "linear-gradient(transparent, #FAF7F1 30%)",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 14,
            border: "1px solid rgba(23,32,51,0.2)",
            background: "transparent",
            color: "#172033",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {t("sync.back")}
        </button>
        <button
          onClick={() => void triggerSync()}
          disabled={!isOnline || isSyncing}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 14,
            background: "#C8A45D",
            border: "none",
            color: "#172033",
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: !isOnline || isSyncing ? "not-allowed" : "pointer",
            opacity: !isOnline || isSyncing ? 0.5 : 1,
          }}
        >
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? t("sync.syncing") : t("sync.syncNow")}
        </button>
      </div>
    </div>
  )
}
