// Middlewares de manejo de errores
export {
  errorHandler,
  asyncHandler,
  createError,
  notFoundHandler,
  type AppError
} from './errorHandler';

// Middlewares de logging
export {
  requestLogger,
  simpleRequestLogger
} from './requestLogger';

// Middlewares de validación
export {
  validateBody,
  validateQuery,
  validateParams,
  sanitizeInput,
  commonSchemas,
  type ValidationSchema
} from './validation';

// Middlewares de upload de archivos
export {
  uploadConsultationFiles,
  uploadSingleFile,
  getFileInfo,
  deleteFile,
  fileExists,
  UPLOAD_CONSTANTS
} from './fileUpload';

// Middleware de manejo de errores de multer
export { multerErrorHandler } from './multerErrorHandler';
