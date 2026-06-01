import { prisma } from "@/lib/db/prisma"
import type { CreateUserData } from "./auth.types"

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(data: CreateUserData) {
  return prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      passwordHash: data.passwordHash,
    },
  })
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } })
}

export async function updateLastLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })
}
