"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CalendarCheck, Loader2, Users, UserCheck, Clock } from "lucide-react"
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
import { EventReadinessCard } from "@/components/wedding/event-readiness-card"
import { StaffDeviceStatusCard } from "@/components/staff/staff-device-status-card"
import { SnapshotSummaryCard } from "@/components/wedding/snapshot-summary-card"
import { ManualDeskGuidance } from "@/components/wedding/manual-desk-guidance"
import { EmergencyInstructions } from "@/components/wedding/emergency-instructions"
import type { EventDayStatusDTO } from "@/modules/weddings/event-mode.service"

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
    <div className="space-y-6">
      <PageHeader
        title="Event Mode"
        description="Enable Event Mode to lock your guest list and create the offline check-in snapshot."
      />

      <SectionCard title="Readiness Checklist">
        <div className="space-y-3">
          {checks.map((check) => (
            <EventReadinessCard key={check.key} check={check} />
          ))}
          {checks.length === 0 && readinessQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading checklist...</p>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Enabling Event Mode locks your guest list
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once enabled, you will not be able to add, edit, or remove guests. A snapshot of
              your current guest list will be created for offline check-in. This action cannot be
              undone.
            </p>
          </div>
        </div>

        {enableError && (
          <p className="mt-3 text-sm text-danger">{enableError}</p>
        )}

        <div className="mt-4">
          <Button
            variant="navy"
            size="lg"
            disabled={!allPassed || enableMutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {enableMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <CalendarCheck />
                Enable Event Mode
              </>
            )}
          </Button>
          {!allPassed && (
            <p className="mt-2 text-xs text-muted-foreground">
              Complete all checklist items above to enable Event Mode.
            </p>
          )}
        </div>
      </SectionCard>

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Day Command Center"
        description="Event Mode is active. Monitor your check-in progress and staff device status below."
      />

      {snapshot && <SnapshotSummaryCard snapshot={snapshot} />}

      <SectionCard title="Check-in Progress">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Users className="size-5 text-muted-foreground" />}
            label="Total guests"
            value={checkinStats.total.toString()}
          />
          <StatCard
            icon={<UserCheck className="size-5 text-success" />}
            label="Checked in"
            value={checkinStats.checkedIn.toString()}
            valueClass="text-success"
          />
          <StatCard
            icon={<Clock className="size-5 text-warning" />}
            label="Pending"
            value={checkinStats.pending.toString()}
            valueClass="text-warning"
          />
        </div>
        {checkinStats.total > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {Math.round((checkinStats.checkedIn / checkinStats.total) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{
                  width: `${Math.round((checkinStats.checkedIn / checkinStats.total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </SectionCard>

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

function StatCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold ${valueClass ?? "text-foreground"}`}>{value}</p>
      </div>
    </div>
  )
}
