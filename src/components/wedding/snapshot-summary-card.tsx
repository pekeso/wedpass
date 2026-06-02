import { SectionCard } from "@/components/shared/section-card"
import { CheckCircle2 } from "lucide-react"
import type { EventDayStatusDTO } from "@/modules/weddings/event-mode.service"

type Snapshot = NonNullable<EventDayStatusDTO["snapshot"]>

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function SnapshotSummaryCard({ snapshot }: { snapshot: Snapshot }) {
  return (
    <SectionCard title="Snapshot">
      <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 p-3 mb-4">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
        <p className="text-sm text-foreground">Guest list is locked. Offline snapshot is active.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Snapshot version" value={`v${snapshot.version}`} />
        <Stat label="Guests in snapshot" value={snapshot.guestCount.toString()} />
        <Stat label="Created" value={new Date(snapshot.createdAt).toLocaleDateString()} />
      </div>
    </SectionCard>
  )
}
