import { NextResponse } from "next/server"
import { z } from "zod"

const betaSignupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  country: z.string().min(2),
  weddingDate: z.string().optional(),
  estimatedGuests: z.coerce.number().int().min(1).optional(),
  role: z.enum(["Couple", "Planner", "Family organizer", "Other"]).optional(),
  preferredLanguage: z.enum(["English", "French", "Both"]).optional(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = betaSignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid submission." } },
      { status: 400 }
    )
  }
  // TODO: persist to database when BetaSignup model is added
  console.log("[beta-signup]", parsed.data)
  return NextResponse.json({ success: true, data: { message: "Beta request received." } })
}
