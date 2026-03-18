import { RequestMagicLinkUseCase } from './request-magic-link.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IMagicLinkRepository } from '../../domain/repositories/magic-link.repository';
import { IEmailPort } from '../ports/email.port';
import { IJwtPort } from '../ports/jwt.port';
import { EmailNotWhitelistedException } from '../../domain/exceptions/email-not-whitelisted.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { User } from '../../domain/entities/user.entity';
import { MagicLink } from '../../domain/entities/magic-link.entity';

describe('RequestMagicLinkUseCase', () => {
  let useCase: RequestMagicLinkUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let magicLinkRepository: jest.Mocked<IMagicLinkRepository>;
  let emailPort: jest.Mocked<IEmailPort>;
  let jwtPort: jest.Mocked<IJwtPort>;

  const mockUser = new User('user-id', 'admin@processmonitor.com', new Date(), new Date());

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      isEmailWhitelisted: jest.fn(),
    };

    magicLinkRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markAsUsed: jest.fn(),
      invalidatePreviousLinks: jest.fn(),
    };

    emailPort = {
      sendMagicLink: jest.fn(),
    };

    jwtPort = {
      generateMagicLinkToken: jest.fn(),
      generateSessionToken: jest.fn(),
      verifyMagicLinkToken: jest.fn(),
    };

    useCase = new RequestMagicLinkUseCase(
      userRepository,
      magicLinkRepository,
      emailPort,
      jwtPort,
    );
  });

  it('should throw EmailNotWhitelistedException when email is not whitelisted', async () => {
    userRepository.isEmailWhitelisted.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'unknown@example.com' }))
      .rejects.toThrow(EmailNotWhitelistedException);

    expect(userRepository.isEmailWhitelisted).toHaveBeenCalledWith('unknown@example.com');
    expect(emailPort.sendMagicLink).not.toHaveBeenCalled();
  });

  it('should throw UserNotFoundException when email is whitelisted but user not found', async () => {
    userRepository.isEmailWhitelisted.mockResolvedValue(true);
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'admin@processmonitor.com' }))
      .rejects.toThrow(UserNotFoundException);
  });

  it('should invalidate previous links, create new magic link and send email', async () => {
    const token = 'jwt-magic-token';
    const magicLink = MagicLink.create(mockUser.id, token);

    userRepository.isEmailWhitelisted.mockResolvedValue(true);
    userRepository.findByEmail.mockResolvedValue(mockUser);
    jwtPort.generateMagicLinkToken.mockReturnValue(token);
    magicLinkRepository.invalidatePreviousLinks.mockResolvedValue(undefined);
    magicLinkRepository.create.mockResolvedValue(magicLink);
    emailPort.sendMagicLink.mockResolvedValue(undefined);

    await useCase.execute({ email: mockUser.email });

    expect(magicLinkRepository.invalidatePreviousLinks).toHaveBeenCalledWith(mockUser.id);
    expect(jwtPort.generateMagicLinkToken).toHaveBeenCalledWith(mockUser.id, mockUser.email);
    expect(magicLinkRepository.create).toHaveBeenCalled();
    expect(emailPort.sendMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockUser.email,
        expiresInMinutes: 15,
      }),
    );
  });
});
