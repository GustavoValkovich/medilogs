import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('ErrorHandler');

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error
  logger.error('Error capturado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Determinar código de estado
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Respuesta en desarrollo vs producción
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    success: false,
    message: isOperational ? err.message : 'Error interno del servidor',
    ...(isDevelopment && {
      stack: err.stack,
      details: {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      }
    })
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Crear un error operacional
 */
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = createError(`Ruta no encontrada: ${req.originalUrl}`, 404);
  next(error);
};
