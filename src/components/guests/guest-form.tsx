"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CreateGuestInput } from "@/modules/guests/guests.schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Concrete form schema without a Zod default so the type is stable
const guestFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  numberOfAllowedGuests: z.number().int().min(1).max(20),
  tableName: z.string().min(1, "Table name is required"),
  seatNumber: z.string().optional(),
})

type GuestFormValues = z.infer<typeof guestFormSchema>

export interface GuestFormProps {
  defaultValues?: Partial<GuestFormValues>
  onSubmit: (data: CreateGuestInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function GuestForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Add Guest",
}: GuestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      numberOfAllowedGuests: 1,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="e.g. Michael Okoro"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-danger">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          placeholder="e.g. +2348012345678"
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className="text-xs text-danger">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g. michael@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-danger">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="numberOfAllowedGuests">Allowed Guests</Label>
        <Input
          id="numberOfAllowedGuests"
          type="number"
          min={1}
          max={20}
          {...register("numberOfAllowedGuests", { valueAsNumber: true })}
        />
        {errors.numberOfAllowedGuests && (
          <p className="text-xs text-danger">{errors.numberOfAllowedGuests.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tableName">Table *</Label>
          <Input
            id="tableName"
            placeholder="e.g. Table 5 or A"
            {...register("tableName")}
          />
          {errors.tableName && (
            <p className="text-xs text-danger">{errors.tableName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seatNumber">Seat</Label>
          <Input
            id="seatNumber"
            placeholder="e.g. 3"
            {...register("seatNumber")}
          />
          {errors.seatNumber && (
            <p className="text-xs text-danger">{errors.seatNumber.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
