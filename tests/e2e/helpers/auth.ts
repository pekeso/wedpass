import type { Page } from "@playwright/test"

export interface TestUser {
  id: string
  email: string
  fullName: string
}

export const DEFAULT_ORGANIZER: TestUser = {
  id: "eeeeeeee-0000-0000-0000-000000000001",
  email: "test-organizer@wedpass.test",
  fullName: "Test Organizer",
}

export const SECOND_ORGANIZER: TestUser = {
  id: "eeeeeeee-0000-0000-0000-000000000002",
  email: "other-organizer@wedpass.test",
  fullName: "Other Organizer",
}

export const DEFAULT_TOKEN = "test-organizer-jwt-token"
export const SECOND_TOKEN = "test-other-organizer-jwt-token"

/**
 * Injects organizer auth state into localStorage before page load so the
 * Zustand persist middleware hydrates immediately on navigation.
 * Must be called BEFORE page.goto().
 */
export async function injectOrganizerAuth(
  page: Page,
  opts: { user?: TestUser; token?: string } = {}
) {
  const user = opts.user ?? DEFAULT_ORGANIZER
  const token = opts.token ?? DEFAULT_TOKEN

  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value)
    },
    {
      key: "wedpass-auth",
      value: JSON.stringify({
        state: { user, accessToken: token },
        version: 0,
      }),
    }
  )
}

/**
 * Injects a staff access token for a specific wedding into localStorage.
 * Must be called BEFORE page.goto().
 */
export async function injectStaffToken(page: Page, weddingId: string, token: string) {
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value)
    },
    {
      key: `wedpass-staff-token-${weddingId}`,
      value: token,
    }
  )
}
