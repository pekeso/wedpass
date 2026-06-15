"use client"

import { use, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download, Printer, QrCode } from "lucide-react"
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
import { useTranslations } from "@/lib/i18n/use-translations"

interface PassColors {
  cardBg: string
  accentColor: string
  textColor: string
  qrColor: string
}

interface PassLabels {
  guestLabel: string
  seat: string
  allowedCount: (count: number) => string
  scanAtEntrance: string
  dateLocale: string
}

const PASS_PRESETS: Array<{ label: string } & PassColors> = [
  { label: "Classic Navy", cardBg: "#172033", accentColor: "#C8A45D", textColor: "#ffffff", qrColor: "#172033" },
  { label: "Ivory", cardBg: "#F9F5ED", accentColor: "#9C7A2E", textColor: "#1C1410", qrColor: "#1C1410" },
  { label: "Rose Dusk", cardBg: "#2D1215", accentColor: "#E8A098", textColor: "#FDF0EE", qrColor: "#2D1215" },
  { label: "Sage", cardBg: "#1A2820", accentColor: "#8FC49A", textColor: "#EEF6EF", qrColor: "#1A2820" },
]

const COLOR_FIELDS: { key: keyof PassColors; label: string }[] = [
  { key: "cardBg", label: "Background" },
  { key: "accentColor", label: "Accent" },
  { key: "textColor", label: "Text" },
  { key: "qrColor", label: "QR Code" },
]

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

// The W mark sits on a white QR background — pick the darker of cardBg/textColor
function makeWMarkDataUrl(cardBg: string, accentColor: string, textColor: string): string {
  const leftColor = isLightColor(cardBg) ? textColor : cardBg
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 96"><rect width="100" height="96" fill="white" rx="10"/><g fill="none" stroke-width="13" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="20"><path d="M10,27 L31,90 L50,7" stroke="${leftColor}"/><path d="M50,7 L69,90 L90,27" stroke="${accentColor}"/></g></svg>`
  )}`
}

interface PassCardProps {
  guestName: string
  allowedCount: number
  tableName?: string | null
  seatNumber?: string | null
  isVip?: boolean
  coupleNames?: string | null
  eventDate?: string | null
  qrValue: string
  colors: PassColors
  labels: PassLabels
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
  colors,
  labels,
}: PassCardProps) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString(labels.dateLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null

  const wMarkDataUrl = makeWMarkDataUrl(colors.cardBg, colors.accentColor, colors.textColor)

  return (
    <div
      style={{
        width: 320,
        background: colors.cardBg,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(23,32,51,0.35)",
        color: colors.textColor,
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
          borderBottom: `1px dashed ${hexToRgba(colors.textColor, 0.18)}`,
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
                stroke={colors.textColor}
                clipPath="url(#pass-mark-l)"
              />
              <path
                d="M10,27 L31,90 L50,7 L69,90 L90,27"
                stroke={colors.accentColor}
                clipPath="url(#pass-mark-r)"
              />
            </g>
          </svg>
          <span style={{ fontWeight: 800, fontSize: 15 }}>
            Wed<span style={{ color: colors.accentColor }}>Pass</span>
          </span>
        </div>
        {isVip && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              background: colors.accentColor,
              color: colors.cardBg,
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
              color: hexToRgba(colors.accentColor, 0.75),
              fontWeight: 600,
            }}
          >
            {labels.guestLabel}
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              margin: "3px 0",
              lineHeight: 1.2,
              wordBreak: "break-word",
              color: colors.textColor,
            }}
          >
            {guestName}
          </div>
          {tableName && (
            <div style={{ fontSize: 12.5, color: hexToRgba(colors.textColor, 0.6) }}>
              {tableName}{seatNumber ? ` · ${labels.seat} ${seatNumber}` : ""}
            </div>
          )}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              background: hexToRgba(colors.textColor, 0.1),
              borderRadius: 999,
              padding: "5px 11px",
            }}
          >
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.accentColor}
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
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.textColor }}>
              {labels.allowedCount(allowedCount)}
            </span>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            padding: 7,
            borderRadius: 10,
            flexShrink: 0,
          }}
        >
          <QRCodeSVG
            value={qrValue}
            size={92}
            level="H"
            fgColor={colors.qrColor}
            bgColor="#ffffff"
            imageSettings={{
              src: wMarkDataUrl,
              width: 22,
              height: 21,
              excavate: true,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 20px",
          background: "rgba(0,0,0,.2)",
          fontSize: 11,
          color: hexToRgba(colors.textColor, 0.6),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)", fontStyle: "italic" }}>
          {coupleNames ?? "Wedding"}
          {formattedDate ? ` · ${formattedDate}` : ""}
        </span>
        <span>{labels.scanAtEntrance}</span>
      </div>
    </div>
  )
}

function GuestQrRow({
  guest,
  isLast,
  coupleNames,
  eventDate,
  passColors,
  passLabels,
}: {
  guest: GuestListItemDTO
  isLast: boolean
  coupleNames?: string | null
  eventDate?: string | null
  passColors: PassColors
  passLabels: PassLabels
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
          colors={passColors}
          labels={passLabels}
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
          {passLabels.allowedCount(guest.numberOfAllowedGuests)}
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
  const { t, language } = useTranslations()
  const previewPassCardRef = useRef<HTMLDivElement>(null)
  const [passColors, setPassColors] = useState<PassColors>(PASS_PRESETS[0])

  const passLabels: PassLabels = {
    guestLabel: t("pass.guestLabel"),
    seat: t("pass.seat"),
    allowedCount: (count: number) => t("pass.allowedCount", { count }),
    scanAtEntrance: t("pass.scanAtEntrance"),
    dateLocale: language === "fr" ? "fr-FR" : "en-US",
  }

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
        title={t("qrPage.title")}
        description={t("qrPage.description")}
        primaryAction={
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white" onClick={() => window.print()}>
              <Download className="mr-2 size-4" />
              {t("qrPage.downloadGuestPasses")}
            </Button>
            <Button variant="navy" onClick={() => window.print()}>
              <Download className="mr-2 size-4" style={{ color: "#C8A45D" }} />
              {t("qrPage.downloadAll")}
            </Button>
          </div>
        }
      />

      {guests.length === 0 ? (
        <EmptyState
          title={t("qrPage.noGuestsTitle")}
          description={t("qrPage.noGuestsDesc")}
          icon={<QrCode className="size-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          {/* Left — Pass preview + customization */}
          <div>
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("qrPage.passPreview")}
            </p>
            <div ref={previewPassCardRef} className="mb-4 inline-block">
              <GuestPassCard
                guestName={previewGuest?.fullName ?? t("pass.guestLabel")}
                allowedCount={previewGuest?.numberOfAllowedGuests ?? 2}
                tableName={previewGuest?.tableName}
                seatNumber={previewGuest?.seatNumber}
                coupleNames={wedding?.coupleNames}
                eventDate={wedding?.eventDate ?? null}
                qrValue={previewGuest?.qrToken ?? "wedpass-preview"}
                colors={passColors}
                labels={passLabels}
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
                {t("qrPage.print")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={handleDownloadPreviewPass}
              >
                <Download className="mr-1.5 size-[15px]" />
                {t("qrPage.downloadThisPass")}
              </Button>
            </div>

            {/* Color customization */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t("qrPage.customizeStyle")}
              </p>
              <div className="flex flex-wrap gap-2">
                {PASS_PRESETS.map((preset) => {
                  const isActive =
                    passColors.cardBg === preset.cardBg &&
                    passColors.accentColor === preset.accentColor &&
                    passColors.textColor === preset.textColor
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setPassColors(preset)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "border-navy bg-navy text-white"
                          : "border-border bg-white text-navy hover:border-navy/40"
                      }`}
                    >
                      <span className="flex gap-0.5">
                        <span
                          className="size-3 rounded-full border border-black/10"
                          style={{ background: preset.cardBg }}
                        />
                        <span
                          className="size-3 rounded-full border border-black/10"
                          style={{ background: preset.accentColor }}
                        />
                      </span>
                      {preset.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-5 pt-0.5">
                {COLOR_FIELDS.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer flex-col items-center gap-1.5"
                    title={`Change ${label.toLowerCase()} color`}
                  >
                    <div
                      className="relative size-8 overflow-hidden rounded-full border-2 border-border shadow-sm"
                      style={{ background: passColors[key] }}
                    >
                      <input
                        type="color"
                        value={passColors[key]}
                        onChange={(e) =>
                          setPassColors((c) => ({ ...c, [key]: e.target.value }))
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>
                    <span className="text-[10px] leading-none text-muted-foreground">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-3 flex gap-2.5 rounded-xl bg-sync-light p-3.5">
              <QrCode className="mt-0.5 size-[18px] shrink-0" style={{ color: "#1d4ed8" }} />
              <p className="text-[13px] leading-[1.45]" style={{ color: "#1e40af" }}>
                {t("qrPage.qrInfo")}
              </p>
            </div>
          </div>

          {/* Right — All guests */}
          <div>
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("qrPage.allGuests")}
            </p>
            <div className="overflow-hidden rounded-lg border bg-card">
              {guests.map((guest, i) => (
                <GuestQrRow
                  key={guest.id}
                  guest={guest}
                  isLast={i === guests.length - 1}
                  coupleNames={wedding?.coupleNames}
                  eventDate={wedding?.eventDate ?? null}
                  passColors={passColors}
                  passLabels={passLabels}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
