export class MagicLinkExpiredException extends Error {
  constructor() {
    super('Magic link has expired. Please request a new one.');
    this.name = 'MagicLinkExpiredException';
  }
}
