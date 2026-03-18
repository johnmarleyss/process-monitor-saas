export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(email: string): User {
    return new User(
      crypto.randomUUID(),
      email,
      new Date(),
      new Date(),
    );
  }
}
