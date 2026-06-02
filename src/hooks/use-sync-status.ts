"use client"

import { useEffect, useState } from "react"
import { offlineDb } from "@/lib/offline/db"
import { getMetadata } from "@/lib/offline/metadata"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useSyncEngine } from "@/hooks/use-sync-engine"
import type { SyncState } from "@/components/staff/sync-status-bar"

export interface SyncStatus {
  pendingCount: number
  lastSyncedAt: string | undefined
  isOnline: boolean
  syncState: SyncState
  triggerSync: () => Promise<void>
}

export function useSyncStatus(weddingId: string): SyncStatus {
  const { isOnline } = useNetworkStatus()
  const { triggerSync, syncState } = useSyncEngine(weddingId)
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

      getMetadata("lastSuccessfulSyncAt")
        .then(setLastSyncedAt)
        .catch(() => setLastSyncedAt(undefined))
    }

    load()

    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [weddingId])

  return { pendingCount, lastSyncedAt, isOnline, syncState, triggerSync }
}
