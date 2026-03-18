import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestMagicLinkUseCase } from '../../application/use-cases/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from '../../application/use-cases/verify-magic-link.use-case';
import { RequestMagicLinkDto } from '../../application/dtos/request-magic-link.dto';
import { VerifyMagicLinkDto } from '../../application/dtos/verify-magic-link.dto';
import { EmailNotWhitelistedException } from '../../domain/exceptions/email-not-whitelisted.exception';
import { MagicLinkExpiredException } from '../../domain/exceptions/magic-link-expired.exception';
import { MagicLinkInvalidException } from '../../domain/exceptions/magic-link-invalid.exception';
import { Public } from '../decorators/public.decorator';

const IS_PROD = process.env.NODE_ENV === 'production';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly requestMagicLinkUseCase: RequestMagicLinkUseCase,
    private readonly verifyMagicLinkUseCase: VerifyMagicLinkUseCase,
  ) {}

  @Public()
  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    try {
      await this.requestMagicLinkUseCase.execute(dto);
      return { message: 'Magic link sent to your email' };
    } catch (error) {
      if (error instanceof EmailNotWhitelistedException) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyMagicLinkDto, @Res({ passthrough: true }) res: Response) {
    return this.verifyToken(dto.token, res);
  }

  @Public()
  @Get('verify')
  async verifyGet(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
    return this.verifyToken(token, res);
  }

  private async verifyToken(token: string, res: Response) {
    try {
      const result = await this.verifyMagicLinkUseCase.execute({ token });

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 min
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'strict' : 'lax',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { user: result.user };
    } catch (error) {
      if (error instanceof MagicLinkExpiredException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof MagicLinkInvalidException) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
