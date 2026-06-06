"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-ivory-dark text-[12px] font-bold text-navy">
      {initials}
    </div>
  )
}

export interface GuestTableProps {
  guests: GuestListItemDTO[]
  onEdit: (guest: GuestListItemDTO) => void
  onDelete: (guest: GuestListItemDTO) => void
}

export function GuestTable({ guests, onEdit, onDelete }: GuestTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="px-[18px] py-[11px] text-[11.5px] font-bold uppercase tracking-[.06em] text-muted-foreground">
            Guest
          </TableHead>
          <TableHead className="px-[18px] py-[11px] text-[11.5px] font-bold uppercase tracking-[.06em] text-muted-foreground">
            Phone
          </TableHead>
          <TableHead className="px-[18px] py-[11px] text-[11.5px] font-bold uppercase tracking-[.06em] text-muted-foreground">
            Table
          </TableHead>
          <TableHead className="px-[18px] py-[11px] text-[11.5px] font-bold uppercase tracking-[.06em] text-muted-foreground">
            Seat
          </TableHead>
          <TableHead className="px-[18px] py-[11px] text-center text-[11.5px] font-bold uppercase tracking-[.06em] text-muted-foreground">
            Allowed
          </TableHead>
          <TableHead className="px-[18px] py-[11px] text-center text-[11.5px] font-bold uppercase tracking-[.06em] text-muted-foreground">
            QR Status
          </TableHead>
          <TableHead className="px-[18px] py-[11px] text-center text-[11.5px] font-bold uppercase tracking-[.06em] text-muted-foreground">
            Check-in
          </TableHead>
          <TableHead className="w-10 px-[18px] py-[11px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {guests.map((guest) => (
          <TableRow key={guest.id} className="border-t border-border/60 hover:bg-muted/20">
            <TableCell className="px-[18px] py-[13px]">
              <div className="flex items-center gap-[11px]">
                <GuestInitialsAvatar name={guest.fullName} />
                <span className="text-sm font-semibold text-foreground">
                  {guest.fullName}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-[18px] py-[13px] font-mono text-[13.5px] text-muted-foreground">
              {guest.phoneNumber ?? "—"}
            </TableCell>
            <TableCell className="px-[18px] py-[13px] text-sm text-muted-foreground">
              {guest.tableName ?? "—"}
            </TableCell>
            <TableCell className="px-[18px] py-[13px] text-sm text-muted-foreground">
              {guest.seatNumber ?? "—"}
            </TableCell>
            <TableCell className="px-[18px] py-[13px] text-center font-mono font-semibold text-navy">
              {guest.numberOfAllowedGuests}
            </TableCell>
            <TableCell className="px-[18px] py-[13px] text-center">
              <Badge className="border-success/20 bg-success/10 text-success hover:bg-success/10">
                Ready
              </Badge>
            </TableCell>
            <TableCell className="px-[18px] py-[13px] text-center">
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
            </TableCell>
            <TableCell className="px-[18px] py-[13px] text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Actions for ${guest.fullName}`}
                >
                  <MoreHorizontal className="size-[18px]" />
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
