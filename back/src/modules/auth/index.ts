/**
 * Módulo de Autenticación
 * 
 * Este módulo maneja:
 * - Login/logout de médicos
 * - Gestión de sesiones
 * - Validación de credenciales
 * - Middleware de autenticación (futuro)
 */

export { AuthController, authValidationSchemas } from './auth.controller';
export { authRouter } from './auth.routes';
