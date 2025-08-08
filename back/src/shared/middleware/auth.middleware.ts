import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';
import { MedicoRepository } from '../../repositories/medico-db.repository';

// Extender la interfaz Request para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        nombre: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'medilogs-secret-key-2025';
const medicoRepository = new MedicoRepository();

/**
 * Middleware de autenticación con JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw createError('Token de acceso requerido', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre
    };
    
    next();
  } catch (error) {
    throw createError('Token inválido', 403);
  }
};

/**
 * Middleware de autenticación condicional
 * Permite el acceso sin autenticación solo si no hay médicos en el sistema
 */
export const conditionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verificar si hay médicos en el sistema
    const existingDoctors = await medicoRepository.findAll();
    
    if (existingDoctors.length === 0) {
      // Si no hay médicos, permitir acceso sin autenticación
      next();
      return;
    }
    
    // Si hay médicos, requerir autenticación
    authenticateToken(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Generar token JWT
 */
export const generateToken = (medico: { id: number; email: string; nombre: string }): string => {
  return jwt.sign(
    {
      id: medico.id,
      email: medico.email,
      nombre: medico.nombre
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
