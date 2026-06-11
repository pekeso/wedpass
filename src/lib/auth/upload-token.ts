import jwt from "jsonwebtoken"

export function generateUploadToken(weddingId: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")
  return jwt.sign({ weddingId, type: "upload" }, secret, { expiresIn: "1h" })
}

export function verifyUploadToken(token: string): { weddingId: string } {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")
  const payload = jwt.verify(token, secret) as { weddingId: string; type: string }
  if (payload.type !== "upload") throw new Error("Invalid token type")
  return { weddingId: payload.weddingId }
}
