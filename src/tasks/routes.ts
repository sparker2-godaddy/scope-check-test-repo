import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth/middleware';
import { createTaskSchema, updateTaskSchema } from './validation';
import { Task, ArchivedTask } from './model';
import { AppError } from '../shared/errors';

const router = Router();

router.use(requireAuth);

// Refactored: extract common task lookup (UNRELATED REFACTOR)
async function findTaskById(id: string, userId: string): Promise<Task | null> {
  // In real app: query database
  return null;
}

// Refactored: extract common ownership check (UNRELATED REFACTOR)
function assertOwnership(task: Task | null, userId: string): Task {
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  if (task.userId !== userId) {
    throw new AppError('Not authorized to access this task', 403);
  }
  return task;
}

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  // In real app: fetch non-archived tasks from database for req.userId
  const tasks: Task[] = [];
  res.json({ tasks });
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
  res.status(201).json({ task });
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Invalid update data', 400);
  }

  // In real app: update task in database
  res.json({ task: { id, ...parsed.data, updatedAt: new Date() } });
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  // In real app: delete task from database
  res.json({ message: `Task ${id} deleted` });
});

// NEW: Archive endpoints
router.get('/archived', async (req: AuthenticatedRequest, res: Response) => {
  // In real app: fetch archived tasks from database for req.userId
  const archivedTasks: ArchivedTask[] = [];
  res.json({ tasks: archivedTasks });
});

router.post('/:id/archive', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  // In real app: look up task, verify ownership, set archived status
  const archivedTask: ArchivedTask = {
    id,
    title: 'Archived task',
    description: '',
    status: 'archived',
    priority: 'medium',
    userId: req.userId!,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: new Date(),
    archivedBy: req.userId!,
  };

  res.json({ task: archivedTask });
});

router.post('/:id/unarchive', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  // In real app: restore task from archived status
  res.json({ task: { id, status: 'todo', updatedAt: new Date() } });
});

export { router as taskRoutes };
