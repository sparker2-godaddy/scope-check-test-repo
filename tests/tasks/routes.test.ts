import { createTaskSchema, updateTaskSchema } from '../../src/tasks/validation';

describe('Task validation', () => {
  describe('createTaskSchema', () => {
    it('should accept valid task data', () => {
      const result = createTaskSchema.safeParse({
        title: 'Test task',
        description: 'A test task',
        priority: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = createTaskSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('should default priority to medium', () => {
      const result = createTaskSchema.safeParse({ title: 'Test' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('medium');
      }
    });
  });

  describe('updateTaskSchema', () => {
    it('should accept partial updates', () => {
      const result = updateTaskSchema.safeParse({ status: 'done' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateTaskSchema.safeParse({ status: 'invalid' });
      expect(result.success).toBe(false);
    });
  });
});
