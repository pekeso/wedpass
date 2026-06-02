export type SyncItemStatus =
  | "ACCEPTED"
  | "DUPLICATE"
  | "REJECTED"
  | "INVALID_GUEST"
  | "SNAPSHOT_MISMATCH"
  | "ALREADY_PROCESSED"

export interface SyncItemResult {
  queueId: string
  guestId: string
  status: SyncItemStatus
  authoritativeCheckedInAt: string | null
}

export interface SyncSummary {
  accepted: number
  duplicate: number
  rejected: number
}

export interface SyncBatchResult {
  results: SyncItemResult[]
  summary: SyncSummary
}
