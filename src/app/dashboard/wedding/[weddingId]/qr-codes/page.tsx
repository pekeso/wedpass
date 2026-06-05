"use client"

import { use, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download, Info, Printer, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import { listGuests } from "@/lib/api/guests-client"
import { getWedding } from "@/lib/api/weddings-client"
import type { GuestListItemDTO } from "@/modules/guests/guests.dto"

interface PassCardProps {
  guestName: string
  allowedCount: number
  tableName?: string | null
  seatNumber?: string | null
  isVip?: boolean
  coupleNames?: string | null
  eventDate?: string | null
  qrValue: string
}

function GuestPassCard({
  guestName,
  allowedCount,
  tableName,
  seatNumber,
  isVip = false,
  coupleNames,
  eventDate,
  qrValue,
}: PassCardProps) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null

  return (
    <div
      style={{
        width: 320,
        background: "#172033",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(23,32,51,0.35)",
        color: "#fff",
        fontSize: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px dashed rgba(255,255,255,.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width={22} height={20} viewBox="0 0 100 96" aria-hidden="true">
            <defs>
              <clipPath id="pass-mark-l">
                <rect x="0" y="0" width="50" height="96" />
              </clipPath>
              <clipPath id="pass-mark-r">
                <rect x="50" y="0" width="50" height="96" />
              </clipPath>
            </defs>
            <g
              fill="none"
              strokeWidth={13}
              strokeLinejoin="miter"
              strokeLinecap="butt"
              strokeMiterlimit={20}
            >
              <path
                d="M10,27 L31,90 L50,7 L69,90 L90,27"
                stroke="#fff"
                clipPath="url(#pass-mark-l)"
              />
              <path
                d="M10,27 L31,90 L50,7 L69,90 L90,27"
                stroke="#C8A45D"
                clipPath="url(#pass-mark-r)"
              />
            </g>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 15 }}>
            Wed<span style={{ color: "#C8A45D" }}>Pass</span>
          </span>
        </div>
        {isVip && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              background: "#C8A45D",
              color: "#172033",
              padding: "4px 9px",
              borderRadius: 999,
            }}
          >
            VIP
          </span>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(200,164,93,0.65)",
              fontWeight: 600,
            }}
          >
            Guest
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              margin: "3px 0",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {guestName}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              background: "rgba(255,255,255,.1)",
              borderRadius: 999,
              padding: "5px 11px",
            }}
          >
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C8A45D"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
              <path d="M16 3.1a4 4 0 0 1 0 7.8" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {allowedCount} allowed
            </span>
          </div>

          {tableName && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 6,
                background: "rgba(255,255,255,.1)",
                borderRadius: 999,
                padding: "5px 11px",
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C8A45D"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {tableName}{seatNumber ? ` · Seat ${seatNumber}` : ""}
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            background: "#fff",
            padding: 7,
            borderRadius: 10,
            flexShrink: 0,
          }}
        >
          <QRCodeSVG value={qrValue} size={92} fgColor="#172033" bgColor="#ffffff" />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 20px",
          background: "rgba(0,0,0,.2)",
          fontSize: 11,
          color: "rgba(255,255,255,.55)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontStyle: "italic" }}>
          {coupleNames ?? "Wedding"}
          {formattedDate ? ` · ${formattedDate}` : ""}
        </span>
        <span>Scan at entrance</span>
      </div>
    </div>
  )
}

function GuestQrRow({
  guest,
  isLast,
  coupleNames,
  eventDate,
}: {
  guest: GuestListItemDTO
  isLast: boolean
  coupleNames?: string | null
  eventDate?: string | null
}) {
  async function handleDownload() {
    const { toPng } = await import("html-to-image")
    const { createRoot } = await import("react-dom/client")
    const { flushSync } = await import("react-dom")

    const container = document.createElement("div")
    container.style.cssText = "position:absolute;left:-9999px;top:0;width:320px"
    document.body.appendChild(container)

    const root = createRoot(container)
    flushSync(() => {
      root.render(
        <GuestPassCard
          guestName={guest.fullName}
          allowedCount={guest.numberOfAllowedGuests}
          tableName={guest.tableName}
          seatNumber={guest.seatNumber}
          coupleNames={coupleNames}
          eventDate={eventDate ?? null}
          qrValue={guest.qrToken}
        />,
      )
    })

    try {
      const card = container.firstChild as HTMLElement
      const dataUrl = await toPng(card, { pixelRatio: 2 })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${guest.fullName.replace(/\s+/g, "-").toLowerCase()}-pass.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } finally {
      root.unmount()
      document.body.removeChild(container)
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b border-border" : ""}`}
    >
      <div className="shrink-0 rounded-[7px] border border-border bg-white p-[3px]">
        <QRCodeSVG value={guest.qrToken} size={36} fgColor="#172033" bgColor="#ffffff" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-navy">{guest.fullName}</div>
        <div className="text-xs text-muted-foreground">
          {guest.numberOfAllowedGuests} allowed
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="rounded p-1 text-muted-foreground transition-colors hover:text-navy"
        title={`Download QR for ${guest.fullName}`}
      >
        <Download className="size-[17px]" />
      </button>
    </div>
  )
}

export default function QrCodesPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()
  const previewPassCardRef = useRef<HTMLDivElement>(null)

  const { data: weddingData } = useQuery({
    queryKey: ["wedding", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await getWedding(weddingId, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  const { data: guestsData, isLoading, isError } = useQuery({
    queryKey: ["guests", weddingId, "qr-page"],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await listGuests(weddingId, { pageSize: 200 }, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  const wedding = weddingData?.wedding
  const guests = guestsData?.items ?? []
  const previewGuest = guests[0]

  async function handleDownloadPreviewPass() {
    if (!previewPassCardRef.current) return
    const { toPng } = await import("html-to-image")
    const dataUrl = await toPng(previewPassCardRef.current, { pixelRatio: 2 })
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `${(previewGuest?.fullName ?? "guest").replace(/\s+/g, "-").toLowerCase()}-pass.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading) return <LoadingState message="Loading QR codes…" />
  if (isError)
    return (
      <ErrorState
        title="Failed to load QR codes"
        description="Please refresh and try again."
      />
    )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Passes & QR Codes"
        description="Download, print, and hand out guest passes"
        primaryAction={
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white" onClick={() => window.print()}>
              <Download className="mr-2 size-4" />
              Download Guest Passes
            </Button>
            <Button variant="navy" onClick={() => window.print()}>
              <Download className="mr-2 size-4" style={{ color: "#C8A45D" }} />
              Download All QR Codes
            </Button>
          </div>
        }
      />

      {guests.length === 0 ? (
        <EmptyState
          title="No guests yet"
          description="Add guests to your wedding to generate QR codes and passes."
          icon={<QrCode className="size-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          {/* Left — Pass preview */}
          <div>
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Pass preview
            </p>
            <div ref={previewPassCardRef} className="mb-4 inline-block">
              <GuestPassCard
                guestName={previewGuest?.fullName ?? "Guest Name"}
                allowedCount={previewGuest?.numberOfAllowedGuests ?? 2}
                tableName={previewGuest?.tableName}
                seatNumber={previewGuest?.seatNumber}
                coupleNames={wedding?.coupleNames}
                eventDate={wedding?.eventDate ?? null}
                qrValue={previewGuest?.qrToken ?? "wedpass-preview"}
              />
            </div>
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={() => window.print()}
              >
                <Printer className="mr-1.5 size-[15px]" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={handleDownloadPreviewPass}
              >
                <Download className="mr-1.5 size-[15px]" />
                Download this pass
              </Button>
            </div>
            <div className="mt-[18px] flex gap-2.5 rounded-xl bg-sync-light p-3.5">
              <Info className="mt-0.5 size-[18px] shrink-0 text-sync" />
              <p className="text-[13px] leading-[1.45] text-sync">
                QR codes are passes, not ID. They show the guest name and how many
                people are allowed — nothing more.
              </p>
            </div>
          </div>

          {/* Right — All guests */}
          <div>
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              All guests
            </p>
            <div className="overflow-hidden rounded-lg border bg-card">
              {guests.map((guest, i) => (
                <GuestQrRow
                  key={guest.id}
                  guest={guest}
                  isLast={i === guests.length - 1}
                  coupleNames={wedding?.coupleNames}
                  eventDate={wedding?.eventDate ?? null}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
