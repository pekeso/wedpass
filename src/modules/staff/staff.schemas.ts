import { z } from "zod"

export const createStaffDeviceSchema = z.object({
  label: z.string().min(1).max(100),
})

export type CreateStaffDeviceInput = z.infer<typeof createStaffDeviceSchema>
