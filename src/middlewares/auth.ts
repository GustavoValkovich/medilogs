import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export interface AuthRequest extends Request {
  user?: { id: number | string; role?: string };
}

export function generateToken(payload: object, expiresIn = '8h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = (req.headers.authorization as string) || '';
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid authorization format' });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

export default { authenticateJWT, requireRole, generateToken };
