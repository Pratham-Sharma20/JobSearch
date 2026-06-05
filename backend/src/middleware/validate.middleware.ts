import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Validation middleware that parses req.body, req.query, and req.params using a Zod schema.
 * Replaces requests data with validated data to benefit from transforms and defaults.
 * Any parsing errors are passed to the global error handler.
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      next();
    } catch (error) {
      next(error);
    }
  };
}
