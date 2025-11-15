import { Patient } from "./patient.entity.js";

export interface PatientRepository {
  findAll(doctorId?: number): Promise<Patient[] | undefined>;
  findOne(id: string): Promise<Patient | undefined>;
  add(patient: Patient): Promise<Patient | undefined>;
  update(id: string, patient: Patient): Promise<Patient | undefined>;
  partialUpdate(id: string, updates: Partial<Patient>): Promise<Patient | undefined>;
  softDelete(id: string, deleted_at?: string): Promise<Patient | undefined>;
  restore(id: string): Promise<Patient | undefined>;
  delete(id: string): Promise<boolean>;
}
