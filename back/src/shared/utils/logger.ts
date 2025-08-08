import { config } from '../../core/config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Logger simple y eficiente
 */
class Logger {
  private logLevel: LogLevel;
  
  constructor(level: LogLevel = 'info') {
    this.logLevel = level;
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
  
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getEmoji(level);
    
    let formattedMessage = `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (data !== undefined) {
      formattedMessage += ` | Data: ${JSON.stringify(data)}`;
    }
    
    return formattedMessage;
  }
  
  private getEmoji(level: LogLevel): string {
    const emojis = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return emojis[level];
  }
  
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, data);
    
    if (level === 'error') {
      console.error(formattedMessage);
    } else if (level === 'warn') {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }
  
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }
  
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }
  
  /**
   * Log de métricas de performance
   */
  performance(operation: string, duration: number, data?: any): void {
    const level = duration > 1000 ? 'warn' : 'info';
    this.log(level, `⚡ ${operation} completado en ${duration}ms`, data);
  }
  
  /**
   * Log de queries de base de datos
   */
  query(sql: string, duration: number, rowCount?: number): void {
    const truncatedSql = sql.length > 100 ? sql.substring(0, 100) + '...' : sql;
    this.debug(`📊 Query: ${truncatedSql} | Duración: ${duration}ms | Filas: ${rowCount || 0}`);
  }
  
  /**
   * Log de requests HTTP
   */
  request(method: string, path: string, statusCode: number, duration: number): void {
    const emoji = statusCode >= 400 ? '🔴' : statusCode >= 300 ? '🟡' : '🟢';
    this.info(`${emoji} ${method} ${path} - ${statusCode} (${duration}ms)`);
  }
}

// Instancia global del logger
export const logger = new Logger(config.logLevel);

// Utilidades adicionales de logging
export const createModuleLogger = (moduleName: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(`[${moduleName}] ${message}`, data),
    info: (message: string, data?: any) => logger.info(`[${moduleName}] ${message}`, data),
    warn: (message: string, data?: any) => logger.warn(`[${moduleName}] ${message}`, data),
    error: (message: string, data?: any) => logger.error(`[${moduleName}] ${message}`, data),
  };
};
