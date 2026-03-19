import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth/middleware';
import { createTaskSchema, updateTaskSchema } from './validation';
import { Task } from './model';
import { AppError } from '../shared/errors';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  // In real app: fetch tasks from database for req.userId
  const tasks: Task[] = [];
  res.json({ tasks, count: tasks.length });
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid task data', 400);
  }

  const task: Task = {
    id: `task_${Date.now()}`,
    ...parsed.data,
    description: parsed.data.description || '',
    status: 'todo',
    userId: req.userId!,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // In real app: save to database
  res.status(201).json({ task, message: 'Task created successfully' });
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Invalid update data', 400);
  }

  // In real app: update task in database
  res.json({ task: { id, ...parsed.data, updatedAt: new Date() }, message: 'Task updated' });
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  // In real app: delete task from database
  res.json({ message: `Task ${id} deleted successfully` });
});

export { router as taskRoutes };
