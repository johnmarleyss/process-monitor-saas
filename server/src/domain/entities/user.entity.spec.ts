import { User } from './user.entity';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a user with the given email', () => {
      const email = 'test@example.com';
      const user = User.create(email);

      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate a unique id for each user', () => {
      const user1 = User.create('user1@example.com');
      const user2 = User.create('user2@example.com');

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('constructor', () => {
    it('should create a user with all provided properties', () => {
      const id = 'test-id';
      const email = 'test@example.com';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const user = new User(id, email, createdAt, updatedAt);

      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });
});
