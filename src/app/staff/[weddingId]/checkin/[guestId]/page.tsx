"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, ScanLine, Users } from "lucide-react"
import { SyncStatusBar } from "@/components/staff/sync-status-bar"
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export default function StaffCheckinGuestPage({
  params,
}: {
  params: Promise<{ weddingId: string; guestId: string }>
}) {
  const { weddingId, guestId } = use(params)
  const router = useRouter()
  const { isOnline, pendingCount, lastSyncedAt, syncState } = useSyncStatus(weddingId)
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
          prev ? { ...prev, checkedIn: true, checkedInAt: checkInResult.checkedInAt } : prev
        )
      }
      setResult(checkInResult)
      setView("result")
    } finally {
      setIsCheckingIn(false)
    }
  }

  const maskedPhone = guest?.phoneNumber ? `•••• ${guest.phoneNumber.slice(-4)}` : null

  return (
    <div style={{ background: "#FAF7F1", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        lastSyncedAt={lastSyncedAt}
        syncState={syncState}
      />

      {/* Loading */}
      {view === "loading" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 20 }}>
          <div style={{ width: 82, height: 82, borderRadius: "50%", background: "#F2ECE0" }} className="animate-pulse" />
          <div style={{ width: 180, height: 22, borderRadius: 8, background: "#F2ECE0" }} className="animate-pulse" />
          <div style={{ width: 140, height: 16, borderRadius: 8, background: "#F2ECE0" }} className="animate-pulse" />
        </div>
      )}

      {/* Not found */}
      {view === "not-found" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 22px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={32} color="#97a0b2" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, color: "#172033", marginBottom: 6, marginTop: 0 }}>
                {t("checkin.guestNotFound")}
              </p>
              <p style={{ fontSize: 13.5, color: "#6b7589", lineHeight: 1.5, margin: 0, maxWidth: 280 }}>
                {t("checkin.guestNotFoundDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/staff/${weddingId}/checkin`)}
            style={{ width: "100%", padding: "17px 24px", borderRadius: 16, background: "transparent", border: "1px solid #e7e1d6", color: "#172033", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
          >
            {t("checkin.backToCheckin")}
          </button>
        </div>
      )}

      {/* Confirmation */}
      {view === "confirmation" && guest && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 22px" }}>
          {/* QR verified badge */}
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: "#DCFCE7", color: "#15803d",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
              {t("checkin.qrVerified")}
            </span>
          </div>

          {/* Guest hero — centered */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 6 }}>
            {/* Avatar */}
            <div style={{
              width: 82, height: 82, borderRadius: "50%",
              background: "#172033", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 28, flexShrink: 0,
            }}>
              {getInitials(guest.fullName)}
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#172033", margin: "14px 0 2px", letterSpacing: "-0.01em" }}>
              {guest.fullName}
            </h1>

            {maskedPhone && (
              <div style={{ fontSize: 14, color: "#6b7589" }}>
                {t("checkin.phoneEnding")} {maskedPhone}
              </div>
            )}

            {/* Allowed guests pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1px solid #e7e1d6", borderRadius: 999,
              padding: "9px 16px", marginTop: 12,
            }}>
              <Users size={17} color="#A8843F" />
              <span style={{ fontWeight: 600, color: "#172033", fontSize: 14 }}>
                {guest.allowedGuests} {t("checkin.peopleAllowed")}
              </span>
            </div>

            {/* Table and seat pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1px solid #e7e1d6", borderRadius: 999,
              padding: "9px 16px", marginTop: 8,
            }}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#A8843F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
              </svg>
              <span style={{ fontWeight: 600, color: "#172033", fontSize: 14 }}>
                {guest.tableName}{guest.seatNumber ? ` · Seat ${guest.seatNumber}` : ""}
              </span>
            </div>

            {/* Status badge */}
            <div style={{ marginTop: 10 }}>
              {guest.checkedIn ? (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: "#FEF3C7", color: "#b45309",
                }}>
                  {t("checkin.alreadyCheckedIn")}
                </span>
              ) : (
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: "rgba(23,32,51,.06)", color: "#172033",
                }}>
                  {t("checkin.notYetCheckedIn")}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div>
            {guest.checkedIn ? (
              <button
                onClick={() => router.push(`/staff/${weddingId}/checkin`)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 9, padding: "20px 24px", borderRadius: 16, background: "#172033",
                  border: 0, color: "#fff", fontWeight: 700, fontSize: 18, minHeight: 60, cursor: "pointer",
                }}
              >
                {t("checkin.nextGuest")}
              </button>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 9, padding: "20px 24px", borderRadius: 16, background: "#172033",
                  border: 0, color: "#fff", fontWeight: 700, fontSize: 18, minHeight: 60,
                  cursor: isCheckingIn ? "not-allowed" : "pointer",
                  opacity: isCheckingIn ? 0.7 : 1,
                }}
              >
                <Check size={22} strokeWidth={3} color="#C8A45D" />
                {isCheckingIn ? t("guestCard.checkingIn") : t("guestCard.checkInGuest")}
              </button>
            )}
            <button
              onClick={() => router.back()}
              style={{
                marginTop: 10, width: "100%", padding: "17px 24px", borderRadius: 16,
                background: "transparent", border: "1px solid #e7e1d6", color: "#172033",
                fontWeight: 600, fontSize: 15, cursor: "pointer",
              }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {view === "result" && result && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 22px" }}>
          {result.status === "checked_in_locally" ? (
            <>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <div style={{
                  width: 96, height: 96, borderRadius: "50%", background: "#DCFCE7", color: "#15803d",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
                }}>
                  <Check size={52} strokeWidth={3} />
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#172033", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                  {t("checkin.isIn", { firstName: guest?.fullName.split(" ")[0] ?? "" })}
                </h1>
                <p style={{ fontSize: 14.5, color: "#45506b", margin: "0 28px", lineHeight: 1.5 }}>
                  {t("checkin.savedLocally")}
                </p>
                <div style={{ marginTop: 14, fontSize: 13, color: "#97a0b2", fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(result.checkedInAt)} · {guest?.allowedGuests} {t("checkin.guests")}
                </div>
              </div>
              <div>
                <button
                  onClick={() => router.push(`/staff/${weddingId}/scan`)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 9, padding: "20px 24px", borderRadius: 16, background: "#C8A45D",
                    border: 0, color: "#172033", fontWeight: 700, fontSize: 18, minHeight: 60, cursor: "pointer",
                  }}
                >
                  <ScanLine size={20} />
                  {t("checkin.continueScan")}
                </button>
                <button
                  onClick={() => router.push(`/staff/${weddingId}/checkin`)}
                  style={{
                    marginTop: 10, width: "100%", padding: "17px 24px", borderRadius: 16,
                    background: "transparent", border: "1px solid #e7e1d6", color: "#172033",
                    fontWeight: 600, fontSize: 15, cursor: "pointer",
                  }}
                >
                  {t("checkin.backToCheckin")}
                </button>
              </div>
            </>
          ) : result.status === "already_checked_in" ? (
            <>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", background: "#FEF3C7", color: "#b45309",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
                }}>
                  <AlertTriangle size={40} />
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#172033", margin: "0 0 6px" }}>
                  {guest?.fullName}
                </h1>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#b45309", margin: 0 }}>
                  {t("checkin.alreadyCheckedIn")}
                </p>
                <p style={{ fontSize: 13.5, color: "#6b7589", marginTop: 6 }}>
                  {t("checkin.originallyCheckedIn", { time: formatTime(result.checkedInAt) })}
                </p>
              </div>
              <button
                onClick={() => router.push(`/staff/${weddingId}/checkin`)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 9, padding: "20px 24px", borderRadius: 16, background: "#C8A45D",
                  border: 0, color: "#172033", fontWeight: 700, fontSize: 18, minHeight: 60, cursor: "pointer",
                }}
              >
                {t("checkin.nextGuest")}
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
