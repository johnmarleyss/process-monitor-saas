export class MagicLink {
  constructor(
    public readonly id: string,
    public readonly token: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly usedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(userId: string, token: string, expiresInMinutes = 15): MagicLink {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    return new MagicLink(
      crypto.randomUUID(),
      token,
      userId,
      expiresAt,
      null,
      new Date(),
    );
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }
}
