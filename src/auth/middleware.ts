import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './token';
import { AppError } from '../shared/errors';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  originalUrl: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    // Preserve the original URL for post-login redirect
    const returnTo = encodeURIComponent(req.originalUrl);
    throw new AppError(`Authentication required. Redirect to /auth/login?returnTo=${returnTo}`, 401);
  }

  const token = header.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError('Invalid or expired token', 401);
  }

  req.userId = payload.userId;
  next();
}
