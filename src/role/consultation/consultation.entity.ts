export interface Consultation {
  id?: number;
  patient_id?: number;
  medical_record?: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
