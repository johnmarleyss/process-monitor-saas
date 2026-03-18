export class MagicLinkInvalidException extends Error {
  constructor() {
    super('Magic link is invalid or has already been used.');
    this.name = 'MagicLinkInvalidException';
  }
}
