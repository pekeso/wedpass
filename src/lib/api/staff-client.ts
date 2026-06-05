import type { CreateStaffDeviceResponseDTO, ListStaffDevicesResponseDTO } from "@/modules/staff/staff.dto"

const BASE = "/api/v1"

export async function listStaffDevices(
  weddingId: string,
  accessToken: string
): Promise<ListStaffDevicesResponseDTO> {
  const res = await fetch(`${BASE}/weddings/${weddingId}/staff/devices`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to list staff devices")
  return json.data as ListStaffDevicesResponseDTO
}

export async function createStaffDevice(
  weddingId: string,
  label: string,
  accessToken: string
): Promise<CreateStaffDeviceResponseDTO> {
  const res = await fetch(`${BASE}/weddings/${weddingId}/staff/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ label }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to create staff device")
  return json.data as CreateStaffDeviceResponseDTO
}

export async function revokeStaffDevice(
  weddingId: string,
  deviceId: string,
  accessToken: string
): Promise<{ revoked: boolean }> {
  const res = await fetch(
    `${BASE}/weddings/${weddingId}/staff/devices/${deviceId}/revoke`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to revoke staff device")
  return json.data as { revoked: boolean }
}

export async function reissueStaffToken(
  weddingId: string,
  deviceId: string,
  accessToken: string
): Promise<{ staffToken: string }> {
  const res = await fetch(
    `${BASE}/weddings/${weddingId}/staff/devices/${deviceId}/reissue`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Failed to reissue staff token")
  return json.data as { staffToken: string }
}

export async function verifyStaffToken(
  weddingId: string,
  staffToken: string
): Promise<{ staffDeviceId: string; weddingId: string }> {
  const res = await fetch(`${BASE}/staff/weddings/${weddingId}/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${staffToken}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? "Invalid staff token")
  return json.data as { staffDeviceId: string; weddingId: string }
}
