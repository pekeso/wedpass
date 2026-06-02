"use client"

import { CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { LocalGuest } from "@/types/shared"

interface GuestSearchResultItemProps {
  guest: LocalGuest
  onSelect: (guest: LocalGuest) => void
}

function GuestSearchResultItem({ guest, onSelect }: GuestSearchResultItemProps) {
  const { t } = useTranslations()

  return (
    <button
      type="button"
      onClick={() => onSelect(guest)}
      className="flex h-14 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 text-left transition-colors hover:bg-muted active:bg-muted"
    >
      <div className="flex-1 min-w-0">
        <p className="truncate text-base font-bold text-foreground">
          {guest.fullName}
        </p>
        {guest.phoneNumber && (
          <p className="truncate text-xs text-muted-foreground">
            {guest.phoneNumber}
          </p>
        )}
      </div>
      {guest.checkedIn ? (
        <Badge className="shrink-0 gap-1 bg-success-light text-success border-success hover:bg-success-light">
          <CheckCircle2 className="size-3" />
          {t("search.checkedIn")}
        </Badge>
      ) : (
        <Badge variant="outline" className="shrink-0 text-muted-foreground">
          {t("search.notIn")}
        </Badge>
      )}
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

  if (results.length === 0 && query.trim()) {
    return (
      <div className="py-12 text-center">
        <p className="text-base font-semibold text-foreground">
          {t("search.noGuestsFound")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("search.noResultsFor", { query })}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {results.map((guest) => (
        <GuestSearchResultItem
          key={guest.guestId}
          guest={guest}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
