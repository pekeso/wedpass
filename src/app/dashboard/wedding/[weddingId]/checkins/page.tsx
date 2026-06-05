"use client"

import { use } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

interface WeddingStats {
  totalGuests: number
  checkedInGuests: number
  pendingGuests: number
  checkinPercentage: number
  totalMediaUploads: number
  lastSyncAt: string | null
}

async function fetchWeddingStats(weddingId: string, accessToken: string): Promise<WeddingStats> {
  const res = await fetch(`/api/v1/weddings/${weddingId}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error.message)
  return json.data
}

// Simulated hourly arrival distribution — 14:00 through 01:00
const ARRIVAL_BARS = [12, 28, 46, 70, 92, 78, 54, 40, 30, 22, 16, 10]
const ARRIVAL_PEAK_INDEX = 4

export default function CheckinsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wedding-stats", weddingId],
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated")
      return fetchWeddingStats(weddingId, accessToken)
    },
    enabled: !!accessToken,
    refetchInterval: 30_000,
  })

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["wedding-stats", weddingId] })
  }

  if (isLoading) return <LoadingState message="Loading check-in stats..." />
  if (isError) return <ErrorState title="Failed to load stats" description="Please refresh and try again." />

  const checkinRate = stats?.checkinPercentage ?? 0
  const checkedIn = stats?.checkedInGuests ?? 0
  const notArrived = stats?.pendingGuests ?? 0
  const maxBar = Math.max(...ARRIVAL_BARS)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-In Stats"
        description="Honest numbers — final after all devices sync"
        primaryAction={
          <Button
            className="bg-navy hover:bg-navy/90 text-white"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh Stats
          </Button>
        }
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        {/* Arrivals over time bar chart */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Arrivals over time
            </p>
            <div className="mt-5 flex h-44 items-end gap-[5px] px-1">
              {ARRIVAL_BARS.map((h, i) => {
                const isPeak = i === ARRIVAL_PEAK_INDEX
                const heightPx = Math.round((h / maxBar) * 170)
                const hour = 14 + i
                const label = hour < 24 ? `${hour}:00` : `0${hour - 24}:00`
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t-[5px]"
                      style={{
                        height: `${heightPx}px`,
                        backgroundColor: isPeak ? "#C8A45D" : "#172033",
                        opacity: isPeak ? 1 : 0.82,
                      }}
                    />
                    <span className="tabular-nums text-[10px] text-muted-foreground">
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Check-in overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-baseline gap-2.5">
                <span className="tabular-nums text-5xl font-bold leading-none text-navy">
                  {checkinRate}%
                </span>
                <span className="text-sm text-muted-foreground">checked in</span>
              </div>

              <div className="my-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${checkinRate}%` }}
                />
              </div>

              <div className="flex justify-between">
                <div>
                  <div className="tabular-nums text-xl font-bold text-success">{checkedIn}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">Synced</div>
                </div>
                <div>
                  <div className="tabular-nums text-xl font-bold text-warning">—</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">Pending</div>
                </div>
                <div>
                  <div className="tabular-nums text-xl font-bold text-muted-foreground">
                    {notArrived}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">Not arrived</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unsynced devices warning */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex gap-2.5">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
                <p className="text-sm leading-relaxed text-amber-800">
                  Some staff devices may have unsynced check-ins. Final numbers may update after sync.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
