"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  ShieldCheck,
  Users,
  UserCheck,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  getEventModeReadiness,
  enableEventMode,
  getEventDayStatus,
} from "@/lib/api/event-mode-client"
import { StaffDeviceStatusCard } from "@/components/staff/staff-device-status-card"
import { ManualDeskGuidance } from "@/components/wedding/manual-desk-guidance"
import { EmergencyInstructions } from "@/components/wedding/emergency-instructions"
import type { EventDayStatusDTO } from "@/modules/weddings/event-mode.service"

function WMarkWatermark({ size = 180 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.92}
      viewBox="0 0 100 96"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10,27 L31,90 L50,7 L69,90 L90,27"
        fill="none"
        stroke="white"
        strokeWidth={13}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        strokeMiterlimit={20}
      />
    </svg>
  )
}

export default function EventModePage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [enableError, setEnableError] = useState<string | null>(null)

  const eventDayQuery = useQuery({
    queryKey: ["event-day-status", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return getEventDayStatus(weddingId, accessToken)
    },
    enabled: !!accessToken,
    refetchInterval: 30_000,
  })

  const readinessQuery = useQuery({
    queryKey: ["event-mode-readiness", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return getEventModeReadiness(weddingId, accessToken)
    },
    enabled: !!accessToken && eventDayQuery.data?.weddingStatus !== "EVENT_MODE",
  })

  const enableMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return enableEventMode(weddingId, accessToken)
    },
    onSuccess: () => {
      setEnableError(null)
      void queryClient.invalidateQueries({ queryKey: ["event-day-status", weddingId] })
      void queryClient.invalidateQueries({ queryKey: ["event-mode-readiness", weddingId] })
      void queryClient.invalidateQueries({ queryKey: ["wedding", weddingId] })
    },
    onError: (err) => {
      setEnableError(err instanceof Error ? err.message : "Failed to enable Event Mode")
    },
  })

  if (eventDayQuery.isLoading) {
    return <LoadingState message="Loading Event Mode status..." />
  }

  if (eventDayQuery.isError) {
    return (
      <ErrorState title="Failed to load event status" description="Please refresh and try again." />
    )
  }

  const status = eventDayQuery.data as EventDayStatusDTO

  if (status.weddingStatus === "EVENT_MODE") {
    return <EventCommandCenter status={status} />
  }

  const checks = readinessQuery.data?.checks ?? []
  const allPassed = readinessQuery.data?.ready ?? false

  return (
    <div className="space-y-5" style={{ maxWidth: 760 }}>
      <PageHeader
        title="Enable Event Mode"
        description="Prepare your wedding for offline check-in"
      />

      {/* Navy explainer card */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6"
        style={{ background: "#172033" }}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-5"
          style={{ opacity: 0.08 }}
        >
          <WMarkWatermark size={180} />
        </div>
        <ShieldCheck className="size-[30px] text-champagne" />
        <h2 className="mt-3 text-[21px] font-bold text-white">
          What is Event Mode?
        </h2>
        <p
          className="mt-2 max-w-[540px] leading-[1.55] text-white/70"
          style={{ fontSize: 14.5 }}
        >
          Event Mode takes a snapshot of your guest list so staff phones can check
          guests in offline. Once enabled, the list is locked so every device stays
          consistent.
        </p>
      </div>

      {/* Before you enable checklist */}
      <div className="overflow-hidden rounded-2xl border border-[#efeae0] bg-white shadow-card">
        <div className="px-6 pt-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#97a0b2]">
            Before you enable
          </p>
        </div>
        <div className="px-6 pb-4">
          {checks.length === 0 && readinessQuery.isLoading ? (
            <p className="py-4 text-sm text-muted-foreground">Loading checklist…</p>
          ) : (
            <div>
              {checks.map((check, i) => (
                <div key={check.key}>
                  <div className="flex items-center gap-3 py-3">
                    <div
                      className="flex size-[22px] shrink-0 items-center justify-center rounded-full"
                      style={
                        check.passed
                          ? { background: "#DCFCE7" }
                          : { background: "#fff", border: "2px solid #e7e1d6" }
                      }
                    >
                      {check.passed && (
                        <Check
                          className="text-[#15803d]"
                          style={{ width: 13, height: 13, strokeWidth: 3 }}
                        />
                      )}
                    </div>
                    <span
                      className="flex-1 text-sm"
                      style={{ color: "#172033" }}
                    >
                      {check.label}
                    </span>
                    {!check.passed && (
                      <span className="inline-flex items-center rounded-full bg-sync-light px-2.5 py-0.5 text-xs font-medium text-sync">
                        Not ready
                      </span>
                    )}
                  </div>
                  {i < checks.length - 1 && (
                    <div className="h-px bg-[#efeae0]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Warning banner */}
      <div
        className="flex items-start gap-3 rounded-2xl p-4"
        style={{ background: "#FEF3C7" }}
      >
        <Lock
          className="mt-0.5 size-5 shrink-0"
          style={{ color: "#b45309" }}
        />
        <p className="leading-[1.5] text-[#92400e]" style={{ fontSize: 13.5 }}>
          <strong>Once enabled, the guest list will be locked</strong> for offline
          check-in consistency. You can still moderate media and view stats.
        </p>
      </div>

      {enableError && (
        <p className="text-sm text-danger">{enableError}</p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button variant="outline">Not yet</Button>
        <Button
          variant="navy"
          size="lg"
          className="ml-auto"
          disabled={!allPassed || enableMutation.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {enableMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Enabling…
            </>
          ) : (
            <>
              <ShieldCheck className="text-champagne" />
              Enable Event Mode
            </>
          )}
        </Button>
      </div>
      {!allPassed && !readinessQuery.isLoading && (
        <p className="text-xs text-muted-foreground">
          Complete all checklist items above to enable Event Mode.
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Enable Event Mode?"
        description="This will lock your guest list and create an offline snapshot for check-in. You will not be able to add or edit guests after this point. This cannot be undone."
        confirmLabel="Enable Event Mode"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmOpen(false)
          enableMutation.mutate()
        }}
      />
    </div>
  )
}

function EventCommandCenter({ status }: { status: EventDayStatusDTO }) {
  const { checkinStats, staffDevices, snapshot } = status
  const activeDevices = staffDevices.filter((d) => d.status === "ACTIVE")
  const checkinPct =
    checkinStats.total > 0
      ? Math.round((checkinStats.checkedIn / checkinStats.total) * 100)
      : 0

  return (
    <div className="space-y-5" style={{ maxWidth: 760 }}>
      <PageHeader
        title="Event Day Command Center"
        description="Event Mode is active. Monitor your check-in progress and staff devices below."
      />

      {/* Navy active-state hero */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6"
        style={{ background: "#172033" }}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-5"
          style={{ opacity: 0.08 }}
        >
          <WMarkWatermark size={180} />
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" />
          <div>
            <p className="font-semibold text-white">Event Mode is active</p>
            <p className="mt-0.5 text-sm text-white/60">
              Guest list is locked for offline check-in consistency.
            </p>
          </div>
        </div>
        {snapshot && (
          <div className="mt-5 flex flex-wrap gap-4">
            {[
              ["Snapshot", `v${snapshot.version}`],
              ["Guests in snapshot", snapshot.guestCount.toLocaleString()],
              [
                "Created",
                new Date(snapshot.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  {label}
                </p>
                <p className="mt-1 font-bold tabular-nums text-white">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-in progress */}
      <div className="overflow-hidden rounded-2xl border border-[#efeae0] bg-white shadow-card">
        <div className="px-6 pt-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#97a0b2]">
            Check-in progress
          </p>
        </div>
        <div className="px-6 pb-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <CheckinStatTile
              icon={<Users className="size-5" />}
              label="Total guests"
              value={checkinStats.total}
              tone="default"
            />
            <CheckinStatTile
              icon={<UserCheck className="size-5" />}
              label="Checked in"
              value={checkinStats.checkedIn}
              tone="success"
            />
            <CheckinStatTile
              icon={<Clock className="size-5" />}
              label="Pending"
              value={checkinStats.pending}
              tone="warning"
            />
          </div>
          {checkinStats.total > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-[#97a0b2]">
                <span>Progress</span>
                <span className="tabular-nums font-medium text-[#45506b]">
                  {checkinPct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2ECE0]">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${checkinPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff devices */}
      <SectionCard
        title="Staff Devices"
        description={`${activeDevices.length} active device${activeDevices.length !== 1 ? "s" : ""}`}
      >
        {staffDevices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff devices registered.</p>
        ) : (
          <div className="space-y-2">
            {staffDevices.map((device) => (
              <StaffDeviceStatusCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </SectionCard>

      <ManualDeskGuidance />
      <EmergencyInstructions />
    </div>
  )
}

const toneStyles = {
  default: {
    icon: "bg-navy/[.06] text-navy",
    value: "#172033",
  },
  success: {
    icon: "bg-success-light text-success",
    value: "#16A34A",
  },
  warning: {
    icon: "bg-warning-light text-warning",
    value: "#D97706",
  },
} as const

function CheckinStatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone: keyof typeof toneStyles
}) {
  const s = toneStyles[tone]
  return (
    <div className="rounded-xl border border-[#efeae0] bg-[#fcfaf6] p-4">
      <div
        className={`mb-3 flex size-9 items-center justify-center rounded-xl ${s.icon}`}
      >
        {icon}
      </div>
      <p
        className="text-[28px] font-bold tabular-nums leading-none"
        style={{ color: s.value }}
      >
        {value.toLocaleString()}
      </p>
      <p className="mt-1.5 text-[13px] font-medium text-[#97a0b2]">{label}</p>
    </div>
  )
}
