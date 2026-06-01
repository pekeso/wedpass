"use client"

import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GuestListItemDTO } from "@/modules/guests/guests.dto"

export interface GuestTableProps {
  guests: GuestListItemDTO[]
  onEdit: (guest: GuestListItemDTO) => void
  onDelete: (guest: GuestListItemDTO) => void
}

export function GuestTable({ guests, onEdit, onDelete }: GuestTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Phone</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Allowed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{guest.fullName}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {guest.qrToken.slice(0, 12)}…
                  </p>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {guest.phoneNumber ?? "—"}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {guest.email ?? "—"}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm">
                {guest.numberOfAllowedGuests}
              </TableCell>
              <TableCell>
                {guest.isCheckedIn ? (
                  <Badge variant="default" className="bg-success text-white text-xs">
                    Checked In
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(guest)}
                    aria-label={`Edit ${guest.fullName}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-danger hover:text-danger"
                    onClick={() => onDelete(guest)}
                    aria-label={`Delete ${guest.fullName}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
