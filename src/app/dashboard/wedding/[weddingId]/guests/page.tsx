"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Users, Plus, Search, ChevronLeft, ChevronRight, Upload, Filter } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { GuestTable } from "@/components/guests/guest-table"
import { GuestCard } from "@/components/guests/guest-card"
import { GuestForm } from "@/components/guests/guest-form"
import { Button } from "@/components/ui/button"
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
import type { ApiResponse } from "@/types/api"

const PAGE_SIZE = 50

interface WeddingStats {
  totalGuests: number
  checkedInGuests: number
}

async function getWeddingStats(
  weddingId: string,
  accessToken: string
): Promise<ApiResponse<WeddingStats>> {
  const res = await fetch(`/api/v1/weddings/${weddingId}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export default function GuestsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  const [addOpen, setAddOpen] = useState(false)
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

  const { data: stats } = useQuery({
    queryKey: ["wedding-stats", weddingId],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated")
      const res = await getWeddingStats(weddingId, accessToken)
      if (!res.success) throw new Error("Failed to load stats")
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
      void queryClient.invalidateQueries({ queryKey: ["wedding-stats", weddingId] })
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
      void queryClient.invalidateQueries({ queryKey: ["wedding-stats", weddingId] })
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
  const hasGuests = (pagination?.total ?? 0) > 0 || debouncedSearch

  const subtitle = stats
    ? `${stats.totalGuests} guests · ${stats.checkedInGuests} checked in`
    : pagination?.total
    ? `${pagination.total} guests`
    : undefined

  if (isLoading) return <LoadingState message="Loading guests..." />
  if (isError)
    return <ErrorState title="Failed to load guests" description="Please refresh and try again." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest List"
        description={subtitle}
        primaryAction={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/wedding/${weddingId}/guests/import`)}>
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

      {!hasGuests ? (
        <EmptyState
          title="No guests yet"
          description="Add your first guest to get started."
          icon={<Users className="size-6" />}
          actionLabel="Add Guest"
          onAction={() => setAddOpen(true)}
        />
      ) : (
        <>
          {/* Desktop: Card wrapping search + table + pagination */}
          <div className="hidden overflow-hidden rounded-lg border bg-card sm:block">
            {/* Search + filter bar */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="flex flex-1 items-center gap-2.5 rounded-[10px] border border-border bg-muted/40 px-3 py-2.5">
                <Search className="size-[18px] shrink-0 text-muted-foreground" />
                <input
                  placeholder="Search by name or phone…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="shrink-0 bg-white">
                <Filter className="mr-1.5 size-3.5" />
                Filter
              </Button>
            </div>

            {/* Table */}
            {guests.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                No guests match your search.
              </div>
            ) : (
              <GuestTable
                guests={guests}
                onEdit={setEditGuest}
                onDelete={setDeleteTarget}
              />
            )}

            {/* Pagination footer */}
            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-[18px] py-3.5 text-sm text-muted-foreground">
                <span>
                  Showing {guests.length} of {pagination.total}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white px-3"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    ‹
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white px-3"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    ›
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Standalone search + cards + pagination */}
          <div className="space-y-3 sm:hidden">
            <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-muted/40 px-3 py-2.5">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                placeholder="Search by name or phone…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {guests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No guests match your search.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border bg-card">
                {guests.map((guest) => (
                  <GuestCard
                    key={guest.id}
                    guest={guest}
                    onEdit={setEditGuest}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}

            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {guests.length} of {pagination.total}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
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
