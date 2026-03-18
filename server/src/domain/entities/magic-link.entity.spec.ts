import { MagicLink } from './magic-link.entity';

describe('MagicLink Entity', () => {
  describe('create', () => {
    it('should create a magic link with default 15 minute expiry', () => {
      const userId = 'user-id';
      const token = 'test-token';
      const before = new Date();

      const magicLink = MagicLink.create(userId, token);

      const expectedExpiry = new Date(before);
      expectedExpiry.setMinutes(expectedExpiry.getMinutes() + 15);

      expect(magicLink.userId).toBe(userId);
      expect(magicLink.token).toBe(token);
      expect(magicLink.usedAt).toBeNull();
      expect(magicLink.expiresAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(magicLink.expiresAt.getTime()).toBeLessThanOrEqual(expectedExpiry.getTime() + 1000);
    });

    it('should create a magic link with custom expiry minutes', () => {
      const magicLink = MagicLink.create('user-id', 'token', 30);
      const now = new Date();
      const minExpiry = new Date(now.getTime() + 29 * 60 * 1000);
      const maxExpiry = new Date(now.getTime() + 31 * 60 * 1000);

      expect(magicLink.expiresAt.getTime()).toBeGreaterThan(minExpiry.getTime());
      expect(magicLink.expiresAt.getTime()).toBeLessThan(maxExpiry.getTime());
    });
  });

  describe('isExpired', () => {
    it('should return false when not expired', () => {
      const magicLink = MagicLink.create('user-id', 'token', 15);
      expect(magicLink.isExpired()).toBe(false);
    });

    it('should return true when expired', () => {
      const pastDate = new Date(Date.now() - 1000);
      const magicLink = new MagicLink('id', 'token', 'user-id', pastDate, null, new Date());
      expect(magicLink.isExpired()).toBe(true);
    });
  });

  describe('isUsed', () => {
    it('should return false when not used', () => {
      const magicLink = MagicLink.create('user-id', 'token');
      expect(magicLink.isUsed()).toBe(false);
    });

    it('should return true when usedAt is set', () => {
      const futureDate = new Date(Date.now() + 60000);
      const magicLink = new MagicLink('id', 'token', 'user-id', futureDate, new Date(), new Date());
      expect(magicLink.isUsed()).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true when not expired and not used', () => {
      const magicLink = MagicLink.create('user-id', 'token');
      expect(magicLink.isValid()).toBe(true);
    });

    it('should return false when expired', () => {
      const pastDate = new Date(Date.now() - 1000);
      const magicLink = new MagicLink('id', 'token', 'user-id', pastDate, null, new Date());
      expect(magicLink.isValid()).toBe(false);
    });

    it('should return false when used', () => {
      const futureDate = new Date(Date.now() + 60000);
      const magicLink = new MagicLink('id', 'token', 'user-id', futureDate, new Date(), new Date());
      expect(magicLink.isValid()).toBe(false);
    });
  });
});
