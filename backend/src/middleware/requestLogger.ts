import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 * Logs incoming requests with method, path, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    const resetColor = '\x1b[0m';
    
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`
    );
  });
  
  next();
};
