import { prisma } from "@/lib/db/prisma"
import type { SubmitFeedbackInput } from "./feedback.schemas"

export async function createFeedback(
  weddingId: string,
  userId: string,
  input: SubmitFeedbackInput
) {
  return prisma.betaFeedback.create({
    data: {
      weddingId,
      userId,
      rating: input.rating,
      workedWell: input.workedWell || null,
      confusing: input.confusing || null,
      offlineFeedback: input.offlineFeedback || null,
      mediaFeedback: input.mediaFeedback || null,
      generalComment: input.generalComment || null,
    },
  })
}
