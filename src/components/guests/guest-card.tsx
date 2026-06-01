"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { GuestListItemDTO } from "@/modules/guests/guests.dto"

export interface GuestCardProps {
  guest: GuestListItemDTO
  onEdit: (guest: GuestListItemDTO) => void
  onDelete: (guest: GuestListItemDTO) => void
}

export function GuestCard({ guest, onEdit, onDelete }: GuestCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{guest.fullName}</p>
            {guest.phoneNumber && (
              <p className="mt-0.5 text-sm text-muted-foreground">{guest.phoneNumber}</p>
            )}
            {guest.email && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{guest.email}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              {guest.isCheckedIn ? (
                <Badge variant="default" className="bg-success text-white text-xs">
                  Checked In
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Pending
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {guest.numberOfAllowedGuests} allowed
              </span>
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              {guest.qrToken.slice(0, 16)}…
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(guest)}
              aria-label={`Edit ${guest.fullName}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-danger hover:text-danger"
              onClick={() => onDelete(guest)}
              aria-label={`Delete ${guest.fullName}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
