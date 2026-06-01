import { randomBytes } from "crypto"

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  const suffix = randomBytes(3).toString("hex")
  return `${base}-${suffix}`
}
