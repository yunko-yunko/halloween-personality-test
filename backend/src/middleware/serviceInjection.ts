import { Request, Response, NextFunction } from 'express';
import { ServiceFactory, ServiceContainer } from '../services/ServiceFactory';

/**
 * Extend Express Request to include services
 */
declare global {
  namespace Express {
    interface Request {
      services?: ServiceContainer;
    }
  }
}

/**
 * Middleware to inject services into request object
 * Services are created based on feature flags via ServiceFactory
 */
export function injectServices(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    req.services = ServiceFactory.getServices();
    next();
  } catch (error) {
    // If service initialization fails, return 500 error
    const errorMessage = error instanceof Error ? error.message : 'Service initialization failed';
    res.status(500).json({
      code: 'SERVICE_INITIALIZATION_ERROR',
      message: errorMessage,
    });
  }
}
