import { Consultation } from "./consultation.entity.js";

export interface ConsultationRepository {
  findAll(): Promise<Consultation[] | undefined>;
  findOne(id: string): Promise<Consultation | undefined>;
  add(consultation: Consultation): Promise<Consultation | undefined>;
  update(id: string, consultation: Consultation): Promise<Consultation | undefined>;
  partialUpdate(id: string, updates: Partial<Consultation>): Promise<Consultation | undefined>;
  softDelete(id: string, deleted_at?: string): Promise<Consultation | undefined>;
  restore(id: string): Promise<Consultation | undefined>;
  delete(id: string): Promise<boolean>;
}
