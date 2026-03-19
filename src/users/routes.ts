import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth/middleware';
import { updateUserSchema } from './validation';
import { UserProfile } from '../shared/types';
import { AppError } from '../shared/errors';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  // In real app: fetch user from database
  const profile: UserProfile = {
    id: req.userId!,
    email: 'user@example.com',
    name: 'Test User',
    displayName: 'Test',
    bio: '',
    timezone: 'America/New_York',
  };
  res.json({ user: profile });
});

router.put('/me', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = updateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError('Invalid user data', 400);
  }

  // In real app: update user in database
  res.json({ user: { id: req.userId, ...parsed.data } });
});

export { router as userRoutes };
