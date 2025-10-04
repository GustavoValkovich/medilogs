export interface Doctor {
  id?: number; // opcional porque lo genera la BD
  first_name: string;
  last_name: string;
  specialty: string;
  phone?: string;
  email?: string;
  license_number: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}