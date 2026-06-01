import jwt from "jsonwebtoken"

export function signToken(payload: { userId: string }): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "7d",
  })
}

export function verifyToken(token: string): { userId: string } {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")

  const decoded = jwt.verify(token, secret)
  return decoded as { userId: string }
}
