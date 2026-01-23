import type { Request, Response, NextFunction } from 'express';
import { HttpError } from './http-error.js';


const isValidationCode = (msg: unknown) => {
  const m = String(msg ?? '');
  return m.startsWith('INVALID_') || m === 'FUTURE_BIRTH_DATE' || m === 'INVALID_BIRTH_DATE';
};

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
 
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  
  if (err?.message === 'DUPLICATE_EMAIL' || err?.httpStatus === 409 || err?.code === '23505') {
    return res.status(409).json({
      message: 'El email ya existe',
      code: 'DUPLICATE_EMAIL',
      details: err?.detail,
    });
  }

 
  if (isValidationCode(err?.message)) {
    return res.status(400).json({
      message: 'Datos inválidos',
      code: String(err.message),
    });
  }

  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({ message: 'Error interno del servidor' });
}
