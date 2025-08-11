import net from 'net';
import { config, validateConfig, isDevelopment } from './config';
import { testConnection } from '../config/database';
import { logger } from '../shared/utils/logger';
import { HelpMenu } from './help-menu';

export interface ServerInstance {
  port: number;
  helpMenu?: HelpMenu;
  close: () => Promise<void>;
}

/**
 * Verificar si un puerto está disponible
 */
export const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
};

/**
 * Encontrar un puerto disponible
 */
export const findAvailablePort = async (startPort: number = config.server.startPort): Promise<number> => {
  let port = startPort;
  let retries = 0;
  
  while (retries < config.server.maxPortRetries) {
    if (await isPortAvailable(port)) {
      return port;
    }
    
    port++;
    retries++;
    
    logger.debug(`Puerto ${port - 1} ocupado, probando ${port}...`);
  }
  
  throw new Error(`No se pudo encontrar un puerto disponible después de ${config.server.maxPortRetries} intentos`);
};

/**
 * Terminar procesos que usan un puerto específico
 */
export const killProcessOnPort = async (port: number): Promise<boolean> => {
  if (!isDevelopment) {
    return false;
  }
  
  try {
    const { execSync } = await import('child_process');
    
    // Obtener PID del proceso usando el puerto
    const pidCommand = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port}` 
      : `lsof -ti:${port}`;
    
    const pid = execSync(pidCommand, { encoding: 'utf8' }).trim();
    
    if (pid) {
      const parsedPid = process.platform === 'win32' 
        ? pid.split('\n')[0].split(/\s+/).pop()
        : pid.split('\n')[0];
      
      if (parsedPid && parsedPid !== process.pid.toString()) {
        // Terminar el proceso
        const killCommand = process.platform === 'win32' 
          ? `taskkill /PID ${parsedPid} /F` 
          : `kill -9 ${parsedPid}`;
        
        execSync(killCommand);
        logger.info(`🔄 Proceso en puerto ${port} terminado (PID: ${parsedPid})`);
        
        // Esperar un poco para que el puerto se libere
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logger.debug(`No se pudo terminar proceso en puerto ${port}:`, error);
    return false;
  }
};

/**
 * Iniciar el servidor en el puerto especificado
 */
export const startServer = async (app: any): Promise<ServerInstance> => {
  let port = config.server.port;
  
  // En desarrollo, intentar liberar el puerto si está ocupado
  if (isDevelopment && !(await isPortAvailable(port))) {
    logger.warn(`⚠️  Puerto ${port} está ocupado`);
    
    // Intentar liberar el puerto
    const killed = await killProcessOnPort(port);
    
    if (!killed || !(await isPortAvailable(port))) {
      logger.info('🔍 Buscando puerto alternativo...');
      port = await findAvailablePort(port);
    }
  } else if (!(await isPortAvailable(port))) {
    // En producción, buscar puerto alternativo
    port = await findAvailablePort(port);
  }
  
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`🚀 ${config.name} v${config.version} iniciado`);
      logger.info(`📡 Servidor corriendo en puerto ${port}`);
      logger.info(`🌍 Entorno: ${config.server.env}`);
      logger.info(`💾 Base de datos: ${config.database.type}`);
      logger.info(`📋 Health check: http://localhost:${port}/health`);
      logger.info(`🏥 API: http://localhost:${port}${config.apiPrefix}`);
      
      let helpMenu: HelpMenu | undefined;
      
      if (isDevelopment) {
        logger.info('✅ MediLogs Server iniciado exitosamente');
        
        // Crear menú de ayuda interactivo
        helpMenu = new HelpMenu(port);
        helpMenu.showWelcomeMessage();
      }
      
      const serverInstance: ServerInstance = {
        port,
        helpMenu,
        close: () => {
          return new Promise<void>((resolveClose) => {
            if (helpMenu) {
              helpMenu.close();
            }
            server.close(() => {
              logger.info('👋 Servidor cerrado correctamente');
              resolveClose();
            });
          });
        }
      };
      
      resolve(serverInstance);
    });
    
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${port} ya está en uso`);
        findAvailablePort(port + 1)
          .then(newPort => {
            logger.info(`🔄 Reintentando en puerto ${newPort}...`);
            // Recursive call with new port
            config.server.port = newPort;
            startServer(app).then(resolve).catch(reject);
          })
          .catch(reject);
      } else {
        reject(error);
      }
    });
  });
};

/**
 * Configurar cierre graceful del servidor
 */
export const setupGracefulShutdown = (serverInstance: ServerInstance): void => {
  const shutdown = async (signal: string) => {
    logger.info(`\n🛑 ${signal} recibido, cerrando servidor...`);
    
    try {
      await serverInstance.close();
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error cerrando servidor:', error);
      process.exit(1);
    }
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGUSR2', () => shutdown('SIGUSR2')); // Nodemon
  
  // Manejar errores no capturados
  process.on('uncaughtException', (error) => {
    logger.error('❌ Excepción no capturada:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Promise rechazada no manejada:', reason);
    process.exit(1);
  });
};

/**
 * Función principal para inicializar el servidor
 */
const main = async (): Promise<void> => {
  try {
    logger.info('🚀 Iniciando MediLogs Server...');
    
    // Validar configuración
    validateConfig();
    
  // Importar la aplicación Express
  const appModule = await import('./app');
  const app = appModule.default;
    
    // Probar la conexión a la base de datos
    logger.info('🔍 Probando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('❌ Base de datos no disponible. Servidor no puede iniciarse.');
      process.exit(1);
    }
    
    // Iniciar el servidor
    const serverInstance = await startServer(app);
    
    // Configurar cierre graceful
    setupGracefulShutdown(serverInstance);
    
  } catch (error) {
    logger.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Ejecutar si es el módulo principal
if (require.main === module) {
  main().catch(error => {
    logger.error('❌ Error fatal:', error);
    process.exit(1);
  });
}
