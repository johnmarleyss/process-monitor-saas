export interface JwtPayload {
  sub: string;
  email: string;
}

export interface IJwtPort {
  generateMagicLinkToken(userId: string, email: string): string;
  generateSessionToken(userId: string, email: string): string;
  generateRefreshToken(userId: string, email: string): string;
  verifyMagicLinkToken(token: string): JwtPayload;
}

export const JWT_PORT = Symbol('IJwtPort');
