import { z } from "zod"

export const createWeddingSchema = z.object({
  name: z.string().min(2),
  coupleNames: z.string().optional(),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
})

export const updateWeddingSchema = createWeddingSchema.partial().extend({
  galleryEnabled: z.boolean().optional(),
})

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>
