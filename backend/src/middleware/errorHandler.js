import { ZodError } from 'zod';

export function errorHandler(err, req, res, _next) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
      },
    });
  }

  // Operational/expected errors (thrown manually)
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
      },
    });
  }

  // Unknown errors — never expose internals
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
