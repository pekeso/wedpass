"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
import { loginOrganizer } from "@/lib/api/auth-client"
import { useAuthStore } from "@/stores/auth-store"
import { loginSchema, type LoginInput } from "@/modules/auth/auth.schemas"
import { useTranslations } from "@/lib/i18n/use-translations"

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { t } = useTranslations()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    setServerError(null)
    const result = await loginOrganizer(values)

    if (!result.success) {
      setServerError(result.error.message)
      return
    }

    setAuth(result.data.user, result.data.accessToken)
    router.replace("/dashboard")
  }

  return (
    <div
      className="flex flex-col bg-ivory px-6"
      style={{ minHeight: "calc(100dvh - 130px)" }}
    >
      {/* centered content */}
      <div className="flex flex-1 flex-col justify-center">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <WedPassWordmark size={60} tagline />
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-sm mx-auto space-y-[14px]"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-semibold text-navy">{t("auth.emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 rounded-xl border-[#e7e1d6] bg-white px-3.5 text-[15px] focus-visible:ring-champagne"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-semibold text-navy">{t("auth.passwordLabel")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-12 rounded-xl border-[#e7e1d6] bg-white px-3.5 pr-11 text-[15px] focus-visible:ring-champagne"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#97a0b2] transition-colors hover:text-[#6b7589]"
                        tabIndex={-1}
                        aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-[13px] font-semibold"
                style={{ color: "var(--color-champagne-deep)" }}
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            {serverError && (
              <p className="text-sm font-medium text-destructive">{serverError}</p>
            )}

            <Button
              type="submit"
              variant="navy"
              className="mt-1 h-[60px] w-full rounded-2xl text-[18px] font-semibold"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? t("auth.signingIn") : t("auth.loginButton")}
            </Button>
          </form>
        </Form>

        {/* Create account */}
        <p className="mt-[18px] text-center text-[14px] text-[#6b7589] w-full max-w-sm mx-auto">
          {t("auth.newToWedPass")}{" "}
          <Link
            href="/register"
            className="font-bold"
            style={{ color: "var(--color-champagne-deep)" }}
          >
            {t("auth.createAccount")}
          </Link>
        </p>
      </div>

      {/* Trust anchor */}
      <div className="flex items-center justify-center gap-[7px] pb-[22px] pt-6 text-[11.5px] text-[#97a0b2]">
        <ShieldCheck size={14} style={{ color: "var(--color-champagne-deep)" }} />
        {t("auth.trust")}
      </div>
    </div>
  )
}
