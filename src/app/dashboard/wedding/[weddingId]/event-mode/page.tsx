"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, XCircle, AlertTriangle, CalendarCheck, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  getEventModeReadiness,
  enableEventMode,
  getActiveSnapshot,
} from "@/lib/api/event-mode-client"
import type { ReadinessCheck } from "@/modules/weddings/event-mode.service"
import type { SnapshotDTO } from "@/lib/api/event-mode-client"

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

  const readinessQuery = useQuery({
    queryKey: ["event-mode-readiness", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return getEventModeReadiness(weddingId, accessToken)
    },
    enabled: !!accessToken,
    refetchInterval: 10_000,
  })

  const snapshotQuery = useQuery({
    queryKey: ["active-snapshot", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return getActiveSnapshot(weddingId, accessToken)
    },
    enabled: !!accessToken,
  })

  const enableMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      return enableEventMode(weddingId, accessToken)
    },
    onSuccess: () => {
      setEnableError(null)
      void queryClient.invalidateQueries({ queryKey: ["event-mode-readiness", weddingId] })
      void queryClient.invalidateQueries({ queryKey: ["active-snapshot", weddingId] })
      void queryClient.invalidateQueries({ queryKey: ["wedding", weddingId] })
    },
    onError: (err) => {
      setEnableError(err instanceof Error ? err.message : "Failed to enable Event Mode")
    },
  })

  if (readinessQuery.isLoading || snapshotQuery.isLoading) {
    return <LoadingState message="Loading Event Mode status..." />
  }

  if (readinessQuery.isError) {
    return (
      <ErrorState title="Failed to load readiness" description="Please refresh and try again." />
    )
  }

  const snapshot = snapshotQuery.data as SnapshotDTO | null | undefined
  const isEventModeActive = !!snapshot

  if (isEventModeActive && snapshot) {
    return <EventModeActiveState snapshot={snapshot} />
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
            <ReadinessItem key={check.key} check={check} />
          ))}
          {checks.length === 0 && (
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

function ReadinessItem({ check }: { check: ReadinessCheck }) {
  return (
    <div className="flex items-center gap-3">
      {check.passed ? (
        <CheckCircle2 className="size-5 shrink-0 text-success" />
      ) : (
        <XCircle className="size-5 shrink-0 text-danger" />
      )}
      <span
        className={`text-sm ${check.passed ? "text-foreground" : "text-muted-foreground"}`}
      >
        {check.label}
      </span>
      <StatusBadge
        label={check.passed ? "Ready" : "Not ready"}
        variant={check.passed ? "success" : "warning"}
      />
    </div>
  )
}

function EventModeActiveState({ snapshot }: { snapshot: SnapshotDTO }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Mode"
        description="Event Mode is active. Your guest list is locked and the offline snapshot is ready."
      />

      <SectionCard title="Snapshot Created">
        <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">Event Mode is active</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A snapshot of your guest list has been created. Staff devices can now download the
              offline check-in data.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SnapshotStat label="Snapshot version" value={`v${snapshot.version}`} />
          <SnapshotStat label="Guests in snapshot" value={snapshot.guestCount.toString()} />
          <SnapshotStat
            label="Created"
            value={new Date(snapshot.createdAt).toLocaleDateString()}
          />
        </div>
      </SectionCard>

      <SectionCard title="Next Steps">
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            Go to <strong>Staff Devices</strong> and ensure all check-in devices have active access
            tokens.
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            On each staff device, open the staff check-in URL and download the offline guest
            snapshot.
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            Staff devices can check in guests offline. Syncing happens automatically when internet
            is available.
          </li>
        </ol>
      </SectionCard>
    </div>
  )
}

function SnapshotStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}
