import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { IMagicLinkRepository, MAGIC_LINK_REPOSITORY } from '../../domain/repositories/magic-link.repository';
import { IJwtPort, JWT_PORT } from '../ports/jwt.port';
import { MagicLinkExpiredException } from '../../domain/exceptions/magic-link-expired.exception';
import { MagicLinkInvalidException } from '../../domain/exceptions/magic-link-invalid.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { VerifyMagicLinkDto } from '../dtos/verify-magic-link.dto';

export interface VerifyMagicLinkResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

@Injectable()
export class VerifyMagicLinkUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(MAGIC_LINK_REPOSITORY) private readonly magicLinkRepository: IMagicLinkRepository,
    @Inject(JWT_PORT) private readonly jwtPort: IJwtPort,
  ) {}

  async execute(dto: VerifyMagicLinkDto): Promise<VerifyMagicLinkResult> {
    const magicLink = await this.magicLinkRepository.findByToken(dto.token);
    if (!magicLink) {
      throw new MagicLinkInvalidException();
    }

    if (magicLink.isExpired()) {
      throw new MagicLinkExpiredException();
    }

    if (magicLink.isUsed()) {
      throw new MagicLinkInvalidException();
    }

    const user = await this.userRepository.findById(magicLink.userId);
    if (!user) {
      throw new UserNotFoundException(magicLink.userId);
    }

    await this.magicLinkRepository.markAsUsed(magicLink.id);
    const accessToken = this.jwtPort.generateSessionToken(user.id, user.email);
    const refreshToken = this.jwtPort.generateRefreshToken(user.id, user.email);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }
}
