"use client"

import { useEffect, useState } from "react"
import { offlineDb } from "@/lib/offline/db"
import { getMetadata } from "@/lib/offline/metadata"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useSyncEngine } from "@/hooks/use-sync-engine"
import type { SyncState } from "@/components/staff/sync-status-bar"

export interface SyncStatus {
  pendingCount: number
  savedLocally: number
  syncedCount: number
  failedCount: number
  lastSyncedAt: string | undefined
  isOnline: boolean
  syncState: SyncState
  triggerSync: () => Promise<void>
}

export function useSyncStatus(weddingId: string): SyncStatus {
  const { isOnline } = useNetworkStatus()
  const { triggerSync, syncState } = useSyncEngine(weddingId)
  const [pendingCount, setPendingCount] = useState(0)
  const [savedLocally, setSavedLocally] = useState(0)
  const [syncedCount, setSyncedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>()

  useEffect(() => {
    function load() {
      const queue = offlineDb.checkinQueue.where("weddingId").equals(weddingId)

      queue.count().then(setSavedLocally).catch(() => setSavedLocally(0))

      queue
        .filter((item) => !item.synced)
        .count()
        .then(setPendingCount)
        .catch(() => setPendingCount(0))

      queue
        .filter((item) => item.synced)
        .count()
        .then(setSyncedCount)
        .catch(() => setSyncedCount(0))

      queue
        .filter((item) => !item.synced && item.syncAttempts >= 3)
        .count()
        .then(setFailedCount)
        .catch(() => setFailedCount(0))

      getMetadata("lastSuccessfulSyncAt")
        .then(setLastSyncedAt)
        .catch(() => setLastSyncedAt(undefined))
    }

    load()

    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [weddingId])

  return { pendingCount, savedLocally, syncedCount, failedCount, lastSyncedAt, isOnline, syncState, triggerSync }
}
