"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute right-[-60px] top-10 opacity-[0.05]">
        <WedPassWordmark size={300} textColor="#fff" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <WedPassWordmark size={60} textColor="#fff" />
          </div>

          <h1 className="mb-2 text-center text-[23px] font-bold">Event Mode</h1>
          <p className="mb-8 text-center text-sm leading-relaxed text-white/60">
            Enter your staff access to begin checking in guests.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="staff-token"
                className="mb-2 block text-[12.5px] font-semibold text-white/60"
              >
                {t("login.tokenLabel")}
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3.5">
                <Lock className="size-5 shrink-0 text-white/45" />
                <input
                  id="staff-token"
                  type="text"
                  placeholder={t("login.tokenPlaceholder")}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 border-0 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-danger">{error}</p>
            )}

            <Button
              type="submit"
              variant="gold"
              size="xl"
              className="mt-6 w-full"
              disabled={isLoading}
            >
              {isLoading ? t("login.verifying") : "Enter Event Mode →"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/50">
            <ShieldCheck className="size-3.5 text-champagne" />
            Staff access is limited &amp; secure
          </div>
        </div>
      </div>
    </div>
  )
}
