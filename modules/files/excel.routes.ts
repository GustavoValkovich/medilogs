import { Router } from 'express';
import { ExcelController } from './excel.controller';
import { requestLogger, multerErrorHandler } from '../../shared/middleware';
import { authenticateToken } from '../../shared/middleware/auth.middleware';

const router = Router();
const excelController = new ExcelController();

// Aplicar logging a todas las rutas
router.use(requestLogger);

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// ============= RUTAS DE EXPORTACIÓN =============

/**
 * @route GET /api/excel/export/pacientes/all
 * @desc Exportar todos los pacientes a Excel
 * @access Private
 * @query page, limit, search, includeHeaders, sheetName, fileName
 */
router.get('/export/pacientes/all', excelController.exportAllPacientesToExcel);

/**
 * @route POST /api/excel/export/pacientes/selected
 * @desc Exportar pacientes seleccionados a Excel
 * @access Private
 * @body { pacienteIds: number[] }
 * @query includeHeaders, sheetName, fileName
 */
router.post('/export/pacientes/selected', excelController.exportSelectedPacientesToExcel);

/**
 * @route GET /api/excel/export/consultas/all
 * @desc Exportar todas las consultas a Excel
 * @access Public
 * @query page, limit, pacienteId, includeHeaders, sheetName, fileName
 */
router.get('/export/consultas/all', excelController.exportAllConsultasToExcel);

/**
 * @route GET /api/excel/export/consultas/paciente/:pacienteId
 * @desc Exportar consultas de un paciente específico a Excel
 * @access Public
 * @query includeHeaders, sheetName, fileName
 */
router.get('/export/consultas/paciente/:pacienteId', excelController.exportPacienteConsultasToExcel);

// ============= RUTAS DE IMPORTACIÓN =============

/**
 * @route POST /api/excel/import/pacientes
 * @desc Importar pacientes desde Excel y guardar en base de datos
 * @access Public
 * @body FormData con archivo Excel en campo 'excel'
 */
router.post('/import/pacientes', excelController.importPacientesFromExcel);

/**
 * @route POST /api/excel/import/consultas
 * @desc Importar consultas desde Excel y guardar en base de datos
 * @access Public
 * @body FormData con archivo Excel en campo 'excel'
 */
router.post('/import/consultas', excelController.importConsultasFromExcel);

/**
 * @route POST /api/excel/validate
 * @desc Validar formato de archivo Excel antes de importar
 * @access Public
 * @body FormData con archivo Excel en campo 'excel'
 * @query type (pacientes|consultas)
 */
router.post('/validate', excelController.validateExcelFile);

// ============= RUTAS DE TEMPLATES =============

/**
 * @route GET /api/excel/template/pacientes
 * @desc Descargar template de Excel para importar pacientes
 * @access Public
 */
router.get('/template/pacientes', excelController.downloadPacientesTemplate);

/**
 * @route GET /api/excel/template/consultas
 * @desc Descargar template de Excel para importar consultas
 * @access Public
 */
router.get('/template/consultas', excelController.downloadConsultasTemplate);

// Middleware de manejo de errores de multer
router.use(multerErrorHandler);

export { router as excelRouter };
