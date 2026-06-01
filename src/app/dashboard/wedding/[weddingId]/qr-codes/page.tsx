"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { QrCode } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { GuestQrCode } from "@/components/guests/guest-qr-code"
import { useAuthStore } from "@/stores/auth-store"
import type { AllQrDataResponseDTO, QrDataItemDTO } from "@/modules/guests/guests.dto"
import type { ApiResponse } from "@/types/api"

export default function QrCodesPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["qr-codes", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await fetch(`/api/v1/weddings/${weddingId}/qr-codes`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const json: ApiResponse<AllQrDataResponseDTO> = await res.json()
      if (!json.success) throw new Error(json.error.message)
      return json.data
    },
    enabled: !!accessToken,
  })

  if (isLoading) return <LoadingState message="Loading QR codes…" />
  if (isError)
    return <ErrorState title="Failed to load QR codes" description="Please refresh and try again." />

  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Codes"
        description={items.length > 0 ? `${items.length} guest${items.length !== 1 ? "s" : ""}` : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No QR codes yet"
          description="Add guests to generate QR codes for event check-in."
          icon={<QrCode className="size-6" />}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item: QrDataItemDTO) => (
            <GuestQrCode
              key={item.guestId}
              guestId={item.guestId}
              fullName={item.fullName}
              qrPayload={item.qrPayload}
            />
          ))}
        </div>
      )}
    </div>
  )
}
