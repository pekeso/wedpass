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
import { registerOrganizer } from "@/lib/api/auth-client"
import { useAuthStore } from "@/stores/auth-store"
import { registerSchema, type RegisterInput } from "@/modules/auth/auth.schemas"

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  })

  async function onSubmit(values: RegisterInput) {
    setServerError(null)
    const result = await registerOrganizer(values)

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
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-semibold text-navy">Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your full name"
                      autoComplete="name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-semibold text-navy">Email</FormLabel>
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
                  <FormLabel className="text-[14px] font-semibold text-navy">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        className="h-12 rounded-xl border-[#e7e1d6] bg-white px-3.5 pr-11 text-[15px] focus-visible:ring-champagne"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#97a0b2] transition-colors hover:text-[#6b7589]"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm font-medium text-destructive">{serverError}</p>
            )}

            <Button
              type="submit"
              variant="navy"
              className="mt-1 h-[60px] w-full rounded-2xl text-[18px] font-semibold"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Form>

        {/* Login link */}
        <p className="mt-[18px] text-center text-[14px] text-[#6b7589] w-full max-w-sm mx-auto">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold"
            style={{ color: "var(--color-champagne-deep)" }}
          >
            Login
          </Link>
        </p>
      </div>

      {/* Trust anchor */}
      <div className="flex items-center justify-center gap-[7px] pb-[22px] pt-6 text-[11.5px] text-[#97a0b2]">
        <ShieldCheck size={14} style={{ color: "var(--color-champagne-deep)" }} />
        Your private wedding workspace
      </div>
    </div>
  )
}
