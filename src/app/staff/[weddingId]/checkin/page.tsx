"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HelpCircle, RefreshCw, ScanLine, Search } from "lucide-react"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import { RecentCheckinsList } from "@/components/staff/recent-checkins-list"
import { WMark } from "@/components/shared/wmark"
import { useSyncStatus } from "@/hooks/use-sync-status"
import { useRecentCheckins } from "@/hooks/use-recent-checkins"
import { useOfflinePackStatus } from "@/hooks/use-offline-pack-status"
import { offlineDb } from "@/lib/offline/db"
import { useTranslations } from "@/lib/i18n/use-translations"

export default function StaffCheckinPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { isOnline, pendingCount, lastSyncedAt, syncState, triggerSync } =
    useSyncStatus(weddingId)
  const recentCheckins = useRecentCheckins(weddingId)
  const { weddingCoupleNames, weddingName, guestCount } = useOfflinePackStatus(weddingId)
  const { t } = useTranslations()

  const [checkedInCount, setCheckedInCount] = useState(0)

  useEffect(() => {
    function loadCount() {
      offlineDb.guests
        .where("weddingId")
        .equals(weddingId)
        .filter((g) => g.checkedIn)
        .count()
        .then(setCheckedInCount)
        .catch(() => setCheckedInCount(0))
    }
    loadCount()
    const interval = setInterval(loadCount, 3000)
    return () => clearInterval(interval)
  }, [weddingId])

  const displayName = weddingCoupleNames || weddingName || "Event"
  const progress = guestCount > 0 ? (checkedInCount / guestCount) * 100 : 0

  return (
    <div className="min-h-screen bg-ivory" style={{ paddingBottom: 88 }}>
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        lastSyncedAt={lastSyncedAt}
        syncState={syncState}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-[18px] pb-2 pt-4">
        <div className="flex items-center gap-[9px]">
          <WMark size={26} />
          <div style={{ lineHeight: 1.15 }}>
            <div className="text-[14px] font-bold text-navy">{displayName}</div>
            <div className="text-[11.5px]" style={{ color: "#6b7589" }}>
              {t("checkin.eventMode")}
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push(`/staff/${weddingId}/help`)}
          className="flex items-center gap-1.5 rounded-full bg-ivory-dark px-3 py-[7px] text-[13px] font-semibold text-navy transition-colors hover:bg-beige"
        >
          <HelpCircle className="size-[15px]" />
          {t("help.helpButton")}
        </button>
      </div>

      {/* Progress strip */}
      <div className="px-[18px] pb-[14px] pt-1.5">
        <div className="mb-[7px] flex items-baseline justify-between">
          <span className="text-[12.5px] font-semibold" style={{ color: "#6b7589" }}>
            {t("checkin.checkedInLabel")}
          </span>
          <span className="tabular-nums font-bold text-navy">
            {checkedInCount}{" "}
            <span className="font-medium" style={{ color: "#97a0b2" }}>
              / {guestCount}
            </span>
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "#F2ECE0" }}
        >
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Big scan button */}
      <div className="px-[18px] pt-1">
        <button
          onClick={() => router.push(`/staff/${weddingId}/scan`)}
          className="flex w-full flex-col items-center justify-center gap-2 bg-navy font-semibold text-white transition-colors hover:bg-navy-hover"
          style={{
            minHeight: 132,
            borderRadius: 20,
            boxShadow: "0 12px 34px rgba(23,32,51,.28)",
          }}
        >
          <ScanLine className="size-10 text-champagne" strokeWidth={1.8} />
          <span className="text-[19px]">{t("scan.title")}</span>
          <span className="text-[12.5px] font-medium text-white/60">{t("scan.hint")}</span>
        </button>
      </div>

      {/* Manual search — styled as input-like button */}
      <div className="px-[18px] pt-[14px]">
        <button
          onClick={() => router.push(`/staff/${weddingId}/search`)}
          className="flex w-full items-center gap-[11px] bg-white text-left transition-colors hover:bg-ivory"
          style={{
            padding: "15px 16px",
            borderRadius: 14,
            border: "1px solid #e7e1d6",
            fontSize: 15,
            color: "#6b7589",
          }}
        >
          <Search className="size-5 shrink-0" style={{ color: "#97a0b2" }} />
          {t("checkin.searchPlaceholder")}
        </button>
      </div>

      {/* Recent check-ins */}
      <div className="px-[18px] pb-4 pt-[22px]">
        <div className="mb-1 flex items-center justify-between">
          <span
            className="text-[11px] font-semibold uppercase"
            style={{ letterSpacing: "0.16em", color: "#97a0b2" }}
          >
            {t("checkin.recentCheckins")}
          </span>
          <button
            onClick={() => router.push(`/staff/${weddingId}/sync`)}
            className="border-0 bg-transparent text-[12.5px] font-semibold"
            style={{ color: "#A8843F" }}
          >
            {t("checkin.syncStatus")} ›
          </button>
        </div>
        <RecentCheckinsList checkins={recentCheckins} />
      </div>

      {/* Sticky Sync Now */}
      <div
        className="fixed bottom-0 left-0 right-0 px-[18px] pb-[18px] pt-3"
        style={{ background: "linear-gradient(transparent, #FAF7F1 28%)" }}
      >
        <button
          onClick={() => triggerSync()}
          className="flex w-full items-center justify-center gap-[9px] bg-champagne font-semibold text-navy transition-colors hover:bg-champagne-light"
          style={{ padding: "17px 24px", fontSize: 16, borderRadius: 16 }}
        >
          <RefreshCw className="size-[18px]" />
          {t("sync.syncNow")} ·{" "}
          <span className="tabular-nums">{pendingCount}</span>
        </button>
      </div>
    </div>
  )
}
