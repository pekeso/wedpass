"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyStaffToken } from "@/lib/api/staff-client"
import { useTranslations } from "@/lib/i18n/use-translations"

const STAFF_TOKEN_KEY = (weddingId: string) => `wedpass-staff-token-${weddingId}`

export default function StaffLoginPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()

  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslations()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) {
      setError(t("login.tokenRequired"))
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await verifyStaffToken(weddingId, trimmed)
      localStorage.setItem(STAFF_TOKEN_KEY(weddingId), trimmed)
      router.push(`/staff/${weddingId}/download`)
    } catch {
      setError(t("login.tokenInvalid"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-navy text-white">
            <Smartphone className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{t("login.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("login.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-token">{t("login.tokenLabel")}</Label>
            <Input
              id="staff-token"
              type="text"
              placeholder={t("login.tokenPlaceholder")}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <Button type="submit" className="h-14 w-full text-base" disabled={isLoading}>
            {isLoading ? t("login.verifying") : t("login.button")}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {t("login.deviceNote")}
        </p>
      </div>
    </div>
  )
}
