"use client"

import { useEffect, useState } from "react"
import { offlineDb } from "@/lib/offline/db"
import type { LocalCheckinQueueItem } from "@/types/shared"

export function useRecentCheckins(
  weddingId: string,
  limit = 10
): LocalCheckinQueueItem[] {
  const [checkins, setCheckins] = useState<LocalCheckinQueueItem[]>([])

  useEffect(() => {
    function load() {
      offlineDb.checkinQueue
        .where("weddingId")
        .equals(weddingId)
        .sortBy("createdAt")
        .then((items) => {
          setCheckins(items.reverse().slice(0, limit))
        })
        .catch(() => setCheckins([]))
    }

    load()

    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [weddingId, limit])

  return checkins
}
