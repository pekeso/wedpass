import { offlineDb } from "../db"
import { getOrCreateDeviceId, setMetadata } from "../metadata"

const STAFF_TOKEN_KEY = (weddingId: string) => `wedpass-staff-token-${weddingId}`

type SnapshotGuestFromAPI = {
  guestId: string
  snapshotId: string
  snapshotVersion: number
  fullName: string
  phoneNumber?: string
  email?: string
  qrToken: string
  allowedGuests: number
  tableName: string
  seatNumber?: string
}

type SnapshotAPIResponse = {
  wedding: { id: string; name: string; coupleNames: string | null; eventDate: string | null }
  snapshot: { id: string; version: number; guestCount: number }
  staffDeviceId: string
  guests: SnapshotGuestFromAPI[]
}

export type SnapshotDownloadResult = {
  guestCount: number
  snapshotId: string
  snapshotVersion: number
}

export async function downloadAndSaveSnapshot(
  weddingId: string
): Promise<SnapshotDownloadResult> {
  const staffToken = localStorage.getItem(STAFF_TOKEN_KEY(weddingId))
  if (!staffToken) {
    throw new Error("No staff token found. Please log in again.")
  }

  const res = await fetch(`/api/v1/staff/weddings/${weddingId}/snapshot`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  })

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new Error(json?.error?.message ?? "Failed to download offline pack")
  }

  const json = await res.json()
  const { wedding, snapshot, guests, staffDeviceId } = json.data as SnapshotAPIResponse

  const deviceId = await getOrCreateDeviceId()

  await offlineDb.transaction("rw", offlineDb.guests, offlineDb.metadata, async () => {
    await offlineDb.guests.where("weddingId").equals(weddingId).delete()

    await offlineDb.guests.bulkAdd(
      guests.map((g) => ({
        guestId: g.guestId,
        weddingId,
        snapshotId: snapshot.id,
        snapshotVersion: snapshot.version,
        fullName: g.fullName,
        phoneNumber: g.phoneNumber,
        email: g.email,
        qrToken: g.qrToken,
        allowedGuests: g.allowedGuests,
        tableName: g.tableName,
        seatNumber: g.seatNumber,
        checkedIn: false,
      }))
    )

    await setMetadata("deviceId", deviceId)
    await setMetadata("weddingId", weddingId)
    await setMetadata("snapshotId", snapshot.id)
    await setMetadata("snapshotVersion", String(snapshot.version))
    await setMetadata("staffDeviceId", staffDeviceId)
    await setMetadata("lastSnapshotDownloadedAt", new Date().toISOString())
    await setMetadata("guestCount", String(guests.length))
    await setMetadata("weddingName", wedding.name)
    if (wedding.coupleNames) await setMetadata("weddingCoupleNames", wedding.coupleNames)
    if (wedding.eventDate) await setMetadata("weddingEventDate", wedding.eventDate)
  })

  return {
    guestCount: guests.length,
    snapshotId: snapshot.id,
    snapshotVersion: snapshot.version,
  }
}
