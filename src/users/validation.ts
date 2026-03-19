import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().min(1).optional(),
});
