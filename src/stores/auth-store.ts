"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserDTO } from "@/modules/auth/auth.dto"

interface AuthState {
  user: UserDTO | null
  accessToken: string | null
  _hasHydrated: boolean
  setAuth: (user: UserDTO, accessToken: string) => void
  clearAuth: () => void
  _setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hasHydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      _setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "wedpass-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    }
  )
)
