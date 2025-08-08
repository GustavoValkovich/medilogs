import { Router } from 'express';
import { ConsultationsController, consultationValidationSchemas } from './consultations.controller';
import { validateBody, validateQuery, validateParams, commonSchemas, sanitizeInput, uploadConsultationFiles } from '../../shared/middleware';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new ConsultationsController();

// Aplicar sanitización a todas las rutas
router.use(sanitizeInput);

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * GET /consultations
 * Obtener todas las consultas con paginación
 */
router.get('/', 
  validateQuery(consultationValidationSchemas.query),
  controller.getAllConsultations
);

/**
 * POST /consultations
 * Crear nueva consulta
 */
router.post('/', 
  validateBody(consultationValidationSchemas.create),
  controller.createConsultation
);

/**
 * POST /consultations/with-files
 * Crear nueva consulta con archivos adjuntos
 */
router.post('/with-files',
  uploadConsultationFiles,
  controller.createConsultationWithFiles
);

/**
 * GET /consultations/recent
 * Obtener últimas consultas
 */
router.get('/recent', 
  controller.getRecentConsultations
);

/**
 * GET /consultations/search
 * Buscar consultas
 */
router.get('/search', 
  validateQuery({ search: { required: true, type: 'string', minLength: 1, maxLength: 100 } }),
  controller.searchConsultations
);

/**
 * GET /consultations/with-images
 * Listar todas las consultas que tienen imágenes
 */
router.get('/with-images', 
  validateQuery(consultationValidationSchemas.query),
  controller.getConsultationsWithImages
);

/**
 * GET /consultations/patient/:pacienteId/images
 * Obtener consultas con imágenes de un paciente específico
 */
router.get('/patient/:pacienteId/images', 
  validateParams({ pacienteId: { required: true, type: 'string', pattern: /^\d+$/ } }),
  controller.getPatientConsultationsWithImages
);

/**
 * GET /consultations/by-patient/:pacienteId
 * Obtener consultas de un paciente específico
 */
router.get('/by-patient/:pacienteId', 
  validateParams({ pacienteId: { required: true, type: 'string', pattern: /^\d+$/ } }),
  controller.getConsultationsByPatient
);

/**
 * GET /consultations/patient/:pacienteId/pdf
 * Generar PDF con historial de consultas de un paciente
 */
router.get('/patient/:pacienteId/pdf', 
  validateParams({ pacienteId: { required: true, type: 'string', pattern: /^\d+$/ } }),
  controller.generatePatientPDF
);

/**
 * GET /consultations/:id/image
 * Obtener información de imagen de una consulta
 */
router.get('/:id/image', 
  validateParams(commonSchemas.id),
  controller.getConsultationImage
);

/**
 * GET /consultations/:id
 * Obtener consulta por ID
 */
router.get('/:id', 
  validateParams(commonSchemas.id),
  controller.getConsultationById
);

/**
 * PUT /consultations/:id
 * Actualizar consulta
 */
router.put('/:id', 
  validateParams(commonSchemas.id),
  validateBody(consultationValidationSchemas.update),
  controller.updateConsultation
);

/**
 * DELETE /consultations/:id
 * Eliminar consulta
 */
router.delete('/:id', 
  validateParams(commonSchemas.id),
  controller.deleteConsultation
);

export { router as consultationsRouter };
