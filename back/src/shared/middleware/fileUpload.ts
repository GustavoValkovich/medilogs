import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { createModuleLogger } from '../utils/logger';
import { query } from '../../config/database';

const logger = createModuleLogger('FileUpload');

// Tipos de archivo permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Directorio de uploads
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Crear directorio si no existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info('📁 Directorio de uploads creado:', UPLOAD_DIR);
}

// Función helper para obtener información del paciente
const getPatientInfo = async (pacienteId: number): Promise<{nombre: string} | null> => {
  try {
    const result = await query('SELECT nombre FROM pacientes WHERE id = $1', [pacienteId]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error obteniendo información del paciente:', error);
    return null;
  }
};

// Función para sanitizar nombres de archivo
const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Función para generar nombre de archivo inteligente
const generateSmartFileName = async (file: Express.Multer.File, req: Request): Promise<string> => {
  const ext = path.extname(file.originalname);
  const originalNameWithoutExt = path.basename(file.originalname, ext);
  
  // Si hay paciente_id en el body, obtener información del paciente
  const pacienteId = req.body.paciente_id ? parseInt(req.body.paciente_id) : null;
  let pacienteInfo = null;
  
  if (pacienteId) {
    pacienteInfo = await getPatientInfo(pacienteId);
  }
  
  // Detectar si es una foto de cámara (nombres típicos de dispositivos móviles)
  const isCameraPhoto = /^(IMG_|image_|photo_|\d{8}_\d{6}|camera|capture)/i.test(originalNameWithoutExt) ||
                       originalNameWithoutExt.length < 5 ||
                       /^\d+$/.test(originalNameWithoutExt);
  
  if (isCameraPhoto && pacienteInfo) {
    // Para fotos de cámara, usar nombre del paciente + fecha
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
    const sanitizedPatientName = sanitizeFileName(pacienteInfo.nombre);
    return `${sanitizedPatientName}_${timestamp}${ext}`;
  } else {
    // Para archivos con nombres descriptivos, mantener el nombre original
    const sanitizedOriginalName = sanitizeFileName(originalNameWithoutExt);
    const timestamp = Date.now();
    
    // Agregar timestamp al final para evitar conflictos, pero mantener legibilidad
    return `${sanitizedOriginalName}_${timestamp}${ext}`;
  }
};

// Configuración de storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: async (req, file, cb) => {
    try {
      // Generar nombre inteligente basado en el tipo de archivo y contexto
      const smartFileName = await generateSmartFileName(file, req);
      
      logger.info('📁 Archivo renombrado:', {
        original: file.originalname,
        nuevo: smartFileName,
        pacienteId: req.body.paciente_id || 'no especificado'
      });
      
      cb(null, smartFileName);
    } catch (error) {
      logger.error('Error generando nombre de archivo:', error);
      
      // Fallback al sistema anterior en caso de error
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
      const fallbackName = `${timestamp}_${sanitizedName}${ext}`;
      
      cb(null, fallbackName);
    }
  }
});

// Validación de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Validar extensión
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    logger.warn('Tipo de archivo no permitido:', { filename: file.originalname, mimetype: file.mimetype });
    return cb(new Error(`Tipo de archivo no permitido. Permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
  
  // Validar MIME type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    logger.warn('MIME type no permitido:', { filename: file.originalname, mimetype: file.mimetype });
    return cb(new Error(`MIME type no permitido. Permitidos: ${ALLOWED_TYPES.join(', ')}`));
  }
  
  cb(null, true);
};

// Configuración principal de multer
export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Máximo 5 archivos por consulta
  }
});

// Middleware específico para consultas
export const uploadConsultationFiles = uploadConfig.array('files', 5);

// Middleware para un solo archivo
export const uploadSingleFile = uploadConfig.single('file');

// Función para obtener información del archivo
export const getFileInfo = (file: Express.Multer.File) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path,
    url: `/uploads/${file.filename}`
  };
};

// Función para eliminar archivo
export const deleteFile = (filename: string): boolean => {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('🗑️ Archivo eliminado:', filename);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error eliminando archivo:', error);
    return false;
  }
};

// Función para validar si el archivo existe
export const fileExists = (filename: string): boolean => {
  const filePath = path.join(UPLOAD_DIR, filename);
  return fs.existsSync(filePath);
};

// Constantes para exportar
export const UPLOAD_CONSTANTS = {
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  UPLOAD_DIR
};
