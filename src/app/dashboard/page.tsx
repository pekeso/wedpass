"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Plus, Heart, CalendarDays, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { useAuthStore } from "@/stores/auth-store"
import { listWeddings } from "@/lib/api/weddings-client"
import type { WeddingListItemDTO } from "@/modules/weddings/weddings.dto"
import type { WeddingStatus } from "@/generated/prisma/enums"

function weddingStatusBadge(status: WeddingStatus) {
  switch (status) {
    case "DRAFT":
      return <StatusBadge label="Draft" variant="neutral" />
    case "ACTIVE":
      return <StatusBadge label="Active" variant="info" />
    case "EVENT_MODE":
      return <StatusBadge label="Event Mode" variant="warning" />
    case "COMPLETED":
      return <StatusBadge label="Completed" variant="success" />
  }
}

function getDaysUntil(dateStr: string): number | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(dateStr)
  event.setHours(0, 0, 0, 0)
  const diff = Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 && diff <= 90 ? diff : null
}

function accentBarClass(status: WeddingStatus): string {
  switch (status) {
    case "ACTIVE":     return "bg-champagne"
    case "EVENT_MODE": return "bg-warning"
    case "COMPLETED":  return "bg-success"
    default:           return "bg-muted"
  }
}

function WeddingCard({ wedding }: { wedding: WeddingListItemDTO }) {
  const daysUntil = wedding.eventDate ? getDaysUntil(wedding.eventDate) : null
  const displayName = wedding.coupleNames ?? wedding.name

  return (
    <Link href={`/dashboard/wedding/${wedding.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-shadow hover:shadow-elevated cursor-pointer">
        <div className={`h-[3px] w-full ${accentBarClass(wedding.status)}`} />

        <div className="px-5 py-4 space-y-3">
          <div>
            <h2 className="font-display text-xl font-bold text-navy leading-tight line-clamp-1">
              {displayName}
            </h2>
            {wedding.coupleNames && wedding.name !== wedding.coupleNames && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{wedding.name}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {wedding.eventDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" />
                {new Date(wedding.eventDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {daysUntil !== null && (
                  <span className="font-medium" style={{ color: "var(--color-champagne-deep, #A8843F)" }}>
                    · in {daysUntil} day{daysUntil === 1 ? "" : "s"}
                  </span>
                )}
              </span>
            )}
            {wedding.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {wedding.location}
              </span>
            )}
          </div>

          <div className="flex justify-end">
            {weddingStatusBadge(wedding.status)}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["weddings"],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await listWeddings(accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  if (isLoading) return <LoadingState message="Loading your weddings..." />
  if (isError) return <ErrorState title="Failed to load weddings" description="Please refresh the page and try again." />

  const weddings = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Weddings"
        description="Manage your wedding events"
        primaryAction={
          <Button
            variant="navy"
            onClick={() => router.push("/dashboard/wedding/new")}
          >
            <Plus className="mr-2 size-4" />
            New Wedding
          </Button>
        }
      />

      {weddings.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-champagne/15">
            <Heart className="size-8 text-champagne" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">No weddings yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Each wedding is an offline-first event. Start with your guest list, then generate QR codes.
            </p>
          </div>
          <Button variant="navy" onClick={() => router.push("/dashboard/wedding/new")}>
            Create Wedding
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {weddings.map((wedding) => (
            <WeddingCard key={wedding.id} wedding={wedding} />
          ))}
        </div>
      )}
    </div>
  )
}
