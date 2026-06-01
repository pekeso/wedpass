"use client"

import { use, useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import { ArrowLeft, Camera, CameraOff, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import type { SyncState } from "@/components/staff/sync-status-bar"
import { ScannerFrame } from "@/components/staff/scanner-frame"
import { findGuestByQrToken } from "@/lib/offline/guests/guest-local-repository"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { offlineDb } from "@/lib/offline/db"

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

  function goToSearch() {
    router.push(`/staff/${weddingId}/search`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        syncState={syncState}
      />

      <div className="mx-auto w-full max-w-lg flex-1 space-y-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Scan QR Code</h1>
        </div>

        {status === "permission-denied" ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
            <CameraOff className="size-12 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Camera access denied</p>
              <p className="text-sm text-muted-foreground">
                Allow camera access in your browser settings, then refresh this
                page.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <ScannerFrame scannerId={SCANNER_ID} />
              {status === "initializing" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
                  <Camera className="size-10 animate-pulse text-white" />
                </div>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Point the camera at a guest&apos;s QR code
            </p>

            {status === "not-found" && (
              <div className="rounded-xl border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger">
                QR code not recognized. Please use manual search.
              </div>
            )}

            {status === "error" && (
              <div className="rounded-xl border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger">
                Camera unavailable. Please use manual search.
              </div>
            )}
          </>
        )}

        <Button
          variant="outline"
          onClick={goToSearch}
          className="h-14 w-full gap-2 text-base"
        >
          <Search className="size-4" />
          Search guest manually
        </Button>
      </div>
    </div>
  )
}
