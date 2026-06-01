import { SyncStatusBar } from "@/components/staff/sync-status-bar"

interface StaffLayoutProps {
  children: React.ReactNode
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SyncStatusBar isOnline={true} pendingCount={0} syncState="idle" />
      <main className="flex-1">{children}</main>
    </div>
  )
}
