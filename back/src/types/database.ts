// Interfaces adaptadas a la estructura de base de datos existente

// Tabla: paciente
export interface PacienteDB {
  id: number;
  medico_id?: number;
  nombre?: string;
  documento?: string;
  nacimiento?: Date;
  importante?: string; // Campo de texto hasta 100 caracteres
  sexo?: string;
  obra_social?: string;
  mail?: string;
  localidad?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Tabla: consulta
export interface ConsultaDB {
  id: number;
  paciente_id?: number;
  fecha_historia?: Date;
  historia?: string;
  imagen?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Tabla: medico
export interface MedicoDB {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  matricula: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaces para requests de API (más completas)
export interface CreatePacienteRequest {
  nombre: string;
  documento: string;
  nacimiento: string; // Se convierte a Date
  sexo?: 'M' | 'F';
  obra_social?: string;
  mail?: string;
  localidad?: string;
  medico_id?: number;
  importante?: string; // Texto hasta 100 caracteres
}

export interface UpdatePacienteRequest {
  nombre?: string;
  documento?: string;
  nacimiento?: string;
  sexo?: 'M' | 'F';
  obra_social?: string;
  mail?: string;
  localidad?: string;
  medico_id?: number;
  importante?: string; // Texto hasta 100 caracteres
}

export interface CreateConsultaRequest {
  paciente_id: number;
  fecha_historia: string; // Se convierte a Date
  historia: string;
  imagen?: string;
}

export interface UpdateConsultaRequest {
  paciente_id?: number;
  fecha_historia?: string;
  historia?: string;
  imagen?: string;
}

export interface CreateMedicoRequest {
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  matricula: string;
  password: string;
}

// Respuestas de API estandarizadas
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  warnings?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos extendidos para respuestas (combinan datos de múltiples tablas)
export interface PacienteCompleto extends PacienteDB {
  medico_nombre?: string;
  total_consultas?: number;
}

export interface ConsultaCompleta extends ConsultaDB {
  paciente_nombre?: string;
  paciente_documento?: string;
}
