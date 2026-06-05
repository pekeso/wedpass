"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import type { SyncState } from "@/components/staff/sync-status-bar"
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
    <div className="min-h-screen bg-ivory">
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        syncState={syncState}
      />

      <div style={{ padding: "14px 18px 0" }}>
        {/* Header row */}
        <div className="flex items-center gap-[10px] mb-[14px]">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            style={{
              background: "#fff",
              border: "1px solid #e7e1d6",
              borderRadius: 10,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="#172033" />
          </button>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#172033" }}>
            {t("search.title")}
          </h1>
        </div>

        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            border: "2px solid #172033",
            borderRadius: 13,
            padding: "13px 15px",
          }}
        >
          <Search size={20} color="#172033" strokeWidth={2} />
          <input
            ref={inputRef}
            type="search"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              border: 0,
              outline: 0,
              fontSize: 16,
              flex: 1,
              background: "transparent",
              color: "#172033",
            }}
          />
        </div>
      </div>

      <div style={{ padding: "18px 18px 0" }}>
        {isSearching ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ height: 70, borderRadius: 13, background: "#F2ECE0" }}
              />
            ))}
          </div>
        ) : (
          <>
            {results.length > 0 && query.trim() && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#97a0b2",
                  marginBottom: 10,
                }}
              >
                {t("search.resultCount", { count: String(results.length) })}
              </div>
            )}
            <ManualSearchResults
              query={query}
              results={results}
              onSelect={handleSelect}
            />
          </>
        )}
      </div>
    </div>
  )
}
