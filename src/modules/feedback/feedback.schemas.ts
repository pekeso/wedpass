import { z } from "zod"

export const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(10),
  workedWell: z.string().max(2000).optional().or(z.literal("")),
  confusing: z.string().max(2000).optional().or(z.literal("")),
  offlineFeedback: z.string().max(2000).optional().or(z.literal("")),
  mediaFeedback: z.string().max(2000).optional().or(z.literal("")),
  generalComment: z.string().max(2000).optional().or(z.literal("")),
})

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>
