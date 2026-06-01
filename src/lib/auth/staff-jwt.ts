import jwt from "jsonwebtoken"

interface StaffTokenPayload {
  staffDeviceId: string
  weddingId: string
  scope: "staff"
}

export function signStaffToken(payload: { staffDeviceId: string; weddingId: string }): string {
  const secret = process.env.STAFF_JWT_SECRET
  if (!secret) throw new Error("STAFF_JWT_SECRET is not configured")

  return jwt.sign({ ...payload, scope: "staff" }, secret, { expiresIn: "30d" })
}

export function verifyStaffToken(token: string): StaffTokenPayload {
  const secret = process.env.STAFF_JWT_SECRET
  if (!secret) throw new Error("STAFF_JWT_SECRET is not configured")

  const decoded = jwt.verify(token, secret) as jwt.JwtPayload

  if (decoded.scope !== "staff") {
    throw new Error("Invalid token scope")
  }

  return {
    staffDeviceId: decoded.staffDeviceId as string,
    weddingId: decoded.weddingId as string,
    scope: "staff",
  }
}
