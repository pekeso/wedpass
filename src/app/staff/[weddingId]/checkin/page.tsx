"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import { OfflineWarningBanner } from "@/components/staff/offline-warning-banner"
import { ScanActionCard } from "@/components/staff/scan-action-card"
import { RecentCheckinsList } from "@/components/staff/recent-checkins-list"
import { useSyncStatus } from "@/hooks/use-sync-status"
import { useRecentCheckins } from "@/hooks/use-recent-checkins"

export default function StaffCheckinPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { isOnline, pendingCount, lastSyncedAt, syncState } =
    useSyncStatus(weddingId)
  const recentCheckins = useRecentCheckins(weddingId)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        lastSyncedAt={lastSyncedAt}
        syncState={syncState}
      />

      {!isOnline && <OfflineWarningBanner />}

      <div className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">Check-In</h1>

        <ScanActionCard
          onScanQr={() => router.push(`/staff/${weddingId}/scan`)}
          onSearchGuest={() => router.push(`/staff/${weddingId}/search`)}
        />

        <RecentCheckinsList checkins={recentCheckins} />
      </div>
    </div>
  )
}
