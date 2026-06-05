"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GuestListItemDTO } from "@/modules/guests/guests.dto"

function GuestInitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-dark text-[13px] font-bold text-navy">
      {initials}
    </div>
  )
}

export interface GuestCardProps {
  guest: GuestListItemDTO
  onEdit: (guest: GuestListItemDTO) => void
  onDelete: (guest: GuestListItemDTO) => void
}

export function GuestCard({ guest, onEdit, onDelete }: GuestCardProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0">
      <GuestInitialsAvatar name={guest.fullName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{guest.fullName}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {guest.phoneNumber && (
            <span className="font-mono text-xs text-muted-foreground">{guest.phoneNumber}</span>
          )}
          {guest.phoneNumber && (
            <span className="text-muted-foreground/40">·</span>
          )}
          <span className="text-xs text-muted-foreground">
            {guest.numberOfAllowedGuests} allowed
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {guest.isCheckedIn ? (
            <Badge className="gap-1.5 border-success/20 bg-success/10 text-success hover:bg-success/10">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              Checked in
            </Badge>
          ) : (
            <Badge className="border-navy/20 bg-navy text-white hover:bg-navy/90">
              Not arrived
            </Badge>
          )}
          <Badge className="border-success/20 bg-success/10 text-success hover:bg-success/10">
            QR Ready
          </Badge>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Actions for ${guest.fullName}`}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(guest)}>
            <Pencil className="mr-2 size-3.5" />
            Edit guest
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(guest)}
            className="text-danger focus:text-danger"
          >
            <Trash2 className="mr-2 size-3.5" />
            Delete guest
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
