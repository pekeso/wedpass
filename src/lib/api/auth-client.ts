import type { AuthResponseDTO, MeResponseDTO } from "@/modules/auth/auth.dto"
import type { ApiResponse } from "@/types/api"

const BASE = "/api/v1/auth"

export async function registerOrganizer(data: {
  fullName: string
  email: string
  password: string
}): Promise<ApiResponse<AuthResponseDTO>> {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function loginOrganizer(data: {
  email: string
  password: string
}): Promise<ApiResponse<AuthResponseDTO>> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function logoutOrganizer(
  accessToken: string
): Promise<ApiResponse<{ message: string }>> {
  const res = await fetch(`${BASE}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

export async function getMe(
  accessToken: string
): Promise<ApiResponse<MeResponseDTO>> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}
