import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export type StatCardTone = "default" | "success" | "warning" | "gold" | "info"

export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: React.ReactNode
  tone?: StatCardTone
}

const toneClasses: Record<StatCardTone, string> = {
  default: "bg-navy/[.06] text-navy",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  gold: "bg-champagne/20 text-champagne",
  info: "bg-sync-light text-sync",
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
  tone = "default",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              toneClasses[tone]
            )}
          >
            {icon}
          </div>
          {accent}
        </div>
        <p className="text-[30px] font-bold leading-none text-navy tabular-nums">{value}</p>
        <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground/70">{sub}</p>}
      </CardContent>
    </Card>
  )
}
