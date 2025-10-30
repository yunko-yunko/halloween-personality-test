import { Request, Response, NextFunction } from 'express';

/**
 * Korean error messages for common error codes
 */
export const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: '입력 데이터가 올바르지 않습니다.',
  INVALID_EMAIL: '유효하지 않은 이메일 주소입니다.',
  TOKEN_EXPIRED: '인증 링크가 만료되었습니다. 다시 시도해주세요.',
  TOKEN_INVALID: '유효하지 않은 인증 링크입니다.',
  DATABASE_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  EMAIL_SEND_FAILED: '이메일 전송에 실패했습니다. 다시 시도해주세요.',
  INCOMPLETE_ANSWERS: '모든 질문에 답변해주세요.',
  UNAUTHORIZED: '인증이 필요합니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  INTERNAL_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns appropriate responses with Korean messages
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details })
    });
    return;
  }

  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      code: 'INVALID_JSON',
      message: '잘못된 JSON 형식입니다.'
    });
    return;
  }

  // Handle validation errors from Joi (should be caught by validateRequest middleware)
  if (err.name === 'ValidationError') {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: errorMessages.VALIDATION_ERROR,
      details: err.message
    });
    return;
  }

  // Handle generic errors
  const statusCode = 500;
  const code = 'INTERNAL_ERROR';
  const message = errorMessages.INTERNAL_ERROR;

  res.status(statusCode).json({
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: errorMessages.NOT_FOUND
  });
};

