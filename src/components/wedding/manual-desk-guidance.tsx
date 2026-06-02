import { SectionCard } from "@/components/shared/section-card"
import { Info } from "lucide-react"

const GUIDANCE_ITEMS = [
  {
    title: "If QR scan fails",
    detail: "Switch to Manual Search on the check-in screen. Search by full name.",
  },
  {
    title: "If guest is not found by name",
    detail: "Try searching by phone number. Check for spelling differences.",
  },
  {
    title: "If device loses power",
    detail: "Use another staff device to continue check-in. All data will sync later.",
  },
  {
    title: "If internet drops",
    detail: "Keep checking in — the app works fully offline. Sync happens automatically when connection returns.",
  },
]

export function ManualDeskGuidance() {
  return (
    <SectionCard title="Manual Desk Guidance">
      <div className="space-y-3">
        {GUIDANCE_ITEMS.map((item) => (
          <div key={item.title} className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-sync" />
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
