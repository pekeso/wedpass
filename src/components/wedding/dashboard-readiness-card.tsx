"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getEventModeReadiness } from "@/lib/api/event-mode-client"

interface DashboardReadinessCardProps {
  weddingId: string
  accessToken: string
}

export function DashboardReadinessCard({ weddingId, accessToken }: DashboardReadinessCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["event-readiness", weddingId],
    queryFn: () => getEventModeReadiness(weddingId, accessToken),
    enabled: !!accessToken,
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-champagne">
          Event readiness
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : data ? (
          <ReadinessContent data={data} />
        ) : null}
      </CardContent>
    </Card>
  )
}

function ReadinessContent({ data }: { data: { ready: boolean; checks: { key: string; label: string; passed: boolean }[] } }) {
  const passing = data.checks.filter((c) => c.passed).length
  const total = data.checks.length
  const pct = total > 0 ? Math.round((passing / total) * 100) : 0

  return (
    <div className="space-y-3">
      {pct === 100 ? (
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="font-semibold">Ready for event day ✓</span>
        </div>
      ) : (
        <p className="text-4xl font-bold text-navy">{pct}%</p>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-success transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {data.checks.slice(0, 4).map((check) => (
          <li key={check.key} className="flex items-center gap-2 text-sm">
            {check.passed ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" />
            ) : (
              <span className="size-4 shrink-0 rounded-full bg-champagne opacity-70" />
            )}
            <span className={check.passed ? "text-muted-foreground" : "text-foreground"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
      {pct < 100 && (
        <Link href="./event-mode" className="text-sm font-medium text-navy hover:underline">
          Complete setup →
        </Link>
      )}
    </div>
  )
}
