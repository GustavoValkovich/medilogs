import { Request, Response } from 'express';
import { MedicoRepository } from '../../repositories/medico-db.repository';
import { ApiResponse } from '../../types/database';
import { asyncHandler, createError } from '../../shared/middleware';
import { createModuleLogger } from '../../shared/utils/logger';

const logger = createModuleLogger('DoctorsController');
const medicoRepository = new MedicoRepository();

/**
 * Controlador modular para médicos
 */
export class DoctorsController {

  /**
   * Obtener todos los médicos
   */
  getAllDoctors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Obteniendo todos los médicos');

    const medicos = await medicoRepository.findAll();

    const response: ApiResponse<any[]> = {
      success: true,
      data: medicos,
      message: `${medicos.length} médicos encontrados`
    };

    logger.info(`Médicos obtenidos: ${medicos.length}`);
    res.json(response);
  });

  /**
   * Obtener médico por ID
   */
  getDoctorById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw createError('ID de médico inválido', 400);
    }

    logger.info('Obteniendo médico por ID', { id });

    const medico = await medicoRepository.findById(id);
    
    if (!medico) {
      throw createError('Médico no encontrado', 404);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: medico
    };

    res.json(response);
  });

  /**
   * Verificar si el sistema necesita configuración inicial
   */
  checkSystemStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const existingDoctors = await medicoRepository.findAll();
    const needsInitialSetup = existingDoctors.length === 0;

    const response: ApiResponse<any> = {
      success: true,
      data: {
        needsInitialSetup,
        totalDoctors: existingDoctors.length,
        systemReady: !needsInitialSetup
      },
      message: needsInitialSetup 
        ? 'El sistema necesita configuración inicial. Cree el primer médico usando POST /api/v1/doctors'
        : `Sistema configurado con ${existingDoctors.length} médico(s)`
    };

    logger.info('Estado del sistema verificado', { needsInitialSetup, totalDoctors: existingDoctors.length });
    res.json(response);
  });

  /**
   * Crear nuevo médico
   */
  createDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const medicoData = req.body;

    logger.info('Creando nuevo médico', { nombre: medicoData.nombre });

    // Verificar si es el primer médico del sistema
    const existingDoctors = await medicoRepository.findAll();
    const isFirstDoctor = existingDoctors.length === 0;

    const nuevoMedico = await medicoRepository.create(medicoData);

    const response: ApiResponse<any> = {
      success: true,
      data: nuevoMedico,
      message: isFirstDoctor 
        ? 'Primer médico creado exitosamente. El sistema está listo para usar.' 
        : 'Médico creado exitosamente'
    };

    logger.info('Médico creado', { 
      id: nuevoMedico.id, 
      isFirstDoctor,
      email: nuevoMedico.email 
    });
    res.status(201).json(response);
  });

  /**
   * Actualizar médico
   */
  updateDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(id)) {
      throw createError('ID de médico inválido', 400);
    }

    logger.info('Actualizando médico', { id });

    const medicoActualizado = await medicoRepository.update(id, updateData);

    if (!medicoActualizado) {
      throw createError('Médico no encontrado', 404);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: medicoActualizado,
      message: 'Médico actualizado exitosamente'
    };

    logger.info('Médico actualizado', { id });
    res.json(response);
  });

  /**
   * Eliminar médico
   */
  deleteDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw createError('ID de médico inválido', 400);
    }

    logger.info('Eliminando médico', { id });

    const eliminado = await medicoRepository.delete(id);

    if (!eliminado) {
      throw createError('Médico no encontrado', 404);
    }

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Médico eliminado exitosamente'
    };

    logger.info('Médico eliminado', { id });
    res.json(response);
  });
}

/**
 * Esquemas de validación para médicos
 */
export const doctorValidationSchemas = {
  create: {
    nombre: { required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    apellido: { required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    especialidad: { required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
    telefono: { required: false, type: 'string' as const, maxLength: 20 },
    email: { required: false, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    matricula: { required: true, type: 'string' as const, minLength: 3, maxLength: 50 },
    password: { required: true, type: 'string' as const, minLength: 6 }
  },
  
  update: {
    nombre: { required: false, type: 'string' as const, minLength: 2, maxLength: 100 },
    apellido: { required: false, type: 'string' as const, minLength: 2, maxLength: 100 },
    especialidad: { required: false, type: 'string' as const, minLength: 2, maxLength: 100 },
    telefono: { required: false, type: 'string' as const, maxLength: 20 },
    email: { required: false, type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    matricula: { required: false, type: 'string' as const, minLength: 3, maxLength: 50 },
    password: { required: false, type: 'string' as const, minLength: 6 }
  }
};
