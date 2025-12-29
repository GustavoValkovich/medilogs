import type { Request, Response, NextFunction } from 'express';
import { HttpError } from './http-error.js';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err?.code === '23505') {
    return res.status(409).json({
      message: 'El email ya existe',
      code: 'DUPLICATE_EMAIL',
      details: err?.detail,
    });
  }

  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({ message: 'Error interno del servidor' });
}
