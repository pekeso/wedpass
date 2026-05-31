export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SNAPSHOT_MISMATCH: 'SNAPSHOT_MISMATCH',
  INVALID_QR_TOKEN: 'INVALID_QR_TOKEN',
  UPLOAD_TOO_LARGE: 'UPLOAD_TOO_LARGE',
  SYNC_FAILED: 'SYNC_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
