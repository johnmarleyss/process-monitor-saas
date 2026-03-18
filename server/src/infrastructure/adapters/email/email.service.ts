import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailPort, SendMagicLinkEmailData } from '../../../application/ports/email.port';

@Injectable()
export class EmailService implements IEmailPort, OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    if (isDev) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(`[DEV] Ethereal email configured: ${testAccount.user}`);
    } else {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      });
    }
  }

  async sendMagicLink(data: SendMagicLinkEmailData): Promise<void> {
    const { to, magicLinkUrl, expiresInMinutes } = data;

    const info = await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM', '"Process Monitor" <noreply@processmonitor.com>'),
      to,
      subject: 'Your Magic Link - Process Monitor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Login to Process Monitor</h2>
          <p>Click the button below to log in. This link will expire in <strong>${expiresInMinutes} minutes</strong>.</p>
          <a href="${magicLinkUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                    color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Login Now
          </a>
          <p style="color: #6B7280; font-size: 14px;">
            If you didn't request this link, you can safely ignore this email.
          </p>
          <p style="color: #6B7280; font-size: 12px;">Link: ${magicLinkUrl}</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`[DEV] Preview email: ${previewUrl}`);
    }
    this.logger.log(`Magic link email sent to ${to}`);
  }
}
