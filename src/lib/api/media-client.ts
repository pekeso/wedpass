import type { ApiResponse } from "@/types/api"
import type {
  OrganizerMediaListResponseDTO,
  MediaModerationResponseDTO,
  MediaDownloadUrlResponseDTO,
} from "@/modules/media/media.dto"

function mediaBase(weddingId: string) {
  return `/api/v1/weddings/${weddingId}/media`
}

export interface ListOrganizerMediaParams {
  mediaType?: "IMAGE" | "VIDEO"
  status?: "UPLOADED" | "APPROVED" | "HIDDEN" | "DELETED"
  page?: number
  pageSize?: number
}

export async function listOrganizerMedia(
  weddingId: string,
  params: ListOrganizerMediaParams,
  accessToken: string
): Promise<ApiResponse<OrganizerMediaListResponseDTO>> {
  const query = new URLSearchParams()
  if (params.mediaType) query.set("mediaType", params.mediaType)
  if (params.status) query.set("status", params.status)
  if (params.page) query.set("page", String(params.page))
  if (params.pageSize) query.set("pageSize", String(params.pageSize))

  const res = await fetch(`${mediaBase(weddingId)}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function hideOrganizerMedia(
  weddingId: string,
  mediaId: string,
  accessToken: string
): Promise<ApiResponse<MediaModerationResponseDTO>> {
  const res = await fetch(`${mediaBase(weddingId)}/${mediaId}/hide`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function showOrganizerMedia(
  weddingId: string,
  mediaId: string,
  accessToken: string
): Promise<ApiResponse<MediaModerationResponseDTO>> {
  const res = await fetch(`${mediaBase(weddingId)}/${mediaId}/show`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function deleteOrganizerMedia(
  weddingId: string,
  mediaId: string,
  accessToken: string
): Promise<ApiResponse<MediaModerationResponseDTO>> {
  const res = await fetch(`${mediaBase(weddingId)}/${mediaId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function getMediaDownloadUrl(
  weddingId: string,
  mediaId: string,
  accessToken: string
): Promise<ApiResponse<MediaDownloadUrlResponseDTO>> {
  const res = await fetch(`${mediaBase(weddingId)}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}
