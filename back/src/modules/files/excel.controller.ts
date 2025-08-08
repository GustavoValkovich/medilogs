import { Request, Response } from 'express';
import { asyncHandler, createError } from '../../shared/middleware';
import { createModuleLogger } from '../../shared/utils/logger';
import { ExcelUtils, ExcelImportResult } from '../../shared/utils/excel';
import { ApiResponse, PacienteDB, ConsultaDB, CreatePacienteRequest, CreateConsultaRequest } from '../../types/database';
import { PacienteRepository } from '../../repositories/paciente-db.repository';
import { ConsultaRepository } from '../../repositories/consulta-db.repository';
import multer from 'multer';

const logger = createModuleLogger('ExcelController');

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

export class ExcelController {
  private pacienteRepository: PacienteRepository;
  private consultaRepository: ConsultaRepository;

  constructor() {
    this.pacienteRepository = new PacienteRepository();
    this.consultaRepository = new ConsultaRepository();
  }

  /**
   * Exportar todos los pacientes a Excel
   */
  exportAllPacientesToExcel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000; // Límite alto para exportación
    const search = req.query.search as string;

    try {
      const { pacientes } = await this.pacienteRepository.findAll(page, limit, search);
      
      if (!pacientes.length) {
        throw createError('No hay pacientes para exportar', 404);
      }

      const options = {
        includeHeaders: req.query.includeHeaders !== 'false',
        sheetName: (req.query.sheetName as string) || 'Pacientes',
        fileName: (req.query.fileName as string) || `pacientes_${new Date().toISOString().split('T')[0]}.xlsx`
      };

      const buffer = await ExcelUtils.exportPacientesToExcel(pacientes, options);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${options.fileName}"`);
      res.send(buffer);

      logger.info(`Pacientes exportados a Excel: ${pacientes.length} registros`);
    } catch (error) {
      logger.error('Error al exportar pacientes:', error);
      throw createError('Error al exportar pacientes a Excel', 500);
    }
  });

  /**
   * Exportar pacientes específicos a Excel
   */
  exportSelectedPacientesToExcel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { pacienteIds } = req.body;
    
    if (!pacienteIds || !Array.isArray(pacienteIds) || pacienteIds.length === 0) {
      throw createError('Se requiere un array de IDs de pacientes', 400);
    }

    try {
      const pacientes = [];
      for (const id of pacienteIds) {
        const paciente = await this.pacienteRepository.findById(parseInt(id));
        if (paciente) {
          pacientes.push(paciente);
        }
      }

      if (!pacientes.length) {
        throw createError('No se encontraron pacientes con los IDs proporcionados', 404);
      }

      const options = {
        includeHeaders: req.query.includeHeaders !== 'false',
        sheetName: (req.query.sheetName as string) || 'Pacientes Seleccionados',
        fileName: (req.query.fileName as string) || `pacientes_seleccionados_${new Date().toISOString().split('T')[0]}.xlsx`
      };

      const buffer = await ExcelUtils.exportPacientesToExcel(pacientes, options);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${options.fileName}"`);
      res.send(buffer);

      logger.info(`Pacientes seleccionados exportados a Excel: ${pacientes.length} registros`);
    } catch (error) {
      logger.error('Error al exportar pacientes seleccionados:', error);
      throw createError('Error al exportar pacientes seleccionados a Excel', 500);
    }
  });

  /**
   * Exportar todas las consultas a Excel
   */
  exportAllConsultasToExcel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000; // Límite alto para exportación
    const pacienteId = req.query.pacienteId ? parseInt(req.query.pacienteId as string) : undefined;

    try {
      const { consultas } = await this.consultaRepository.findAll(page, limit, pacienteId);
      
      if (!consultas.length) {
        throw createError('No hay consultas para exportar', 404);
      }

      const options = {
        includeHeaders: req.query.includeHeaders !== 'false',
        sheetName: (req.query.sheetName as string) || 'Consultas',
        fileName: (req.query.fileName as string) || `consultas_${new Date().toISOString().split('T')[0]}.xlsx`
      };

      const buffer = await ExcelUtils.exportConsultasToExcel(consultas, options);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${options.fileName}"`);
      res.send(buffer);

      logger.info(`Consultas exportadas a Excel: ${consultas.length} registros`);
    } catch (error) {
      logger.error('Error al exportar consultas:', error);
      throw createError('Error al exportar consultas a Excel', 500);
    }
  });

  /**
   * Exportar consultas de un paciente específico a Excel
   */
  exportPacienteConsultasToExcel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { pacienteId } = req.params;
    
    if (!pacienteId) {
      throw createError('ID de paciente requerido', 400);
    }

    try {
      const paciente = await this.pacienteRepository.findById(parseInt(pacienteId));
      if (!paciente) {
        throw createError('Paciente no encontrado', 404);
      }

      const consultas = await this.consultaRepository.findByPacienteId(parseInt(pacienteId));
      
      if (!consultas.length) {
        throw createError('No hay consultas para este paciente', 404);
      }

      const options = {
        includeHeaders: req.query.includeHeaders !== 'false',
        sheetName: `Consultas - ${paciente.nombre}`,
        fileName: (req.query.fileName as string) || `consultas_${paciente.nombre?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      };

      const buffer = await ExcelUtils.exportConsultasToExcel(consultas, options);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${options.fileName}"`);
      res.send(buffer);

      logger.info(`Consultas del paciente ${paciente.nombre} exportadas a Excel: ${consultas.length} registros`);
    } catch (error) {
      logger.error('Error al exportar consultas del paciente:', error);
      throw createError('Error al exportar consultas del paciente a Excel', 500);
    }
  });

  /**
   * Importar pacientes desde Excel y guardar en base de datos
   */
  importPacientesFromExcel = [
    excelUpload.single('excel'),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      if (!req.file) {
        throw createError('Archivo Excel requerido', 400);
      }

      try {
        const importResult: ExcelImportResult<Partial<PacienteDB>> = await ExcelUtils.importPacientesFromExcel(req.file.buffer);
        
        const savedPatients = [];
        const saveErrors = [];

        // Intentar guardar cada paciente válido
        for (const pacienteData of importResult.data) {
          try {
            // Verificar si el documento ya existe
            if (pacienteData.documento) {
              const existingPaciente = await this.pacienteRepository.findByDocumento(pacienteData.documento);
              if (existingPaciente) {
                saveErrors.push(`Paciente con documento ${pacienteData.documento} ya existe`);
                continue;
              }
            }

            // Convertir a CreatePacienteRequest
            const createRequest: CreatePacienteRequest = {
              nombre: pacienteData.nombre || '',
              documento: pacienteData.documento || '',
              nacimiento: pacienteData.nacimiento ? pacienteData.nacimiento.toISOString().split('T')[0] : '',
              sexo: pacienteData.sexo as 'M' | 'F',
              obra_social: pacienteData.obra_social,
              mail: pacienteData.mail,
              medico_id: pacienteData.medico_id,
              importante: pacienteData.importante
            };

            const savedPaciente = await this.pacienteRepository.create(createRequest);
            savedPatients.push(savedPaciente);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            saveErrors.push(`Error al guardar paciente ${pacienteData.nombre}: ${errorMessage}`);
          }
        }

        const allErrors = [...importResult.errors, ...saveErrors];

        const response: ApiResponse<{
          importResult: ExcelImportResult<Partial<PacienteDB>>;
          savedCount: number;
          savedPatients: PacienteDB[];
          saveErrors: string[];
        }> = {
          success: savedPatients.length > 0,
          data: {
            importResult,
            savedCount: savedPatients.length,
            savedPatients,
            saveErrors
          },
          message: `Importación completada: ${savedPatients.length} pacientes guardados correctamente de ${importResult.totalRows} procesados.`
        };

        if (allErrors.length > 0) {
          response.message += ` ${allErrors.length} errores encontrados.`;
        }

        res.json(response);
        logger.info(`Pacientes importados desde Excel: ${savedPatients.length} guardados, ${allErrors.length} errores`);

      } catch (error) {
        logger.error('Error al importar pacientes desde Excel:', error);
        throw createError('Error al procesar el archivo Excel', 500);
      }
    })
  ];

  /**
   * Importar consultas desde Excel y guardar en base de datos
   */
  importConsultasFromExcel = [
    excelUpload.single('excel'),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      if (!req.file) {
        throw createError('Archivo Excel requerido', 400);
      }

      try {
        const importResult: ExcelImportResult<Partial<ConsultaDB>> = await ExcelUtils.importConsultasFromExcel(req.file.buffer);
        
        const savedConsultas = [];
        const saveErrors = [];

        // Intentar guardar cada consulta válida
        for (const consultaData of importResult.data) {
          try {
            // Verificar que el paciente existe
            if (consultaData.paciente_id) {
              const paciente = await this.pacienteRepository.findById(consultaData.paciente_id);
              if (!paciente) {
                saveErrors.push(`Paciente con ID ${consultaData.paciente_id} no existe`);
                continue;
              }
            }

            // Convertir a CreateConsultaRequest
            const createRequest: CreateConsultaRequest = {
              paciente_id: consultaData.paciente_id || 0,
              fecha_historia: consultaData.fecha_historia ? consultaData.fecha_historia.toISOString().split('T')[0] : '',
              historia: consultaData.historia || '',
              imagen: consultaData.imagen
            };

            const savedConsulta = await this.consultaRepository.create(createRequest);
            savedConsultas.push(savedConsulta);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            saveErrors.push(`Error al guardar consulta del paciente ${consultaData.paciente_id}: ${errorMessage}`);
          }
        }

        const allErrors = [...importResult.errors, ...saveErrors];

        const response: ApiResponse<{
          importResult: ExcelImportResult<Partial<ConsultaDB>>;
          savedCount: number;
          savedConsultas: ConsultaDB[];
          saveErrors: string[];
        }> = {
          success: savedConsultas.length > 0,
          data: {
            importResult,
            savedCount: savedConsultas.length,
            savedConsultas,
            saveErrors
          },
          message: `Importación completada: ${savedConsultas.length} consultas guardadas correctamente de ${importResult.totalRows} procesadas.`
        };

        if (allErrors.length > 0) {
          response.message += ` ${allErrors.length} errores encontrados.`;
        }

        res.json(response);
        logger.info(`Consultas importadas desde Excel: ${savedConsultas.length} guardadas, ${allErrors.length} errores`);

      } catch (error) {
        logger.error('Error al importar consultas desde Excel:', error);
        throw createError('Error al procesar el archivo Excel', 500);
      }
    })
  ];

  /**
   * Descargar template de Excel para pacientes
   */
  downloadPacientesTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const buffer = await ExcelUtils.createPacientesTemplate();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="template_pacientes.xlsx"');
      res.send(buffer);

      logger.info('Template de pacientes descargado');
    } catch (error) {
      logger.error('Error al generar template de pacientes:', error);
      throw createError('Error al generar template de pacientes', 500);
    }
  });

  /**
   * Descargar template de Excel para consultas
   */
  downloadConsultasTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const buffer = await ExcelUtils.createConsultasTemplate();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="template_consultas.xlsx"');
      res.send(buffer);

      logger.info('Template de consultas descargado');
    } catch (error) {
      logger.error('Error al generar template de consultas:', error);
      throw createError('Error al generar template de consultas', 500);
    }
  });

  /**
   * Validar formato de archivo Excel antes de importar
   */
  validateExcelFile = [
    excelUpload.single('excel'),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      if (!req.file) {
        throw createError('Archivo Excel requerido', 400);
      }

      const { type } = req.query; // 'pacientes' o 'consultas'

      try {
        let validationResult;

        if (type === 'pacientes') {
          validationResult = await ExcelUtils.importPacientesFromExcel(req.file.buffer);
        } else if (type === 'consultas') {
          validationResult = await ExcelUtils.importConsultasFromExcel(req.file.buffer);
        } else {
          throw createError('Tipo de validación requerido: pacientes o consultas', 400);
        }

        const response: ApiResponse<{
          valid: boolean;
          totalRows: number;
          validRows: number;
          errors: string[];
          preview: any[];
        }> = {
          success: true,
          data: {
            valid: validationResult.errors.length === 0,
            totalRows: validationResult.totalRows,
            validRows: validationResult.validRows,
            errors: validationResult.errors,
            preview: validationResult.data.slice(0, 5) // Mostrar solo los primeros 5 para preview
          },
          message: `Validación completada: ${validationResult.validRows} registros válidos de ${validationResult.totalRows} total`
        };

        res.json(response);
        logger.info(`Archivo Excel validado: ${validationResult.validRows} válidos, ${validationResult.errors.length} errores`);

      } catch (error) {
        logger.error('Error al validar archivo Excel:', error);
        throw createError('Error al validar el archivo Excel', 500);
      }
    })
  ];
}
