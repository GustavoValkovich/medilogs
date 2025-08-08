import { Request, Response, NextFunction } from 'express';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('RequestLogger');

/**
 * Middleware para logging de requests HTTP
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Capturar información del request
  const requestInfo = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  logger.info(`🔵 Incoming ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Hook para capturar la respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const responseSize = data ? JSON.stringify(data).length : 0;
    
    // Log según el código de respuesta
    const emoji = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    logger.info(`${emoji} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
      statusCode: res.statusCode,
      duration,
      responseSize,
      ip: req.ip
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware simplificado para requests básicos
 */
export const simpleRequestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const emoji = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    console.log(`${emoji} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};
