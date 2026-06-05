"use client"

import { CalendarDays, MapPin } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

interface GuestCoverOverlayProps {
  displayName: string
  formattedDate: string | null
  location: string | null
}

function CoupleNameDisplay({ name }: { name: string }) {
  const parts = name.split(" & ")
  if (parts.length === 2) {
    return (
      <>
        {parts[0]}{" "}
        <span className="font-display italic font-medium" style={{ color: "#E3CE9F" }}>
          &amp;
        </span>{" "}
        {parts[1]}
      </>
    )
  }
  return <>{name}</>
}

export function GuestCoverOverlay({
  displayName,
  formattedDate,
  location,
}: GuestCoverOverlayProps) {
  const { t } = useTranslations()

  return (
    <div className="absolute bottom-6 left-[22px] right-[22px] text-white">
      <p
        className="mb-2.5 text-[12px] font-semibold uppercase"
        style={{ letterSpacing: "0.2em", color: "#E3CE9F" }}
      >
        {t("guest.wereGettingMarried")}
      </p>
      <h1
        className="font-display font-semibold leading-[1.05]"
        style={{ fontSize: 44, letterSpacing: "0.01em" }}
      >
        <CoupleNameDisplay name={displayName} />
      </h1>
      {(formattedDate || location) && (
        <div
          className="mt-3 flex flex-wrap items-center gap-2 text-sm"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          {formattedDate && (
            <>
              <CalendarDays className="h-4 w-4 flex-none" style={{ color: "#E3CE9F" }} />
              <span>{formattedDate}</span>
            </>
          )}
          {formattedDate && location && (
            <span style={{ opacity: 0.5 }}>·</span>
          )}
          {location && (
            <>
              <MapPin className="h-4 w-4 flex-none" style={{ color: "#E3CE9F" }} />
              <span>{location}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
