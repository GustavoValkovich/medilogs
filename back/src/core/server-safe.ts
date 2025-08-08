/**
 * Servidor simplificado sin funciones problemáticas
 */

import { config, validateConfig } from './config';
import { testConnection } from '../config/database';
import { logger } from '../shared/utils/logger';

/**
 * Función principal simplificada
 */
const main = async (): Promise<void> => {
  try {
    logger.info('🚀 Iniciando MediLogs Server (modo simple)...');
    
    // Validar configuración
    validateConfig();
    
    // Importar y configurar la aplicación
    const { createApp } = await import('./app');
    
    // Crear la aplicación Express
    const app = createApp();
    
    // Probar la conexión a la base de datos
    logger.info('🔍 Probando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('❌ Base de datos no disponible. Servidor no puede iniciarse.');
      process.exit(1);
    }
    
    // Iniciar el servidor de forma simple
    const port = process.env.PORT ? parseInt(process.env.PORT) : config.server.port;
    
    const server = app.listen(port, () => {
      logger.info(`🚀 ${config.name} v${config.version} iniciado`);
      logger.info(`📡 Servidor corriendo en puerto ${port}`);
      logger.info(`🌍 Entorno: ${config.server.env}`);
      logger.info(`💾 Base de datos: ${config.database.type}`);
      logger.info(`📋 Health check: http://localhost:${port}/health`);
      logger.info(`🏥 API: http://localhost:${port}${config.apiPrefix}`);
      logger.info('✅ MediLogs Server iniciado exitosamente');
    });
    
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${port} ya está en uso`);
        process.exit(1);
      } else {
        logger.error('❌ Error del servidor:', error);
        process.exit(1);
      }
    });
    
    // Configurar cierre graceful simple
    const gracefulShutdown = () => {
      logger.info('🔄 Cerrando servidor...');
      server.close(() => {
        logger.info('👋 Servidor cerrado correctamente');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Ejecutar
main().catch(error => {
  logger.error('❌ Error fatal:', error);
  process.exit(1);
});
