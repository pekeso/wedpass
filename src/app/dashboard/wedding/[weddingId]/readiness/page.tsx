"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Check, ShieldCheck, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/auth-store"
import { getEventModeReadiness } from "@/lib/api/event-mode-client"
import { listStaffDevices } from "@/lib/api/staff-client"
import type { ReadinessResult } from "@/modules/weddings/event-mode.service"
import type { StaffDeviceListItemDTO } from "@/modules/staff/staff.dto"

const CHECK_META: Record<
  string,
  { hint?: string; actionLabel?: string; actionHref?: string }
> = {
  wedding_details: { actionLabel: "Edit details", actionHref: "settings" },
  guest_list: { actionLabel: "Import guests", actionHref: "guests" },
  qr_codes: { actionLabel: "Generate QR codes", actionHref: "qr-codes" },
  staff_access: { actionLabel: "Add staff device", actionHref: "staff" },
}

export default function ReadinessPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()

  const { data: readiness, isLoading: readinessLoading } = useQuery({
    queryKey: ["event-readiness", weddingId],
    queryFn: () => getEventModeReadiness(weddingId, accessToken!),
    enabled: !!accessToken,
  })

  const { data: devicesData, isLoading: devicesLoading } = useQuery({
    queryKey: ["staff-devices", weddingId],
    queryFn: () => listStaffDevices(weddingId, accessToken!),
    enabled: !!accessToken,
  })

  const devices = devicesData?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Readiness Command Center"
        description="Is the wedding truly ready for event day?"
        primaryAction={
          <Link href={`/dashboard/wedding/${weddingId}/event-mode`}>
            <Button variant="navy">
              <ShieldCheck className="mr-2 size-4" />
              Complete Setup
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr]">
        {/* Left column: score + devices */}
        <div className="flex flex-col gap-4">
          <ReadinessScoreCard readiness={readiness} isLoading={readinessLoading} />
          <StaffDevicesCard
            devices={devices}
            isLoading={devicesLoading}
            weddingId={weddingId}
          />
        </div>

        {/* Right column: checklist */}
        <ChecklistCard
          readiness={readiness}
          isLoading={readinessLoading}
          weddingId={weddingId}
        />
      </div>
    </div>
  )
}

function ReadinessScoreCard({
  readiness,
  isLoading,
}: {
  readiness?: ReadinessResult
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center p-6">
          <Skeleton className="h-[140px] w-[140px] rounded-full" />
          <Skeleton className="mt-3 h-4 w-28" />
        </CardContent>
      </Card>
    )
  }

  const checks = readiness?.checks ?? []
  const passing = checks.filter((c) => c.passed).length
  const total = checks.length
  const pct = total > 0 ? Math.round((passing / total) * 100) : 0

  return (
    <Card>
      <CardContent className="flex flex-col items-center p-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#97a0b2]">
          Wedding readiness
        </p>
        <ReadinessRing pct={pct} />
        <p className="tabular-nums text-[13px] text-[#6b7589]">
          {passing} of {total} complete
        </p>
      </CardContent>
    </Card>
  )
}

function ReadinessRing({ pct }: { pct: number }) {
  const r = 52
  const circumference = 2 * Math.PI * r
  return (
    <div className="relative my-3" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--color-ivory-dark, #efeae0)"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--color-champagne, #c8a45d)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="tabular-nums font-bold leading-none text-navy"
          style={{ fontSize: 34 }}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}

function StaffDevicesCard({
  devices,
  isLoading,
  weddingId,
}: {
  devices: StaffDeviceListItemDTO[]
  isLoading: boolean
  weddingId: string
}) {
  const readyCount = devices.filter((d) => d.status === "ACTIVE").length
  const total = devices.length

  return (
    <Card className="border-none" style={{ background: "var(--color-navy, #172033)" }}>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="h-8 w-20 bg-white/10" />
            <Skeleton className="h-2 w-full bg-white/10" />
          </div>
        ) : (
          <>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--color-champagne, #c8a45d)" }}
            >
              Staff devices
            </p>
            <div className="my-3 flex items-baseline gap-2">
              <span className="tabular-nums text-3xl font-bold text-white">
                {readyCount}
              </span>
              <span className="text-sm text-white/60">
                of {total} ready
              </span>
            </div>
            {total > 0 && (
              <div className="flex gap-1.5">
                {devices.map((d) => (
                  <div
                    key={d.id}
                    className="h-[7px] flex-1 rounded-full"
                    style={{
                      background:
                        d.status === "ACTIVE"
                          ? "var(--color-champagne, #c8a45d)"
                          : "rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
              </div>
            )}
            {total === 0 && (
              <p className="text-sm text-white/50">No devices created yet.</p>
            )}
            <Link href={`/dashboard/wedding/${weddingId}/staff`}>
              <Button
                size="sm"
                className="mt-4 w-full border-0 text-white hover:text-white"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <Smartphone className="mr-2 size-3.5" />
                View Staff Devices
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ChecklistCard({
  readiness,
  isLoading,
  weddingId,
}: {
  readiness?: ReadinessResult
  isLoading: boolean
  weddingId: string
}) {
  return (
    <Card>
      <CardContent className="p-[22px]">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#97a0b2]">
          Setup checklist
        </p>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div>
            {(readiness?.checks ?? []).map((check, i) => {
              const meta = CHECK_META[check.key] ?? {}
              const isLast = i === (readiness?.checks.length ?? 0) - 1
              return (
                <div key={check.key}>
                  <div className="flex items-center gap-3.5 py-[13px]">
                    <div
                      className="flex size-6 shrink-0 items-center justify-center rounded-full"
                      style={
                        check.passed
                          ? { background: "#DCFCE7" }
                          : {
                              background: "#fff",
                              border: "2px solid #e7e1d6",
                            }
                      }
                    >
                      {check.passed ? (
                        <Check
                          className="text-[#15803d]"
                          style={{ width: 14, height: 14, strokeWidth: 3.2 }}
                        />
                      ) : (
                        <span
                          className="rounded-full"
                          style={{
                            width: 7,
                            height: 7,
                            background: "var(--color-champagne, #c8a45d)",
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm font-medium"
                        style={{ color: check.passed ? "#45506b" : "#172033" }}
                      >
                        {check.label}
                      </div>
                    </div>
                    {!check.passed && meta.actionLabel && meta.actionHref && (
                      <Link
                        href={`/dashboard/wedding/${weddingId}/${meta.actionHref}`}
                      >
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
        )}
      </CardContent>
    </Card>
  )
}
