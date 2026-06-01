"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Plus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
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

function WeddingCard({ wedding }: { wedding: WeddingListItemDTO }) {
  return (
    <Link href={`/dashboard/wedding/${wedding.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
              {wedding.name}
            </CardTitle>
            {weddingStatusBadge(wedding.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {wedding.coupleNames && (
            <p className="text-sm text-muted-foreground">{wedding.coupleNames}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {wedding.eventDate && <span>{new Date(wedding.eventDate).toLocaleDateString()}</span>}
            {wedding.location && <span>{wedding.location}</span>}
          </div>
        </CardContent>
      </Card>
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
            onClick={() => router.push("/dashboard/wedding/new")}
            className="bg-navy hover:bg-navy/90"
          >
            <Plus className="mr-2 size-4" />
            New Wedding
          </Button>
        }
      />

      {weddings.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="No weddings yet"
          description="Create your first wedding to get started with guest management and check-in."
          actionLabel="Create Wedding"
          onAction={() => router.push("/dashboard/wedding/new")}
        />
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
