import { CheckCircle2, XCircle } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import type { ReadinessCheck } from "@/modules/weddings/event-mode.service"

export function EventReadinessCard({ check }: { check: ReadinessCheck }) {
  return (
    <div className="flex items-center gap-3">
      {check.passed ? (
        <CheckCircle2 className="size-5 shrink-0 text-success" />
      ) : (
        <XCircle className="size-5 shrink-0 text-danger" />
      )}
      <span className={`flex-1 text-sm ${check.passed ? "text-foreground" : "text-muted-foreground"}`}>
        {check.label}
      </span>
      <StatusBadge
        label={check.passed ? "Ready" : "Not ready"}
        variant={check.passed ? "success" : "warning"}
      />
    </div>
  )
}
