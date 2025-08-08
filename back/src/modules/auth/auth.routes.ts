import { Router } from 'express';
import { AuthController, authValidationSchemas } from './auth.controller';
import { validateBody, sanitizeInput } from '../../shared/middleware';

const router = Router();
const controller = new AuthController();

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);

/**
 * POST /auth/login
 * Autenticación de médicos
 */
router.post('/login', 
  validateBody(authValidationSchemas.login),
  controller.login
);

/**
 * POST /auth/register
 * Registro de nuevos médicos con clave de autorización
 */
router.post('/register', 
  validateBody(authValidationSchemas.register),
  controller.register
);

/**
 * POST /auth/reset-password
 * Recuperación de contraseña con clave de autorización
 */
router.post('/reset-password', 
  validateBody(authValidationSchemas.resetPassword),
  controller.resetPassword
);

/**
 * POST /auth/recover-user
 * Recuperación de información de usuario con clave de autorización
 */
router.post('/recover-user', 
  validateBody(authValidationSchemas.recoverUser),
  controller.recoverUser
);

/**
 * POST /auth/logout
 * Cerrar sesión
 */
router.post('/logout', 
  controller.logout
);

/**
 * GET /auth/me
 * Obtener información del usuario actual
 */
router.get('/me', 
  controller.getCurrentUser
);

export { router as authRouter };
