/**
 * Módulos de la aplicación MediLogs2
 * 
 * Esta es la entrada principal para todos los módulos de funcionalidad.
 * Cada módulo está organizado por responsabilidad y contiene:
 * - Controlador
 * - Rutas
 * - Validaciones
 * - Tipos específicos
 */

// Módulo de Pacientes
export * from './patients';

// Módulo de Médicos
export * from './doctors';

// Módulo de Consultas
export * from './consultations';

// Módulo de Archivos
export * from './files';

// Módulo de Autenticación
export * from './auth';

// Re-exportar routers para fácil acceso
export { patientsRouter } from './patients';
export { doctorsRouter } from './doctors';
export { consultationsRouter } from './consultations';
export { authRouter } from './auth';
export { filesRouter, excelRouter } from './files';
