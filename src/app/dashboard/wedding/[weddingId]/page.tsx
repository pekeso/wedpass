"use client"

import Link from "next/link"
import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { Users, QrCode, Camera, CalendarDays, MapPin, Settings, CheckSquare, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { useAuthStore } from "@/stores/auth-store"
import { getWedding } from "@/lib/api/weddings-client"
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

const NAV_LINKS = [
  { href: "guests", label: "Guests", icon: Users, description: "Manage guest list" },
  { href: "qr-codes", label: "QR Codes", icon: QrCode, description: "Download QR codes" },
  { href: "event-mode", label: "Event Mode", icon: CheckSquare, description: "Prepare for event day" },
  { href: "staff", label: "Staff", icon: UserCheck, description: "Manage staff access" },
  { href: "checkins", label: "Check-ins", icon: CalendarDays, description: "View check-in activity" },
  { href: "gallery", label: "Gallery", icon: Camera, description: "Moderate media uploads" },
  { href: "settings", label: "Settings", icon: Settings, description: "Wedding settings" },
]

export default function WeddingOverviewPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wedding", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await getWedding(weddingId, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  if (isLoading) return <LoadingState message="Loading wedding..." />
  if (isError)
    return <ErrorState title="Failed to load wedding" description="Please refresh and try again." />

  const wedding = data?.wedding

  if (!wedding) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title={wedding.name}
        description={wedding.coupleNames ?? undefined}
        primaryAction={
          <Link href={`/dashboard/wedding/${weddingId}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 size-4" />
              Settings
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        {weddingStatusBadge(wedding.status)}
        {wedding.eventDate && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {new Date(wedding.eventDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        {wedding.location && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {wedding.location}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Guests" value={0} icon={<Users className="size-4" />} />
        <StatCard title="Checked In" value={0} variant="success" icon={<CheckSquare className="size-4" />} />
        <StatCard title="Media Uploads" value={0} icon={<Camera className="size-4" />} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {NAV_LINKS.map(({ href, label, icon: Icon, description }) => (
          <Link key={href} href={`/dashboard/wedding/${weddingId}/${href}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-navy/10">
                    <Icon className="size-4 text-navy" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
