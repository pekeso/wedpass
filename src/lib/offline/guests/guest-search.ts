import { offlineDb } from "../db"
import type { LocalGuest } from "@/types/shared"

const MAX_RESULTS = 20

export async function searchGuests(
  weddingId: string,
  searchTerm: string
): Promise<LocalGuest[]> {
  if (!searchTerm.trim()) {
    return offlineDb.guests
      .where("weddingId")
      .equals(weddingId)
      .limit(MAX_RESULTS)
      .toArray()
  }

  const term = searchTerm.trim().toLowerCase()

  const all = await offlineDb.guests
    .where("weddingId")
    .equals(weddingId)
    .toArray()

  const results: LocalGuest[] = []
  for (const guest of all) {
    if (results.length >= MAX_RESULTS) break
    const nameMatch = guest.fullName.toLowerCase().startsWith(term)
    const phoneMatch = guest.phoneNumber?.startsWith(term) ?? false
    if (nameMatch || phoneMatch) {
      results.push(guest)
    }
  }
  return results
}
