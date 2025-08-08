import { Request, Response } from 'express';
import { ConsultaRepository } from '../../repositories/consulta-db.repository';
import { PacienteRepository } from '../../repositories/paciente-db.repository';
import { 
  CreateConsultaRequest, 
  UpdateConsultaRequest,
  ApiResponse, 
  PaginatedResponse,
  ConsultaCompleta 
} from '../../types/database';
import { asyncHandler, createError } from '../../shared/middleware';
import { createModuleLogger } from '../../shared/utils/logger';
import { medicoService, MedicoInfo } from '../../services/medico.service';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// Tipo extendido de Request que incluye user del JWT
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    nombre: string;
  };
}

const logger = createModuleLogger('ConsultationsController');
const consultaRepository = new ConsultaRepository();
const pacienteRepository = new PacienteRepository();

/**
 * Controlador modular para consultas
 */
export class ConsultationsController {

  /**
   * Obtener todas las consultas con paginación
   */
  getAllConsultations = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const pacienteId = req.query.pacienteId ? parseInt(req.query.pacienteId as string) : undefined;
    
    // Obtener el ID del médico autenticado
    const medicoId = req.user?.id;
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Obteniendo consultas para médico', { page, limit, pacienteId, medicoId });

    const { consultas, total } = await consultaRepository.findAll(page, limit, pacienteId, medicoId);

    const response: ApiResponse<PaginatedResponse<ConsultaCompleta>> = {
      success: true,
      data: {
        data: consultas,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    logger.info(`Consultas obtenidas para médico ${medicoId}: ${consultas.length}/${total}`);
    res.json(response);
  });

  /**
   * Obtener consulta por ID (SOLO SI EL PACIENTE PERTENECE AL MÉDICO AUTENTICADO)
   */
  getConsultationById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const medicoId = req.user?.id;
    
    if (isNaN(id)) {
      throw createError('ID de consulta inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Obteniendo consulta por ID para médico', { id, medicoId });

    const consulta = await consultaRepository.findByIdAndMedico(id, medicoId);
    
    if (!consulta) {
      throw createError('Consulta no encontrada o no autorizada', 404);
    }

    const response: ApiResponse<ConsultaCompleta> = {
      success: true,
      data: consulta
    };

    res.json(response);
  });

  /**
   * Crear nueva consulta (VERIFICANDO QUE EL PACIENTE PERTENECE AL MÉDICO AUTENTICADO)
   */
  createConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const consultaData: CreateConsultaRequest = req.body;
    const medicoId = req.user?.id;
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Creando nueva consulta para médico', { pacienteId: consultaData.paciente_id, medicoId });

    // Verificar que el paciente pertenece al médico
    const paciente = await pacienteRepository.findByIdAndMedico(consultaData.paciente_id, medicoId);
    if (!paciente) {
      throw createError('Paciente no encontrado o no autorizado', 404);
    }

    const nuevaConsulta = await consultaRepository.create(consultaData);

    const response: ApiResponse<ConsultaCompleta> = {
      success: true,
      data: nuevaConsulta,
      message: 'Consulta creada exitosamente'
    };

    logger.info('Consulta creada para médico', { id: nuevaConsulta.id, medicoId });
    res.status(201).json(response);
  });

  /**
   * Actualizar consulta (SOLO SI EL PACIENTE PERTENECE AL MÉDICO AUTENTICADO)
   */
  updateConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const updateData: UpdateConsultaRequest = req.body;
    const medicoId = req.user?.id;

    if (isNaN(id)) {
      throw createError('ID de consulta inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Actualizando consulta para médico', { id, medicoId });

    // Verificar que la consulta pertenece al médico
    const consultaExistente = await consultaRepository.findByIdAndMedico(id, medicoId);
    if (!consultaExistente) {
      throw createError('Consulta no encontrada o no autorizada', 404);
    }

    const consultaActualizada = await consultaRepository.update(id, updateData);

    if (!consultaActualizada) {
      throw createError('Error al actualizar consulta', 500);
    }

    const response: ApiResponse<ConsultaCompleta> = {
      success: true,
      data: consultaActualizada,
      message: 'Consulta actualizada exitosamente'
    };

    logger.info('Consulta actualizada para médico', { id, medicoId });
    res.json(response);
  });

  /**
   * Eliminar consulta (SOLO SI EL PACIENTE PERTENECE AL MÉDICO AUTENTICADO)
   */
  deleteConsultation = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const medicoId = req.user?.id;

    if (isNaN(id)) {
      throw createError('ID de consulta inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Eliminando consulta para médico', { id, medicoId });

    // Verificar que la consulta pertenece al médico
    const consultaExistente = await consultaRepository.findByIdAndMedico(id, medicoId);
    if (!consultaExistente) {
      throw createError('Consulta no encontrada o no autorizada', 404);
    }

    const eliminada = await consultaRepository.delete(id);

    if (!eliminada) {
      throw createError('Error al eliminar consulta', 500);
    }

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Consulta eliminada exitosamente'
    };

    logger.info('Consulta eliminada para médico', { id, medicoId });
    res.json(response);
  });

  /**
   * Obtener consultas por paciente (SOLO SI EL PACIENTE PERTENECE AL MÉDICO AUTENTICADO)
   */
  getConsultationsByPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const pacienteId = parseInt(req.params.pacienteId);
    const medicoId = req.user?.id;

    if (isNaN(pacienteId)) {
      throw createError('ID de paciente inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Obteniendo consultas por paciente para médico', { pacienteId, medicoId });

    // Verificar que el paciente pertenece al médico
    const paciente = await pacienteRepository.findByIdAndMedico(pacienteId, medicoId);
    if (!paciente) {
      throw createError('Paciente no encontrado o no autorizado', 404);
    }

    const consultas = await consultaRepository.findByPacienteId(pacienteId);

    const response: ApiResponse<ConsultaCompleta[]> = {
      success: true,
      data: consultas
    };

    logger.info(`Consultas del paciente ${pacienteId} para médico ${medicoId}: ${consultas.length}`);
    res.json(response);
  });

  /**
   * Obtener últimas consultas (SOLO DEL MÉDICO AUTENTICADO)
   */
  getRecentConsultations = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 10;
    const medicoId = req.user?.id;
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Obteniendo últimas consultas para médico', { limit, medicoId });

    const consultas = await consultaRepository.getUltimasConsultasByMedico(medicoId, limit);

    const response: ApiResponse<ConsultaCompleta[]> = {
      success: true,
      data: consultas
    };

    logger.info(`Últimas consultas obtenidas para médico ${medicoId}: ${consultas.length}`);
    res.json(response);
  });

  /**
   * Buscar consultas
   */
  searchConsultations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string;

    if (!search || search.trim().length === 0) {
      throw createError('Término de búsqueda requerido', 400);
    }

    logger.info('Buscando consultas', { search });

    const consultas = await consultaRepository.searchConsultas(search);

    const response: ApiResponse<ConsultaCompleta[]> = {
      success: true,
      data: consultas
    };

    logger.info(`Resultados de búsqueda: ${consultas.length}`);
    res.json(response);
  });

  /**
   * Crear nueva consulta con archivos
   */
  createConsultationWithFiles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const consultaData: CreateConsultaRequest = req.body;
    const files = req.files as Express.Multer.File[];

    logger.info('Creando nueva consulta con archivos', { 
      pacienteId: consultaData.paciente_id,
      fileCount: files?.length || 0
    });

    // Crear la consulta primero
    const nuevaConsulta = await consultaRepository.create(consultaData);

    // Si hay archivos, asociarlos con la consulta
    if (files && files.length > 0) {
      // Tomar solo el primer archivo y guardar su nombre (sin ruta)
      const fileName = files[0].filename;
      
      // Actualizar la consulta con el nombre del archivo
      const updatedConsulta = await consultaRepository.update(nuevaConsulta.id, {
        imagen: fileName
      });

      logger.info('Archivo asociado a la consulta', { 
        consultaId: nuevaConsulta.id,
        fileName: fileName
      });

      const response: ApiResponse<ConsultaCompleta> = {
        success: true,
        data: updatedConsulta!,
        message: `Consulta creada exitosamente con ${files.length} archivo(s)`
      };

      res.status(201).json(response);
    } else {
      const response: ApiResponse<ConsultaCompleta> = {
        success: true,
        data: nuevaConsulta,
        message: 'Consulta creada exitosamente'
      };

      res.status(201).json(response);
    }
  });

  /**
   * Obtener información de imagen de una consulta
   */
  getConsultationImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw createError('ID de consulta inválido', 400);
    }

    const consulta = await consultaRepository.findById(id);

    if (!consulta) {
      throw createError('Consulta no encontrada', 404);
    }

    if (!consulta.imagen) {
      throw createError('Esta consulta no tiene imagen asociada', 404);
    }

    // Construir la URL completa de la imagen
    const imageUrl = `/uploads/${consulta.imagen}`;
    
    // Verificar si el archivo existe físicamente
    const uploadsPath = path.join(__dirname, '../../../uploads');
    const imagePath = path.join(uploadsPath, consulta.imagen);
    const imageExists = fs.existsSync(imagePath);

    const response: ApiResponse<{
      consultaId: number;
      pacienteNombre: string;
      fechaHistoria: Date;
      imagen: string;
      imageUrl: string;
      imageExists: boolean;
      fullUrl: string;
    }> = {
      success: true,
      data: {
        consultaId: consulta.id,
        pacienteNombre: consulta.paciente_nombre || 'N/A',
        fechaHistoria: consulta.fecha_historia!,
        imagen: consulta.imagen,
        imageUrl,
        imageExists,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
      },
      message: imageExists ? 'Imagen encontrada' : 'Referencia de imagen encontrada pero archivo no existe'
    };

    logger.info(`Información de imagen obtenida para consulta ${id}: ${consulta.imagen}`);
    res.json(response);
  });

  /**
   * Listar todas las consultas con imágenes
   */
  getConsultationsWithImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Obteniendo consultas con imágenes', { page, limit });

    // Obtener todas las consultas y filtrar las que tienen imágenes
    const { consultas, total } = await consultaRepository.findAll(1, 1000); // Obtener muchas para filtrar
    const consultasConImagenes = consultas.filter(c => c.imagen);
    
    // Aplicar paginación a los resultados filtrados
    const totalFiltered = consultasConImagenes.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConsultas = consultasConImagenes.slice(startIndex, endIndex);

    // Agregar información de URL y existencia de archivos
    const uploadsPath = path.join(__dirname, '../../../uploads');
    const consultasConInfo = paginatedConsultas.map(consulta => ({
      ...consulta,
      imageUrl: `/uploads/${consulta.imagen}`,
      fullUrl: `${req.protocol}://${req.get('host')}/uploads/${consulta.imagen}`,
      imageExists: fs.existsSync(path.join(uploadsPath, consulta.imagen!))
    }));

    const response: ApiResponse<PaginatedResponse<any>> = {
      success: true,
      data: {
        data: consultasConInfo,
        total: totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit)
      },
      message: `${consultasConInfo.length} consultas con imágenes encontradas`
    };

    logger.info(`Consultas con imágenes obtenidas: ${consultasConInfo.length}/${totalFiltered}`);
    res.json(response);
  });

  /**
   * Obtener consultas de un paciente con sus imágenes
   */
  getPatientConsultationsWithImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pacienteId = parseInt(req.params.pacienteId);

    if (isNaN(pacienteId)) {
      throw createError('ID de paciente inválido', 400);
    }

    logger.info(`Obteniendo consultas con imágenes para paciente ${pacienteId}`);

    const { consultas } = await consultaRepository.findAll(1, 1000, pacienteId);
    const consultasConImagenes = consultas.filter(c => c.imagen);

    if (consultasConImagenes.length === 0) {
      const response: ApiResponse<any[]> = {
        success: true,
        data: [],
        message: 'Este paciente no tiene consultas con imágenes'
      };
      res.json(response);
      return;
    }

    // Agregar información de URL y existencia de archivos
    const uploadsPath = path.join(__dirname, '../../../uploads');
    const consultasConInfo = consultasConImagenes.map(consulta => ({
      ...consulta,
      imageUrl: `/uploads/${consulta.imagen}`,
      fullUrl: `${req.protocol}://${req.get('host')}/uploads/${consulta.imagen}`,
      imageExists: fs.existsSync(path.join(uploadsPath, consulta.imagen!))
    }));

    const response: ApiResponse<any[]> = {
      success: true,
      data: consultasConInfo,
      message: `${consultasConInfo.length} consultas con imágenes encontradas para el paciente`
    };

    logger.info(`Consultas con imágenes del paciente ${pacienteId}: ${consultasConInfo.length}`);
    res.json(response);
  });

  /**
   * Generar PDF con historial de consultas de un paciente (SOLO SI PERTENECE AL MÉDICO AUTENTICADO)
   */
  generatePatientPDF = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const pacienteId = parseInt(req.params.pacienteId);
    const medicoId = req.user?.id;
    
    if (isNaN(pacienteId)) {
      throw createError('ID de paciente inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Generando PDF para paciente del médico', { pacienteId, medicoId });

    // Verificar que el paciente pertenece al médico
    const paciente = await pacienteRepository.findByIdAndMedico(pacienteId, medicoId);
    if (!paciente) {
      throw createError('Paciente no encontrado o no autorizado', 404);
    }

    // Obtener consultas del paciente
    const consultas = await consultaRepository.findByPacienteId(pacienteId);
    
    if (consultas.length === 0) {
      throw createError('No se encontraron consultas para este paciente', 404);
    }

    const nombrePaciente = paciente.nombre || `Paciente ${pacienteId}`;

    // Obtener información del médico autenticado
    const medicoInfo = await medicoService.getMedicoPrincipal();
    
    if (!medicoInfo) {
      logger.warn('No se encontró información del médico, usando datos por defecto');
    }

    logger.info('Consultando datos', { 
      consultas: consultas.length, 
      nombrePaciente,
      medico: medicoInfo?.nombreCompleto || 'No disponible'
    });

    try {
      // Configurar puppeteer con opciones más específicas
      const browser = await puppeteer.launch({
        headless: true, // Cambiar a boolean
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
      
      const page = await browser.newPage();
      
      // Generar contenido HTML mejorado
      const htmlContent = this.generatePDFHTML(consultas, pacienteId, nombrePaciente, medicoInfo);
      
      // Configurar la página con mejor manejo de contenido
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // Generar PDF con configuración mejorada para máximo aprovechamiento del espacio
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm'
        },
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false // Removemos header/footer para más espacio
      });
      
      await browser.close();

      // Verificar que el buffer es válido
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF buffer vacío o inválido');
      }

      logger.info('PDF generado exitosamente', { 
        pacienteId, 
        nombrePaciente,
        size: pdfBuffer.length,
        consultasIncluidas: consultas.length 
      });

      // Configurar headers correctos para PDF
      const filename = `historial_${nombrePaciente.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Enviar PDF como buffer
      res.status(200).end(pdfBuffer, 'binary');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error generando PDF', { 
        error: errorMessage, 
        stack: error instanceof Error ? error.stack : undefined,
        pacienteId 
      });
      throw createError(`Error al generar PDF: ${errorMessage}`, 500);
    }
  });

  /**
   * Generar contenido HTML para PDF
   */
  private generatePDFHTML(consultas: ConsultaCompleta[], pacienteId: number, nombrePaciente?: string, medicoInfo?: MedicoInfo | null): string {
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const nombreDisplay = nombrePaciente || `Paciente ${pacienteId}`;
    
    // Usar datos del médico de la base de datos o valores por defecto
    const doctorData = medicoInfo ? {
      nombre: medicoInfo.nombreCompleto,
      matricula: medicoInfo.matricula,
      especialidad: medicoInfo.especialidad,
      telefono: medicoInfo.telefono || 'No disponible',
      email: medicoInfo.email || ''
    } : {
      nombre: 'Médico no disponible',
      matricula: 'N/A',
      especialidad: 'N/A',
      telefono: 'N/A',
      email: ''
    };

    let consultasHTML = '';
    consultas.forEach((consulta, index) => {
      const fecha = consulta.fecha_historia ? new Date(consulta.fecha_historia) : new Date();
      
      // Formatear fecha y hora para Argentina (UTC-3)
      const fechaFormateada = fecha.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
      });
      const horaFormateada = fecha.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
      });
      
      consultasHTML += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e9ecef; font-size: 11px; vertical-align: top; width: 80px;">
            ${fechaFormateada}<br>
            <span style="color: #6c757d; font-size: 10px;">${horaFormateada}</span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e9ecef; font-size: 11px; line-height: 1.4; vertical-align: top;">
            ${consulta.historia || 'Sin notas registradas'}
            ${consulta.imagen ? `<div style="margin-top: 4px; color: #007bff; font-size: 10px;">📎 ${consulta.imagen}</div>` : ''}
          </td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Historial Médico - ${nombreDisplay}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 15px; 
            background: #ffffff;
            color: #333;
            line-height: 1.3;
            font-size: 11px;
          }
          .header { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #007bff;
          }
          .logo {
            color: #6c757d;
            font-size: 10px;
            font-weight: 500;
          }
          .main-title {
            text-align: center;
            flex: 1;
            margin: 0 20px;
          }
          .main-title h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
          }
          .date-stamp {
            color: #6c757d;
            font-size: 10px;
            text-align: right;
          }
          .doctor-info { 
            background: #f8f9fa;
            padding: 12px;
            border-radius: 4px; 
            margin-bottom: 15px;
            border-left: 4px solid #007bff;
          }
          .doctor-info h3 {
            margin: 0 0 6px 0;
            color: #007bff;
            font-size: 14px;
            font-weight: 600;
          }
          .doctor-details {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 10px;
            color: #495057;
          }
          .patient-info { 
            background: #fff;
            padding: 10px;
            border-radius: 4px; 
            margin-bottom: 15px;
            border: 1px solid #dee2e6;
          }
          .patient-info h3 {
            margin: 0 0 6px 0;
            color: #495057;
            font-size: 12px;
            font-weight: 600;
          }
          .patient-details {
            display: flex;
            gap: 15px;
            font-size: 10px;
            color: #6c757d;
          }
          .consultations-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .consultations-table th {
            background: #f1f3f4;
            padding: 8px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #007bff;
          }
          .consultations-table td {
            font-size: 11px;
            vertical-align: top;
          }
          .section-title {
            margin: 15px 0 8px 0;
            font-size: 13px;
            font-weight: 600;
            color: #2c3e50;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 3px;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
            color: #adb5bd;
            border-top: 1px solid #e9ecef;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MediLogs</div>
          <div class="main-title">
            <h1>Historial Clínico</h1>
          </div>
          <div class="date-stamp">${fechaGeneracion}</div>
        </div>
        
        <div class="doctor-info">
          <h3>${doctorData.nombre}</h3>
          <div class="doctor-details">
            <span><strong>Mat. Profesional:</strong> ${doctorData.matricula}</span>
            <span><strong>Especialidad:</strong> ${doctorData.especialidad}</span>
            <span><strong>Teléfono:</strong> ${doctorData.telefono}</span>
            ${doctorData.email ? `<span><strong>Email:</strong> ${doctorData.email}</span>` : ''}
          </div>
        </div>
        
        <div class="patient-info">
          <h3>Paciente: ${nombreDisplay}</h3>
          <div class="patient-details">
            <span><strong>ID:</strong> ${pacienteId}</span>
            <span><strong>Consultas:</strong> ${consultas.length}</span>
            <span><strong>Con archivos:</strong> ${consultas.filter(c => c.imagen).length}</span>
          </div>
        </div>

        <div class="section-title">Registro de Consultas</div>
        <table class="consultations-table">
          <thead>
            <tr>
              <th style="width: 80px;">Fecha</th>
              <th>Historia Clínica</th>
            </tr>
          </thead>
          <tbody>
            ${consultasHTML}
          </tbody>
        </table>
        
        <div class="footer">
          MediLogs v3.0.0 | Generado: ${new Date().toLocaleString('es-ES')} | Documento confidencial
        </div>
      </body>
      </html>
    `;
  }
}

/**
 * Esquemas de validación para consultas
 */
export const consultationValidationSchemas = {
  create: {
    paciente_id: { required: true, type: 'number' as const },
    fecha_historia: { required: true, type: 'string' as const, pattern: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/ },
    historia: { required: true, type: 'string' as const, minLength: 5, maxLength: 2000 },
    imagen: { required: false, type: 'string' as const, maxLength: 500 }
  },
  
  update: {
    paciente_id: { required: false, type: 'number' as const },
    fecha_historia: { required: false, type: 'string' as const, pattern: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/ },
    historia: { required: false, type: 'string' as const, minLength: 5, maxLength: 2000 },
    imagen: { required: false, type: 'string' as const, maxLength: 500 }
  },
  
  query: {
    page: { required: false, type: 'string' as const, pattern: /^\d+$/ },
    limit: { required: false, type: 'string' as const, pattern: /^\d+$/ },
    pacienteId: { required: false, type: 'string' as const, pattern: /^\d+$/ },
    search: { required: false, type: 'string' as const, maxLength: 100 }
  }
};
