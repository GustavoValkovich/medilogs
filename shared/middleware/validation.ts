import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

/**
 * Validador de esquemas simples
 */
export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    values?: any[];
  };
}

/**
 * Middleware de validación de body
 */
export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors = validateObject(req.body, schema);
      if (errors.length > 0) {
        throw createError(`Errores de validación: ${errors.join(', ')}`, 400);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware de validación de query params
 */
export const validateQuery = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors = validateObject(req.query, schema);
      if (errors.length > 0) {
        throw createError(`Errores en parámetros de consulta: ${errors.join(', ')}`, 400);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware de validación de parámetros de ruta
 */
export const validateParams = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors = validateObject(req.params, schema);
      if (errors.length > 0) {
        throw createError(`Errores en parámetros de ruta: ${errors.join(', ')}`, 400);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Función auxiliar para validar objetos
 */
function validateObject(obj: any, schema: ValidationSchema): string[] {
  const errors: string[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];
    
    // Verificar campo requerido
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`El campo '${field}' es requerido`);
      continue;
    }
    
    // Si no es requerido y está vacío, continuar
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Verificar tipo
    if (rules.type && typeof value !== rules.type) {
      errors.push(`El campo '${field}' debe ser de tipo ${rules.type}`);
      continue;
    }
    
    // Verificar longitud mínima
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`El campo '${field}' debe tener al menos ${rules.minLength} caracteres`);
    }
    
    // Verificar longitud máxima
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`El campo '${field}' no puede tener más de ${rules.maxLength} caracteres`);
    }
    
    // Verificar patrón regex
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push(`El campo '${field}' no tiene el formato correcto`);
    }
    
    // Verificar valores permitidos
    if (rules.values && !rules.values.includes(value)) {
      errors.push(`El campo '${field}' debe ser uno de: ${rules.values.join(', ')}`);
    }
  }
  
  return errors;
}

/**
 * Esquemas de validación comunes
 */
export const commonSchemas = {
  id: {
    id: { required: true, type: 'string' as const, pattern: /^\d+$/ }
  },
  
  pagination: {
    page: { required: false, type: 'string' as const, pattern: /^\d+$/ },
    limit: { required: false, type: 'string' as const, pattern: /^\d+$/ }
  },
  
  email: {
    email: { 
      required: true, 
      type: 'string' as const, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    }
  }
};

/**
 * Middleware para sanitizar entrada
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitizar strings en body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitizar query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

/**
 * Función auxiliar para sanitizar objetos
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remover caracteres peligrosos básicos
      sanitized[key] = value
        .trim()
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, ''); // Remover eventos onclick, onload, etc
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
