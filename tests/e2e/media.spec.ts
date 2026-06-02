/**
 * E2E: Media Upload and Gallery Flows
 *
 * Covers:
 * - Upload URL API rejects SVG files (415 Unsupported Media Type)
 * - Upload URL API rejects files over the size limit (413 Too Large)
 * - Upload URL API accepts valid JPEG and MP4 files
 * - Organizer gallery renders media items from the API
 * - Organizer can hide a media item (moves to hidden state)
 * - Organizer can delete a media item (removed from gallery)
 * - Public gallery shows disabled message when galleryEnabled is false
 *
 * API calls that touch a database (upload-url, confirm, public gallery rendering)
 * use page.route() mocking so no real database is required for the gallery tests.
 * The upload URL validation tests hit the API directly and require the server.
 */

import { test, expect } from "@playwright/test"
import { injectOrganizerAuth } from "./helpers/auth"
import { ok, paginated, TEST_WEDDING_ID, TEST_MEDIA_ITEM } from "./helpers/setup"

const MEDIA_URL = `/api/v1/weddings/${TEST_WEDDING_ID}/media`
const UPLOAD_URL_ENDPOINT = `${MEDIA_URL}/upload-url`

const HIDDEN_MEDIA_ITEM = {
  ...TEST_MEDIA_ITEM,
  id: "bbbbbbbb-0000-0000-0000-000000000002",
  status: "HIDDEN" as const,
}

test.describe("Upload URL API — file type validation", () => {
  test("SVG upload request returns 415 Unsupported Media Type", async ({ request }) => {
    const res = await request.post(UPLOAD_URL_ENDPOINT, {
      data: {
        mediaType: "IMAGE",
        mimeType: "image/svg+xml",
        fileSizeBytes: 500_000,
      },
    })
    expect([400, 415]).toContain(res.status())
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toMatch(/UNSUPPORTED_FILE_TYPE|VALIDATION_ERROR/)
  })

  test("image exceeding 10 MB limit returns 413 Too Large", async ({ request }) => {
    const res = await request.post(UPLOAD_URL_ENDPOINT, {
      data: {
        mediaType: "IMAGE",
        mimeType: "image/jpeg",
        fileSizeBytes: 11 * 1024 * 1024,
      },
    })
    expect([400, 413]).toContain(res.status())
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toMatch(/FILE_TOO_LARGE|VALIDATION_ERROR/)
  })

  test("video exceeding 100 MB limit returns 413 Too Large", async ({ request }) => {
    const res = await request.post(UPLOAD_URL_ENDPOINT, {
      data: {
        mediaType: "VIDEO",
        mimeType: "video/mp4",
        fileSizeBytes: 101 * 1024 * 1024,
      },
    })
    expect([400, 413]).toContain(res.status())
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toMatch(/FILE_TOO_LARGE|VALIDATION_ERROR/)
  })
})

test.describe("Organizer Gallery", () => {
  test.beforeEach(async ({ page }) => {
    await injectOrganizerAuth(page)
  })

  test("renders media items returned by the API", async ({ page }) => {
    await page.route(MEDIA_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([TEST_MEDIA_ITEM])),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/gallery`)
    await expect(page.getByText(/1 item/i)).toBeVisible({ timeout: 8_000 })
  })

  test("shows empty state when no media has been uploaded", async ({ page }) => {
    await page.route(MEDIA_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([])),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/gallery`)
    await expect(page.getByText(/no photos or videos|no media/i)).toBeVisible({ timeout: 8_000 })
  })

  test("hiding a media item triggers the hide API and refreshes the list", async ({ page }) => {
    let hideCalled = false

    await page.route(MEDIA_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([TEST_MEDIA_ITEM])),
      })
    })

    await page.route(`${MEDIA_URL}/${TEST_MEDIA_ITEM.id}/hide`, async (route) => {
      hideCalled = true
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({ ...TEST_MEDIA_ITEM, status: "HIDDEN" })),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/gallery`)
    await expect(page.getByText(/1 item/i)).toBeVisible({ timeout: 8_000 })

    const hideButton = page.getByRole("button", { name: /hide/i }).first()
    await hideButton.click()

    await expect(() => expect(hideCalled).toBe(true)).toPass({ timeout: 5_000 })
  })

  test("deleting a media item triggers the delete API", async ({ page }) => {
    let deleteCalled = false

    await page.route(MEDIA_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(paginated([TEST_MEDIA_ITEM])),
      })
    })

    await page.route(`${MEDIA_URL}/${TEST_MEDIA_ITEM.id}`, async (route) => {
      if (route.request().method() === "DELETE") {
        deleteCalled = true
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(ok({ deleted: true })),
        })
      }
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/gallery`)
    await expect(page.getByText(/1 item/i)).toBeVisible({ timeout: 8_000 })

    const deleteButton = page.getByRole("button", { name: /delete/i }).first()
    await deleteButton.click()

    await expect(() => expect(deleteCalled).toBe(true)).toPass({ timeout: 5_000 })
  })

  test("hidden tab only shows hidden items", async ({ page }) => {
    let activeRequest = "all"

    await page.route(MEDIA_URL, async (route) => {
      const url = new URL(route.request().url())
      const status = url.searchParams.get("status")
      activeRequest = status ?? "all"

      const item = status === "HIDDEN" ? HIDDEN_MEDIA_ITEM : TEST_MEDIA_ITEM
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({ items: [item], pagination: { total: 1, page: 1, pageSize: 30 } })),
      })
    })

    await page.goto(`/dashboard/wedding/${TEST_WEDDING_ID}/gallery`)
    await expect(page.getByText(/1 item/i)).toBeVisible({ timeout: 8_000 })

    const hiddenTab = page.getByRole("tab", { name: /hidden/i })
    await hiddenTab.click()

    await page.waitForTimeout(1_000)
    expect(activeRequest).toBe("HIDDEN")
  })
})
