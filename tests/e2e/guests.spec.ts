/**
 * E2E: Guest Management Flows
 *
 * Covers:
 * - Guest list renders correctly from API data
 * - Add guest dialog opens and submits
 * - Edit guest dialog opens and submits
 * - Delete guest confirmation dialog appears and confirms
 * - Event Mode locked wedding rejects adding guests
 *
 * All API calls are mocked via page.route() — no real database required.
 */

import { test, expect } from "@playwright/test"
import { injectOrganizerAuth } from "./helpers/auth"
import { ok, paginated, TEST_WEDDING_ID, TEST_GUEST_A, TEST_GUEST_B } from "./helpers/setup"

const GUESTS_URL = `/api/v1/weddings/${TEST_WEDDING_ID}/guests`

function guestListResponse(guests = [TEST_GUEST_A, TEST_GUEST_B]) {
  return paginated(guests, guests.length)
}

test.beforeEach(async ({ page }) => {
  await injectOrganizerAuth(page)
})

test.describe("Guest list", () => {
  test("renders guest names from API", async ({ page }) => {
    await page.route(GUESTS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(guestListResponse()),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)

    await expect(page.getByText("Adebayo Johnson")).toBeVisible()
    await expect(page.getByText("Marie Nkosi")).toBeVisible()
  })

  test("shows empty state when guest list is empty", async ({ page }) => {
    await page.route(GUESTS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(guestListResponse([])),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)

    await expect(page.getByText(/no guests yet/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /add guest/i })).toBeVisible()
  })

  test("shows total guest count", async ({ page }) => {
    await page.route(GUESTS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([TEST_GUEST_A, TEST_GUEST_B], 2)),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)

    await expect(page.getByText("2 total")).toBeVisible()
  })
})

test.describe("Add guest", () => {
  test("opens dialog and submits new guest", async ({ page }) => {
    let listCallCount = 0

    await page.route(GUESTS_URL, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(ok({ guest: TEST_GUEST_A })),
        })
      } else {
        listCallCount++
        const guests = listCallCount === 1 ? [] : [TEST_GUEST_A]
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(guestListResponse(guests)),
        })
      }
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)
    await page.getByRole("button", { name: /add guest/i }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Add Guest")).toBeVisible()

    await page.getByLabel(/full name/i).fill("Adebayo Johnson")
    await page.getByLabel(/phone/i).fill("+234 800 000 0001")

    await page.getByRole("button", { name: /save|add/i }).click()

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 })
  })

  test("shows validation error when name is too short", async ({ page }) => {
    await page.route(GUESTS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(guestListResponse([])),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)
    await page.getByRole("button", { name: /add guest/i }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await page.getByLabel(/full name/i).fill("A")
    await page.getByRole("button", { name: /save|add/i }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
  })
})

test.describe("Edit guest", () => {
  test("edit button opens pre-filled dialog", async ({ page }) => {
    await page.route(GUESTS_URL, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(guestListResponse()),
        })
      } else {
        await route.continue()
      }
    })

    await page.route(`${GUESTS_URL}/${TEST_GUEST_A.id}`, async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(ok({ guest: TEST_GUEST_A })),
        })
      }
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)

    await expect(page.getByText("Adebayo Johnson")).toBeVisible()

    const editButton = page.getByRole("button", { name: /edit/i }).first()
    await editButton.click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByLabel(/full name/i)).toHaveValue("Adebayo Johnson")
  })
})

test.describe("Delete guest", () => {
  test("delete button opens confirmation dialog", async ({ page }) => {
    await page.route(GUESTS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(guestListResponse()),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)

    await expect(page.getByText("Adebayo Johnson")).toBeVisible()

    const deleteButton = page.getByRole("button", { name: /delete/i }).first()
    await deleteButton.click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText(/delete guest/i)).toBeVisible()
    await expect(page.getByText("Adebayo Johnson")).toBeVisible()
  })

  test("confirming delete removes guest from list", async ({ page }) => {
    let listCallCount = 0

    await page.route(GUESTS_URL, async (route) => {
      listCallCount++
      const guests = listCallCount === 1 ? [TEST_GUEST_A, TEST_GUEST_B] : [TEST_GUEST_B]
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(guestListResponse(guests)),
      })
    })

    await page.route(`${GUESTS_URL}/${TEST_GUEST_A.id}`, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(ok({ deleted: true })),
        })
      }
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)

    const deleteButton = page.getByRole("button", { name: /delete/i }).first()
    await deleteButton.click()

    await expect(page.getByRole("dialog")).toBeVisible()
    await page.getByRole("button", { name: /^delete$/i }).click()

    await expect(page.getByText("Adebayo Johnson")).not.toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("Marie Nkosi")).toBeVisible()
  })
})

test.describe("Event Mode lock", () => {
  test("adding a guest when wedding is in EVENT_MODE shows an error", async ({ page }) => {
    await page.route(GUESTS_URL, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: {
              code: "EVENT_MODE_LOCKED",
              message: "Guest list is locked while Event Mode is active",
            },
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(guestListResponse([])),
        })
      }
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/guests`)
    await page.getByRole("button", { name: /add guest/i }).click()

    await page.getByLabel(/full name/i).fill("New Guest")
    await page.getByRole("button", { name: /save|add/i }).click()

    await expect(page.getByText(/event mode|locked/i)).toBeVisible({ timeout: 5_000 })
  })
})
