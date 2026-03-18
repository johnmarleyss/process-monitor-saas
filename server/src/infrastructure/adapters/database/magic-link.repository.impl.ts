import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IMagicLinkRepository } from '../../../domain/repositories/magic-link.repository';
import { MagicLink } from '../../../domain/entities/magic-link.entity';

@Injectable()
export class MagicLinkRepositoryImpl implements IMagicLinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(magicLink: MagicLink): Promise<MagicLink> {
    const created = await this.prisma.magicLink.create({
      data: {
        id: magicLink.id,
        token: magicLink.token,
        userId: magicLink.userId,
        expiresAt: magicLink.expiresAt,
      },
    });
    return new MagicLink(
      created.id,
      created.token,
      created.userId,
      created.expiresAt,
      created.usedAt,
      created.createdAt,
    );
  }

  async findByToken(token: string): Promise<MagicLink | null> {
    const record = await this.prisma.magicLink.findUnique({ where: { token } });
    if (!record) return null;
    return new MagicLink(
      record.id,
      record.token,
      record.userId,
      record.expiresAt,
      record.usedAt,
      record.createdAt,
    );
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.magicLink.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidatePreviousLinks(userId: string): Promise<void> {
    await this.prisma.magicLink.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}
