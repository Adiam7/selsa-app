/**
 * Senior-level Logging System
 * src/lib/logger/logger.ts
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private enableLogging = process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING === 'true';

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const context = entry.context ? ` [${entry.context}]` : '';
    return `${prefix}${context} ${entry.message}`;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data: this.isDev ? data : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  debug(message: string, context?: string, data?: any) {
    if (!this.isDev || !this.enableLogging) return;

    const entry = this.createEntry(LogLevel.DEBUG, message, context, data);
    console.debug(this.formatMessage(entry), data);
  }

  info(message: string, context?: string, data?: any) {
    if (!this.enableLogging) return;

    const entry = this.createEntry(LogLevel.INFO, message, context, data);
    console.log(this.formatMessage(entry), data);
  }

  warn(message: string, context?: string, data?: any) {
    const entry = this.createEntry(LogLevel.WARN, message, context, data);
    console.warn(this.formatMessage(entry), data);

    // Send to monitoring service in production
    if (!this.isDev) {
      this.sendToMonitoring(entry);
    }
  }

  error(message: string, context?: string, error?: any) {
    const entry = this.createEntry(LogLevel.ERROR, message, context, error);
    console.error(this.formatMessage(entry), error);

    // Send to error tracking service in production
    if (!this.isDev) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry) {
    import('@sentry/nextjs')
      .then((Sentry) => {
        if (entry.level === LogLevel.ERROR) {
          Sentry.captureException(new Error(entry.message), {
            level: 'error',
            extra: entry.data,
          });
        } else {
          Sentry.captureMessage(entry.message, entry.level.toLowerCase() as 'warning' | 'info');
        }
      })
      .catch(() => {
        // @sentry/nextjs not installed — monitoring disabled
      });
  }

  // Authentication logging
  logAuthEvent(event: 'login' | 'logout' | 'signup' | 'passwordReset', userId?: string, data?: any) {
    this.info(`Authentication: ${event}`, 'AUTH', { userId, ...data });
  }

  // API logging
  logApiCall(method: string, endpoint: string, status: number, duration: number) {
    this.debug(`API: ${method} ${endpoint} [${status}] ${duration}ms`, 'API');
  }

  // Error tracking
  logErrorEvent(error: any, context?: string, additionalData?: any) {
    this.error(
      error?.message || 'Unknown error',
      context,
      { ...error, ...additionalData }
    );
  }
}

export const logger = new Logger();
