import { query } from '../config/database';
import { createModuleLogger } from '../shared/utils/logger';

const logger = createModuleLogger('MedicoService');

export interface MedicoInfo {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  matricula: string;
  nombreCompleto: string;
}

/**
 * Servicio para gestionar información de médicos
 */
export class MedicoService {
  
  /**
   * Obtener información del médico por ID
   */
  async getMedicoById(medicoId: number): Promise<MedicoInfo | null> {
    try {
      logger.info('Obteniendo información del médico', { medicoId });
      
      const result = await query(
        'SELECT id, nombre, apellido, especialidad, telefono, email, matricula FROM medico WHERE id = $1',
        [medicoId]
      );

      if (result.rows.length === 0) {
        logger.warn('Médico no encontrado', { medicoId });
        return null;
      }

      const medico = result.rows[0];
      const medicoInfo: MedicoInfo = {
        id: medico.id,
        nombre: medico.nombre,
        apellido: medico.apellido,
        especialidad: medico.especialidad,
        telefono: medico.telefono,
        email: medico.email,
        matricula: medico.matricula,
        nombreCompleto: `Dr${medico.nombre.includes('Diana') ? 'a' : ''}. ${medico.nombre} ${medico.apellido}`
      };

      logger.info('Información del médico obtenida', { 
        medicoId, 
        nombreCompleto: medicoInfo.nombreCompleto 
      });

      return medicoInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error obteniendo información del médico', { 
        medicoId, 
        error: errorMessage 
      });
      throw new Error(`Error al obtener información del médico: ${errorMessage}`);
    }
  }

  /**
   * Obtener el médico principal (el primero en la tabla)
   * Útil cuando hay un solo médico en el sistema
   */
  async getMedicoPrincipal(): Promise<MedicoInfo | null> {
    try {
      logger.info('Obteniendo médico principal');
      
      const result = await query(
        'SELECT id, nombre, apellido, especialidad, telefono, email, matricula FROM medico ORDER BY id ASC LIMIT 1'
      );

      if (result.rows.length === 0) {
        logger.warn('No se encontró ningún médico en el sistema');
        return null;
      }

      const medico = result.rows[0];
      const medicoInfo: MedicoInfo = {
        id: medico.id,
        nombre: medico.nombre,
        apellido: medico.apellido,
        especialidad: medico.especialidad,
        telefono: medico.telefono,
        email: medico.email,
        matricula: medico.matricula,
        nombreCompleto: `Dr${medico.nombre.includes('Diana') ? 'a' : ''}. ${medico.nombre} ${medico.apellido}`
      };

      logger.info('Médico principal obtenido', { 
        medicoId: medicoInfo.id,
        nombreCompleto: medicoInfo.nombreCompleto 
      });

      return medicoInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error obteniendo médico principal', { error: errorMessage });
      throw new Error(`Error al obtener médico principal: ${errorMessage}`);
    }
  }

  /**
   * Obtener todos los médicos del sistema
   */
  async getAllMedicos(): Promise<MedicoInfo[]> {
    try {
      logger.info('Obteniendo todos los médicos');
      
      const result = await query(
        'SELECT id, nombre, apellido, especialidad, telefono, email, matricula FROM medico ORDER BY nombre ASC'
      );

      const medicos: MedicoInfo[] = result.rows.map((medico: any) => ({
        id: medico.id,
        nombre: medico.nombre,
        apellido: medico.apellido,
        especialidad: medico.especialidad,
        telefono: medico.telefono,
        email: medico.email,
        matricula: medico.matricula,
        nombreCompleto: `Dr${medico.nombre.includes('Diana') ? 'a' : ''}. ${medico.nombre} ${medico.apellido}`
      }));

      logger.info(`Se obtuvieron ${medicos.length} médicos`);
      return medicos;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error obteniendo todos los médicos', { error: errorMessage });
      throw new Error(`Error al obtener médicos: ${errorMessage}`);
    }
  }
}

export const medicoService = new MedicoService();
