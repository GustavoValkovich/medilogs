import { pool } from "../../db/connection.js";
import { Consultation } from "./consultation.entity.js";
import { ConsultationRepository } from "./consultation.repository.interface.js";

export class ConsultationPostgresRepository implements ConsultationRepository {
  async findAll(): Promise<Consultation[] | undefined> {
    const res = await pool.query("SELECT * FROM consultations WHERE deleted_at IS NULL ORDER BY id ASC");
    return res.rows;
  }

  async findOne(id: string): Promise<Consultation | undefined> {
    const res = await pool.query("SELECT * FROM consultations WHERE id = $1 AND deleted_at IS NULL", [id]);
    return res.rows[0];
  }

  async add(consultation: Consultation): Promise<Consultation | undefined> {
    const { patient_id, medical_record, image } = consultation;
    const res = await pool.query(
      `INSERT INTO consultations (patient_id, medical_record, image)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patient_id, medical_record, image]
    );
    return res.rows[0];
  }

  async update(id: string, consultation: Consultation): Promise<Consultation | undefined> {
    const { patient_id, medical_record, image } = consultation;
    const res = await pool.query(
      `UPDATE consultations
       SET patient_id=$1, medical_record=$2, image=$3
       WHERE id=$4 AND deleted_at IS NULL
       RETURNING *`,
      [patient_id, medical_record, image, id]
    );
    return res.rows[0];
  }

  async partialUpdate(id: string, updates: Partial<Consultation>): Promise<Consultation | undefined> {
    const allowed = ['patient_id', 'medical_record', 'image', 'deleted_at'];
    const keys = Object.keys(updates as Record<string, unknown>).filter((k) => allowed.includes(k));
    const values = keys.map((k) => (updates as any)[k]);
    if (keys.length === 0) return undefined;

    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
    const query = `UPDATE consultations SET ${setClause} WHERE id=$${keys.length + 1} AND deleted_at IS NULL RETURNING *`;
    const res = await pool.query(query, [...values, id]);
    return res.rows[0];
  }

  async softDelete(id: string, deleted_at?: string): Promise<Consultation | undefined> {
    const res = await pool.query(
      "UPDATE consultations SET deleted_at = COALESCE($2, CURRENT_TIMESTAMP) WHERE id=$1 AND deleted_at IS NULL RETURNING *",
      [id, deleted_at]
    );
    return res.rows[0];
  }

  async restore(id: string): Promise<Consultation | undefined> {
    const res = await pool.query(
      "UPDATE consultations SET deleted_at = NULL WHERE id=$1 AND deleted_at IS NOT NULL RETURNING *",
      [id]
    );
    return res.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const res = await pool.query("DELETE FROM consultations WHERE id=$1", [id]);
    return res.rowCount !== null && res.rowCount > 0;
  }
}
