import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from '../controllers/auth.controller';
import { RequestMagicLinkUseCase } from '../../application/use-cases/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from '../../application/use-cases/verify-magic-link.use-case';
import { UserRepositoryImpl } from '../adapters/database/user.repository.impl';
import { MagicLinkRepositoryImpl } from '../adapters/database/magic-link.repository.impl';
import { EmailService } from '../adapters/email/email.service';
import { JwtAdapterService } from '../services/jwt.service';
import { JwtStrategy } from '../adapters/oauth/jwt.strategy';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { MAGIC_LINK_REPOSITORY } from '../../domain/repositories/magic-link.repository';
import { EMAIL_PORT } from '../../application/ports/email.port';
import { JWT_PORT } from '../../application/ports/jwt.port';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RequestMagicLinkUseCase,
    VerifyMagicLinkUseCase,
    JwtStrategy,
    JwtAuthGuard,
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    { provide: MAGIC_LINK_REPOSITORY, useClass: MagicLinkRepositoryImpl },
    { provide: EMAIL_PORT, useClass: EmailService },
    { provide: JWT_PORT, useClass: JwtAdapterService },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
