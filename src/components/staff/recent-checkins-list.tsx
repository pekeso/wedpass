"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { findGuestById } from "@/lib/offline/guests/guest-local-repository"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { LocalCheckinQueueItem, LocalGuest } from "@/types/shared"

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

interface CheckinRowProps {
  item: LocalCheckinQueueItem
}

function CheckinRow({ item }: CheckinRowProps) {
  const [guest, setGuest] = useState<LocalGuest | null>(null)
  const { t } = useTranslations()

  useEffect(() => {
    findGuestById(item.guestId)
      .then((g) => setGuest(g ?? null))
      .catch(() => setGuest(null))
  }, [item.guestId])

  const guestName = guest?.fullName ?? t("checkin.loading")
  const seatInfo =
    guest && guest.allowedGuests > 1
      ? `${guest.allowedGuests} ${t("guestCard.guestCount", { count: guest.allowedGuests })}`
      : guest?.phoneNumber
        ? `•••• ${guest.phoneNumber.slice(-4)}`
        : ""

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex size-9 shrink-0 items-center justify-center"
        style={{ borderRadius: 10, background: "#DCFCE7", color: "#15803d" }}
      >
        <Check className="size-[18px]" strokeWidth={3} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-semibold text-navy">{guestName}</div>
        {seatInfo && (
          <div className="text-[12.5px]" style={{ color: "#6b7589" }}>
            {seatInfo}
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className="tabular-nums text-[12px]" style={{ color: "#6b7589" }}>
          {timeAgo(item.checkedInAt)}
        </div>
        <div
          className="text-[11px] font-semibold"
          style={{ color: item.synced ? "#16A34A" : "#D97706" }}
        >
          {item.synced ? t("checkin.synced") : t("checkin.pending")}
        </div>
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
      <p className="py-6 text-center text-sm" style={{ color: "#6b7589" }}>
        {t("checkin.noCheckins")}
      </p>
    )
  }

  return (
    <div
      className="rounded-[14px] bg-white"
      style={{ padding: "4px 16px", border: "1px solid #efeae0" }}
    >
      {checkins.map((item, idx) => (
        <div key={item.queueId}>
          {idx > 0 && (
            <div style={{ height: 1, background: "#efeae0", margin: "0 -16px" }} />
          )}
          <CheckinRow item={item} />
        </div>
      ))}
    </div>
  )
}
