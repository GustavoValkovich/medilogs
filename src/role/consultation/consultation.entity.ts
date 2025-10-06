export interface Consultation {
  id?: number;
  patient_id?: number;
  doctor_id?: number;
  record_date?: string; // YYYY-MM-DD
  medical_record?: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
