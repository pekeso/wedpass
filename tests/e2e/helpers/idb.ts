import type { Page } from "@playwright/test"

/**
 * Injects a snapshot and guest list directly into the app's IndexedDB (wedpass_offline_db).
 * This bypasses the download API flow so offline tests can start immediately.
 */
export async function seedOfflineDb(
  page: Page,
  opts: {
    weddingId: string
    snapshotId: string
    snapshotVersion: number
    staffDeviceId: string
    staffToken: string
    deviceId: string
    guests: Array<{
      guestId: string
      fullName: string
      qrToken: string
      allowedGuests: number
      checkedIn?: boolean
      checkedInAt?: string
    }>
  }
) {
  await page.evaluate(
    async ({
      weddingId,
      snapshotId,
      snapshotVersion,
      staffDeviceId,
      staffToken,
      deviceId,
      guests,
    }) => {
      const DB_NAME = "wedpass_offline_db"
      const DB_VERSION = 1

      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains("guests")) {
            db.createObjectStore("guests", { keyPath: "guestId" })
          }
          if (!db.objectStoreNames.contains("checkinQueue")) {
            db.createObjectStore("checkinQueue", { keyPath: "queueId" })
          }
          if (!db.objectStoreNames.contains("metadata")) {
            db.createObjectStore("metadata", { keyPath: "key" })
          }
          if (!db.objectStoreNames.contains("mediaQueue")) {
            db.createObjectStore("mediaQueue", { keyPath: "uploadId" })
          }
        }
        req.onsuccess = async () => {
          const db = req.result
          const tx = db.transaction(["guests", "checkinQueue", "metadata"], "readwrite")
          const guestStore = tx.objectStore("guests")
          const metaStore = tx.objectStore("metadata")

          const now = new Date().toISOString()

          const metaItems = [
            { key: "weddingId", value: weddingId, updatedAt: now },
            { key: "snapshotId", value: snapshotId, updatedAt: now },
            { key: "snapshotVersion", value: String(snapshotVersion), updatedAt: now },
            { key: "deviceId", value: deviceId, updatedAt: now },
            { key: "staffDeviceId", value: staffDeviceId, updatedAt: now },
            { key: "lastSnapshotDownloadedAt", value: now, updatedAt: now },
            { key: "guestCount", value: String(guests.length), updatedAt: now },
          ]

          for (const item of metaItems) {
            metaStore.put(item)
          }

          for (const guest of guests) {
            guestStore.put({
              guestId: guest.guestId,
              weddingId,
              snapshotId,
              snapshotVersion,
              fullName: guest.fullName,
              qrToken: guest.qrToken,
              allowedGuests: guest.allowedGuests,
              checkedIn: guest.checkedIn ?? false,
              checkedInAt: guest.checkedInAt,
            })
          }

          tx.oncomplete = () => {
            db.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
        req.onerror = () => reject(req.error)
      })

      // Staff token lives in localStorage
      localStorage.setItem(`wedpass-staff-token-${weddingId}`, staffToken)
    },
    opts
  )
}

/**
 * Reads a guest record from IndexedDB and returns it.
 */
export async function getGuestFromDb(
  page: Page,
  guestId: string
): Promise<{ checkedIn: boolean; checkedInAt?: string } | null> {
  return page.evaluate(async (id) => {
    const DB_NAME = "wedpass_offline_db"
    return new Promise<{ checkedIn: boolean; checkedInAt?: string } | null>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME)
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction("guests", "readonly")
        const store = tx.objectStore("guests")
        const get = store.get(id)
        get.onsuccess = () => {
          db.close()
          resolve(get.result ?? null)
        }
        get.onerror = () => reject(get.error)
      }
      req.onerror = () => reject(req.error)
    })
  }, guestId)
}

/**
 * Reads all checkin queue items from IndexedDB.
 */
export async function getCheckinQueue(
  page: Page
): Promise<Array<{ queueId: string; synced: boolean; guestId: string }>> {
  return page.evaluate(async () => {
    const DB_NAME = "wedpass_offline_db"
    return new Promise<Array<{ queueId: string; synced: boolean; guestId: string }>>(
      (resolve, reject) => {
        const req = indexedDB.open(DB_NAME)
        req.onsuccess = () => {
          const db = req.result
          const tx = db.transaction("checkinQueue", "readonly")
          const store = tx.objectStore("checkinQueue")
          const getAll = store.getAll()
          getAll.onsuccess = () => {
            db.close()
            resolve(getAll.result)
          }
          getAll.onerror = () => reject(getAll.error)
        }
        req.onerror = () => reject(req.error)
      }
    )
  })
}

/**
 * Reads a metadata value from IndexedDB.
 */
export async function getMetadataFromDb(
  page: Page,
  key: string
): Promise<string | undefined> {
  return page.evaluate(
    async (k) => {
      const DB_NAME = "wedpass_offline_db"
      return new Promise<string | undefined>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME)
        req.onsuccess = () => {
          const db = req.result
          const tx = db.transaction("metadata", "readonly")
          const store = tx.objectStore("metadata")
          const get = store.get(k)
          get.onsuccess = () => {
            db.close()
            resolve(get.result?.value)
          }
          get.onerror = () => reject(get.error)
        }
        req.onerror = () => reject(req.error)
      })
    },
    key
  )
}
