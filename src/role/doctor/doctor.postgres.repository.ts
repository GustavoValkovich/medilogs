import { pool } from '../../db/connection.js';
import { DoctorRepository } from './doctor.repository.interface';
import { Doctor } from './doctor.entity';

export class DoctorPostgresRepository implements DoctorRepository {
  async findAll(): Promise<Doctor[] | undefined> {
    const res = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
    return (res.rows as Doctor[]) || undefined;
  }

  async findOne(id: string): Promise<Doctor | undefined> {
    const res = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
    return (res.rows[0] as Doctor) || undefined;
  }

  async add(doctor: Doctor): Promise<Doctor | undefined> {
    try {
      const res = await pool.query(
        `INSERT INTO doctors 
          (first_name, last_name, specialty, phone, email, license_number, password) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          doctor.first_name,
          doctor.last_name,
          doctor.specialty,
          doctor.phone,
          doctor.email,
          doctor.license_number,
          doctor.password,
        ],
      );
      return res.rows[0];
    } catch (error) {
      return undefined;
    }
  }

  async update(id: string, doctor: Doctor): Promise<Doctor | undefined> {
    try {
      const res = await pool.query(
        `UPDATE doctors 
         SET first_name = $1, last_name = $2, specialty = $3, phone = $4, email = $5, 
             license_number = $6, password = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 
         RETURNING *`,
        [
          doctor.first_name,
          doctor.last_name,
          doctor.specialty,
          doctor.phone,
          doctor.email,
          doctor.license_number,
          doctor.password,
          id,
        ],
      );
      return res.rows[0];
    } catch (error) {
      return undefined;
    }
  }

  async partialUpdate(id: string, updates: Partial<Doctor>): Promise<Doctor | undefined> {
    try {
      const keys = Object.keys(updates as Record<string, unknown>);
      const values = Object.values(updates as Record<string, unknown>);

      if (keys.length === 0) return undefined;

      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      const query = `UPDATE doctors SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${keys.length + 1} RETURNING *`;

      const res = await pool.query(query, [...values, id]);
      return res.rows[0];
    } catch (error) {
      return undefined;
    }
  }

  async delete(id: string): Promise<Doctor | undefined> {
    try {
      const res = await pool.query('DELETE FROM doctors WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    } catch (error) {
      return undefined;
    }
  }
}