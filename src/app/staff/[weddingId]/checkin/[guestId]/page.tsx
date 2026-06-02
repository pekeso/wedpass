"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
import { GuestCheckinCard } from "@/components/staff/guest-checkin-card"
import { findGuestById } from "@/lib/offline/guests/guest-local-repository"
import { checkInGuestLocally } from "@/lib/offline/checkins/checkin-local-service"
import type { CheckInLocalResult } from "@/lib/offline/checkins/checkin-local-service"
import { useSyncStatus } from "@/hooks/use-sync-status"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { LocalGuest } from "@/types/shared"

type PageView = "loading" | "not-found" | "confirmation" | "result"

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function StaffCheckinGuestPage({
  params,
}: {
  params: Promise<{ weddingId: string; guestId: string }>
}) {
  const { weddingId, guestId } = use(params)
  const router = useRouter()
  const { isOnline, pendingCount, lastSyncedAt, syncState } =
    useSyncStatus(weddingId)
  const { t } = useTranslations()

  const [guest, setGuest] = useState<LocalGuest | null>(null)
  const [view, setView] = useState<PageView>("loading")
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [result, setResult] = useState<CheckInLocalResult | null>(null)

  useEffect(() => {
    findGuestById(guestId)
      .then((g) => {
        if (!g) {
          setView("not-found")
        } else {
          setGuest(g)
          setView("confirmation")
        }
      })
      .catch(() => setView("not-found"))
  }, [guestId])

  async function handleCheckIn() {
    if (!guest) return
    setIsCheckingIn(true)
    try {
      const checkInResult = await checkInGuestLocally(guestId)
      if (checkInResult.status === "checked_in_locally") {
        setGuest((prev) =>
          prev
            ? {
                ...prev,
                checkedIn: true,
                checkedInAt: checkInResult.checkedInAt,
              }
            : prev
        )
      }
      setResult(checkInResult)
      setView("result")
    } finally {
      setIsCheckingIn(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        lastSyncedAt={lastSyncedAt}
        syncState={syncState}
      />

      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-4">
        {view !== "result" && (
          <div className="mb-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
              className="shrink-0"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              {t("checkin.guestCheckinTitle")}
            </h1>
          </div>
        )}

        {view === "loading" && (
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          </div>
        )}

        {view === "not-found" && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
            <AlertTriangle className="size-12 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t("checkin.guestNotFound")}</p>
              <p className="text-sm text-muted-foreground">
                {t("checkin.guestNotFoundDesc")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/staff/${weddingId}/checkin`)}
              className="h-12 w-full"
            >
              {t("checkin.backToCheckin")}
            </Button>
          </div>
        )}

        {view === "confirmation" && guest && (
          <div className="space-y-4">
            <GuestCheckinCard
              guest={guest}
              onCheckIn={handleCheckIn}
              isLoading={isCheckingIn}
            />
            <button
              type="button"
              onClick={() => router.back()}
              className="block w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {t("checkin.wrongGuest")}
            </button>
          </div>
        )}

        {view === "result" && result && (
          <div className="flex flex-col items-center gap-6 pt-6 text-center">
            {result.status === "checked_in_locally" ? (
              <>
                <div className="flex size-20 items-center justify-center rounded-full bg-success-light">
                  <CheckCircle className="size-10 text-success" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    {guest?.fullName}
                  </p>
                  <p className="text-base font-semibold text-success">
                    {t("checkin.checkedInSuccessfully")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    at {formatTime(result.checkedInAt)}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    router.push(`/staff/${weddingId}/checkin`)
                  }
                  className="h-14 w-full rounded-2xl text-base font-semibold"
                >
                  {t("checkin.nextGuest")}
                </Button>
              </>
            ) : result.status === "already_checked_in" ? (
              <>
                <div className="flex size-20 items-center justify-center rounded-full bg-warning-light">
                  <AlertTriangle className="size-10 text-warning" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    {guest?.fullName}
                  </p>
                  <p className="text-base font-semibold text-warning">
                    {t("checkin.alreadyCheckedIn")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("checkin.originallyCheckedIn", { time: formatTime(result.checkedInAt) })}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    router.push(`/staff/${weddingId}/checkin`)
                  }
                  className="h-14 w-full rounded-2xl text-base font-semibold"
                >
                  {t("checkin.nextGuest")}
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
