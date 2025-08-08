import { Router } from 'express';
import { DoctorsController, doctorValidationSchemas } from './doctors.controller';
import { validateBody, validateParams, commonSchemas, sanitizeInput } from '../../shared/middleware';
import { authenticateToken, conditionalAuth } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new DoctorsController();

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);

/**
 * GET /doctors/system-status
 * Verificar el estado del sistema (sin autenticación)
 */
router.get('/system-status', 
  controller.checkSystemStatus
);

/**
 * GET /doctors
 * Obtener todos los médicos
 */
router.get('/', 
  authenticateToken,
  controller.getAllDoctors
);

/**
 * POST /doctors
 * Crear nuevo médico
 * NOTA: Usa autenticación condicional para permitir el primer médico sin token
 */
router.post('/', 
  conditionalAuth,
  validateBody(doctorValidationSchemas.create),
  controller.createDoctor
);

/**
 * GET /doctors/:id
 * Obtener médico por ID
 */
router.get('/:id', 
  authenticateToken,
  validateParams(commonSchemas.id),
  controller.getDoctorById
);

/**
 * PUT /doctors/:id
 * Actualizar médico
 */
router.put('/:id', 
  authenticateToken,
  validateParams(commonSchemas.id),
  validateBody(doctorValidationSchemas.update),
  controller.updateDoctor
);

/**
 * DELETE /doctors/:id
 * Eliminar médico
 */
router.delete('/:id', 
  validateParams(commonSchemas.id),
  controller.deleteDoctor
);

export { router as doctorsRouter };
