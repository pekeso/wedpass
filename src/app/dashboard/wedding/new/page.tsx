"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PageHeader } from "@/components/shared/page-header"
import { useAuthStore } from "@/stores/auth-store"
import { createWedding } from "@/lib/api/weddings-client"
import { createWeddingSchema, type CreateWeddingInput } from "@/modules/weddings/weddings.schemas"

export default function NewWeddingPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<CreateWeddingInput>({
    resolver: zodResolver(createWeddingSchema),
    defaultValues: {
      name: "",
      coupleNames: "",
      eventDate: "",
      location: "",
      country: "",
    },
  })

  async function onSubmit(values: CreateWeddingInput) {
    if (!accessToken) return
    setServerError(null)

    const result = await createWedding(values, accessToken)

    if (!result.success) {
      setServerError(result.error.message)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ["weddings"] })
    router.push(`/dashboard/wedding/${result.data.wedding.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Wedding"
        description="Set up your wedding event in WedPass"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Wedding Details</CardTitle>
          <CardDescription>
            Fill in the basic details for your wedding. You can update these later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wedding Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sarah & Daniel Wedding" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coupleNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couple Names</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sarah & Daniel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Lagos, Nigeria" {...field} />
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

              {serverError && (
                <p className="text-sm font-medium text-destructive">{serverError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-navy hover:bg-navy/90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Creating..." : "Create Wedding"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
