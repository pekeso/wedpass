"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  syncCheckins,
  SnapshotMismatchError,
} from "@/lib/offline/checkins/checkin-sync-client"
import { setupNetworkMonitor } from "@/lib/offline/network/network-monitor"
import type { SyncState } from "@/components/staff/sync-status-bar"

export function useSyncEngine(weddingId: string): {
  triggerSync: () => Promise<void>
  syncState: SyncState
} {
  const [syncState, setSyncState] = useState<SyncState>(
    typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "idle"
  )
  const isSyncing = useRef(false)

  const triggerSync = useCallback(async () => {
    if (isSyncing.current) return
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSyncState("offline")
      return
    }
    isSyncing.current = true
    setSyncState("syncing")
    try {
      await syncCheckins(weddingId)
      setSyncState("idle")
    } catch (error) {
      void error
      setSyncState("failed")
    } finally {
      isSyncing.current = false
    }
  }, [weddingId])

  useEffect(() => {
    if (typeof window === "undefined") return

    function handleOffline() {
      setSyncState("offline")
    }

    window.addEventListener("offline", handleOffline)
    const cleanup = setupNetworkMonitor(() => void triggerSync())

    return () => {
      window.removeEventListener("offline", handleOffline)
      cleanup()
    }
  }, [triggerSync])

  return { triggerSync, syncState }
}
