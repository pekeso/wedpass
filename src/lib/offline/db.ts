import Dexie, { Table } from "dexie"
import type {
  LocalGuest,
  LocalCheckinQueueItem,
  LocalMetadata,
  LocalMediaUpload,
} from "@/types/shared"

export class WedPassOfflineDB extends Dexie {
  guests!: Table<LocalGuest, string>
  checkinQueue!: Table<LocalCheckinQueueItem, string>
  metadata!: Table<LocalMetadata, string>
  mediaQueue!: Table<LocalMediaUpload, string>

  constructor() {
    super("wedpass_offline_db")

    this.version(1).stores({
      guests:
        "guestId, weddingId, snapshotId, qrToken, fullName, phoneNumber, checkedIn",
      checkinQueue: "queueId, weddingId, guestId, synced, createdAt",
      metadata: "key",
      mediaQueue: "uploadId, weddingId, weddingSlug, uploadStatus, createdAt",
    })
  }
}

export const offlineDb = new WedPassOfflineDB()
