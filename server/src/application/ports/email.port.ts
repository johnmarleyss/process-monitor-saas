export interface SendMagicLinkEmailData {
  to: string;
  magicLinkUrl: string;
  expiresInMinutes: number;
}

export interface IEmailPort {
  sendMagicLink(data: SendMagicLinkEmailData): Promise<void>;
}

export const EMAIL_PORT = Symbol('IEmailPort');
