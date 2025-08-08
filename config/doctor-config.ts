/**
 * Configuración del médico para documentos PDF
 * 
 * ⚠️  DEPRECATED: Este archivo ya no se usa.
 * Los datos del médico ahora se obtienen dinámicamente desde la base de datos
 * mediante el servicio MedicoService.
 * 
 * Ver: /src/services/medico.service.ts
 * Controlador actualizado: /src/modules/consultations/consultations.controller.ts
 */

export interface DoctorConfig {
  nombre: string;
  matricula: string;
  especialidad: string;
  telefono: string;
  email?: string;
  direccion?: string;
}

// ⚠️ DEPRECATED - Solo se mantiene para compatibilidad hacia atrás
export const doctorConfig: DoctorConfig = {
  nombre: 'Dra. Diana Hernández',
  matricula: 'MP 98765',
  especialidad: 'Medicina Familiar',
  telefono: '+54 9 11 9876-5432',
  email: 'diana@medilogs.com',
  direccion: 'Av. Rivadavia 5678, CABA'
};

/**
 * @deprecated Usar medicoService.getMedicoPrincipal() en su lugar
 * Función para obtener la configuración del médico
 * En el futuro se puede conectar a base de datos
 */
export function getDoctorConfig(): DoctorConfig {
  console.warn('⚠️  getDoctorConfig() está deprecated. Usar medicoService.getMedicoPrincipal() en su lugar.');
  return doctorConfig;
}
