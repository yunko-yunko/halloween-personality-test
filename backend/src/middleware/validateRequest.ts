import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

/**
 * Middleware factory for request validation using Joi schemas
 * 
 * @param schema - Joi validation schema
 * @returns Express middleware function
 */
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: errors[0].message, // Return first error message
        errors
      });
      return;
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

