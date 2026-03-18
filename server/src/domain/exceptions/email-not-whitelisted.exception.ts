export class EmailNotWhitelistedException extends Error {
  constructor(email: string) {
    super(`Email '${email}' is not authorized to access this system`);
    this.name = 'EmailNotWhitelistedException';
  }
}
