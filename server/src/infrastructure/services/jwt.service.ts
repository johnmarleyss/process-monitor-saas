import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtPort, JwtPayload } from '../../application/ports/jwt.port';

const MAGIC_LINK_EXPIRY = '15m';
const SESSION_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

@Injectable()
export class JwtAdapterService implements IJwtPort {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateMagicLinkToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, type: 'magic-link' },
      {
        secret: this.configService.get<string>('JWT_MAGIC_LINK_SECRET'),
        expiresIn: MAGIC_LINK_EXPIRY,
      },
    );
  }

  generateSessionToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, type: 'session' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: SESSION_EXPIRY,
      },
    );
  }

  generateRefreshToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', this.configService.get<string>('JWT_SECRET')!),
        expiresIn: REFRESH_EXPIRY,
      },
    );
  }

  verifyMagicLinkToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_MAGIC_LINK_SECRET'),
    });
  }
}
