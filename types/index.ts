// Interfaces para el dominio médico de medilogs2

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  fechaNacimiento: Date;
  telefono?: string;
  email?: string;
  direccion?: string;
  numeroDocumento: string;
  tipoDocumento: TipoDocumento;
  sexo: Sexo;
  grupoSanguineo?: GrupoSanguineo;
  alergias?: string[];
  medicamentosActuales?: string[];
  enfermedadesCronicas?: string[];
  contactoEmergencia?: ContactoEmergencia;
  fechaRegistro: Date;
  activo: boolean;
}

export interface ConsultaMedica {
  id: string;
  pacienteId: string;
  fecha: Date;
  horaInicio: string;
  horaFin?: string;
  motivo: string;
  sintomas: string[];
  signosVitales: SignosVitales;
  diagnostico?: string;
  tratamiento?: string;
  medicamentosRecetados?: MedicamentoRecetado[];
  observaciones?: string;
  proximaCita?: Date;
  estado: EstadoConsulta;
  medico: string;
}

export interface MedicamentoRecetado {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  instrucciones?: string;
}

export interface SignosVitales {
  presionArterial?: string;
  frecuenciaCardiaca?: number;
  temperatura?: number;
  peso?: number;
  altura?: number;
  imc?: number;
  saturacionOxigeno?: number;
}

export interface ContactoEmergencia {
  nombre: string;
  telefono: string;
  relacion: string;
}

// Enums
export enum TipoDocumento {
  DNI = 'DNI',
  PASAPORTE = 'PASAPORTE',
  CEDULA = 'CEDULA',
  OTRO = 'OTRO'
}

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO'
}

export enum GrupoSanguineo {
  A_POSITIVO = 'A+',
  A_NEGATIVO = 'A-',
  B_POSITIVO = 'B+',
  B_NEGATIVO = 'B-',
  AB_POSITIVO = 'AB+',
  AB_NEGATIVO = 'AB-',
  O_POSITIVO = 'O+',
  O_NEGATIVO = 'O-'
}

export enum EstadoConsulta {
  PROGRAMADA = 'PROGRAMADA',
  EN_CURSO = 'EN_CURSO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  NO_ASISTIO = 'NO_ASISTIO'
}

// Tipos para responses de API
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

// Tipos para requests
export interface CreatePacienteRequest {
  nombre: string;
  apellido: string;
  edad: number;
  fechaNacimiento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  numeroDocumento: string;
  tipoDocumento: TipoDocumento;
  sexo: Sexo;
  grupoSanguineo?: GrupoSanguineo;
  alergias?: string[];
  medicamentosActuales?: string[];
  enfermedadesCronicas?: string[];
  contactoEmergencia?: ContactoEmergencia;
}

export interface CreateConsultaRequest {
  pacienteId: string;
  fecha: string;
  horaInicio: string;
  motivo: string;
  sintomas?: string[];
  signosVitales?: Partial<SignosVitales>;
  medico: string;
}

export interface UpdateConsultaRequest {
  diagnostico?: string;
  tratamiento?: string;
  medicamentosRecetados?: MedicamentoRecetado[];
  observaciones?: string;
  proximaCita?: string;
  estado?: EstadoConsulta;
  horaFin?: string;
}
