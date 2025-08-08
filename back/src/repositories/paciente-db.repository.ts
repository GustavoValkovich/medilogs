import { query } from '../config/database';
import { 
  PacienteDB, 
  PacienteCompleto,
  CreatePacienteRequest, 
  UpdatePacienteRequest 
} from '../types/database';

export class PacienteRepository {

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ pacientes: PacienteCompleto[], total: number }> {
    let whereClause = '';
    let params: any[] = [];
    
    if (search) {
      // Usar ILIKE para PostgreSQL (case-insensitive) - Búsqueda en múltiples campos
      whereClause = `WHERE (
        p.nombre ILIKE $1 OR 
        p.documento ILIKE $1 OR 
        p.obra_social ILIKE $1 OR 
        p.localidad ILIKE $1 OR 
        p.mail ILIKE $1
      )`;
      params.push(`%${search}%`);
    }
    
    // Query para obtener el total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pacientes p
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Query principal con paginación y JOIN con médico
    const offset = (page - 1) * limit;
    const mainQuery = `
      SELECT 
        p.*,
        m.nombre as medico_nombre,
        (SELECT COUNT(*) FROM consultas c WHERE c.paciente_id = p.id) as total_consultas
      FROM pacientes p
      LEFT JOIN medico m ON p.medico_id = m.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const result = await query(mainQuery, params);
    
    return {
      pacientes: result.rows,
      total
    };
  }

  async findById(id: number): Promise<PacienteCompleto | null> {
    const result = await query(`
      SELECT 
        p.*,
        m.nombre as medico_nombre,
        (SELECT COUNT(*) FROM consultas c WHERE c.paciente_id = p.id) as total_consultas
      FROM pacientes p
      LEFT JOIN medico m ON p.medico_id = m.id
      WHERE p.id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  async findByDocumento(documento: string): Promise<PacienteDB | null> {
    const result = await query(`
      SELECT * FROM pacientes WHERE documento = $1
    `, [documento]);
    
    return result.rows[0] || null;
  }

  async create(pacienteData: CreatePacienteRequest): Promise<PacienteDB> {
    const {
      nombre,
      documento,
      nacimiento,
      sexo,
      obra_social,
      mail,
      localidad,
      medico_id,
      importante
    } = pacienteData;

    // Validar que los campos requeridos estén presentes
    if (!nombre || !documento || !nacimiento) {
      throw new Error('Los campos nombre, documento y nacimiento son requeridos');
    }

    // Procesar fecha de nacimiento de manera segura
    let fechaNacimiento: Date;
    try {
      fechaNacimiento = new Date(nacimiento);
      if (isNaN(fechaNacimiento.getTime())) {
        throw new Error('Fecha de nacimiento inválida');
      }
    } catch (error) {
      throw new Error(`Error al procesar fecha de nacimiento: ${nacimiento}`);
    }

    const result = await query(`
      INSERT INTO pacientes (
        nombre, documento, nacimiento, sexo, obra_social, mail, localidad, medico_id, importante
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      nombre,
      documento,
      fechaNacimiento,
      sexo || null,
      obra_social || null,
      mail || null,
      localidad || null,
      medico_id || null,
      importante || null
    ]);

    return result.rows[0];
  }

  async update(id: number, updateData: UpdatePacienteRequest): Promise<PacienteDB | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Construir query dinámicamente
    if (updateData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(updateData.nombre);
    }
    
    if (updateData.documento !== undefined) {
      fields.push(`documento = $${paramCount++}`);
      values.push(updateData.documento);
    }
    
    if (updateData.nacimiento !== undefined) {
      // Validar fecha antes de usarla
      try {
        const fecha = new Date(updateData.nacimiento);
        if (isNaN(fecha.getTime())) {
          throw new Error('Fecha de nacimiento inválida');
        }
        fields.push(`nacimiento = $${paramCount++}`);
        values.push(fecha);
      } catch (error) {
        throw new Error(`Error al procesar fecha de nacimiento: ${updateData.nacimiento}`);
      }
    }
    
    if (updateData.sexo !== undefined) {
      fields.push(`sexo = $${paramCount++}`);
      values.push(updateData.sexo);
    }
    
    if (updateData.obra_social !== undefined) {
      fields.push(`obra_social = $${paramCount++}`);
      values.push(updateData.obra_social);
    }
    
    if (updateData.mail !== undefined) {
      fields.push(`mail = $${paramCount++}`);
      values.push(updateData.mail);
    }
    
    if (updateData.localidad !== undefined) {
      fields.push(`localidad = $${paramCount++}`);
      values.push(updateData.localidad);
    }
    
    if (updateData.medico_id !== undefined) {
      fields.push(`medico_id = $${paramCount++}`);
      values.push(updateData.medico_id);
    }
    
    if (updateData.importante !== undefined) {
      fields.push(`importante = $${paramCount++}`);
      values.push(updateData.importante);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await query(`
      UPDATE pacientes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query(`
      DELETE FROM pacientes WHERE id = $1
    `, [id]);

    return (result.rowCount || 0) > 0;
  }

  async getPacientesByMedico(medicoId: number): Promise<PacienteDB[]> {
    const result = await query(`
      SELECT * FROM pacientes WHERE medico_id = $1 ORDER BY nombre
    `, [medicoId]);

    return result.rows;
  }

  async getPacientesImportantes(): Promise<PacienteDB[]> {
    const result = await query(`
      SELECT * FROM pacientes 
      WHERE importante IS NOT NULL 
        AND importante != '' 
        AND importante != 'false' 
        AND importante != 'true'
      ORDER BY nombre
    `);

    return result.rows;
  }

  /**
   * Buscar todos los pacientes con paginación y búsqueda FILTRADO POR MÉDICO
   */
  async findAllByMedico(medicoId: number, page: number = 1, limit: number = 10, search?: string): Promise<{ pacientes: PacienteCompleto[], total: number }> {
    let whereClause = 'WHERE p.medico_id = $1';
    let params: any[] = [medicoId];
    
    if (search) {
      // Usar ILIKE para PostgreSQL (case-insensitive) - Búsqueda en múltiples campos
      whereClause += ` AND (
        p.nombre ILIKE $2 OR 
        p.documento ILIKE $2 OR 
        p.obra_social ILIKE $2 OR 
        p.localidad ILIKE $2 OR 
        p.mail ILIKE $2
      )`;
      params.push(`%${search}%`);
    }
    
    // Query para obtener el total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pacientes p
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Query principal con paginación y JOIN con médico
    const offset = (page - 1) * limit;
    const mainQuery = `
      SELECT 
        p.*,
        m.nombre as medico_nombre,
        (SELECT COUNT(*) FROM consultas c WHERE c.paciente_id = p.id) as total_consultas
      FROM pacientes p
      LEFT JOIN medico m ON p.medico_id = m.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const result = await query(mainQuery, params);
    
    return {
      pacientes: result.rows,
      total
    };
  }

  /**
   * Buscar paciente por ID y verificar que pertenece al médico
   */
  async findByIdAndMedico(id: number, medicoId: number): Promise<PacienteCompleto | null> {
    const result = await query(`
      SELECT 
        p.*,
        m.nombre as medico_nombre,
        (SELECT COUNT(*) FROM consultas c WHERE c.paciente_id = p.id) as total_consultas
      FROM pacientes p
      LEFT JOIN medico m ON p.medico_id = m.id
      WHERE p.id = $1 AND p.medico_id = $2
    `, [id, medicoId]);
    
    return result.rows[0] || null;
  }

  /**
   * Obtener pacientes importantes filtrados por médico
   */
  async getPacientesImportantesByMedico(medicoId: number): Promise<PacienteDB[]> {
    const result = await query(`
      SELECT * FROM pacientes 
      WHERE medico_id = $1 
        AND importante IS NOT NULL 
        AND importante != '' 
        AND importante != 'false' 
        AND importante != 'true'
      ORDER BY nombre
    `, [medicoId]);

    return result.rows;
  }
}
