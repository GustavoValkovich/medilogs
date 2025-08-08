import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('MulterErrorHandler');

/**
 * Middleware para manejar errores de Multer
 */
export const multerErrorHandler = (
  error: MulterError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof MulterError) {
    logger.error('Error de Multer:', { code: error.code, message: error.message });
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({
          success: false,
          message: 'Archivo muy grande. Máximo 1MB permitido',
          error: 'FILE_TOO_LARGE'
        });
        return;
        
      case 'LIMIT_FILE_COUNT':
        res.status(400).json({
          success: false,
          message: 'Demasiados archivos. Máximo 5 archivos por consulta',
          error: 'TOO_MANY_FILES'
        });
        return;
        
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          success: false,
          message: 'Campo de archivo no esperado',
          error: 'UNEXPECTED_FIELD'
        });
        return;
        
      default:
        res.status(400).json({
          success: false,
          message: error.message || 'Error en la subida de archivos',
          error: 'UPLOAD_ERROR'
        });
        return;
    }
  }
  
  // Si no es un error de multer, pasar al siguiente handler
  next(error);
};
