/**
 * Senior-level Error Handler
 * src/lib/errors/AppError.ts
 */

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly isDev: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.severity = severity;
    this.isDev = process.env.NODE_ENV === 'development';
    this.timestamp = new Date();

    // Log error in development
    if (this.isDev) {
      console.error(`[${this.code}] ${message}`);
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      ...(this.isDev && { stack: this.stack }),
    };
  }
}

/**
 * Specific error classes
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED, 401, ErrorSeverity.MEDIUM);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, ErrorCode.FORBIDDEN, 403, ErrorSeverity.MEDIUM);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, ErrorCode.NOT_FOUND, 404, ErrorSeverity.LOW);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', public readonly fields?: Record<string, string>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, ErrorSeverity.LOW);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error') {
    super(message, ErrorCode.NETWORK_ERROR, 0, ErrorSeverity.HIGH);
  }
}

export class ServerError extends AppError {
  constructor(message = 'Server error') {
    super(message, ErrorCode.SERVER_ERROR, 500, ErrorSeverity.CRITICAL);
  }
}

/**
 * Convert standard errors to AppError
 */
export function parseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return new NetworkError(error.message);
    }
    if (error.message.includes('Unauthorized')) {
      return new UnauthorizedError(error.message);
    }
    return new ServerError(error.message);
  }

  return new ServerError('An unknown error occurred');
}
