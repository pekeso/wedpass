import { SectionCard } from "@/components/shared/section-card"
import { AlertTriangle } from "lucide-react"

const STEPS = [
  "If a device crashes, open the staff check-in URL on any other device and download the snapshot again.",
  "All local check-ins from the crashed device were already queued — they will sync when the device recovers.",
  "If no replacement device is available, use a paper register as backup and enter check-ins manually after the event.",
  "Do not refresh or close the check-in browser tab while offline — it will preserve your local check-in data.",
  "When internet returns, the sync will happen automatically. Look for the green sync status.",
]

export function EmergencyInstructions() {
  return (
    <SectionCard title="Emergency Instructions">
      <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 mb-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <p className="text-sm font-medium text-foreground">
          Keep this visible for staff on event day
        </p>
      </div>
      <ol className="space-y-2">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {i + 1}
            </span>
            <span className="text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
