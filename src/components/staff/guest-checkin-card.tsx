"use client"

import { AlertTriangle, CheckCircle, Phone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { LocalGuest } from "@/types/shared"

interface GuestCheckinCardProps {
  guest: LocalGuest
  onCheckIn: () => void
  isLoading?: boolean
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function GuestCheckinCard({
  guest,
  onCheckIn,
  isLoading,
}: GuestCheckinCardProps) {
  const { t } = useTranslations()

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("guestCard.label")}
        </p>
        <h2 className="text-3xl font-bold leading-tight text-foreground">
          {guest.fullName}
        </h2>
      </div>

      <div className="mb-6 space-y-3">
        {guest.phoneNumber && (
          <div className="flex items-center gap-2 text-base text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span>{guest.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-base text-muted-foreground">
          <Users className="size-4 shrink-0" />
          <span>
            {guest.allowedGuests === 1
              ? t("guestCard.singleGuest")
              : t("guestCard.guestCount", { count: guest.allowedGuests })}
          </span>
        </div>
      </div>

      {guest.checkedIn ? (
        <div className="rounded-xl border border-warning/30 bg-warning-light p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold text-warning">{t("guestCard.alreadyCheckedIn")}</p>
              {guest.checkedInAt && (
                <p className="mt-0.5 text-sm text-warning/80">
                  {t("guestCard.checkedInAt", { time: formatTime(guest.checkedInAt) })}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={onCheckIn}
          disabled={isLoading}
          className="h-16 w-full gap-3 rounded-2xl bg-success text-lg font-semibold text-white hover:bg-success/90 disabled:opacity-60"
        >
          <CheckCircle className="size-6" />
          {isLoading ? t("guestCard.checkingIn") : t("guestCard.checkInGuest")}
        </Button>
      )}
    </div>
  )
}
