import { Router } from 'express';
import { FilesController } from './files.controller';
import { requestLogger, multerErrorHandler } from '../../shared/middleware';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();
const filesController = new FilesController();

// Aplicar logging a todas las rutas
router.use(requestLogger);

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @route GET /api/files/info
 * @desc Obtener información sobre tipos de archivo permitidos
 * @access Private
 */
router.get('/info', filesController.getUploadInfo);

/**
 * @route POST /api/files/upload
 * @desc Subir un archivo individual
 * @access Private
 * @body FormData con campo 'file'
 */
router.post('/upload', filesController.uploadSingleFile);

/**
 * @route POST /api/files/upload/consultation
 * @desc Subir múltiples archivos para una consulta
 * @access Private
 * @body FormData con campo 'files' (múltiple)
 */
router.post('/upload/consultation', filesController.uploadConsultationFiles);

/**
 * @route DELETE /api/files/:filename
 * @desc Eliminar un archivo
 * @access Public
 */
router.delete('/:filename', filesController.deleteFile);

/**
 * @route GET /api/files/check/:filename
 * @desc Verificar si un archivo existe
 * @access Public
 */
router.get('/check/:filename', filesController.checkFile);

// ============= RUTAS DE EXCEL =============

/**
 * @route POST /api/files/excel/export/pacientes
 * @desc Exportar pacientes a Excel
 * @access Public
 * @body Array de pacientes
 */
router.post('/excel/export/pacientes', filesController.exportPacientesToExcel);

/**
 * @route POST /api/files/excel/export/consultas
 * @desc Exportar consultas a Excel
 * @access Public
 * @body Array de consultas
 */
router.post('/excel/export/consultas', filesController.exportConsultasToExcel);

/**
 * @route POST /api/files/excel/import/pacientes
 * @desc Importar pacientes desde Excel
 * @access Public
 * @body FormData con archivo Excel en campo 'excel'
 */
router.post('/excel/import/pacientes', filesController.importPacientesFromExcel);

/**
 * @route POST /api/files/excel/import/consultas
 * @desc Importar consultas desde Excel
 * @access Public
 * @body FormData con archivo Excel en campo 'excel'
 */
router.post('/excel/import/consultas', filesController.importConsultasFromExcel);

/**
 * @route GET /api/files/excel/template/pacientes
 * @desc Descargar template de Excel para importar pacientes
 * @access Public
 */
router.get('/excel/template/pacientes', filesController.downloadPacientesTemplate);

/**
 * @route GET /api/files/excel/template/consultas
 * @desc Descargar template de Excel para importar consultas
 * @access Public
 */
router.get('/excel/template/consultas', filesController.downloadConsultasTemplate);

// Middleware de manejo de errores de multer
router.use(multerErrorHandler);

export { router as filesRouter };
