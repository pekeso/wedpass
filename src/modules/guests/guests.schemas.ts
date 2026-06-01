import { z } from "zod"

export const createGuestSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  numberOfAllowedGuests: z.number().int().min(1).max(20).default(1),
})

export const updateGuestSchema = createGuestSchema.partial()

export const listGuestsQuerySchema = z.object({
  search: z.string().optional(),
  checkedIn: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export type CreateGuestInput = z.infer<typeof createGuestSchema>
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>
export type ListGuestsQuery = z.infer<typeof listGuestsQuerySchema>
