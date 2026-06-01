"use client"

import { useEffect, useState } from "react"
import { offlineDb } from "@/lib/offline/db"
import { getMetadata } from "@/lib/offline/metadata"
import { useNetworkStatus } from "@/hooks/use-network-status"
import type { SyncState } from "@/components/staff/sync-status-bar"

export interface SyncStatus {
  pendingCount: number
  lastSyncedAt: string | undefined
  isOnline: boolean
  syncState: SyncState
}

export function useSyncStatus(weddingId: string): SyncStatus {
  const { isOnline } = useNetworkStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>()

  useEffect(() => {
    function load() {
      offlineDb.checkinQueue
        .where("weddingId")
        .equals(weddingId)
        .filter((item) => !item.synced)
        .count()
        .then(setPendingCount)
        .catch(() => setPendingCount(0))

      getMetadata("lastSyncedAt")
        .then(setLastSyncedAt)
        .catch(() => setLastSyncedAt(undefined))
    }

    load()

    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [weddingId])

  const syncState: SyncState = isOnline ? "idle" : "offline"

  return { pendingCount, lastSyncedAt, isOnline, syncState }
}
