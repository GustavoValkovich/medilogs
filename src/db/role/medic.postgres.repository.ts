import { Client } from 'pg';
import { DoctorRepository } from './doctor.repository.interface.js';
import { Doctor } from './doctor.entity.js';

export class DoctorPostgresRepository implements DoctorRepository {
  private client: Client;

  constructor(client?: Client) {
    this.client =
      client ||
      new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medilogs',
        password: 'postgres',
        port: 5432,
      });
    this.client.connect();
  }

  async findAll(): Promise<Doctor[] | undefined> {
    const res = await this.client.query('SELECT * FROM doctors');
    return (res.rows as Doctor[]) || undefined;
  }

  async findOne(id: string): Promise<Doctor | undefined> {
    const res = await this.client.query('SELECT * FROM doctors WHERE id = $1', [id]);
    return (res.rows[0] as Doctor) || undefined;
  }

  async add(doctor: Doctor): Promise<Doctor | undefined> {
    try {
      const res = await this.client.query(
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
      //console.error('Error adding doctor:', error);
      return undefined;
    }
  }

  async update(id: string, doctor: Doctor): Promise<Doctor | undefined> {
    try {
      const res = await this.client.query(
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
      //console.error('Error updating doctor:', error);
      return undefined;
    }
  }

  async partialUpdate(id: string, updates: Partial<Doctor>): Promise<Doctor | undefined> {
    try {
      const keys = Object.keys(updates);
      const values = Object.values(updates);

      if (keys.length === 0) return undefined;

      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      const query = `UPDATE doctors 
                     SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${keys.length + 1} 
                     RETURNING *`;

      const res = await this.client.query(query, [...values, id]);
      return res.rows[0];
    } catch (error) {
      //console.error('Error partially updating doctor:', error);
      return undefined;
    }
  }

  async delete(id: string): Promise<Doctor | undefined> {
    try {
      const res = await this.client.query('DELETE FROM doctors WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    } catch (error) {
      //console.error('Error deleting doctor:', error);
      return undefined;
    }
  }
}