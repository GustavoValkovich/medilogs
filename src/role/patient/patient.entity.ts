export interface Patient {
  id?: number;
  doctor_id?: number;
  full_name: string;
  document?: string;
  birth_date?: Date;
  notes?: string;
  gender?: string;
  insurance?: string;
  email?: string;
  city?: string;
  created_at?: Date;
  updated_at?: Date;
}
