"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Smartphone } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-champagne">
          Staff devices
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <DeviceList devices={data.items} />
        ) : (
          <EmptyDevices />
        )}
      </CardContent>
    </Card>
  )
}

function DeviceList({ devices }: { devices: StaffDeviceListItemDTO[] }) {
  const activeCount = devices.filter((d) => d.status === "ACTIVE").length
  const total = devices.length
  const allReady = activeCount === total

  return (
    <div className="space-y-3">
      <span
        className={[
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          allReady
            ? "bg-success-light text-success"
            : "bg-warning-light text-warning",
        ].join(" ")}
      >
        {activeCount} of {total} ready
      </span>
      <ul className="space-y-2">
        {devices.slice(0, 4).map((device) => (
          <DeviceRow key={device.id} device={device} />
        ))}
      </ul>
      <Link href="./staff" className="text-sm font-medium text-navy hover:underline">
        Manage devices →
      </Link>
    </div>
  )
}

function DeviceRow({ device }: { device: StaffDeviceListItemDTO }) {
  const isReady = device.status === "ACTIVE"

  return (
    <li className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ivory-dark">
        <Smartphone className="size-4 text-navy" />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {device.label ?? "Unnamed device"}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`text-xs ${isReady ? "text-success" : "text-muted-foreground"}`}>
          {isReady ? "Ready" : "Not prepared"}
        </span>
        <span
          className={`size-2 rounded-full ${isReady ? "bg-success" : "bg-muted-foreground"}`}
        />
      </div>
    </li>
  )
}

function EmptyDevices() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">No staff devices created yet.</p>
      <Link href="./staff" className="text-sm font-medium text-navy hover:underline">
        Add a device →
      </Link>
    </div>
  )
}
