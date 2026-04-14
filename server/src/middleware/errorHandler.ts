import type { NextFunction, Request, Response } from 'express';

export function globalError(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'internal server error',
    status: err.status || 'fail',
    statusCode,
    success: false,
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    message: 'route not found',
    status: 'fail',
    statusCode: 404,
    success: false,
  });
}
