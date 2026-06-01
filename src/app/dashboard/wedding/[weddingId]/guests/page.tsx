"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Users, Plus, Search, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { GuestTable } from "@/components/guests/guest-table"
import { GuestCard } from "@/components/guests/guest-card"
import { GuestForm } from "@/components/guests/guest-form"
import { CsvImportDialog } from "@/components/guests/csv-import-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuthStore } from "@/stores/auth-store"
import {
  listGuests,
  createGuest,
  updateGuest,
  deleteGuest,
} from "@/lib/api/guests-client"
import type { GuestListItemDTO } from "@/modules/guests/guests.dto"
import type { CreateGuestInput } from "@/modules/guests/guests.schemas"

const PAGE_SIZE = 50

export default function GuestsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  const [addOpen, setAddOpen] = useState(false)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [editGuest, setEditGuest] = useState<GuestListItemDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GuestListItemDTO | null>(null)

  const queryKey = ["guests", weddingId, debouncedSearch, page]

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await listGuests(
        weddingId,
        { search: debouncedSearch || undefined, page, pageSize: PAGE_SIZE },
        accessToken
      )
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    enabled: !!accessToken,
  })

  const createMutation = useMutation({
    mutationFn: async (input: CreateGuestInput) => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await createGuest(weddingId, input, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["guests", weddingId] })
      void queryClient.invalidateQueries({ queryKey: ["wedding", weddingId] })
      setAddOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ guestId, input }: { guestId: string; input: CreateGuestInput }) => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await updateGuest(weddingId, guestId, input, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["guests", weddingId] })
      setEditGuest(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (guestId: string) => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await deleteGuest(weddingId, guestId, accessToken)
      if (!res.success) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["guests", weddingId] })
      void queryClient.invalidateQueries({ queryKey: ["wedding", weddingId] })
      setDeleteTarget(null)
    },
  })

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
    clearTimeout((handleSearchChange as unknown as { timer?: ReturnType<typeof setTimeout> }).timer)
    ;(handleSearchChange as unknown as { timer?: ReturnType<typeof setTimeout> }).timer = setTimeout(() => {
      setDebouncedSearch(value)
    }, 400)
  }

  const guests = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1

  if (isLoading) return <LoadingState message="Loading guests..." />
  if (isError)
    return <ErrorState title="Failed to load guests" description="Please refresh and try again." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guests"
        description={pagination ? `${pagination.total} total` : undefined}
        primaryAction={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
              <Upload className="mr-2 size-4" />
              Import CSV
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Guest
            </Button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone…"
          className="pl-9"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {guests.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? "No guests found" : "No guests yet"}
          description={
            debouncedSearch
              ? "Try a different name or phone number."
              : "Add your first guest to get started."
          }
          icon={<Users className="size-6" />}
          actionLabel={debouncedSearch ? undefined : "Add Guest"}
          onAction={debouncedSearch ? undefined : () => setAddOpen(true)}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <GuestTable
              guests={guests}
              onEdit={setEditGuest}
              onDelete={setDeleteTarget}
            />
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {guests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onEdit={setEditGuest}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add guest dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Guest</DialogTitle>
          </DialogHeader>
          <GuestForm
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data)
            }}
            onCancel={() => setAddOpen(false)}
            isSubmitting={createMutation.isPending}
          />
          {createMutation.error && (
            <p className="text-sm text-danger">{createMutation.error.message}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit guest dialog */}
      <Dialog open={!!editGuest} onOpenChange={(open) => !open && setEditGuest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          {editGuest && (
            <GuestForm
              defaultValues={{
                fullName: editGuest.fullName,
                phoneNumber: editGuest.phoneNumber ?? undefined,
                email: editGuest.email ?? undefined,
                numberOfAllowedGuests: editGuest.numberOfAllowedGuests,
              }}
              onSubmit={async (data) => {
                await updateMutation.mutateAsync({ guestId: editGuest.id, input: data })
              }}
              onCancel={() => setEditGuest(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          )}
          {updateMutation.error && (
            <p className="text-sm text-danger">{updateMutation.error.message}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* CSV import dialog */}
      <CsvImportDialog
        weddingId={weddingId}
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImported={() => {
          void queryClient.invalidateQueries({ queryKey: ["guests", weddingId] })
          void queryClient.invalidateQueries({ queryKey: ["wedding", weddingId] })
        }}
      />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Guest"
        description={
          deleteTarget
            ? `Are you sure you want to remove ${deleteTarget.fullName} from the guest list? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id)
          }
        }}
      />
    </div>
  )
}
