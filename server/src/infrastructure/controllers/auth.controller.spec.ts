import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RequestMagicLinkUseCase } from '../../application/use-cases/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from '../../application/use-cases/verify-magic-link.use-case';
import { EmailNotWhitelistedException } from '../../domain/exceptions/email-not-whitelisted.exception';
import { MagicLinkInvalidException } from '../../domain/exceptions/magic-link-invalid.exception';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let requestMagicLinkUseCase: jest.Mocked<RequestMagicLinkUseCase>;
  let verifyMagicLinkUseCase: jest.Mocked<VerifyMagicLinkUseCase>;

  beforeEach(async () => {
    const mockRequestMagicLinkUseCase = {
      execute: jest.fn(),
    };
    const mockVerifyMagicLinkUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RequestMagicLinkUseCase, useValue: mockRequestMagicLinkUseCase },
        { provide: VerifyMagicLinkUseCase, useValue: mockVerifyMagicLinkUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    requestMagicLinkUseCase = module.get(RequestMagicLinkUseCase);
    verifyMagicLinkUseCase = module.get(VerifyMagicLinkUseCase);
  });

  describe('POST /auth/magic-link', () => {
    it('should return 200 with success message when email is valid', async () => {
      requestMagicLinkUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.requestMagicLink({ email: 'admin@processmonitor.com' });

      expect(result).toEqual({ message: 'Magic link sent to your email' });
      expect(requestMagicLinkUseCase.execute).toHaveBeenCalledWith({ email: 'admin@processmonitor.com' });
    });

    it('should throw 403 when email is not whitelisted', async () => {
      requestMagicLinkUseCase.execute.mockRejectedValue(
        new EmailNotWhitelistedException('unknown@example.com'),
      );

      await expect(controller.requestMagicLink({ email: 'unknown@example.com' }))
        .rejects.toThrow(HttpException);
    });
  });

  describe('POST /auth/verify', () => {
    it('should return access token and user on valid token', async () => {
      const verifyResult = {
        accessToken: 'session-token',
        user: { id: 'user-id', email: 'admin@processmonitor.com' },
      };

      verifyMagicLinkUseCase.execute.mockResolvedValue(verifyResult);

      const result = await controller.verify({ token: 'valid-token' });

      expect(result).toEqual(verifyResult);
    });

    it('should throw 401 when token is invalid', async () => {
      verifyMagicLinkUseCase.execute.mockRejectedValue(new MagicLinkInvalidException());

      await expect(controller.verify({ token: 'invalid-token' }))
        .rejects.toThrow(HttpException);
    });
  });
});
