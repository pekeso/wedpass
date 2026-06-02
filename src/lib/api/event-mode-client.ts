import type { ReadinessResult, EventDayStatusDTO } from "@/modules/weddings/event-mode.service"

const BASE = "/api/v1"

export type SnapshotDTO = {
  id: string
  version: number
  guestCount: number
  createdAt: string
}

export type EnableEventModeResponseData = {
  weddingId: string
  status: "EVENT_MODE"
  snapshot: SnapshotDTO
}

export async function getEventModeReadiness(
  weddingId: string,
  accessToken: string
): Promise<ReadinessResult> {
  const res = await fetch(`${BASE}/weddings/${weddingId}/event-mode/readiness`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to get readiness")
  return json.data as ReadinessResult
}

export async function enableEventMode(
  weddingId: string,
  accessToken: string
): Promise<EnableEventModeResponseData> {
  const res = await fetch(`${BASE}/weddings/${weddingId}/event-mode/enable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ confirmGuestListLock: true }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to enable Event Mode")
  return json.data as EnableEventModeResponseData
}

export async function getActiveSnapshot(
  weddingId: string,
  accessToken: string
): Promise<SnapshotDTO | null> {
  const res = await fetch(`${BASE}/weddings/${weddingId}/snapshot/active`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 404) return null
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to get snapshot")
  return (json.data as { snapshot: SnapshotDTO }).snapshot
}

export async function getEventDayStatus(
  weddingId: string,
  accessToken: string
): Promise<EventDayStatusDTO> {
  const res = await fetch(`${BASE}/weddings/${weddingId}/event-day-status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to get event day status")
  return json.data as EventDayStatusDTO
}
