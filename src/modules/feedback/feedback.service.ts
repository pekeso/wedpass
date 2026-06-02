import { findWeddingById } from "@/modules/weddings/weddings.repository"
import { createFeedback } from "./feedback.repository"
import type { SubmitFeedbackInput } from "./feedback.schemas"

export class FeedbackWeddingNotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("Wedding not found")
    this.name = "FeedbackWeddingNotFoundError"
  }
}

export class FeedbackForbiddenError extends Error {
  readonly code = "FORBIDDEN"
  constructor() {
    super("You do not have access to this wedding")
    this.name = "FeedbackForbiddenError"
  }
}

export async function submitFeedback(
  weddingId: string,
  organizerId: string,
  input: SubmitFeedbackInput
): Promise<{ feedbackId: string }> {
  const wedding = await findWeddingById(weddingId)
  if (!wedding) throw new FeedbackWeddingNotFoundError()
  if (wedding.organizerId !== organizerId) throw new FeedbackForbiddenError()

  const feedback = await createFeedback(weddingId, organizerId, input)
  return { feedbackId: feedback.id }
}
