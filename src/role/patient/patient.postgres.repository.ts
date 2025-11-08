import { pool } from "../../db/connection.js";
import { Patient } from "./patient.entity.js";
import { PatientRepository } from "./patient.repository.interface.js";

export class PatientPostgresRepository implements PatientRepository {
  async findAll(doctorId?: number): Promise<Patient[] | undefined> {
    if (doctorId !== undefined && doctorId !== null && !Number.isNaN(Number(doctorId))) {
      const result = await pool.query("SELECT * FROM patients WHERE doctor_id = $1 ORDER BY id ASC", [doctorId]);
      return result.rows;
    }
    const result = await pool.query("SELECT * FROM patients ORDER BY id ASC");
    return result.rows;
  }

  async findOne(id: string): Promise<Patient | undefined> {
    const result = await pool.query("SELECT * FROM patients WHERE id = $1", [id]);
    return result.rows[0];
  }

  async add(patient: Patient): Promise<Patient | undefined> {
    const { doctor_id, full_name, document, birth_date, notes, gender, insurance, email, city } = patient;
    const result = await pool.query(
      `INSERT INTO patients (doctor_id, full_name, document, birth_date, notes, gender, insurance, email, city)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [doctor_id, full_name, document, birth_date, notes, gender, insurance, email, city]
    );
    return result.rows[0];
  }

  async update(id: string, patient: Patient): Promise<Patient | undefined> {
    const { doctor_id, full_name, document, birth_date, notes, gender, insurance, email, city } = patient;
    const result = await pool.query(
      `UPDATE patients
       SET doctor_id=$1, full_name=$2, document=$3, birth_date=$4, notes=$5,
           gender=$6, insurance=$7, email=$8, city=$9
       WHERE id=$10
       RETURNING *`,
      [doctor_id, full_name, document, birth_date, notes, gender, insurance, email, city, id]
    );
    return result.rows[0];
  }

  async partialUpdate(id: string, updates: Partial<Patient>): Promise<Patient | undefined> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, i) => `${key}=$${i + 1}`).join(", ");
    const query = `UPDATE patients SET ${setClause} WHERE id=$${keys.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    // Instead of deleting consultations, set their patient_id to NULL so history is preserved.
    // This also avoids FK violations on delete. The operation is performed inside a transaction.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE consultations SET patient_id = NULL WHERE patient_id = $1", [id]);
      const result = await client.query("DELETE FROM patients WHERE id=$1", [id]);
      await client.query("COMMIT");
      return result.rowCount !== null && result.rowCount > 0;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
