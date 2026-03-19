import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, generateResetToken, verifyResetToken } from './token';
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

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  token: string;
  newPassword: string;
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

router.post('/forgot-password', async (req: Request<{}, {}, ForgotPasswordBody>, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // In real app: look up user by email, generate reset token, send email
  // Always return 200 to prevent email enumeration
  const resetToken = generateResetToken(email);
  // In real app: send email with reset link containing resetToken
  res.json({ message: 'If an account exists with this email, a reset link has been sent' });
});

router.post('/reset-password', async (req: Request<{}, {}, ResetPasswordBody>, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400);
  }

  const payload = verifyResetToken(token);
  if (!payload) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  // In real app: update user password in database, invalidate reset token
  res.json({ message: 'Password reset successfully' });
});

export { router as authRoutes };
