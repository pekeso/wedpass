"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { useAuthStore } from "@/stores/auth-store"

export interface AppHeaderProps {
  weddingId?: string
}

export function AppHeader({ weddingId }: AppHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()

  function handleSignOut() {
    fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {})
    clearAuth()
    router.replace("/login")
  }

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

      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-2">
        {user?.fullName && (
          <span className="hidden text-sm text-muted-foreground sm:inline truncate max-w-[160px]">
            {user.fullName}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  )
}
