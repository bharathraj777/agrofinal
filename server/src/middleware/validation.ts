import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

// Generic validation middleware
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessage
      });
    }

    // Replace request body with validated and cleaned data
    req.body = value;
    next();
  };
};

// Validation for query parameters
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorMessage
      });
    }

    req.query = value;
    next();
  };
};

// Validation for URL parameters
export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: errorMessage
      });
    }

    req.params = value;
    next();
  };
};