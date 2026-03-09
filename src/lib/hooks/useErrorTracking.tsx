/**
 * Error Tracking & Error Boundary
 * Catches and logs all errors throughout the application
 */

import React, { useEffect } from 'react';
import { logger } from '@/lib/services/logger';
import { analytics } from '@/lib/services/analytics';
import i18n from '@/i18n';

/**
 * Hook to track uncaught errors and unhandled promise rejections
 */
export function useErrorTracking() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.error('Uncaught error', event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });

      analytics.trackErrorEvent(event.message, 'UNCAUGHT_ERROR', {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error ? event.reason.message : String(event.reason);

      logger.error('Unhandled promise rejection', event.reason, {
        reason,
      });

      analytics.trackErrorEvent(reason, 'UNHANDLED_REJECTION', {
        promise: String(event.promise),
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

/**
 * Error Boundary Component
 * Catches React rendering errors
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });

    analytics.trackErrorEvent(error.message, 'REACT_ERROR', {
      componentStack: errorInfo.componentStack,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '20px',
              margin: '20px',
              border: '1px solid #f5a623',
              borderRadius: '4px',
              backgroundColor: '#fff9e6',
              color: '#d97706',
            }}
          >
            <h2>{i18n.t('Something went wrong')}</h2>
            <p>
              We've logged this error and will investigate. Please try refreshing
              the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                <summary>Error details</summary>
                <code style={{ fontSize: '12px' }}>
                  {this.state.error.toString()}
                </code>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to track async operation errors
 */
export function useAsyncErrorTracking() {
  const trackAsyncError = (
    operation: string,
    error: unknown,
    context?: Record<string, any>
  ) => {
    const message = error instanceof Error ? error.message : String(error);

    logger.error(`Error in async operation: ${operation}`, error, {
      ...context,
    });

    analytics.trackErrorEvent(message, `ASYNC_${operation.toUpperCase()}`, {
      ...context,
    });
  };

  const withErrorTracking = async <T,>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      trackAsyncError(operation, error, context);
      return null;
    }
  };

  return { trackAsyncError, withErrorTracking };
}

/**
 * Hook for API error tracking with context
 */
export function useApiErrorTracking() {
  const trackApiError = (
    method: string,
    url: string,
    statusCode: number,
    error: string,
    context?: Record<string, any>
  ) => {
    logger.apiError(`${method} ${url} returned ${statusCode}: ${error}`, statusCode, {
      url,
      error,
      ...context,
    });

    analytics.trackErrorEvent(error, `API_${statusCode}`, {
      method,
      url,
      statusCode,
      ...context,
    });
  };

  return { trackApiError };
}

/**
 * Hook to track performance issues (slow operations)
 */
export function usePerformanceTracking() {
  const trackSlowOperation = (
    operationName: string,
    duration: number,
    threshold: number = 1000
  ) => {
    if (duration > threshold) {
      logger.warn(`Slow operation detected: ${operationName}`, {
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${threshold}ms`,
      });

      analytics.trackErrorEvent(`Slow operation: ${operationName}`, 'PERFORMANCE_SLOW', {
        duration,
        threshold,
      });
    }
  };

  const trackMemoryUsage = () => {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1048576;
      const totalMemory = memory.totalJSHeapSize / 1048576;
      const limit = memory.jsHeapSizeLimit / 1048576;

      if (usedMemory > limit * 0.8) {
        logger.warn('High memory usage detected', {
          used: `${usedMemory.toFixed(2)}MB`,
          total: `${totalMemory.toFixed(2)}MB`,
          limit: `${limit.toFixed(2)}MB`,
        });
      }
    }
  };

  return { trackSlowOperation, trackMemoryUsage };
}

export default {
  useErrorTracking,
  useAsyncErrorTracking,
  useApiErrorTracking,
  usePerformanceTracking,
  ErrorBoundary,
};
