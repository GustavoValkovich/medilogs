import { Request, Response } from 'express';
import { ConsultaRepository } from '../repositories/consulta-db.repository';
import { 
  CreateConsultaRequest, 
  UpdateConsultaRequest,
  ApiResponse, 
  PaginatedResponse,
  ConsultaCompleta 
} from '../types/database';

const consultaRepository = new ConsultaRepository();

export class ConsultaController {

  async getAllConsultas(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const pacienteId = req.query.pacienteId ? parseInt(req.query.pacienteId as string) : undefined;

      const { consultas, total } = await consultaRepository.findAll(page, limit, pacienteId);

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

      res.json(response);
    } catch (error) {
      console.error('Error en getAllConsultas:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener consultas'
      };
      res.status(500).json(response);
    }
  }

  async getConsultaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de consulta inválido'
        };
        res.status(400).json(response);
        return;
      }

      const consulta = await consultaRepository.findById(id);

      if (!consulta) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Consulta no encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<ConsultaCompleta> = {
        success: true,
        data: consulta
      };

      res.json(response);
    } catch (error) {
      console.error('Error en getConsultaById:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener consulta'
      };
      res.status(500).json(response);
    }
  }

  async createConsulta(req: Request, res: Response): Promise<void> {
    try {
      const consultaData: CreateConsultaRequest = req.body;

      // Validaciones básicas
      if (!consultaData.paciente_id || !consultaData.fecha_historia || !consultaData.historia) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Paciente ID, fecha de historia y historia son requeridos'
        };
        res.status(400).json(response);
        return;
      }

      const nuevaConsulta = await consultaRepository.create(consultaData);

      const response: ApiResponse<typeof nuevaConsulta> = {
        success: true,
        data: nuevaConsulta,
        message: 'Consulta creada exitosamente'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error en createConsulta:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al crear consulta'
      };
      res.status(500).json(response);
    }
  }

  async updateConsulta(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: UpdateConsultaRequest = req.body;

      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de consulta inválido'
        };
        res.status(400).json(response);
        return;
      }

      const consultaActualizada = await consultaRepository.update(id, updateData);

      if (!consultaActualizada) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Consulta no encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof consultaActualizada> = {
        success: true,
        data: consultaActualizada,
        message: 'Consulta actualizada exitosamente'
      };

      res.json(response);
    } catch (error) {
      console.error('Error en updateConsulta:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al actualizar consulta'
      };
      res.status(500).json(response);
    }
  }

  async deleteConsulta(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de consulta inválido'
        };
        res.status(400).json(response);
        return;
      }

      const eliminada = await consultaRepository.delete(id);

      if (!eliminada) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Consulta no encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Consulta eliminada exitosamente'
      };

      res.json(response);
    } catch (error) {
      console.error('Error en deleteConsulta:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al eliminar consulta'
      };
      res.status(500).json(response);
    }
  }

  async getConsultasByPaciente(req: Request, res: Response): Promise<void> {
    try {
      const pacienteId = parseInt(req.params.pacienteId);

      if (isNaN(pacienteId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID de paciente inválido'
        };
        res.status(400).json(response);
        return;
      }

      const consultas = await consultaRepository.findByPacienteId(pacienteId);

      const response: ApiResponse<typeof consultas> = {
        success: true,
        data: consultas
      };

      res.json(response);
    } catch (error) {
      console.error('Error en getConsultasByPaciente:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener consultas del paciente'
      };
      res.status(500).json(response);
    }
  }

  async getUltimasConsultas(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const consultas = await consultaRepository.getUltimasConsultas(limit);

      const response: ApiResponse<typeof consultas> = {
        success: true,
        data: consultas
      };

      res.json(response);
    } catch (error) {
      console.error('Error en getUltimasConsultas:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener últimas consultas'
      };
      res.status(500).json(response);
    }
  }

  async searchConsultas(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;

      if (!searchTerm) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Término de búsqueda requerido'
        };
        res.status(400).json(response);
        return;
      }

      const consultas = await consultaRepository.searchConsultas(searchTerm);

      const response: ApiResponse<typeof consultas> = {
        success: true,
        data: consultas
      };

      res.json(response);
    } catch (error) {
      console.error('Error en searchConsultas:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al buscar consultas'
      };
      res.status(500).json(response);
    }
  }
}
