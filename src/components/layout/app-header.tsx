"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatusBadge } from "@/components/shared/status-badge"
import { AppSidebar } from "@/components/layout/app-sidebar"
import type { StatusBadgeVariant } from "@/components/shared/status-badge"

type WeddingStatus = "DRAFT" | "ACTIVE" | "EVENT_MODE" | "COMPLETED"

const STATUS_LABELS: Record<WeddingStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  EVENT_MODE: "Event Mode",
  COMPLETED: "Completed",
}

const STATUS_VARIANTS: Record<WeddingStatus, StatusBadgeVariant> = {
  DRAFT: "neutral",
  ACTIVE: "info",
  EVENT_MODE: "warning",
  COMPLETED: "success",
}

export interface AppHeaderProps {
  weddingId?: string
  weddingName?: string
  weddingDate?: string
  status?: WeddingStatus
  userName?: string
}

export function AppHeader({
  weddingId,
  weddingName,
  weddingDate: _weddingDate,
  status,
  userName,
}: AppHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
        <SheetContent side="left" className="w-56 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AppSidebar weddingId={weddingId} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {weddingName && (
          <span className="truncate text-sm font-medium text-foreground">
            {weddingName}
          </span>
        )}
        {status && (
          <StatusBadge
            label={STATUS_LABELS[status]}
            variant={STATUS_VARIANTS[status]}
          />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {userName && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {userName}
          </span>
        )}
        <Button variant="ghost" size="sm">
          Sign out
        </Button>
      </div>
    </header>
  )
}
