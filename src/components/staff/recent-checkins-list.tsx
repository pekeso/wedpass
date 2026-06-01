"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock } from "lucide-react"
import { findGuestById } from "@/lib/offline/guests/guest-local-repository"
import type { LocalCheckinQueueItem } from "@/types/shared"

interface RecentCheckinItemProps {
  item: LocalCheckinQueueItem
}

function RecentCheckinItem({ item }: RecentCheckinItemProps) {
  const [guestName, setGuestName] = useState<string>("")

  useEffect(() => {
    findGuestById(item.guestId)
      .then((g) => setGuestName(g?.fullName ?? "Unknown Guest"))
      .catch(() => setGuestName("Unknown Guest"))
  }, [item.guestId])

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <CheckCircle className="size-4 shrink-0 text-success" />
      <p className="min-w-0 flex-1 truncate font-medium text-foreground">
        {guestName || <span className="text-muted-foreground">Loading...</span>}
      </p>
      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3" />
        <span>
          {new Date(item.checkedInAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}

interface RecentCheckinsListProps {
  checkins: LocalCheckinQueueItem[]
}

export function RecentCheckinsList({ checkins }: RecentCheckinsListProps) {
  if (checkins.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No check-ins yet. Scan a QR code or search for a guest.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Recent Check-Ins
      </h2>
      <div className="space-y-2">
        {checkins.map((item) => (
          <RecentCheckinItem key={item.queueId} item={item} />
        ))}
      </div>
    </div>
  )
}
