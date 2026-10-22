import { z } from 'zod';

/**
 * Reusable Zod validation middleware generator
 * Validates req.body, req.params, and/or req.query
 * Returns structured 400 Bad Request on failure
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        Object.assign(req.params, parsedParams);
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.assign(req.query, parsedQuery);
      }
      return next();
    } catch (error) {
      if (error instanceof z.ZodError || error.name === 'ZodError' || Array.isArray(error.issues) || Array.isArray(error.errors)) {
        const errorList = error.errors || error.issues || [];
        const details = errorList.map((err) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          error: 'ValidationError',
          message: details.map((d) => d.message).join(', ') || 'Validation error in request parameters',
          details,
        });
      }

      console.error('[Validate Unknown Error]:', error);

      return res.status(400).json({
        error: 'BadRequest',
        message: 'Invalid request formatting',
      });
    }
  };
};

export { z };
