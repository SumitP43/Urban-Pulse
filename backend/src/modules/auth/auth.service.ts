import { prisma } from '../../database/prisma.js';
import { hashPassword, verifyPassword, hashToken, generateRandomToken } from '../../utils/crypto.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../common/errors.js';
import { Role } from '../../common/types.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export class AuthService {
  async register(input: RegisterInput): Promise<UserResponse> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);

    // Rule: Register always creates role USER
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: 'USER',
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async validateUserCredentials(input: LoginInput): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async createRefreshToken(userId: string, familyId?: string): Promise<string> {
    const rawToken = generateRandomToken(40);
    const tokenHash = hashToken(rawToken);
    const resolvedFamilyId = familyId || generateRandomToken(16);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days refresh lifespan

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        familyId: resolvedFamilyId,
        expiresAt,
      },
    });

    return rawToken;
  }

  async rotateRefreshToken(rawToken: string): Promise<{ userId: string; user: UserResponse; newRefreshToken: string }> {
    const hashed = hashToken(rawToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashed },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Reuse Detection: If token is already revoked, an adversary or stale client is attempting reuse
    if (storedToken.isRevoked) {
      // Invalidate the entire token family
      await prisma.refreshToken.updateMany({
        where: { familyId: storedToken.familyId },
        data: { isRevoked: true, revokedAt: new Date() },
      });
      throw new UnauthorizedError('Refresh token reuse detected. All sessions in this family invalidated.');
    }

    // Check expiration
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true, revokedAt: new Date() },
      });
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    // Create new token within same familyId
    const newRefreshToken = await this.createRefreshToken(storedToken.userId, storedToken.familyId);

    const user: UserResponse = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      role: storedToken.user.role as Role,
      isActive: storedToken.user.isActive,
      createdAt: storedToken.user.createdAt,
    };

    return {
      userId: storedToken.userId,
      user,
      newRefreshToken,
    };
  }

  async revokeToken(rawToken: string): Promise<void> {
    const hashed = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashed },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
