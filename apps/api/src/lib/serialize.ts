import type { User as DbUser } from '@prisma/client';
import type { User } from '@technokhan/shared';

/** Public user shape (matches shared `User`) */
export function serializeUser(user: DbUser): User {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
