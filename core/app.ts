import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config, isDevelopment } from './config';
import { testConnection } from '../config/database';
import { logger } from '../shared/utils/logger';
import { errorHandler, notFoundHandler } from '../shared/middleware';
import { requestLogger } from '../shared/middleware';
import { patientsRouter, doctorsRouter, consultationsRouter, authRouter, filesRouter, excelRouter } from '../modules';

/**
 * Crear y configurar la aplicación Express
 */
export const createApp = (): express.Application => {
  const app = express();
  
  // ==================== MIDDLEWARE DE SEGURIDAD ====================
  
  // Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
  }));
  
  // CORS configurado
  app.use(cors({
    origin: isDevelopment ? true : config.server.corsOrigins, // Permitir todas las fuentes en desarrollo
    credentials: true,
  }));
  
  // Rate limiting
  if (!isDevelopment) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por ventana
      message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
    });
    app.use(limiter);
  }
  
  // ==================== MIDDLEWARE DE PARSING ====================
  
  // Compresión
  app.use(compression());
  
  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // ==================== ARCHIVOS ESTÁTICOS ====================
  
  // Servir archivos de uploads
  const uploadsPath = path.join(__dirname, '../../uploads');
  app.use('/uploads', express.static(uploadsPath));
  
  // Servir archivos del frontend UI
  const uiPath = path.join(__dirname, '../../../UI');
  app.use(express.static(uiPath));
  
  // ==================== MIDDLEWARE DE LOGGING ====================
  
  app.use(requestLogger);
  
  // ==================== HEALTH CHECKS ====================
  
  app.get('/health', async (req, res) => {
    try {
      const dbConnected = await testConnection();
      const healthData = {
        status: dbConnected ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(),
        service: config.name,
        version: config.version,
        environment: config.server.env,
        database: {
          type: config.database.type,
          connected: dbConnected
        },
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };
      
      res.status(dbConnected ? 200 : 503).json(healthData);
    } catch (error) {
      logger.error('Error en health check:', error);
      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        service: config.name,
        error: 'Health check failed'
      });
    }
  });
  
  // Endpoint de información
  app.get(`${config.apiPrefix}`, (req, res) => {
    res.json({
      name: config.name,
      version: config.version,
      environment: config.server.env,
      database: config.database.type,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      
      // 📋 ENDPOINTS ORGANIZADOS POR CATEGORÍA
      endpoints: {
        
        // ⚡ SISTEMA
        system: {
          health: '/health',
          info: `${config.apiPrefix}`,
          uploads: '/uploads',
          systemStatus: `${config.apiPrefix}/doctors/system-status`
        },
        
        // 🔐 AUTENTICACIÓN
        auth: {
          base: `${config.apiPrefix}/auth`,
          login: `${config.apiPrefix}/auth/login`,
          logout: `${config.apiPrefix}/auth/logout`,
          profile: `${config.apiPrefix}/auth/profile`
        },
        
        // 👥 PACIENTES
        patients: {
          base: `${config.apiPrefix}/patients`,
          list: `${config.apiPrefix}/patients`,
          create: `${config.apiPrefix}/patients`,
          getById: `${config.apiPrefix}/patients/:id`,
          update: `${config.apiPrefix}/patients/:id`,
          delete: `${config.apiPrefix}/patients/:id`,
          search: `${config.apiPrefix}/patients/search`
        },
        
        // 👨‍⚕️ MÉDICOS
        doctors: {
          base: `${config.apiPrefix}/doctors`,
          list: `${config.apiPrefix}/doctors`,
          create: `${config.apiPrefix}/doctors`,
          getById: `${config.apiPrefix}/doctors/:id`,
          update: `${config.apiPrefix}/doctors/:id`,
          delete: `${config.apiPrefix}/doctors/:id`,
          search: `${config.apiPrefix}/doctors/search`
        },
        
        // 📅 CONSULTAS
        consultations: {
          base: `${config.apiPrefix}/consultations`,
          list: `${config.apiPrefix}/consultations`,
          create: `${config.apiPrefix}/consultations`,
          createWithFiles: `${config.apiPrefix}/consultations/with-files`,
          getById: `${config.apiPrefix}/consultations/:id`,
          update: `${config.apiPrefix}/consultations/:id`,
          delete: `${config.apiPrefix}/consultations/:id`,
          recent: `${config.apiPrefix}/consultations/recent`,
          search: `${config.apiPrefix}/consultations/search`,
          withImages: `${config.apiPrefix}/consultations/with-images`,
          byPatient: `${config.apiPrefix}/consultations/by-patient/:pacienteId`,
          getImage: `${config.apiPrefix}/consultations/:id/image`,
          patientImages: `${config.apiPrefix}/consultations/patient/:pacienteId/images`
        },
        
        // 📁 ARCHIVOS
        files: {
          base: `${config.apiPrefix}/files`,
          upload: `${config.apiPrefix}/files/upload`,
          getFile: `${config.apiPrefix}/files/:filename`,
          deleteFile: `${config.apiPrefix}/files/:filename`,
          directAccess: '/uploads/:filename'
        },
        
        // 📊 EXCEL
        excel: {
          base: `${config.apiPrefix}/excel`,
          
          // Exportación
          exportAllPatients: `${config.apiPrefix}/excel/export/pacientes/all`,
          exportSelectedPatients: `${config.apiPrefix}/excel/export/pacientes/selected`,
          exportAllConsultations: `${config.apiPrefix}/excel/export/consultas/all`,
          exportPatientConsultations: `${config.apiPrefix}/excel/export/consultas/paciente/:id`,
          
          // Importación
          importPatients: `${config.apiPrefix}/excel/import/pacientes`,
          importConsultations: `${config.apiPrefix}/excel/import/consultas`,
          validateFile: `${config.apiPrefix}/excel/validate`,
          
          // Templates
          templatePatients: `${config.apiPrefix}/excel/template/pacientes`,
          templateConsultations: `${config.apiPrefix}/excel/template/consultas`
        },
        
        // 🔗 COMPATIBILIDAD (rutas legacy)
        legacy: {
          pacientes: `${config.apiPrefix}/pacientes`,
          medicos: `${config.apiPrefix}/medicos`,
          consultas: `${config.apiPrefix}/consultas`
        }
      },
      
      // 🎯 MÉTODOS HTTP POR ENDPOINT
      methods: {
        'GET /health': 'Health check del sistema',
        [`GET ${config.apiPrefix}`]: 'Información de la API',
        
        // Pacientes
        [`GET ${config.apiPrefix}/patients`]: 'Listar pacientes (con paginación y filtros)',
        [`POST ${config.apiPrefix}/patients`]: 'Crear nuevo paciente',
        [`GET ${config.apiPrefix}/patients/:id`]: 'Obtener paciente por ID',
        [`PUT ${config.apiPrefix}/patients/:id`]: 'Actualizar paciente',
        [`DELETE ${config.apiPrefix}/patients/:id`]: 'Eliminar paciente',
        [`GET ${config.apiPrefix}/patients/search`]: 'Buscar pacientes',
        
        // Médicos
        [`GET ${config.apiPrefix}/doctors`]: 'Listar médicos',
        [`POST ${config.apiPrefix}/doctors`]: 'Crear nuevo médico',
        [`GET ${config.apiPrefix}/doctors/:id`]: 'Obtener médico por ID',
        [`PUT ${config.apiPrefix}/doctors/:id`]: 'Actualizar médico',
        [`DELETE ${config.apiPrefix}/doctors/:id`]: 'Eliminar médico',
        [`GET ${config.apiPrefix}/doctors/search`]: 'Buscar médicos',
        
        // Consultas
        [`GET ${config.apiPrefix}/consultations`]: 'Listar consultas',
        [`POST ${config.apiPrefix}/consultations`]: 'Crear nueva consulta',
        [`POST ${config.apiPrefix}/consultations/with-files`]: 'Crear consulta con archivos adjuntos',
        [`GET ${config.apiPrefix}/consultations/:id`]: 'Obtener consulta por ID',
        [`PUT ${config.apiPrefix}/consultations/:id`]: 'Actualizar consulta',
        [`DELETE ${config.apiPrefix}/consultations/:id`]: 'Eliminar consulta',
        [`GET ${config.apiPrefix}/consultations/recent`]: 'Consultas recientes',
        [`GET ${config.apiPrefix}/consultations/search`]: 'Buscar consultas',
        [`GET ${config.apiPrefix}/consultations/with-images`]: 'Consultas con imágenes adjuntas',
        [`GET ${config.apiPrefix}/consultations/:id/image`]: 'Información de imagen de consulta',
        
        // Excel
        [`GET ${config.apiPrefix}/excel/export/pacientes/all`]: 'Exportar todos los pacientes a Excel',
        [`POST ${config.apiPrefix}/excel/export/pacientes/selected`]: 'Exportar pacientes seleccionados',
        [`GET ${config.apiPrefix}/excel/export/consultas/all`]: 'Exportar todas las consultas',
        [`POST ${config.apiPrefix}/excel/import/pacientes`]: 'Importar pacientes desde Excel',
        [`GET ${config.apiPrefix}/excel/template/pacientes`]: 'Descargar template de pacientes',
        
        // Archivos
        [`POST ${config.apiPrefix}/files/upload`]: 'Subir archivo',
        [`GET /uploads/:filename`]: 'Acceso directo a archivos subidos'
      },
      
      // 🚀 CARACTERÍSTICAS
      features: [
        '🔒 Seguridad mejorada con Helmet y Rate Limiting',
        '📝 Validación automática de datos con Joi',
        '📊 Logging estructurado con Winston',
        '🚀 Gestión automática de puertos',
        '💾 Base de datos PostgreSQL',
        '🧩 Arquitectura modular escalable',
        '⚡ Compresión gzip y optimizaciones',
        '📁 Upload de archivos (JPG, PNG, PDF) <1MB',
        '📊 Exportación e importación completa de Excel',
        '📋 Templates automáticos de Excel',
        '🖼️ Manejo de imágenes adjuntas en consultas',
        '🔍 Búsqueda avanzada y filtros',
        '📄 Paginación automática',
        '🔗 Rutas legacy para compatibilidad',
        '⚕️ Gestión integral de historias médicas'
      ],
      
      // 💡 EJEMPLOS DE USO
      examples: {
        'Listar pacientes': `curl "${req.protocol}://${req.get('host')}${config.apiPrefix}/patients"`,
        'Crear paciente': `curl -X POST "${req.protocol}://${req.get('host')}${config.apiPrefix}/patients" -H "Content-Type: application/json" -d '{"nombre":"Juan Pérez","documento":"12345678"}'`,
        'Exportar a Excel': `curl "${req.protocol}://${req.get('host')}${config.apiPrefix}/excel/export/pacientes/all" -o pacientes.xlsx`,
        'Ver consultas con imágenes': `curl "${req.protocol}://${req.get('host')}${config.apiPrefix}/consultations/with-images"`,
        'Acceder a imagen': `open "${req.protocol}://${req.get('host')}/uploads/radiografia_001.jpg"`
      },
      
      // 📚 DOCUMENTACIÓN
      documentation: {
        description: 'Sistema de gestión médica optimizado - MediLogs',
        version: config.version,
        apiVersion: 'v3.0',
        author: 'MediLogs Team',
        contact: 'medilogs@example.com',
        excelDocs: 'Ver EXCEL-FUNCTIONALITY.md para documentación completa de Excel',
        testDocs: 'Ver PRUEBA-CONSULTAS.md para ejemplos de consultas con imágenes'
      },
      
      // 🏥 ESTADÍSTICAS (si están disponibles)
      stats: {
        totalEndpoints: Object.keys(res.app._router.stack || []).length,
        environment: config.server.env,
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  });
  
  // ==================== RUTAS MODULARES ====================
  
  // Rutas de autenticación
  app.use(`${config.apiPrefix}/auth`, authRouter);
  
  // Rutas de pacientes  
  app.use(`${config.apiPrefix}/patients`, patientsRouter);
  
  // Rutas de médicos
  app.use(`${config.apiPrefix}/doctors`, doctorsRouter);
  
  // Rutas de consultas
  app.use(`${config.apiPrefix}/consultations`, consultationsRouter);
  
  // Rutas de archivos
  app.use(`${config.apiPrefix}/files`, filesRouter);
  
  // Rutas de Excel
  app.use(`${config.apiPrefix}/excel`, excelRouter);
  
  // ==================== RUTAS DE COMPATIBILIDAD ====================
  // Mantener rutas legacy para compatibilidad con Postman existente
  
  app.use(`${config.apiPrefix}/pacientes`, patientsRouter);
  app.use(`${config.apiPrefix}/medicos`, doctorsRouter);
  app.use(`${config.apiPrefix}/consultas`, consultationsRouter);
  
  // ==================== MIDDLEWARE DE MANEJO DE ERRORES ====================
  
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
};
