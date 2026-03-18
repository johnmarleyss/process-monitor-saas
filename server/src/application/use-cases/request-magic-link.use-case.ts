import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { IMagicLinkRepository, MAGIC_LINK_REPOSITORY } from '../../domain/repositories/magic-link.repository';
import { IEmailPort, EMAIL_PORT } from '../ports/email.port';
import { IJwtPort, JWT_PORT } from '../ports/jwt.port';
import { EmailNotWhitelistedException } from '../../domain/exceptions/email-not-whitelisted.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { MagicLink } from '../../domain/entities/magic-link.entity';
import { RequestMagicLinkDto } from '../dtos/request-magic-link.dto';

const MAGIC_LINK_EXPIRY_MINUTES = 15;

@Injectable()
export class RequestMagicLinkUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(MAGIC_LINK_REPOSITORY) private readonly magicLinkRepository: IMagicLinkRepository,
    @Inject(EMAIL_PORT) private readonly emailPort: IEmailPort,
    @Inject(JWT_PORT) private readonly jwtPort: IJwtPort,
  ) {}

  async execute(dto: RequestMagicLinkDto): Promise<void> {
    const isWhitelisted = await this.userRepository.isEmailWhitelisted(dto.email);
    
    if (!isWhitelisted) {
      throw new EmailNotWhitelistedException(dto.email);
    }

    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UserNotFoundException(dto.email);
    }

    await this.magicLinkRepository.invalidatePreviousLinks(user.id);

    const token = this.jwtPort.generateMagicLinkToken(user.id, user.email);
    const magicLink = MagicLink.create(user.id, token, MAGIC_LINK_EXPIRY_MINUTES);
    await this.magicLinkRepository.create(magicLink);

    const magicLinkUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

    console.log(magicLinkUrl);
    
    
    await this.emailPort.sendMagicLink({
      to: user.email,
      magicLinkUrl,
      expiresInMinutes: MAGIC_LINK_EXPIRY_MINUTES,
    });
  }
}
