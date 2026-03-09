/**
 * Enhanced Loading and Error UI Components
 * Provides better user feedback during operations
 */

'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LoadingStateProps {
  loading: boolean;
  error?: string;
  retry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
  errorTitle?: string;
}

export function LoadingState({ 
  loading, 
  error, 
  retry, 
  children, 
  loadingMessage = 'Loading...',
  errorTitle = 'Something went wrong'
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">{errorTitle}</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {retry && (
            <Button onClick={retry} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export interface ProgressIndicatorProps {
  current: number;
  total: number;
  steps: string[];
  className?: string;
}

export function ProgressIndicator({ current, total, steps, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`progress-indicator ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index < current ? 'bg-green-500 text-white' : 
                  index === current ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 text-gray-500'}
              `}
            >
              {index < current ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`ml-2 text-sm ${index === current ? 'font-medium' : 'text-gray-500'}`}>
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${index < current ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export interface NetworkStatusProps {
  isOnline: boolean;
  className?: string;
}

export function NetworkStatus({ isOnline, className = '' }: NetworkStatusProps) {
  if (isOnline) return null;

  return (
    <div className={`
      bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2
      ${className}
    `}>
      <WifiOff className="w-5 h-5 text-orange-500" />
      <div>
        <p className="text-orange-800 font-medium">Connection Lost</p>
        <p className="text-orange-700 text-sm">
          Check your internet connection. Changes will be saved when reconnected.
        </p>
      </div>
    </div>
  );
}

export interface RetryButtonProps {
  onRetry: () => void;
  loading: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function RetryButton({ 
  onRetry, 
  loading, 
  disabled = false, 
  children = 'Retry',
  className = ''
}: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      disabled={disabled || loading}
      variant="outline"
      className={`gap-2 ${className}`}
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Retrying...' : children}
    </Button>
  );
}

export interface ActionButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

export function ActionButton({
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loadingText
}: ActionButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? (loadingText || 'Processing...') : children}
    </button>
  );
}

export interface ValidationMessageProps {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ValidationMessage({ 
  type, 
  message, 
  action, 
  className = '' 
}: ValidationMessageProps) {
  const typeConfig = {
    error: { 
      icon: AlertCircle, 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200', 
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    warning: { 
      icon: AlertCircle, 
      bgColor: 'bg-yellow-50', 
      borderColor: 'border-yellow-200', 
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    success: { 
      icon: CheckCircle2, 
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-200', 
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    info: { 
      icon: AlertCircle, 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200', 
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} border rounded-lg p-4
      ${className}
    `}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`${config.textColor} text-sm`}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`
                ${config.textColor} text-sm font-medium underline hover:no-underline mt-2
              `}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for network status monitoring
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}