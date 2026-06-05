"use client"

import { use, useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import { AlertTriangle, Camera, CameraOff, Search, X, Zap } from "lucide-react"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import type { SyncState } from "@/components/staff/sync-status-bar"
import { ScannerFrame } from "@/components/staff/scanner-frame"
import { findGuestByQrToken } from "@/lib/offline/guests/guest-local-repository"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { offlineDb } from "@/lib/offline/db"
import { useTranslations } from "@/lib/i18n/use-translations"

const SCANNER_ID = "wedpass-qr-scanner"
const SCAN_COOLDOWN_MS = 2000
const QR_PREFIX = "wedpass://checkin/"

type ScanStatus =
  | "initializing"
  | "scanning"
  | "found"
  | "not-found"
  | "permission-denied"
  | "error"

export default function StaffScanPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { isOnline } = useNetworkStatus()
  const [status, setStatus] = useState<ScanStatus>("initializing")
  const [pendingCount, setPendingCount] = useState(0)
  const { t } = useTranslations()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanTimeRef = useRef<number>(0)
  const isNavigatingRef = useRef(false)

  const syncState: SyncState = isOnline ? "idle" : "offline"

  useEffect(() => {
    offlineDb.checkinQueue
      .where("weddingId")
      .equals(weddingId)
      .filter((item) => !item.synced)
      .count()
      .then(setPendingCount)
      .catch(() => setPendingCount(0))
  }, [weddingId])

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      const now = Date.now()
      if (now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) return
      if (isNavigatingRef.current) return
      lastScanTimeRef.current = now

      if (!decodedText.startsWith(QR_PREFIX)) {
        setStatus("not-found")
        return
      }

      const token = decodedText.slice(QR_PREFIX.length).trim()
      if (!token) {
        setStatus("not-found")
        return
      }

      try {
        const guest = await findGuestByQrToken(weddingId, token)
        if (guest) {
          isNavigatingRef.current = true
          setStatus("found")
          await scannerRef.current?.stop()
          router.push(`/staff/${weddingId}/checkin/${guest.guestId}`)
        } else {
          setStatus("not-found")
        }
      } catch {
        setStatus("not-found")
      }
    },
    [weddingId, router]
  )

  useEffect(() => {
    let isMounted = true
    let hasStarted = false
    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10 },
        handleScanSuccess,
        () => {}
      )
      .then(() => {
        hasStarted = true
        if (isMounted) {
          setStatus("scanning")
        } else {
          scanner.stop().catch(() => {})
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const isDenied =
          (err instanceof DOMException && err.name === "NotAllowedError") ||
          String(err).toLowerCase().includes("permission")
        setStatus(isDenied ? "permission-denied" : "error")
      })

    return () => {
      isMounted = false
      if (hasStarted) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              scanner.clear()
            } catch {
              /* element already removed */
            }
          })
      } else {
        try {
          scanner.clear()
        } catch {
          /* ignore */
        }
      }
    }
  }, [handleScanSuccess])

  function goBack() {
    router.push(`/staff/${weddingId}/checkin`)
  }

  function goToSearch() {
    router.push(`/staff/${weddingId}/search`)
  }

  const showError = status === "not-found" || status === "error"
  const errorMessage =
    status === "not-found" ? t("scan.qrNotRecognized") : t("scan.cameraUnavailable")

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "#0b0e16", position: "relative" }}
    >
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        syncState={syncState}
      />

      {/* Camera area */}
      <div
        className="relative flex flex-1 items-center justify-center"
        style={{ background: "#0b0e16" }}
      >
        {/* Radial gradient atmosphere */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(255,255,255,.05), transparent 60%)",
          }}
        />

        {status === "permission-denied" ? (
          /* Permission denied state */
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <CameraOff className="size-12" style={{ color: "rgba(255,255,255,.4)" }} />
            <div className="space-y-1">
              <p className="font-semibold text-white">{t("scan.cameraAccessDenied")}</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,.6)" }}>
                {t("scan.cameraAccessDeniedDesc")}
              </p>
            </div>
          </div>
        ) : (
          /* Live camera + overlay */
          <ScannerFrame scannerId={SCANNER_ID} className="absolute inset-0" />
        )}

        {/* Initializing overlay */}
        {status === "initializing" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="size-10 animate-pulse text-white" />
          </div>
        )}

        {/* Hint text */}
        {status !== "permission-denied" && (
          <div
            className="pointer-events-none absolute left-0 right-0 text-center"
            style={{
              bottom: 100,
              color: "rgba(255,255,255,.8)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {t("scan.hint")}
          </div>
        )}

        {/* Flash button */}
        <button
          aria-label="Toggle flash"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,.12)",
            border: 0,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={20} />
        </button>
      </div>

      {/* Error banner */}
      {showError && (
        <div
          style={{
            background: "#3a1717",
            padding: "14px 18px",
            display: "flex",
            gap: 11,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={19} color="#f0a0a0" style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ color: "rgba(255,255,255,.9)", fontSize: 13, lineHeight: 1.4 }}>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div
        style={{
          padding: 16,
          background: "#0b0e16",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={goBack}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: 48,
            borderRadius: 12,
            background: "rgba(255,255,255,.1)",
            border: 0,
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <X size={17} />
          {t("common.cancel")}
        </button>
        <button
          onClick={goToSearch}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: 48,
            borderRadius: 12,
            background: "#C8A45D",
            border: 0,
            color: "#172033",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {t("scan.searchManually")}
          <Search size={16} />
        </button>
      </div>
    </div>
  )
}
