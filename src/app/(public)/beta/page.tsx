"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const betaSignupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  country: z.string().min(2),
  weddingDate: z.string().optional(),
  estimatedGuests: z.number().int().min(1).optional(),
  role: z.enum(["Couple", "Planner", "Family organizer", "Other"]).optional(),
  preferredLanguage: z.enum(["English", "French", "Both"]).optional(),
})

type BetaSignupFormData = z.infer<typeof betaSignupSchema>

function WMarkWhite({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.92)}
      viewBox="0 0 100 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10,27 L31,90 L50,7 L69,90 L90,27"
        fill="none"
        stroke="white"
        strokeWidth={13}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        strokeMiterlimit={20}
      />
    </svg>
  )
}

export default function BetaPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<BetaSignupFormData>({
    resolver: zodResolver(betaSignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      country: "",
      weddingDate: "",
      estimatedGuests: undefined,
      role: undefined,
      preferredLanguage: "Both",
    },
  })

  const { formState: { isSubmitting } } = form

  async function onSubmit(data: BetaSignupFormData) {
    setServerError(null)
    try {
      const res = await fetch("/api/v1/beta/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = (await res.json()) as { success: boolean; error?: { message: string } }
      if (!res.ok || !json.success) {
        setServerError(json.error?.message ?? "Something went wrong. Please try again.")
        return
      }
      setSubmittedEmail(data.email)
      setSubmitted(true)
    } catch {
      setServerError("Unable to submit. Please check your connection and try again.")
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12">
        <div className="space-y-4 text-center">
          <CheckCircle className="mx-auto size-12 text-success" />
          <h2 className="text-2xl font-bold text-navy">You&apos;re on the list!</h2>
          <p className="text-muted-foreground">
            We&apos;ll reach out to {submittedEmail} as we onboard new organizers.
          </p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[980px] overflow-hidden rounded-[18px] border border-[#e7e1d6] bg-white shadow-elevated">
        <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr]">

          {/* Left: Navy brand panel */}
          <div className="relative flex min-h-[320px] flex-col overflow-hidden bg-navy p-[38px] text-white">
            {/* Background W watermark */}
            <div className="pointer-events-none absolute -bottom-10 -right-[60px] opacity-[0.07]">
              <WMarkWhite size={280} />
            </div>

            {/* Wordmark */}
            <div className="relative flex items-center gap-[10px]">
              <WMarkWhite size={24} />
              <span
                className="text-[15.8px] font-extrabold tracking-[-0.01em] text-white"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Wed<span style={{ color: "var(--color-champagne)" }}>Pass</span>
              </span>
            </div>

            {/* Brand copy — pushed to bottom */}
            <div className="relative mt-auto pt-10">
              <h2 className="mb-4 font-display text-[30px] font-semibold leading-[1.2]">
                Your wedding, beautifully under control.
              </h2>
              <p className="text-[14.5px] leading-[1.55] text-white/65">
                Tell us a little about your day and we&apos;ll set you up with free beta access.
              </p>
              <div className="mt-[22px] flex flex-wrap gap-[7px]">
                {["Free during beta", "No card needed"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full px-[11px] py-[6px] text-[12px] font-semibold"
                    style={{ background: "rgba(255,255,255,0.10)" }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form panel */}
          <div className="p-[38px]">
            <h1 className="mb-1 text-[25px] font-bold text-navy">Join the free beta</h1>
            <p className="mb-6 text-[14px] text-[#6b7589]">Takes under a minute.</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-semibold text-[#45506b]">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-semibold text-[#45506b]">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-semibold text-[#45506b]">
                          Country
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Ghana" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weddingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-semibold text-[#45506b]">
                          Wedding date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-semibold text-[#45506b]">
                          Estimated guests
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g. 400"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? undefined : Number(e.target.value)
                              )
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-semibold text-[#45506b]">
                          Role
                        </FormLabel>
                        <FormControl>
                          <select
                            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-[15px] text-navy outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? undefined : e.target.value)
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                          >
                            <option value="">Select role</option>
                            <option>Couple</option>
                            <option>Planner</option>
                            <option>Family organizer</option>
                            <option>Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preferred language — full width, chip buttons */}
                <FormField
                  control={form.control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold text-[#45506b]">
                        Preferred language
                      </FormLabel>
                      <div className="flex gap-2">
                        {(["English", "French", "Both"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => field.onChange(lang)}
                            className={`flex-1 rounded-full border py-[7px] px-3 text-[13px] font-medium transition-colors ${
                              field.value === lang
                                ? "border-navy bg-navy text-white"
                                : "border-[#e7e1d6] bg-white text-[#45506b] hover:border-[#97a0b2]"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {serverError && (
                  <p className="text-sm text-destructive">{serverError}</p>
                )}

                <Button
                  type="submit"
                  variant="navy"
                  size="lg"
                  className="mt-[22px] w-full text-[16px] font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting…" : "Submit Beta Request"}
                </Button>

                <p className="text-center text-[13px] text-[#6b7589]">
                  Already have access?{" "}
                  <Link
                    href="/login"
                    className="font-semibold"
                    style={{ color: "var(--color-champagne-deep)" }}
                  >
                    Login
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
