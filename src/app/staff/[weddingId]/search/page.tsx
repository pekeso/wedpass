"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import type { SyncState } from "@/components/staff/sync-status-bar"
import { OfflineWarningBanner } from "@/components/staff/offline-warning-banner"
import { ManualSearchResults } from "@/components/staff/manual-search-results"
import { useLocalGuestSearch } from "@/hooks/use-local-guest-search"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { offlineDb } from "@/lib/offline/db"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { LocalGuest } from "@/types/shared"

export default function StaffSearchPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { isOnline } = useNetworkStatus()
  const { query, setQuery, results, isSearching } = useLocalGuestSearch(weddingId)
  const { t } = useTranslations()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    offlineDb.checkinQueue
      .where("weddingId")
      .equals(weddingId)
      .filter((item) => !item.synced)
      .count()
      .then(setPendingCount)
      .catch(() => setPendingCount(0))
  }, [weddingId])

  const syncState: SyncState = isOnline ? "idle" : "offline"

  function handleSelect(guest: LocalGuest) {
    router.push(`/staff/${weddingId}/checkin/${guest.guestId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        syncState={syncState}
      />

      {!isOnline && <OfflineWarningBanner />}

      <div className="mx-auto w-full max-w-lg flex-1 space-y-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t("search.title")}</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-9 text-base"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        {isSearching ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <ManualSearchResults
            query={query}
            results={results}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  )
}
