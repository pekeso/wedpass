import { hashPassword, comparePassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateLastLogin,
} from "./auth.repository"
import type { RegisterInput, LoginInput } from "./auth.schemas"
import type { UserDTO, AuthResponseDTO, MeResponseDTO } from "./auth.dto"

export class ConflictError extends Error {
  readonly code = "CONFLICT"
  constructor() {
    super("An account with this email already exists")
    this.name = "ConflictError"
  }
}

export class InvalidCredentialsError extends Error {
  readonly code = "UNAUTHORIZED"
  constructor() {
    super("Invalid email or password")
    this.name = "InvalidCredentialsError"
  }
}

export class NotFoundError extends Error {
  readonly code = "NOT_FOUND"
  constructor() {
    super("User not found")
    this.name = "NotFoundError"
  }
}

function toUserDTO(user: { id: string; fullName: string; email: string }): UserDTO {
  return { id: user.id, fullName: user.fullName, email: user.email }
}

export async function registerOrganizer(
  data: RegisterInput
): Promise<AuthResponseDTO> {
  const existing = await findUserByEmail(data.email)
  if (existing) throw new ConflictError()

  const passwordHash = await hashPassword(data.password)
  const user = await createUser({
    email: data.email,
    fullName: data.fullName,
    passwordHash,
  })

  const accessToken = signToken({ userId: user.id })
  return { user: toUserDTO(user), accessToken }
}

export async function loginOrganizer(
  data: LoginInput
): Promise<AuthResponseDTO> {
  const user = await findUserByEmail(data.email)
  if (!user) throw new InvalidCredentialsError()

  const isValid = await comparePassword(data.password, user.passwordHash)
  if (!isValid) throw new InvalidCredentialsError()

  await updateLastLogin(user.id)

  const accessToken = signToken({ userId: user.id })
  return { user: toUserDTO(user), accessToken }
}

export async function getCurrentUser(userId: string): Promise<MeResponseDTO> {
  const user = await findUserById(userId)
  if (!user) throw new NotFoundError()
  return { user: toUserDTO(user) }
}
