import { query } from '../config/database';
import { MedicoDB, CreateMedicoRequest } from '../types/database';
import * as bcrypt from 'bcrypt';

export class MedicoRepository {

  async findAll(): Promise<MedicoDB[]> {
    const result = await query(`
      SELECT id, nombre, apellido, especialidad, telefono, email, matricula FROM medico ORDER BY nombre, apellido
    `);
    
    return result.rows;
  }

  async findById(id: number): Promise<MedicoDB | null> {
    const result = await query(`
      SELECT id, nombre, apellido, especialidad, telefono, email, matricula FROM medico WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<MedicoDB | null> {
    const result = await query(`
      SELECT * FROM medico WHERE email = $1
    `, [email]);
    
    return result.rows[0] || null;
  }

  async create(medicoData: CreateMedicoRequest): Promise<MedicoDB> {
    const { nombre, apellido, especialidad, telefono, email, matricula, password } = medicoData;

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await query(`
      INSERT INTO medico (nombre, apellido, especialidad, telefono, email, matricula, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombre, apellido, especialidad, telefono, email, matricula
    `, [nombre, apellido, especialidad, telefono, email, matricula, hashedPassword]);

    return result.rows[0];
  }

  async update(id: number, updateData: Partial<CreateMedicoRequest>): Promise<MedicoDB | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(updateData.nombre);
    }
    
    if (updateData.apellido !== undefined) {
      fields.push(`apellido = $${paramCount++}`);
      values.push(updateData.apellido);
    }
    
    if (updateData.especialidad !== undefined) {
      fields.push(`especialidad = $${paramCount++}`);
      values.push(updateData.especialidad);
    }
    
    if (updateData.telefono !== undefined) {
      fields.push(`telefono = $${paramCount++}`);
      values.push(updateData.telefono);
    }
    
    if (updateData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updateData.email);
    }
    
    if (updateData.matricula !== undefined) {
      fields.push(`matricula = $${paramCount++}`);
      values.push(updateData.matricula);
    }
    
    if (updateData.password !== undefined) {
      // Hash de la nueva contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
      fields.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const result = await query(`
      UPDATE medico 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nombre, apellido, especialidad, telefono, email, matricula
    `, values);

    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    // Verificar si el médico tiene pacientes asignados
    const pacientesCount = await query(`
      SELECT COUNT(*) FROM pacientes WHERE medico_id = $1
    `, [id]);

    if (parseInt(pacientesCount.rows[0].count) > 0) {
      throw new Error('No se puede eliminar un médico que tiene pacientes asignados');
    }

    const result = await query(`
      DELETE FROM medico WHERE id = $1
    `, [id]);

    return (result.rowCount || 0) > 0;
  }

  async validatePassword(email: string, password: string): Promise<MedicoDB | null> {
    const result = await query(`
      SELECT id, nombre, apellido, especialidad, telefono, email, matricula, password FROM medico WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    const medico = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, medico.password);

    if (!isValidPassword) {
      return null;
    }

    // Retornar médico sin la contraseña
    const { password: _, ...medicoSinPassword } = medico;
    return medicoSinPassword;
  }
}
