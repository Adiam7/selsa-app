/**
 * Advanced Logging Service
 * Tracks all API operations, errors, and provides detailed debugging information
 * Integrates with Sentry for production error tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'auth' | 'api' | 'analytics' | 'error' | 'performance' | 'user' | 'general';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  stackTrace?: string;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableStorage: boolean;
  enableSentry: boolean;
  maxLogSize: number; // Max logs to keep in storage
  logLevel: LogLevel;
  environment: 'development' | 'production' | 'staging';
  sentryDsn?: string;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private requestIdCounter = 0;
  private sessionId: string = '';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableConsole: true,
      enableStorage: true,
      enableSentry: false,
      maxLogSize: 500,
      logLevel: 'info',
      environment: process.env.NODE_ENV as 'development' | 'production' | 'staging',
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.initializeSentry();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('logger_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('logger_session_id', sessionId);
      }
      return sessionId;
    }
    return `server_session_${Date.now()}`;
  }

  /**
   * Initialize Sentry for error tracking
   */
  private initializeSentry(): void {
    if (!this.config.enableSentry || !this.config.sentryDsn) return;

    if (typeof window !== 'undefined') {
      import('@sentry/nextjs')
        .then((Sentry) => {
          Sentry.init({
            dsn: this.config.sentryDsn,
            environment: this.config.environment,
            tracesSampleRate: 1.0,
          });
        })
        .catch(() => {
          // @sentry/nextjs not installed — Sentry disabled
        });
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${++this.requestIdCounter}_${Date.now()}`;
  }

  /**
   * Format timestamp in ISO 8601
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Format log message for console
   */
  private formatConsoleMessage(entry: LogEntry): string {
    const icon = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[entry.level];

    const categoryLabel = entry.category.toUpperCase();
    const baseMessage = `${icon} [${categoryLabel}] [${entry.timestamp}] ${entry.message}`;

    return baseMessage;
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const message = this.formatConsoleMessage(entry);
    const style = {
      debug: 'color: #999; font-size: 12px;',
      info: 'color: #0066cc; font-size: 12px;',
      warn: 'color: #ff9900; font-size: 12px; font-weight: bold;',
      error: 'color: #cc0000; font-size: 12px; font-weight: bold;',
    }[entry.level];

    if (entry.data) {
      console[entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log'](
        `%c${message}`,
        style,
        entry.data
      );
    } else {
      console[entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log'](
        `%c${message}`,
        style
      );
    }
  }

  /**
   * Store log in memory
   */
  private storeLog(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }

    // Persist to localStorage if available
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_logs', JSON.stringify(this.logs));
      } catch (e) {
        // Storage quota exceeded, ignore
      }
    }
  }

  /**
   * Send to Sentry (error tracking)
   */
  private sendToSentry(entry: LogEntry): void {
    if (!this.config.enableSentry) return;
    if (entry.level !== 'error') return;

    import('@sentry/nextjs')
      .then((Sentry) => {
        Sentry.captureException(new Error(entry.message), {
          level: entry.level as 'error',
          tags: { category: entry.category },
          extra: entry.data,
        });
      })
      .catch(() => {
        // @sentry/nextjs not available — Sentry disabled
      });
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    meta?: Partial<LogEntry>
  ): LogEntry {
    if (!this.shouldLog(level)) {
      return {} as LogEntry;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      category,
      message,
      data,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      ...meta,
    };

    this.logToConsole(entry);
    this.storeLog(entry);
    this.sendToSentry(entry);

    return entry;
  }

  // Public logging methods by category

  /**
   * Log authentication events
   */
  auth(message: string, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('info', 'auth', message, data, meta);
  }

  /**
   * Log API requests and responses
   */
  api(message: string, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('info', 'api', message, data, meta);
  }

  /**
   * Log API errors
   */
  apiError(message: string, statusCode?: number, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('error', 'api', message, data, {
      ...meta,
      statusCode,
    });
  }

  /**
   * Log user interactions and journey
   */
  user(message: string, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('info', 'analytics', message, data, meta);
  }

  /**
   * Log performance metrics
   */
  performance(message: string, duration: number, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('info', 'performance', message, data, {
      ...meta,
      duration,
    });
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('info', 'general', message, data, meta);
  }

  /**
   * Log errors with stack traces
   */
  error(message: string, error?: Error | unknown, data?: any): LogEntry {
    const stackTrace = error instanceof Error ? error.stack : undefined;
    return this.log('error', 'error', message, {
      ...data,
      originalError: error instanceof Error ? error.message : String(error),
    }, {
      stackTrace,
    });
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('warn', 'error', message, data, meta);
  }

  /**
   * Log debug information
   */
  debug(message: string, data?: any, meta?: Partial<LogEntry>): LogEntry {
    return this.log('debug', 'error', message, data, meta);
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by category
   */
  getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs from last N minutes
   */
  getRecentLogs(minutes: number = 5): LogEntry[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.logs.filter(log => new Date(log.timestamp).getTime() > cutoff);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs');
    }
  }

  /**
   * Export logs as JSON for debugging
   */
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      logs: this.logs,
    }, null, 2);
  }

  /**
   * Create a timer for performance tracking
   */
  createTimer(label: string) {
    const startTime = performance.now();
    return {
      end: (data?: any) => {
        const duration = performance.now() - startTime;
        this.performance(label, duration, data);
        return duration;
      },
    };
  }
}

// Export singleton instance
export const logger = new Logger({
  enableConsole: true,
  enableStorage: true,
  enableSentry: process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true',
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'staging',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export default logger;
