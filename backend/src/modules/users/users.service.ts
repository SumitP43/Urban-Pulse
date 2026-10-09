import { prisma } from '../../database/prisma.js';
import { NotFoundError } from '../../common/errors.js';
import { Role } from '../../common/types.js';

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UsersService {
  async listUsers(page = 1, limit = 20): Promise<{ users: UserSummary[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { isDeleted: false } }),
    ]);

    return {
      users: users.map((u) => ({ ...u, role: u.role as Role })),
      total,
      page,
      limit,
    };
  }

  async updateRole(id: string, newRole: Role): Promise<UserSummary> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updated,
      role: updated.role as Role,
    };
  }
}

export const usersService = new UsersService();
