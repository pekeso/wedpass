/**
 * E2E: Organizer Flows
 *
 * Covers:
 * - Register → redirect to dashboard
 * - Login → redirect to dashboard
 * - Create wedding → redirect to wedding overview
 * - Dashboard lists weddings from the API
 *
 * All API calls are mocked via page.route() — no real database required.
 */

import { test, expect } from "@playwright/test"
import { injectOrganizerAuth, DEFAULT_ORGANIZER, DEFAULT_TOKEN } from "./helpers/auth"
import { ok, paginated, TEST_WEDDING, TEST_WEDDING_ID } from "./helpers/setup"

const MOCK_AUTH_RESPONSE = ok({
  user: DEFAULT_ORGANIZER,
  accessToken: DEFAULT_TOKEN,
})

test.describe("Organizer — Registration", () => {
  test("successful registration redirects to dashboard", async ({ page }) => {
    await page.route("/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(MOCK_AUTH_RESPONSE),
      })
    })

    await page.route("/api/v1/weddings", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(paginated([])),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto("/register")
    await expect(page.getByText("Create your account")).toBeVisible()

    await page.getByLabel("Full name").fill("Test Organizer")
    await page.getByLabel("Email").fill("test-organizer@wedpass.test")
    await page.getByLabel("Password").fill("securepassword123")
    await page.getByRole("button", { name: /create account/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("registration with invalid email shows inline error", async ({ page }) => {
    await page.goto("/register")
    await page.getByLabel("Full name").fill("Test Organizer")
    await page.getByLabel("Email").fill("not-an-email")
    await page.getByLabel("Password").fill("securepassword123")
    await page.getByRole("button", { name: /create account/i }).click()

    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test("registration with duplicate email shows server error", async ({ page }) => {
    await page.route("/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists" },
        }),
      })
    })

    await page.goto("/register")
    await page.getByLabel("Full name").fill("Test Organizer")
    await page.getByLabel("Email").fill("test-organizer@wedpass.test")
    await page.getByLabel("Password").fill("securepassword123")
    await page.getByRole("button", { name: /create account/i }).click()

    await expect(page.getByText(/already exists/i)).toBeVisible()
  })
})

test.describe("Organizer — Login", () => {
  test("successful login redirects to dashboard", async ({ page }) => {
    await page.route("/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_AUTH_RESPONSE),
      })
    })

    await page.route("/api/v1/weddings", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(paginated([])),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto("/login")
    await expect(page.getByText("Welcome back")).toBeVisible()

    await page.getByLabel("Email").fill("test-organizer@wedpass.test")
    await page.getByLabel("Password").fill("securepassword123")
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("wrong credentials shows error message", async ({ page }) => {
    await page.route("/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        }),
      })
    })

    await page.goto("/login")
    await page.getByLabel("Email").fill("test-organizer@wedpass.test")
    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: /sign in/i }).click()

    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })
})

test.describe("Organizer — Dashboard", () => {
  test("dashboard shows wedding list when weddings exist", async ({ page }) => {
    await injectOrganizerAuth(page)

    await page.route("/api/v1/weddings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([TEST_WEDDING])),
      })
    })

    await page.goto("/dashboard")
    await expect(page.getByText("Sarah & Daniel Wedding")).toBeVisible()
    await expect(page.getByText("My Weddings")).toBeVisible()
  })

  test("dashboard shows empty state when no weddings", async ({ page }) => {
    await injectOrganizerAuth(page)

    await page.route("/api/v1/weddings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([])),
      })
    })

    await page.goto("/dashboard")
    await expect(page.getByText(/no weddings yet/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /create wedding/i })).toBeVisible()
  })

  test("unauthenticated access to dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Organizer — Create Wedding", () => {
  test("creates a wedding and redirects to the wedding overview", async ({ page }) => {
    await injectOrganizerAuth(page)

    await page.route("/api/v1/weddings", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(ok({ wedding: TEST_WEDDING })),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(paginated([])),
        })
      }
    })

    await page.route(`/api/v1/weddings/${TEST_WEDDING_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({ wedding: TEST_WEDDING })),
      })
    })

    await page.route(`/api/v1/weddings/${TEST_WEDDING_ID}/stats`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({
          totalGuests: 0,
          checkedInGuests: 0,
          pendingGuests: 0,
          checkinPercentage: 0,
          totalMediaUploads: 0,
          lastSyncAt: null,
        })),
      })
    })

    await page.goto("/dashboard/wedding/new")
    await expect(page.getByText("Wedding Details")).toBeVisible()

    await page.getByLabel("Wedding Name *").fill("Sarah & Daniel Wedding")
    await page.getByLabel("Couple Names").fill("Sarah & Daniel")
    await page.getByRole("button", { name: /create wedding/i }).click()

    await expect(page).toHaveURL(new RegExp(`/dashboard/wedding/${TEST_WEDDING_ID}`))
  })

  test("create wedding form requires a wedding name", async ({ page }) => {
    await injectOrganizerAuth(page)

    await page.goto("/dashboard/wedding/new")
    await page.getByRole("button", { name: /create wedding/i }).click()

    await expect(page.getByText(/too small|min|required/i)).toBeVisible()
  })
})
