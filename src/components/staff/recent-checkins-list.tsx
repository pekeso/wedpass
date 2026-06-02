"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock } from "lucide-react"
import { findGuestById } from "@/lib/offline/guests/guest-local-repository"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { LocalCheckinQueueItem } from "@/types/shared"

interface RecentCheckinItemProps {
  item: LocalCheckinQueueItem
}

function RecentCheckinItem({ item }: RecentCheckinItemProps) {
  const [guestName, setGuestName] = useState<string>("")
  const { t } = useTranslations()

  useEffect(() => {
    findGuestById(item.guestId)
      .then((g) => setGuestName(g?.fullName ?? t("checkin.unknownGuest")))
      .catch(() => setGuestName(t("checkin.unknownGuest")))
  }, [item.guestId, t])

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <CheckCircle className="size-4 shrink-0 text-success" />
      <p className="min-w-0 flex-1 truncate font-medium text-foreground">
        {guestName || <span className="text-muted-foreground">{t("checkin.loading")}</span>}
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
  const { t } = useTranslations()

  if (checkins.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {t("checkin.noCheckins")}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t("checkin.recentCheckins")}
      </h2>
      <div className="space-y-2">
        {checkins.map((item) => (
          <RecentCheckinItem key={item.queueId} item={item} />
        ))}
      </div>
    </div>
  )
}
