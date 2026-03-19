import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const RESET_SECRET = process.env.RESET_SECRET || 'dev-reset-secret';
const TOKEN_EXPIRY = '24h';
const RESET_TOKEN_EXPIRY = '1h';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface ResetTokenPayload {
  email: string;
  type: 'password_reset';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function generateResetToken(email: string): string {
  const payload: ResetTokenPayload = { email, type: 'password_reset' };
  return jwt.sign(payload, RESET_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });
}

export function verifyResetToken(token: string): ResetTokenPayload | null {
  try {
    const payload = jwt.verify(token, RESET_SECRET) as ResetTokenPayload;
    if (payload.type !== 'password_reset') return null;
    return payload;
  } catch {
    return null;
  }
}
