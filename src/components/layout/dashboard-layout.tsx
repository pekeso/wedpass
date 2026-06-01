import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"

type WeddingStatus = "DRAFT" | "ACTIVE" | "EVENT_MODE" | "COMPLETED"

interface DashboardLayoutProps {
  children: React.ReactNode
  weddingId?: string
  weddingName?: string
  weddingDate?: string
  status?: WeddingStatus
  userName?: string
}

export function DashboardLayout({
  children,
  weddingId,
  weddingName,
  weddingDate,
  status,
  userName,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex">
        <AppSidebar weddingId={weddingId} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          weddingId={weddingId}
          weddingName={weddingName}
          weddingDate={weddingDate}
          status={status}
          userName={userName}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
