"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Smartphone } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { listStaffDevices } from "@/lib/api/staff-client"
import type { StaffDeviceListItemDTO } from "@/modules/staff/staff.dto"

interface DashboardStaffDevicesCardProps {
  weddingId: string
  accessToken: string
}

export function DashboardStaffDevicesCard({ weddingId, accessToken }: DashboardStaffDevicesCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-devices", weddingId],
    queryFn: () => listStaffDevices(weddingId, accessToken),
    enabled: !!accessToken,
  })

  const devices = data?.items ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-champagne">
            Staff devices
          </p>
          {!isLoading && devices.length > 0 && (
            <ReadinessBadge devices={devices} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[54px] w-full" />
            ))}
          </div>
        ) : devices.length > 0 ? (
          <DeviceList devices={devices} weddingId={weddingId} />
        ) : (
          <EmptyDevices weddingId={weddingId} />
        )}
      </CardContent>
    </Card>
  )
}

function ReadinessBadge({ devices }: { devices: StaffDeviceListItemDTO[] }) {
  const activeCount = devices.filter((d) => d.status === "ACTIVE").length
  const total = devices.length
  const allReady = activeCount === total

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        allReady ? "bg-success-light text-success" : "bg-warning-light text-warning",
      ].join(" ")}
    >
      <span className={`size-1.5 rounded-full ${allReady ? "bg-success" : "bg-warning"}`} />
      {activeCount} of {total} ready
    </span>
  )
}

function DeviceList({ devices, weddingId }: { devices: StaffDeviceListItemDTO[]; weddingId: string }) {
  return (
    <div>
      <ul>
        {devices.slice(0, 4).map((device, i) => (
          <DeviceRow key={device.id} device={device} isFirst={i === 0} />
        ))}
      </ul>
      <div className="mt-3">
        <Link href={`/dashboard/wedding/${weddingId}/staff`}>
          <Button variant="outline" size="sm" className="w-full">
            Manage devices
          </Button>
        </Link>
      </div>
    </div>
  )
}

function DeviceRow({ device, isFirst }: { device: StaffDeviceListItemDTO; isFirst: boolean }) {
  const isReady = device.status === "ACTIVE"
  const statusLabel = isReady ? "Offline pack ready" : "Not prepared"

  return (
    <li
      className={[
        "flex items-center gap-[11px] py-2.5",
        isFirst ? "" : "border-t border-ivory-dark",
      ].join(" ")}
    >
      <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-ivory-dark">
        <Smartphone className="size-[17px] text-navy/60" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold leading-tight text-foreground">
          {device.label ?? "Unnamed device"}
        </div>
        <div className={`mt-0.5 text-[12px] font-medium leading-tight ${isReady ? "text-success" : "text-muted-foreground"}`}>
          {statusLabel}
        </div>
      </div>
      <span className={`size-2 shrink-0 rounded-full ${isReady ? "bg-success" : "bg-muted-foreground"}`} />
    </li>
  )
}

function EmptyDevices({ weddingId }: { weddingId: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">No staff devices created yet.</p>
      <Link href={`/dashboard/wedding/${weddingId}/staff`}>
        <Button variant="outline" size="sm" className="w-full">
          Add a device
        </Button>
      </Link>
    </div>
  )
}
