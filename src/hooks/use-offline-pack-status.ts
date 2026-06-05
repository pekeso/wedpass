"use client"

import { useState, useEffect, useCallback } from "react"
import { offlineDb } from "@/lib/offline/db"

type PackStatusData = {
  isReady: boolean
  guestCount: number
  lastDownloadedAt: string | null
  snapshotId: string | null
  snapshotVersion: number | null
  weddingName: string | null
  weddingCoupleNames: string | null
  weddingEventDate: string | null
}

async function readPackStatus(weddingId: string): Promise<PackStatusData> {
  const [
    weddingMeta,
    snapshotMeta,
    downloadedAtMeta,
    guestCountMeta,
    snapshotVersionMeta,
    weddingNameMeta,
    weddingCoupleNamesMeta,
    weddingEventDateMeta,
  ] = await Promise.all([
    offlineDb.metadata.get("weddingId"),
    offlineDb.metadata.get("snapshotId"),
    offlineDb.metadata.get("lastSnapshotDownloadedAt"),
    offlineDb.metadata.get("guestCount"),
    offlineDb.metadata.get("snapshotVersion"),
    offlineDb.metadata.get("weddingName"),
    offlineDb.metadata.get("weddingCoupleNames"),
    offlineDb.metadata.get("weddingEventDate"),
  ])

  if (!weddingMeta || weddingMeta.value !== weddingId || !snapshotMeta) {
    return {
      isReady: false,
      guestCount: 0,
      lastDownloadedAt: null,
      snapshotId: null,
      snapshotVersion: null,
      weddingName: null,
      weddingCoupleNames: null,
      weddingEventDate: null,
    }
  }

  return {
    isReady: true,
    snapshotId: snapshotMeta.value,
    lastDownloadedAt: downloadedAtMeta?.value ?? null,
    guestCount: guestCountMeta ? parseInt(guestCountMeta.value, 10) : 0,
    snapshotVersion: snapshotVersionMeta ? parseInt(snapshotVersionMeta.value, 10) : null,
    weddingName: weddingNameMeta?.value ?? null,
    weddingCoupleNames: weddingCoupleNamesMeta?.value ?? null,
    weddingEventDate: weddingEventDateMeta?.value ?? null,
  }
}

export type OfflinePackStatus = PackStatusData & {
  isLoading: boolean
  refetch: () => void
}

export function useOfflinePackStatus(weddingId: string): OfflinePackStatus {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<PackStatusData>({
    isReady: false,
    guestCount: 0,
    lastDownloadedAt: null,
    snapshotId: null,
    snapshotVersion: null,
    weddingName: null,
    weddingCoupleNames: null,
    weddingEventDate: null,
  })

  const load = useCallback(() => {
    readPackStatus(weddingId)
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch(() => {
        setData({ isReady: false, guestCount: 0, lastDownloadedAt: null, snapshotId: null, snapshotVersion: null, weddingName: null, weddingCoupleNames: null, weddingEventDate: null })
        setIsLoading(false)
      })
  }, [weddingId])

  useEffect(() => {
    load()
  }, [load])

  return { ...data, isLoading, refetch: load }
}
