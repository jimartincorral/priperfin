import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export const API_TOKEN_PREFIX = 'pfp_';

/** sha256 hex of a plain token; only this is stored. */
export function hashApiToken(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

@Injectable()
export class ApiTokenService {
  private readonly logger = new Logger(ApiTokenService.name);
  /** The integration polls every minute; one write per poll is not worth it. */
  private readonly LAST_USED_WRITE_INTERVAL_MS = 5 * 60 * 1000;

  constructor(private prisma: PrismaService) {}

  /** Creates a token and returns the plain value, which is never shown again. */
  async create(profileId: string, name: string) {
    const token = API_TOKEN_PREFIX + randomBytes(32).toString('base64url');
    const record = await this.prisma.apiToken.create({
      data: { profileId, name: name.trim(), tokenHash: hashApiToken(token) },
    });
    this.logger.log(
      `API token "${record.name}" created for profile ${profileId}`,
    );
    return {
      id: record.id,
      name: record.name,
      createdAt: record.createdAt,
      token,
    };
  }

  list(profileId: string) {
    return this.prisma.apiToken.findMany({
      where: { profileId },
      select: { id: true, name: true, createdAt: true, lastUsedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(profileId: string, id: string) {
    const record = await this.prisma.apiToken.findFirst({
      where: { id, profileId },
    });
    if (!record) throw new NotFoundException('API token not found');
    await this.prisma.apiToken.delete({ where: { id } });
    this.logger.log(
      `API token "${record.name}" revoked for profile ${profileId}`,
    );
  }

  /** Resolves a plain token to its profile, or null when unknown or revoked. */
  async validate(plain: string) {
    if (!plain || !plain.startsWith(API_TOKEN_PREFIX)) return null;
    const record = await this.prisma.apiToken.findUnique({
      where: { tokenHash: hashApiToken(plain) },
      include: { profile: true },
    });
    if (!record) return null;

    const now = Date.now();
    if (
      !record.lastUsedAt ||
      now - record.lastUsedAt.getTime() > this.LAST_USED_WRITE_INTERVAL_MS
    ) {
      try {
        await this.prisma.apiToken.update({
          where: { id: record.id },
          data: { lastUsedAt: new Date(now) },
        });
      } catch {
        // Bookkeeping only; never block a valid token on it.
      }
    }
    return record.profile;
  }
}
