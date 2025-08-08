import { Router } from 'express';
import { Request, Response } from 'express';
import { medicoService } from '../../services/medico.service';
import { asyncHandler, createError } from '../../shared/middleware';
import { createModuleLogger } from '../../shared/utils/logger';
import { ApiResponse } from '../../types/database';

const logger = createModuleLogger('MedicoController');

export class MedicoController {

  /**
   * Obtener información del médico principal
   */
  getMedicoPrincipal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Obteniendo médico principal');

    const medico = await medicoService.getMedicoPrincipal();
    
    if (!medico) {
      throw createError('No se encontró ningún médico en el sistema', 404);
    }

    const response: ApiResponse<typeof medico> = {
      success: true,
      data: medico,
      message: 'Información del médico principal obtenida exitosamente'
    };

    logger.info('Médico principal obtenido', { 
      medicoId: medico.id,
      nombreCompleto: medico.nombreCompleto 
    });

    res.json(response);
  });

  /**
   * Obtener información de un médico por ID
   */
  getMedicoById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const medicoId = parseInt(req.params.id);
    
    if (isNaN(medicoId)) {
      throw createError('ID de médico inválido', 400);
    }

    logger.info('Obteniendo médico por ID', { medicoId });

    const medico = await medicoService.getMedicoById(medicoId);
    
    if (!medico) {
      throw createError('Médico no encontrado', 404);
    }

    const response: ApiResponse<typeof medico> = {
      success: true,
      data: medico,
      message: 'Información del médico obtenida exitosamente'
    };

    logger.info('Médico obtenido', { 
      medicoId: medico.id,
      nombreCompleto: medico.nombreCompleto 
    });

    res.json(response);
  });

  /**
   * Obtener todos los médicos
   */
  getAllMedicos = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Obteniendo todos los médicos');

    const medicos = await medicoService.getAllMedicos();

    const response: ApiResponse<typeof medicos> = {
      success: true,
      data: medicos,
      message: `${medicos.length} médicos encontrados`
    };

    logger.info(`Médicos obtenidos: ${medicos.length}`);
    res.json(response);
  });
}

/**
 * Configurar rutas del módulo de médicos
 */
export const setupMedicoRoutes = (router: Router): void => {
  const controller = new MedicoController();

  // Rutas públicas para obtener información de médicos
  router.get('/medicos', controller.getAllMedicos);
  router.get('/medicos/principal', controller.getMedicoPrincipal);
  router.get('/medicos/:id', controller.getMedicoById);
};

export default setupMedicoRoutes;
