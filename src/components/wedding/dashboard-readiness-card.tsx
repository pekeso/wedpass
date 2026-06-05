"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getEventModeReadiness } from "@/lib/api/event-mode-client"
import type { ReadinessResult } from "@/modules/weddings/event-mode.service"

interface DashboardReadinessCardProps {
  weddingId: string
  accessToken: string
}

const CHECK_META: Record<string, { hint?: string; actionLabel?: string; actionHref?: string }> = {
  guest_list: { actionLabel: "Import guests", actionHref: "./guests" },
  qr_codes: { actionLabel: "Generate", actionHref: "./qr-codes" },
  staff_access: { actionLabel: "Add staff", actionHref: "./staff" },
  wedding_details: { actionLabel: "Edit", actionHref: "./settings" },
}

export function DashboardReadinessCard({ weddingId, accessToken }: DashboardReadinessCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["event-readiness", weddingId],
    queryFn: () => getEventModeReadiness(weddingId, accessToken),
    enabled: !!accessToken,
  })

  return (
    <Card>
      <CardContent className="p-[22px]">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : data ? (
          <ReadinessContent data={data} weddingId={weddingId} />
        ) : null}
      </CardContent>
    </Card>
  )
}

function ReadinessContent({
  data,
  weddingId,
}: {
  data: ReadinessResult
  weddingId: string
}) {
  const passing = data.checks.filter((c) => c.passed).length
  const total = data.checks.length
  const pct = total > 0 ? Math.round((passing / total) * 100) : 0

  return (
    <div>
      {/* Header row */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#97a0b2]">
            Event readiness
          </p>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="font-bold tabular-nums leading-none text-navy" style={{ fontSize: 38 }}>
              {pct}%
            </span>
            <span className="text-[13px] text-[#6b7589]">
              {passing} of {total} ready
            </span>
          </div>
        </div>
        {pct < 100 && (
          <Link href={`/dashboard/wedding/${weddingId}/event-mode`}>
            <Button variant="gold" size="sm">
              Complete setup
            </Button>
          </Link>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-ivory-dark">
        <div
          className="h-full rounded-full bg-success transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Check rows */}
      <div className="pt-1.5">
        {data.checks.map((check, i) => {
          const meta = CHECK_META[check.key] ?? {}
          const isLast = i === data.checks.length - 1
          return (
            <div key={check.key}>
              <div className="flex items-center gap-[13px] py-[13px]">
                {/* Icon */}
                <div
                  className="flex size-6 flex-none items-center justify-center rounded-full"
                  style={
                    check.passed
                      ? { background: "#DCFCE7" }
                      : { background: "#fff", border: "2px solid #e7e1d6" }
                  }
                >
                  {check.passed ? (
                    <Check
                      className="text-[#15803d]"
                      style={{ width: 14, height: 14, strokeWidth: 3.2 }}
                    />
                  ) : (
                    <span
                      className="rounded-full bg-champagne"
                      style={{ width: 7, height: 7 }}
                    />
                  )}
                </div>

                {/* Label + hint */}
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-medium"
                    style={{ color: check.passed ? "#45506b" : "#172033" }}
                  >
                    {check.label}
                  </div>
                  {meta.hint && (
                    <div className="mt-px text-xs" style={{ color: "#97a0b2" }}>
                      {meta.hint}
                    </div>
                  )}
                </div>

                {/* Action button */}
                {!check.passed && meta.actionLabel && meta.actionHref && (
                  <Link href={`/dashboard/wedding/${weddingId}/${meta.actionHref.replace("./", "")}`}>
                    <Button variant="ghost" size="sm">
                      {meta.actionLabel}
                    </Button>
                  </Link>
                )}
              </div>

              {!isLast && <div className="h-px bg-[#efeae0]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
