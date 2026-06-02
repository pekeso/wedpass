import { z } from "zod"

export const syncCheckinItemSchema = z.object({
  queueId: z.string().min(1),
  guestId: z.string().uuid(),
  checkedInAt: z.string().datetime(),
})

export const syncPayloadSchema = z.object({
  snapshotId: z.string().uuid(),
  snapshotVersion: z.number().int(),
  deviceId: z.string().uuid(),
  checkins: z.array(syncCheckinItemSchema).max(100),
})

export type SyncCheckinItemInput = z.infer<typeof syncCheckinItemSchema>
export type SyncPayloadInput = z.infer<typeof syncPayloadSchema>
