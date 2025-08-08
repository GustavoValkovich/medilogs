import { Request, Response } from 'express';
import { PacienteRepository } from '../../repositories/paciente-db.repository';
import { 
  CreatePacienteRequest, 
  UpdatePacienteRequest,
  ApiResponse, 
  PaginatedResponse,
  PacienteCompleto 
} from '../../types/database';
import { asyncHandler, createError } from '../../shared/middleware';
import { validateBody, validateQuery, validateParams, commonSchemas } from '../../shared/middleware';
import { createModuleLogger } from '../../shared/utils/logger';

// Tipo extendido de Request que incluye user del JWT
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    nombre: string;
  };
}

const logger = createModuleLogger('PatientsController');
const pacienteRepository = new PacienteRepository();

/**
 * Controlador modular para pacientes
 */
export class PatientsController {

  /**
   * Obtener todos los pacientes con paginación y búsqueda (SOLO DEL MÉDICO AUTENTICADO)
   */
  getAllPatients = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    // Obtener el ID del médico autenticado
    const medicoId = req.user?.id;
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Obteniendo pacientes para médico', { page, limit, search, medicoId });

    const { pacientes, total } = await pacienteRepository.findAllByMedico(medicoId, page, limit, search);

    const response: ApiResponse<PaginatedResponse<PacienteCompleto>> = {
      success: true,
      data: {
        data: pacientes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    logger.info(`Pacientes obtenidos para médico ${medicoId}: ${pacientes.length}/${total}`);
    res.json(response);
  });

  /**
   * Obtener paciente por ID (SOLO SI PERTENECE AL MÉDICO AUTENTICADO)
   */
  getPatientById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const medicoId = req.user?.id;
    
    if (isNaN(id)) {
      throw createError('ID de paciente inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Obteniendo paciente por ID para médico', { id, medicoId });

    const paciente = await pacienteRepository.findByIdAndMedico(id, medicoId);
    
    if (!paciente) {
      throw createError('Paciente no encontrado o no autorizado', 404);
    }

    const response: ApiResponse<PacienteCompleto> = {
      success: true,
      data: paciente
    };

    res.json(response);
  });

  /**
   * Crear nuevo paciente (ASOCIADO AL MÉDICO AUTENTICADO)
   */
  createPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const pacienteData: CreatePacienteRequest = req.body;
    const medicoId = req.user?.id;
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    // Asociar automáticamente el paciente al médico autenticado
    pacienteData.medico_id = medicoId;

    logger.info('Creando nuevo paciente para médico', { nombre: pacienteData.nombre, medicoId });

    const nuevoPaciente = await pacienteRepository.create(pacienteData);

    const response: ApiResponse<PacienteCompleto> = {
      success: true,
      data: nuevoPaciente,
      message: 'Paciente creado exitosamente'
    };

    logger.info('Paciente creado para médico', { id: nuevoPaciente.id, medicoId });
    res.status(201).json(response);
  });

  /**
   * Actualizar paciente (SOLO SI PERTENECE AL MÉDICO AUTENTICADO)
   */
  updatePatient = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const updateData: UpdatePacienteRequest = req.body;
    const medicoId = req.user?.id;

    if (isNaN(id)) {
      throw createError('ID de paciente inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Actualizando paciente para médico', { id, medicoId });

    // Verificar que el paciente pertenece al médico
    const pacienteExistente = await pacienteRepository.findByIdAndMedico(id, medicoId);
    if (!pacienteExistente) {
      throw createError('Paciente no encontrado o no autorizado', 404);
    }

    // Prevenir cambio de médico_id por seguridad
    if (updateData.medico_id && updateData.medico_id !== medicoId) {
      throw createError('No puede cambiar la asignación de médico', 403);
    }

    const pacienteActualizado = await pacienteRepository.update(id, updateData);

    if (!pacienteActualizado) {
      throw createError('Error al actualizar paciente', 500);
    }

    const response: ApiResponse<PacienteCompleto> = {
      success: true,
      data: pacienteActualizado,
      message: 'Paciente actualizado exitosamente'
    };

    logger.info('Paciente actualizado para médico', { id, medicoId });
    res.json(response);
  });

  /**
   * Eliminar paciente (SOLO SI PERTENECE AL MÉDICO AUTENTICADO)
   */
  deletePatient = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const medicoId = req.user?.id;

    if (isNaN(id)) {
      throw createError('ID de paciente inválido', 400);
    }
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Eliminando paciente para médico', { id, medicoId });

    // Verificar que el paciente pertenece al médico
    const pacienteExistente = await pacienteRepository.findByIdAndMedico(id, medicoId);
    if (!pacienteExistente) {
      throw createError('Paciente no encontrado o no autorizado', 404);
    }

    const eliminado = await pacienteRepository.delete(id);

    if (!eliminado) {
      throw createError('Error al eliminar paciente', 500);
    }

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Paciente eliminado exitosamente'
    };

    logger.info('Paciente eliminado para médico', { id, medicoId });
    res.json(response);
  });

  /**
   * Obtener pacientes importantes (SOLO DEL MÉDICO AUTENTICADO)
   */
  getImportantPatients = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const medicoId = req.user?.id;
    
    if (!medicoId) {
      throw createError('Usuario no autenticado', 401);
    }

    logger.info('Obteniendo pacientes importantes para médico', { medicoId });

    const pacientes = await pacienteRepository.getPacientesImportantesByMedico(medicoId);

    const response: ApiResponse<PacienteCompleto[]> = {
      success: true,
      data: pacientes
    };

    logger.info(`Pacientes importantes obtenidos para médico ${medicoId}: ${pacientes.length}`);
    res.json(response);
  });

  /**
   * Obtener pacientes por médico
   */
  getPatientsByDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const medicoId = parseInt(req.params.medicoId);

    if (isNaN(medicoId)) {
      throw createError('ID de médico inválido', 400);
    }

    logger.info('Obteniendo pacientes por médico', { medicoId });

    const pacientes = await pacienteRepository.getPacientesByMedico(medicoId);

    const response: ApiResponse<PacienteCompleto[]> = {
      success: true,
      data: pacientes
    };

    logger.info(`Pacientes del médico ${medicoId}: ${pacientes.length}`);
    res.json(response);
  });
}

/**
 * Esquemas de validación para pacientes
 */
export const patientValidationSchemas = {
  create: {
    nombre: { required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    documento: { required: true, type: 'string' as const, minLength: 5, maxLength: 20 },
    nacimiento: { required: true, type: 'string' as const, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    localidad: { required: false, type: 'string' as const, minLength: 2, maxLength: 100 },
    sexo: { required: false, type: 'string' as const, values: ['M', 'F'] },
    obra_social: { required: false, type: 'string' as const, maxLength: 100 },
    mail: { required: false, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    medico_id: { required: false, type: 'number' as const },
    importante: { required: false, type: 'string' as const, maxLength: 200 }
  },
  
  update: {
    nombre: { required: false, type: 'string' as const, minLength: 2, maxLength: 100 },
    documento: { required: false, type: 'string' as const, minLength: 5, maxLength: 20 },
    nacimiento: { required: false, type: 'string' as const, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    localidad: { required: false, type: 'string' as const, minLength: 2, maxLength: 100 },
    sexo: { required: false, type: 'string' as const, values: ['M', 'F'] },
    obra_social: { required: false, type: 'string' as const, maxLength: 100 },
    mail: { required: false, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    medico_id: { required: false, type: 'number' as const },
    importante: { required: false, type: 'string' as const, maxLength: 200 }
  },
  
  query: {
    page: { required: false, type: 'string' as const, pattern: /^\d+$/ },
    limit: { required: false, type: 'string' as const, pattern: /^\d+$/ },
    search: { required: false, type: 'string' as const, maxLength: 100 }
  }
};
