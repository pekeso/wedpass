"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (_hasHydrated && !accessToken) {
      router.replace("/login")
    }
  }, [_hasHydrated, accessToken, router])

  if (!_hasHydrated || !accessToken) return null

  return <>{children}</>
}
