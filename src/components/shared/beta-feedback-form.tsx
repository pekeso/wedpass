"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAuthStore } from "@/stores/auth-store"
import { submitFeedbackSchema, type SubmitFeedbackInput } from "@/modules/feedback/feedback.schemas"

interface BetaFeedbackFormProps {
  weddingId: string
}

const RATING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function BetaFeedbackForm({ weddingId }: BetaFeedbackFormProps) {
  const { accessToken } = useAuthStore()
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<SubmitFeedbackInput>({
    resolver: zodResolver(submitFeedbackSchema),
    defaultValues: {
      rating: 0 as unknown as number,
      workedWell: "",
      confusing: "",
      offlineFeedback: "",
      mediaFeedback: "",
      generalComment: "",
    },
  })

  async function onSubmit(values: SubmitFeedbackInput) {
    if (!accessToken) return
    try {
      const res = await fetch(`/api/v1/weddings/${weddingId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { success: boolean; error?: { message: string } }
      if (!data.success) throw new Error(data.error?.message ?? "Submission failed")
      setSubmitted(true)
      toast.success("Thank you for your feedback!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback")
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <MessageSquare className="size-6 text-success" />
            </div>
            <p className="font-semibold text-foreground">Feedback submitted — thank you!</p>
            <p className="text-sm text-muted-foreground">
              Your input helps improve WedPass for every wedding.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Beta Feedback</CardTitle>
        <CardDescription>
          Help us improve WedPass. Your feedback is used directly to shape the product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating (1–10)</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {RATING_OPTIONS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => field.onChange(n)}
                          className={`flex size-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                            field.value === n
                              ? "border-navy bg-navy text-white"
                              : "border-border bg-background hover:border-navy/50"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  {field.value === 0 && form.formState.isSubmitted && (
                    <p className="text-sm text-destructive">Please select a rating</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workedWell"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What worked well?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Offline check-in was fast and reliable."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confusing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What was confusing or difficult?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Staff setup instructions were not clear."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offlineFeedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How was offline check-in?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Worked well even with no internet at the venue."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mediaFeedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How was media upload?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Guests uploaded many photos without issues."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generalComment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any other comments?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything else you'd like to share."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="bg-navy hover:bg-navy/90"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting…" : "Submit Feedback"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
