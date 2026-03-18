import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(user.id, user.email, user.createdAt, user.updatedAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User(user.id, user.email, user.createdAt, user.updatedAt);
  }

  async isEmailWhitelisted(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user !== null;
  }
}
