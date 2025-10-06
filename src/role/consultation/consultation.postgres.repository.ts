import { pool } from "../../db/connection.js";
import { Consultation } from "./consultation.entity.js";
import { ConsultationRepository } from "./consultation.repository.interface.js";

export class ConsultationPostgresRepository implements ConsultationRepository {
  async findAll(): Promise<Consultation[] | undefined> {
    const res = await pool.query("SELECT * FROM consultations ORDER BY id ASC");
    return res.rows;
  }

  async findOne(id: string): Promise<Consultation | undefined> {
    const res = await pool.query("SELECT * FROM consultations WHERE id = $1", [id]);
    return res.rows[0];
  }

  async add(consultation: Consultation): Promise<Consultation | undefined> {
    const { patient_id, record_date, medical_record, image } = consultation;
    const res = await pool.query(
      `INSERT INTO consultations (patient_id, record_date, medical_record, image)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patient_id, record_date, medical_record, image]
    );
    return res.rows[0];
  }

  async update(id: string, consultation: Consultation): Promise<Consultation | undefined> {
    const { patient_id, record_date, medical_record, image } = consultation;
    const res = await pool.query(
      `UPDATE consultations
       SET patient_id=$1, record_date=$2, medical_record=$3, image=$4
       WHERE id=$5
       RETURNING *`,
      [patient_id, record_date, medical_record, image, id]
    );
    return res.rows[0];
  }

  async partialUpdate(id: string, updates: Partial<Consultation>): Promise<Consultation | undefined> {
    const keys = Object.keys(updates as Record<string, unknown>);
    const values = Object.values(updates as Record<string, unknown>);
    if (keys.length === 0) return undefined;

    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
    const query = `UPDATE consultations SET ${setClause} WHERE id=$${keys.length + 1} RETURNING *`;
    const res = await pool.query(query, [...values, id]);
    return res.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const res = await pool.query("DELETE FROM consultations WHERE id=$1", [id]);
    return res.rowCount !== null && res.rowCount > 0;
  }
}
