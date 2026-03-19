import { updateUserSchema } from '../../src/users/validation';

describe('User validation', () => {
  describe('updateUserSchema', () => {
    it('should accept valid user update', () => {
      const result = updateUserSchema.safeParse({
        name: 'New Name',
        email: 'new@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = updateUserSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('should accept partial updates', () => {
      const result = updateUserSchema.safeParse({ name: 'Just Name' });
      expect(result.success).toBe(true);
    });
  });
});
