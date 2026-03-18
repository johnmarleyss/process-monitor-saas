import { VerifyMagicLinkUseCase } from './verify-magic-link.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IMagicLinkRepository } from '../../domain/repositories/magic-link.repository';
import { IJwtPort } from '../ports/jwt.port';
import { MagicLinkExpiredException } from '../../domain/exceptions/magic-link-expired.exception';
import { MagicLinkInvalidException } from '../../domain/exceptions/magic-link-invalid.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { User } from '../../domain/entities/user.entity';
import { MagicLink } from '../../domain/entities/magic-link.entity';

describe('VerifyMagicLinkUseCase', () => {
  let useCase: VerifyMagicLinkUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let magicLinkRepository: jest.Mocked<IMagicLinkRepository>;
  let jwtPort: jest.Mocked<IJwtPort>;

  const mockUser = new User('user-id', 'admin@processmonitor.com', new Date(), new Date());
  const validMagicLink = MagicLink.create(mockUser.id, 'valid-token', 15);

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

    jwtPort = {
      generateMagicLinkToken: jest.fn(),
      generateSessionToken: jest.fn(),
      verifyMagicLinkToken: jest.fn(),
    };

    useCase = new VerifyMagicLinkUseCase(userRepository, magicLinkRepository, jwtPort);
  });

  it('should throw MagicLinkInvalidException when token is not found', async () => {
    magicLinkRepository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'invalid-token' }))
      .rejects.toThrow(MagicLinkInvalidException);
  });

  it('should throw MagicLinkExpiredException when magic link is expired', async () => {
    const expiredMagicLink = new MagicLink(
      'id',
      'expired-token',
      mockUser.id,
      new Date(Date.now() - 1000),
      null,
      new Date(),
    );

    magicLinkRepository.findByToken.mockResolvedValue(expiredMagicLink);

    await expect(useCase.execute({ token: 'expired-token' }))
      .rejects.toThrow(MagicLinkExpiredException);
  });

  it('should throw MagicLinkInvalidException when magic link is already used', async () => {
    const usedMagicLink = new MagicLink(
      'id',
      'used-token',
      mockUser.id,
      new Date(Date.now() + 60000),
      new Date(),
      new Date(),
    );

    magicLinkRepository.findByToken.mockResolvedValue(usedMagicLink);

    await expect(useCase.execute({ token: 'used-token' }))
      .rejects.toThrow(MagicLinkInvalidException);
  });

  it('should throw UserNotFoundException when user not found', async () => {
    magicLinkRepository.findByToken.mockResolvedValue(validMagicLink);
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'valid-token' }))
      .rejects.toThrow(UserNotFoundException);
  });

  it('should mark link as used and return session token on success', async () => {
    const sessionToken = 'session-jwt-token';

    magicLinkRepository.findByToken.mockResolvedValue(validMagicLink);
    userRepository.findById.mockResolvedValue(mockUser);
    jwtPort.generateSessionToken.mockReturnValue(sessionToken);
    magicLinkRepository.markAsUsed.mockResolvedValue(undefined);

    const result = await useCase.execute({ token: 'valid-token' });

    expect(magicLinkRepository.markAsUsed).toHaveBeenCalledWith(validMagicLink.id);
    expect(jwtPort.generateSessionToken).toHaveBeenCalledWith(mockUser.id, mockUser.email);
    expect(result).toEqual({
      accessToken: sessionToken,
      user: { id: mockUser.id, email: mockUser.email },
    });
  });
});
