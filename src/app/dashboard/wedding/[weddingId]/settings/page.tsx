"use client"

import { use, useEffect, useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Lock, Globe, Copy, Check, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { BetaFeedbackForm } from "@/components/shared/beta-feedback-form"
import { GalleryTableCard } from "@/components/shared/gallery-table-card"
import { useAuthStore } from "@/stores/auth-store"
import { getWedding, updateWedding } from "@/lib/api/weddings-client"
import { updateWeddingSchema, type UpdateWeddingInput } from "@/modules/weddings/weddings.schemas"

export default function WeddingSettingsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wedding", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await getWedding(weddingId, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  const wedding = data?.wedding

  const form = useForm<UpdateWeddingInput>({
    resolver: zodResolver(updateWeddingSchema),
    defaultValues: {
      name: "",
      coupleNames: "",
      eventDate: "",
      location: "",
      country: "",
      galleryEnabled: true,
    },
  })

  useEffect(() => {
    if (wedding) {
      form.reset({
        name: wedding.name,
        coupleNames: wedding.coupleNames ?? "",
        eventDate: wedding.eventDate ?? "",
        location: wedding.location ?? "",
        country: wedding.country ?? "",
        galleryEnabled: wedding.galleryEnabled,
      })
    }
  }, [wedding, form])

  const mutation = useMutation({
    mutationFn: async (values: UpdateWeddingInput) => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await updateWedding(weddingId, values, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wedding", weddingId] })
      toast.success("Settings saved")
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to save settings")
    },
  })

  const [copied, setCopied] = useState(false)

  const galleryUrl = wedding ? `https://wedpass.net/w/${wedding.slug}/gallery` : ""

  const handleCopyGalleryUrl = useCallback(() => {
    if (!galleryUrl) return
    void navigator.clipboard.writeText(galleryUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [galleryUrl])

  if (isLoading) return <LoadingState message="Loading settings..." />
  if (isError || !wedding) {
    return (
      <ErrorState title="Failed to load settings" description="Please refresh and try again." />
    )
  }

  const isEventMode = wedding.status === "EVENT_MODE"
  const isCompleted = wedding.status === "COMPLETED"
  const textFieldsLocked = isEventMode || isCompleted

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={`Manage settings for ${wedding.name}`}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
          {/* Wedding Details */}
          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Wedding Details</CardTitle>
                  <CardDescription>Basic information about the wedding event.</CardDescription>
                </div>
                {textFieldsLocked && (
                  <div className="flex items-center gap-1.5 rounded-md bg-warning-light px-3 py-1.5 text-xs font-medium text-warning">
                    <Lock className="size-3" aria-hidden="true" />
                    {isEventMode ? "Locked in Event Mode" : "Completed"}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wedding Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Sarah & Daniel Wedding"
                        disabled={textFieldsLocked}
                        {...field}
                      />
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
                      <Input
                        placeholder="e.g. Sarah & Daniel"
                        disabled={textFieldsLocked}
                        {...field}
                      />
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
                      <Input
                        type="date"
                        disabled={textFieldsLocked}
                        {...field}
                      />
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
                      <Input
                        placeholder="e.g. Lagos, Nigeria"
                        disabled={textFieldsLocked}
                        {...field}
                      />
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
                      <Input
                        placeholder="e.g. Nigeria"
                        disabled={textFieldsLocked}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Gallery Settings */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Gallery Settings</CardTitle>
              <CardDescription>Control guest access to the wedding gallery.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="galleryEnabled"
                render={({ field }) => (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="gallery-toggle"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Globe className="size-4 text-navy/60" aria-hidden="true" />
                        Enable Guest Gallery
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, guests can view the gallery at the link below. Guests can always upload photos regardless of this setting.
                      </p>
                      <div className="mt-2 flex items-center gap-1 rounded-lg border border-champagne-light bg-ivory px-3 py-2">
                        <a
                          href={galleryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 flex-1 truncate font-mono text-xs text-navy/70 transition-colors hover:text-navy"
                        >
                          {galleryUrl}
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyGalleryUrl}
                          aria-label="Copy gallery link"
                          className="shrink-0 rounded p-1 text-navy/40 transition-colors hover:bg-champagne-light/60 hover:text-navy"
                        >
                          {copied ? (
                            <Check className="size-3.5 text-success" aria-hidden="true" />
                          ) : (
                            <Copy className="size-3.5" aria-hidden="true" />
                          )}
                        </button>
                        <a
                          href={galleryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open gallery link"
                          className="shrink-0 rounded p-1 text-navy/40 transition-colors hover:bg-champagne-light/60 hover:text-navy"
                        >
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                    <Switch
                      id="gallery-toggle"
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                      disabled={isCompleted}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="max-w-2xl">
            <Button
              type="submit"
              className="bg-navy hover:bg-navy/90"
              disabled={mutation.isPending || isCompleted}
            >
              {mutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Table Cards */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Table Cards</CardTitle>
          <CardDescription>
            Print scannable cards to place on each guest table. Guests scan the QR code to view the gallery and upload their photos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GalleryTableCard
            galleryUrl={galleryUrl}
            coupleNames={wedding.coupleNames ?? ""}
            eventDate={wedding.eventDate ?? null}
          />
        </CardContent>
      </Card>

      {/* Beta Feedback */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Beta Feedback</h2>
          <p className="text-sm text-muted-foreground">
            Share your experience using WedPass at this wedding.
          </p>
        </div>
        <BetaFeedbackForm weddingId={weddingId} />
      </div>
    </div>
  )
}
