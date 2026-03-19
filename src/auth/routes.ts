import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from './token';
import { AppError } from '../shared/errors';

const router = Router();

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

router.post('/register', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // In real app: save user to database
  const userId = `user_${Date.now()}`;

  const token = generateToken({ userId, email });
  res.status(201).json({ token, userId });
});

router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // In real app: look up user in database and verify password
  const userId = 'user_123';
  const token = generateToken({ userId, email });
  res.json({ token });
});

router.post('/logout', (_req: Request, res: Response) => {
  // In real app: invalidate token in blocklist
  res.json({ message: 'Logged out successfully' });
});

export { router as authRoutes };
