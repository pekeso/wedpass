import { offlineDb } from "./db"

export async function getMetadata(key: string): Promise<string | undefined> {
  const record = await offlineDb.metadata.get(key)
  return record?.value
}

export async function setMetadata(key: string, value: string): Promise<void> {
  await offlineDb.metadata.put({
    key,
    value,
    updatedAt: new Date().toISOString(),
  })
}

export async function clearMetadata(): Promise<void> {
  await offlineDb.metadata.clear()
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getMetadata("deviceId")
  if (existing) return existing

  const deviceId = crypto.randomUUID()
  await setMetadata("deviceId", deviceId)
  return deviceId
}
