"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
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
  preferredLanguage: z.enum(["English", "French"]).optional(),
})

type BetaSignupFormData = z.infer<typeof betaSignupSchema>

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
      preferredLanguage: undefined,
    },
  })

  const {
    formState: { isSubmitting },
  } = form

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

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-12">
      {!submitted ? (
        <div className="w-full max-w-lg rounded-2xl bg-white px-8 py-10 shadow-card">
          <div className="mb-6 flex justify-center">
            <WedPassWordmark size={28} />
          </div>
          <h1 className="mb-1 text-center text-2xl font-bold text-navy">
            Join the WedPass Beta
          </h1>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            We&apos;re onboarding couples and planners in Central, East &amp; West Africa. Be
            first.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
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
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nigeria" {...field} />
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
                    <FormLabel>
                      Wedding Date{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
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
                    <FormLabel>
                      Estimated Guest Count{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 150"
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
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Preferred Language{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : e.target.value)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                      >
                        <option value="">Select language</option>
                        <option value="English">English</option>
                        <option value="French">French</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button
                type="submit"
                variant="navy"
                className="mt-2 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Request Beta Access"}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
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
      )}
    </div>
  )
}
