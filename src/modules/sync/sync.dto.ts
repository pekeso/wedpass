import type { SyncItemResult, SyncSummary } from "./sync.types"

export interface SyncResponseDTO {
  results: SyncItemResult[]
  summary: SyncSummary
}
