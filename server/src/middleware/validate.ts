import type { Request, Response, NextFunction } from 'express';
import type { ErrorResponse, AppConfig } from '../types';
import { createChatRequestSchema } from '../schema/chat.schema';

export function validateChatRequest(config: Pick<AppConfig, 'stream'>) {
  const schema = createChatRequestSchema(config);

  return function validator(
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
  ): void {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors,
        },
      });
      return;
    }

    req.body = parsed.data;
    next();
  };
}
