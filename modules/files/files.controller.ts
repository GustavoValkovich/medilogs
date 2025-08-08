import { Request, Response } from 'express';
import { 
  asyncHandler, 
  createError, 
  uploadSingleFile, 
  uploadConsultationFiles, 
  getFileInfo, 
  deleteFile, 
  fileExists,
  UPLOAD_CONSTANTS 
} from '../../shared/middleware';
import { createModuleLogger } from '../../shared/utils/logger';
import { ExcelUtils, ExcelImportResult } from '../../shared/utils/excel';
import { ApiResponse, PacienteDB, ConsultaDB, PacienteCompleto, ConsultaCompleta } from '../../types/database';
import multer from 'multer';

const logger = createModuleLogger('FilesController');

// Configuración de multer para archivos Excel
const excelUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

export interface FileUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface MultipleFileUploadResponse {
  files: FileUploadResponse[];
  totalFiles: number;
  totalSize: number;
}

/**
 * Controlador para manejo de archivos
 */
export class FilesController {

  /**
   * Obtener información sobre los tipos de archivo permitidos
   */
  getUploadInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const response: ApiResponse<typeof UPLOAD_CONSTANTS> = {
      success: true,
      data: UPLOAD_CONSTANTS,
      message: 'Información de upload obtenida exitosamente'
    };

    res.json(response);
  });

  /**
   * Subir un archivo individual
   */
  uploadSingleFile = [
    uploadSingleFile,
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const file = req.file;
      
      if (!file) {
        throw createError('No se proporcionó ningún archivo', 400);
      }

      const fileInfo = getFileInfo(file);
      logger.info('Archivo subido exitosamente:', fileInfo);

      const response: ApiResponse<FileUploadResponse> = {
        success: true,
        data: {
          filename: fileInfo.filename,
          originalName: fileInfo.originalName,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          url: fileInfo.url
        },
        message: 'Archivo subido exitosamente'
      };

      res.status(201).json(response);
    })
  ];

  /**
   * Subir múltiples archivos para una consulta
   */
  uploadConsultationFiles = [
    uploadConsultationFiles,
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        throw createError('No se proporcionaron archivos', 400);
      }

      const fileInfos = files.map(file => getFileInfo(file));
      const totalSize = files.reduce((total, file) => total + file.size, 0);

      logger.info('Archivos subidos exitosamente:', {
        count: files.length,
        totalSize,
        files: fileInfos.map(f => f.filename)
      });

      const response: ApiResponse<MultipleFileUploadResponse> = {
        success: true,
        data: {
          files: fileInfos.map(fileInfo => ({
            filename: fileInfo.filename,
            originalName: fileInfo.originalName,
            size: fileInfo.size,
            mimetype: fileInfo.mimetype,
            url: fileInfo.url
          })),
          totalFiles: files.length,
          totalSize
        },
        message: `${files.length} archivo(s) subido(s) exitosamente`
      };

      res.status(201).json(response);
    })
  ];

  /**
   * Eliminar un archivo
   */
  deleteFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { filename } = req.params;

    if (!filename) {
      throw createError('Nombre de archivo requerido', 400);
    }

    // Verificar si el archivo existe
    if (!fileExists(filename)) {
      throw createError('Archivo no encontrado', 404);
    }

    // Eliminar el archivo
    const deleted = deleteFile(filename);

    if (!deleted) {
      throw createError('Error eliminando el archivo', 500);
    }

    logger.info('Archivo eliminado:', filename);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Archivo eliminado exitosamente'
    };

    res.json(response);
  });

  /**
   * Verificar si un archivo existe
   */
  checkFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { filename } = req.params;

    if (!filename) {
      throw createError('Nombre de archivo requerido', 400);
    }

    const exists = fileExists(filename);

    const response: ApiResponse<{ exists: boolean; filename: string }> = {
      success: true,
      data: {
        exists,
        filename
      },
      message: exists ? 'Archivo encontrado' : 'Archivo no encontrado'
    };

    res.json(response);
  });

  /**
   * Exportar pacientes a Excel
   */
  exportPacientesToExcel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Este endpoint debería recibir los datos de pacientes desde el request
    // Por ahora simulamos que vienen del query o body
    const pacientes: PacienteCompleto[] = req.body.pacientes || [];
    
    if (!pacientes.length) {
      throw createError('No hay pacientes para exportar', 400);
    }

    const options = {
      includeHeaders: req.query.includeHeaders !== 'false',
      sheetName: (req.query.sheetName as string) || 'Pacientes',
      fileName: (req.query.fileName as string) || 'pacientes.xlsx'
    };

    const buffer = await ExcelUtils.exportPacientesToExcel(pacientes, options);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${options.fileName}"`);
    res.send(buffer);

    logger.info(`Pacientes exportados a Excel: ${pacientes.length} registros`);
  });

  /**
   * Exportar consultas a Excel
   */
  exportConsultasToExcel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const consultas: ConsultaCompleta[] = req.body.consultas || [];
    
    if (!consultas.length) {
      throw createError('No hay consultas para exportar', 400);
    }

    const options = {
      includeHeaders: req.query.includeHeaders !== 'false',
      sheetName: (req.query.sheetName as string) || 'Consultas',
      fileName: (req.query.fileName as string) || 'consultas.xlsx'
    };

    const buffer = await ExcelUtils.exportConsultasToExcel(consultas, options);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${options.fileName}"`);
    res.send(buffer);

    logger.info(`Consultas exportadas a Excel: ${consultas.length} registros`);
  });

  /**
   * Importar pacientes desde Excel
   */
  importPacientesFromExcel = [
    excelUpload.single('excel'),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      if (!req.file) {
        throw createError('Archivo Excel requerido', 400);
      }

      const result: ExcelImportResult<Partial<PacienteDB>> = await ExcelUtils.importPacientesFromExcel(req.file.buffer);

      const response: ApiResponse<ExcelImportResult<Partial<PacienteDB>>> = {
        success: result.errors.length === 0 || result.validRows > 0,
        data: result,
        message: `Importación completada: ${result.validRows} registros válidos de ${result.totalRows} total`
      };

      if (result.errors.length > 0) {
        response.message += `. ${result.errors.length} errores encontrados.`;
      }

      res.json(response);
      logger.info(`Pacientes importados desde Excel: ${result.validRows} válidos, ${result.errors.length} errores`);
    })
  ];

  /**
   * Importar consultas desde Excel
   */
  importConsultasFromExcel = [
    excelUpload.single('excel'),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      if (!req.file) {
        throw createError('Archivo Excel requerido', 400);
      }

      const result: ExcelImportResult<Partial<ConsultaDB>> = await ExcelUtils.importConsultasFromExcel(req.file.buffer);

      const response: ApiResponse<ExcelImportResult<Partial<ConsultaDB>>> = {
        success: result.errors.length === 0 || result.validRows > 0,
        data: result,
        message: `Importación completada: ${result.validRows} registros válidos de ${result.totalRows} total`
      };

      if (result.errors.length > 0) {
        response.message += `. ${result.errors.length} errores encontrados.`;
      }

      res.json(response);
      logger.info(`Consultas importadas desde Excel: ${result.validRows} válidos, ${result.errors.length} errores`);
    })
  ];

  /**
   * Descargar template de Excel para pacientes
   */
  downloadPacientesTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const buffer = await ExcelUtils.createPacientesTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="template_pacientes.xlsx"');
    res.send(buffer);

    logger.info('Template de pacientes descargado');
  });

  /**
   * Descargar template de Excel para consultas
   */
  downloadConsultasTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const buffer = await ExcelUtils.createConsultasTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="template_consultas.xlsx"');
    res.send(buffer);

    logger.info('Template de consultas descargado');
  });
}
