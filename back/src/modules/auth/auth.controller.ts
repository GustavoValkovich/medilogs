import { Request, Response } from 'express';
import { MedicoRepository } from '../../repositories/medico-db.repository';
import { ApiResponse } from '../../types/database';
import { asyncHandler, createError } from '../../shared/middleware';
import { createModuleLogger } from '../../shared/utils/logger';
import { generateToken } from '../../shared/middleware/auth.middleware';
import * as crypto from 'crypto';

const logger = createModuleLogger('AuthController');
const medicoRepository = new MedicoRepository();

// Clave de autorización para registro y recuperación
const ADMIN_AUTH_KEY = process.env.ADMIN_AUTH_KEY || 'medilogs-admin-key-2025';

/**
 * Controlador de autenticación
 */
export class AuthController {

  /**
   * Registro de nuevo médico con clave de autorización
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { nombre, apellido, email, password, especialidad, telefono, matricula, authKey } = req.body;

    logger.info('Intento de registro de médico', { email, nombre, apellido });

    // Validar clave de autorización
    if (authKey !== ADMIN_AUTH_KEY) {
      logger.warn('Intento de registro con clave incorrecta', { email });
      throw createError('Clave de autorización incorrecta', 401);
    }

    // Verificar si el email ya existe
    const existingMedico = await medicoRepository.findByEmail(email);
    if (existingMedico) {
      logger.warn('Intento de registro con email existente', { email });
      throw createError('Ya existe un médico con este email', 400);
    }

    // Crear nuevo médico
    const newMedico = await medicoRepository.create({
      nombre,
      apellido,
      email,
      password,
      especialidad,
      telefono,
      matricula
    });

    // Generar token para el nuevo médico
    const token = generateToken({
      id: newMedico.id,
      email: newMedico.email || email,
      nombre: newMedico.nombre
    });

    const response: ApiResponse<any> = {
      success: true,
      data: {
        medico: {
          id: newMedico.id,
          nombre: newMedico.nombre,
          apellido: newMedico.apellido,
          email: newMedico.email,
          especialidad: newMedico.especialidad,
          telefono: newMedico.telefono,
          matricula: newMedico.matricula
        },
        token: token,
        message: 'Médico registrado exitosamente'
      }
    };

    logger.info('Médico registrado exitosamente', { email, medicoId: newMedico.id });
    res.status(201).json(response);
  });

  /**
   * Recuperación de contraseña con clave de autorización
   */
  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, newPassword, authKey } = req.body;

    logger.info('Intento de recuperación de contraseña', { email });

    // Validar clave de autorización
    if (authKey !== ADMIN_AUTH_KEY) {
      logger.warn('Intento de recuperación con clave incorrecta', { email });
      throw createError('Clave de autorización incorrecta', 401);
    }

    // Buscar médico por email
    const medico = await medicoRepository.findByEmail(email);
    if (!medico) {
      logger.warn('Intento de recuperación con email no encontrado', { email });
      throw createError('No se encontró un médico con este email', 404);
    }

    // Actualizar contraseña
    await medicoRepository.update(medico.id, { password: newPassword });

    const response: ApiResponse<any> = {
      success: true,
      data: {
        message: 'Contraseña actualizada exitosamente'
      }
    };

    logger.info('Contraseña actualizada exitosamente', { email, medicoId: medico.id });
    res.json(response);
  });

  /**
   * Recuperación de usuario (mostrar datos del médico) con clave de autorización
   */
  recoverUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, authKey } = req.body;

    logger.info('Intento de recuperación de usuario', { email });

    // Validar clave de autorización
    if (authKey !== ADMIN_AUTH_KEY) {
      logger.warn('Intento de recuperación de usuario con clave incorrecta', { email });
      throw createError('Clave de autorización incorrecta', 401);
    }

    // Buscar médico por email
    const medico = await medicoRepository.findByEmail(email);
    if (!medico) {
      logger.warn('Intento de recuperación de usuario con email no encontrado', { email });
      throw createError('No se encontró un médico con este email', 404);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        medico: {
          id: medico.id,
          nombre: medico.nombre,
          apellido: medico.apellido,
          email: medico.email,
          especialidad: medico.especialidad,
          telefono: medico.telefono,
          matricula: medico.matricula
        }
      }
    };

    logger.info('Usuario recuperado exitosamente', { email, medicoId: medico.id });
    res.json(response);
  });

  /**
   * Login de médico
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    logger.info('Intento de login', { email });

    // Validar credenciales usando el método del repositorio
    const medico = await medicoRepository.validatePassword(email, password);
    
    if (!medico) {
      logger.warn('Login fallido: credenciales inválidas', { email });
      throw createError('Credenciales inválidas', 401);
    }

    // Crear sesión/token seguro
    const token = generateToken({
      id: medico.id,
      email: medico.email || email, // Usar el email del input si el del médico es undefined
      nombre: medico.nombre
    });

    const sessionData = {
      id: medico.id,
      email: medico.email || email,
      nombre: medico.nombre
    };

    const response: ApiResponse<any> = {
      success: true,
      data: {
        medico: sessionData,
        token: token,
        message: 'Login exitoso'
      }
    };

    logger.info('Login exitoso', { email, medicoId: medico.id });
    res.json(response);
  });

  /**
   * Logout con sincronización automática de bases de datos
   */
    logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Logout de usuario');

    try {
      const response: ApiResponse<any> = {
        success: true,
        data: {
          timestamp: new Date().toISOString()
        },
        message: 'Logout exitoso'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error en logout:', error);
      throw createError('Error interno en logout', 500);
    }
  });

  /**
   * Verificar password (implementación básica)
   * En producción, usar bcrypt para comparar hashes
   */
  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // TODO: Implementar verificación con bcrypt
    // Por ahora comparación directa para compatibilidad
    return plainPassword === hashedPassword;
  }

  /**
   * Obtener información del médico actual (si hay sesión activa)
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // TODO: Implementar cuando se agregue middleware de autenticación
    const response: ApiResponse<null> = {
      success: false,
      message: 'Función no implementada - requiere middleware de autenticación'
    };

    res.status(501).json(response);
  });
}

/**
 * Esquemas de validación para autenticación
 */
export const authValidationSchemas = {
  login: {
    email: { required: true, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, type: 'string' as const, minLength: 1 }
  },
  register: {
    nombre: { required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    apellido: { required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    email: { required: true, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, type: 'string' as const, minLength: 6 },
    especialidad: { required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    telefono: { required: false, type: 'string' as const, maxLength: 20 },
    matricula: { required: false, type: 'string' as const, maxLength: 50 },
    authKey: { required: true, type: 'string' as const, minLength: 1 }
  },
  resetPassword: {
    email: { required: true, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    newPassword: { required: true, type: 'string' as const, minLength: 6 },
    authKey: { required: true, type: 'string' as const, minLength: 1 }
  },
  recoverUser: {
    email: { required: true, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    authKey: { required: true, type: 'string' as const, minLength: 1 }
  }
};
