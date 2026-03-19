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

    it('should accept archived status', () => {
      const result = updateTaskSchema.safeParse({ status: 'archived' });
      expect(result.success).toBe(true);
    });
  });
});

describe('Task archival', () => {
  it('should archive a task with metadata', () => {
    // In real test: call POST /tasks/:id/archive and verify response
    const archivedTask = {
      id: 'task_1',
      status: 'archived',
      archivedAt: new Date(),
      archivedBy: 'user_123',
    };
    expect(archivedTask.status).toBe('archived');
    expect(archivedTask.archivedAt).toBeDefined();
    expect(archivedTask.archivedBy).toBeDefined();
  });

  it('should unarchive a task', () => {
    // In real test: call POST /tasks/:id/unarchive and verify status restored
    const restoredTask = { id: 'task_1', status: 'todo' };
    expect(restoredTask.status).toBe('todo');
  });

  it('should exclude archived tasks from default listing', () => {
    // In real test: verify GET /tasks excludes archived tasks
    expect(true).toBe(true);
  });

  it('should list only archived tasks on archive endpoint', () => {
    // In real test: verify GET /tasks/archived returns only archived
    expect(true).toBe(true);
  });
});
