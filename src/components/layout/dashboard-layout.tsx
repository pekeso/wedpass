import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  weddingId?: string
}

export function DashboardLayout({ children, weddingId }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex">
        <AppSidebar weddingId={weddingId} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader weddingId={weddingId} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
