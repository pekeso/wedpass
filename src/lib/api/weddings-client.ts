import type { ApiResponse } from "@/types/api"
import type {
  WeddingResponseDTO,
  ListWeddingsResponseDTO,
} from "@/modules/weddings/weddings.dto"
import type {
  CreateWeddingInput,
  UpdateWeddingInput,
} from "@/modules/weddings/weddings.schemas"

const BASE = "/api/v1/weddings"

export async function listWeddings(
  accessToken: string
): Promise<ApiResponse<ListWeddingsResponseDTO>> {
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function getWedding(
  weddingId: string,
  accessToken: string
): Promise<ApiResponse<WeddingResponseDTO>> {
  const res = await fetch(`${BASE}/${weddingId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function createWedding(
  data: CreateWeddingInput,
  accessToken: string
): Promise<ApiResponse<WeddingResponseDTO>> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateWedding(
  weddingId: string,
  data: UpdateWeddingInput,
  accessToken: string
): Promise<ApiResponse<WeddingResponseDTO>> {
  const res = await fetch(`${BASE}/${weddingId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  })
  return res.json()
}
