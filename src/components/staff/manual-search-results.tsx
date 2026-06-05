"use client"

import { ChevronRight } from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { LocalGuest } from "@/types/shared"

function GuestAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase()
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: "#F2ECE0",
        color: "#172033",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  )
}

function StatusBadge({ checkedIn }: { checkedIn: boolean }) {
  const { t } = useTranslations()
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: checkedIn ? "#DCFCE7" : "#EEF2F8",
        color: checkedIn ? "#15803d" : "#172033",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: checkedIn ? "#16A34A" : "#172033",
          flexShrink: 0,
        }}
      />
      {checkedIn ? t("search.checkedIn") : t("search.notIn")}
    </span>
  )
}

interface GuestSearchResultItemProps {
  guest: LocalGuest
  onSelect: (guest: LocalGuest) => void
}

function GuestSearchResultItem({ guest, onSelect }: GuestSearchResultItemProps) {
  const { t } = useTranslations()
  const maskedPhone = guest.phoneNumber
    ? `•••• ${guest.phoneNumber.slice(-4)}`
    : null

  return (
    <button
      type="button"
      onClick={() => onSelect(guest)}
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 14,
        background: "#fff",
        border: "1px solid #efeae0",
        borderRadius: 13,
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <GuestAvatar name={guest.fullName} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#172033" }}>
          {guest.fullName}
        </div>
        <div style={{ fontSize: 12.5, color: "#6b7589", marginTop: 2 }}>
          {maskedPhone ? `${maskedPhone} · ` : ""}
          {guest.allowedGuests} {t("search.allowed")}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <StatusBadge checkedIn={guest.checkedIn} />
        <ChevronRight size={16} color="#97a0b2" />
      </div>
    </button>
  )
}

interface ManualSearchResultsProps {
  query: string
  results: LocalGuest[]
  onSelect: (guest: LocalGuest) => void
}

export function ManualSearchResults({
  query,
  results,
  onSelect,
}: ManualSearchResultsProps) {
  const { t } = useTranslations()
  const hasQuery = query.trim().length > 0

  if (hasQuery && results.length === 0) {
    return (
      <div
        style={{
          padding: 16,
          background: "#F3F4F6",
          borderRadius: 13,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13.5, color: "#45506b", fontWeight: 600, marginBottom: 4 }}>
          {t("search.notRightGuest")}
        </div>
        <div style={{ fontSize: 12.5, color: "#6b7589", lineHeight: 1.45 }}>
          {t("search.tryAnotherSpelling")}
        </div>
      </div>
    )
  }

  if (!hasQuery || results.length === 0) {
    return null
  }

  return (
    <div>
      {results.map((guest) => (
        <GuestSearchResultItem
          key={guest.guestId}
          guest={guest}
          onSelect={onSelect}
        />
      ))}

      {/* fallback tip */}
      <div
        style={{
          marginTop: 6,
          padding: 16,
          background: "#F3F4F6",
          borderRadius: 13,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13.5, color: "#45506b", fontWeight: 600, marginBottom: 4 }}>
          {t("search.notRightGuest")}
        </div>
        <div style={{ fontSize: 12.5, color: "#6b7589", lineHeight: 1.45 }}>
          {t("search.tryAnotherSpelling")}
        </div>
      </div>
    </div>
  )
}
