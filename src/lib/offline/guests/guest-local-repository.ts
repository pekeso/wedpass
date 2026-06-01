import { offlineDb } from "../db"
import type { LocalGuest } from "@/types/shared"
import { searchGuests } from "./guest-search"

export async function findGuestByQrToken(
  weddingId: string,
  qrToken: string
): Promise<LocalGuest | undefined> {
  return offlineDb.guests
    .where("[weddingId+qrToken]")
    .equals([weddingId, qrToken])
    .first()
    .catch(() =>
      offlineDb.guests
        .where("qrToken")
        .equals(qrToken)
        .filter((g) => g.weddingId === weddingId)
        .first()
    )
}

export async function findGuestById(
  guestId: string
): Promise<LocalGuest | undefined> {
  return offlineDb.guests.get(guestId)
}

export { searchGuests }

export async function bulkSaveGuests(guests: LocalGuest[]): Promise<void> {
  await offlineDb.guests.bulkPut(guests)
}

export async function clearGuestsByWedding(weddingId: string): Promise<void> {
  await offlineDb.guests.where("weddingId").equals(weddingId).delete()
}

export async function updateGuestCheckedIn(
  guestId: string,
  checkedIn: boolean,
  checkedInAt?: string
): Promise<void> {
  await offlineDb.guests.update(guestId, { checkedIn, checkedInAt })
}
