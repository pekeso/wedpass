"use client"

interface DashboardSyncCardProps {
  checkedInGuests: number
  pendingGuests: number
  lastSyncAt: string | null
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

export function DashboardSyncCard({ checkedInGuests, pendingGuests, lastSyncAt }: DashboardSyncCardProps) {
  return (
    <div className="rounded-xl bg-navy p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-wider text-champagne">
        Sync status
      </p>
      <p className="mt-1 text-sm text-white/60">
        {lastSyncAt ? `Last sync ${formatRelativeTime(lastSyncAt)}` : "Never synced"}
      </p>
      <div className="mt-4 flex gap-6">
        <div>
          <p className="text-3xl font-bold text-white">{checkedInGuests}</p>
          <p className="mt-0.5 text-xs text-white/60">Synced</p>
        </div>
        <div>
          <p className={`text-3xl font-bold ${pendingGuests > 0 ? "text-champagne" : "text-white"}`}>
            {pendingGuests}
          </p>
          <p className="mt-0.5 text-xs text-white/60">Pending on devices</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-white/65">
        Some devices may have unsynced check-ins. Final numbers update after sync.
      </p>
    </div>
  )
}
