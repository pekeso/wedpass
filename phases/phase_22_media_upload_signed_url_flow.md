# Phase 22 — Media Upload Signed URL Flow

## Goal

Implement the complete media upload flow: guests request a signed URL from the server, upload directly to Cloudflare R2, then confirm the upload. Includes client-side validation, upload progress, error handling, and the media queue for offline retry. Covers photos (JPEG, PNG) and short videos (MP4).

## Why This Phase Matters

Direct-to-R2 upload is the architecture that makes media scale. If guests upload through the Next.js server instead, it creates a bandwidth and memory bottleneck. Getting the signed URL flow right — with proper validation, confirmation, and offline queueing — is essential for reliable media collection.

## Documents to Read Before Starting

- `CLAUDE.md`
- `docs/api_contracts.md` (Part 9 — Media API, Sections 31–32)
- `docs/architecture.md` (Section 10 — Media Architecture)
- `docs/security.md` (media upload rules)
- `docs/env_and_deployment.md` (Cloudflare R2 setup)

## Dependencies

- Phase 21 complete (guest public wedding page)
- Phase 09 complete (IndexedDB — `mediaQueue` store)
- Cloudflare R2 bucket configured in `.env`

## Scope

### Backend

- Media module: `src/modules/media/`
  - `media.schemas.ts` — Zod validation for upload requests
  - `media.repository.ts` — media metadata DB operations
  - `media.service.ts` — signed URL generation, confirm logic
  - `media.dto.ts`
- R2 storage client: `src/lib/storage/r2-client.ts`
- API route handlers:
  - `POST /api/v1/weddings/:weddingId/media/upload-url` — generate signed upload URL
  - `POST /api/v1/weddings/:weddingId/media/confirm` — confirm upload, create metadata

### Frontend

- `src/app/w/[slug]/upload/page.tsx` — guest upload page
- `src/components/media/media-upload-form.tsx` — file selector + progress
- `src/components/media/upload-progress.tsx` — progress bar
- `src/lib/offline/media/media-upload-queue.ts` — offline queue for media

## File Limits

Per `docs/v1_scope.md` and `api_contracts.md`:
- Images: JPEG, PNG — max 10MB
- Videos: MP4 — max 100MB
- No SVG

## Implementation Tasks

1. Configure R2 client in `src/lib/storage/r2-client.ts`:
   ```ts
   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

   export const r2Client = new S3Client({
     region: "auto",
     endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
     credentials: {
       accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
       secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
     },
   });
   ```
   Install: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
2. Create `src/modules/media/media.schemas.ts`:
   ```ts
   export const requestUploadUrlSchema = z.object({
     mediaType: z.enum(["IMAGE", "VIDEO"]),
     mimeType: z.enum(["image/jpeg", "image/png", "video/mp4"]),
     fileSizeBytes: z.number().positive(),
     originalFileName: z.string().optional(),
     durationSeconds: z.number().optional().nullable(),
     uploadedByName: z.string().optional(),
   });
   ```
3. Create `src/modules/media/media.service.ts`:
   - `requestUploadUrl()` — validate file type/size, generate `fileKey`, create R2 signed URL
   - `confirmUpload()` — store media metadata after upload
4. File key format: `weddings/{weddingId}/media/{uploadId}{ext}`
5. Create API route handlers:
   - `src/app/api/v1/weddings/[weddingId]/media/upload-url/route.ts` (POST — public)
   - `src/app/api/v1/weddings/[weddingId]/media/confirm/route.ts` (POST — public)
6. Create `src/lib/offline/media/media-upload-queue.ts`:
   - `queueMediaUpload(weddingId, slug, file, name)` — stores blob in mediaQueue
   - `processMediaQueue(weddingId, slug)` — processes pending items when online
   - `getQueueStatus(weddingId)` — pending/uploading/failed count
7. Create `src/components/media/media-upload-form.tsx`:
   - File input (accept: image/jpeg, image/png, video/mp4)
   - Client-side validation (file type, file size)
   - If online: request signed URL → upload to R2 → confirm
   - If offline: queue in IndexedDB, show "Queued for upload when online"
   - Upload progress indicator
   - Success/error states
8. Create `src/components/media/upload-progress.tsx` — progress bar component.
9. Build `src/app/w/[slug]/upload/page.tsx`:
   - Guest name input (optional)
   - `MediaUploadForm`
   - Mobile-first, simple
   - No account required

## Upload Flow

```
Guest selects file
      ↓
Client validates: type + size
      ↓
If offline → save to mediaQueue
If online:
  POST /media/upload-url
      ↓
  Upload directly to R2 (fetch/XMLHttpRequest with progress)
      ↓
  POST /media/confirm
      ↓
  Show success
```

## Security Notes

- Server must validate file type and size before signing URL
- R2 key must be generated server-side (not client-side guessable)
- Rate limit the upload-url and confirm endpoints
- Do not accept SVG
- Do not upload through the app server

## Files and Folders Likely to Be Created or Modified

- `src/lib/storage/r2-client.ts`
- `src/modules/media/`
- `src/lib/offline/media/media-upload-queue.ts`
- `src/app/api/v1/weddings/[weddingId]/media/upload-url/route.ts`
- `src/app/api/v1/weddings/[weddingId]/media/confirm/route.ts`
- `src/components/media/media-upload-form.tsx`
- `src/components/media/upload-progress.tsx`
- `src/app/w/[slug]/upload/page.tsx`

## Testing Requirements

- Upload valid JPEG — verify in R2 + metadata in DB
- Upload valid MP4 — verify in R2 + metadata
- Upload SVG — verify rejected with UNSUPPORTED_FILE_TYPE
- Upload 11MB image — verify rejected with FILE_TOO_LARGE
- Offline upload — verify queued in IndexedDB
- Upload confirmation with wrong fileKey — verify error
- `npm run lint` passes
- `npx tsc --noEmit` passes

## Manual QA Checklist

- [ ] Guest upload page at `/w/[slug]/upload` loads
- [ ] File picker accepts images and video
- [ ] SVG rejected with error message
- [ ] Oversized file rejected with error message
- [ ] Valid image upload shows progress and success
- [ ] Valid video upload shows progress (may be slow) and success
- [ ] Offline: file queued, shows "Will upload when online"
- [ ] Media metadata appears in DB after confirm

## Acceptance Criteria

- [ ] Signed URL flow works (no media through server)
- [ ] File type and size validation on server
- [ ] Offline queue stores blobs for retry
- [ ] Confirmation creates metadata in DB
- [ ] R2 client configured and working

## Git Commit Recommendation

```
feat: implement media upload signed url flow
```

## PROGRESS.md Update Instructions

After completing this phase:
- Move Phase 22 to Completed Phases
- Set Current Phase to Phase 23 and Phase 24
- Set Last Updated to today's date

---

## Claude Code Implementation Prompt

```
You are working on the WedPass project — Phase 22: Media Upload Signed URL Flow.

Before starting, read:
- CLAUDE.md
- docs/api_contracts.md (Part 9 — Media API, Sections 31–32)
- docs/architecture.md (Section 10 — Media Architecture)
- docs/security.md (media upload rules)
- docs/env_and_deployment.md (Cloudflare R2 setup)

Your task is to implement the media upload signed URL flow.

1. Install: @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner.
2. Create src/lib/storage/r2-client.ts — S3Client configured for Cloudflare R2.
3. Create src/modules/media/ with: media.schemas.ts, media.repository.ts, media.service.ts.
   Allowed MIME types: image/jpeg, image/png, video/mp4 only.
   File size limits: images 10MB, videos 100MB.
   File key format: weddings/{weddingId}/media/{uploadId}{ext}

4. Create route handlers (both public — no auth required from guests):
   POST /api/v1/weddings/:weddingId/media/upload-url
     - Validate type + size, generate fileKey, return signed R2 URL
   POST /api/v1/weddings/:weddingId/media/confirm
     - Create media_upload metadata record in DB

5. Create src/lib/offline/media/media-upload-queue.ts:
   - queueMediaUpload(weddingId, slug, file, name): stores blob in mediaQueue
   - processMediaQueue(weddingId, slug): processes pending items when online

6. Create src/components/media/media-upload-form.tsx:
   - File input (image/jpeg, image/png, video/mp4 only)
   - Client-side validation
   - If online: request signed URL → upload to R2 → confirm
   - If offline: queue in mediaQueue, show queued message
   - Upload progress bar

7. Build src/app/w/[slug]/upload/page.tsx:
   - Optional uploader name
   - MediaUploadForm
   - Mobile-first, no auth required

CRITICAL RULES:
- Media must NOT be uploaded through the Next.js server — use signed URLs directly to R2
- Validate file type AND size on the server before issuing signed URL
- Never accept SVG files
- Rate limiting: add middleware or Vercel config for upload-url and confirm endpoints

After completing:
- Test: valid upload, SVG rejection, oversized file rejection, offline queue
- Run npm run lint — must pass

Update PROGRESS.md: Phase 22 completed, Current Phase → Phase 23.

Commit with:
git commit -m "feat: implement media upload signed url flow"
```
