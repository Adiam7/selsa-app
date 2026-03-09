/**
 * Senior-level Configuration Manager
 * src/lib/config/config.ts
 */

/**
 * Application Configuration
 */
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Authentication Configuration
  auth: {
    enableDebugLogging: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING === 'true',
    enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
    sessionMaxAge: 2592000, // 30 days
    sessionUpdateAge: 86400, // 24 hours
  },

  // Feature Flags
  features: {
    enableGoogleAuth: !!process.env.GOOGLE_CLIENT_ID,
    enableAppleAuth: !!process.env.APPLE_CLIENT_ID,
    enableErrorBoundary: true,
    enableProtectedRoutes: true,
    enableSessionPersistence: true,
    enableGpt5: true, // Enable GPT-5 for all clients
  },

  // Security Configuration
  security: {
    enableSecureCookies: process.env.NODE_ENV === 'production',
    enableCsrfProtection: true,
    enableXssProtection: true,
    enableCorsOrigins: [
      'http://localhost:3000',
      'http://localhost:8000',
      // Add production URLs here
    ],
  },

  // Logging Configuration
  logging: {
    enableConsoleLogging: process.env.NODE_ENV === 'development',
    enableFileLogging: process.env.NODE_ENV === 'production',
    enableErrorTracking: process.env.NODE_ENV === 'production',
    logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'INFO',
  },

  // Performance Configuration
  performance: {
    enableCaching: true,
    cacheDuration: 300000, // 5 minutes
    enableRequestDeduplication: true,
    enableOptimisticUpdates: true,
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // UI Configuration
  ui: {
    animationDuration: 300, // ms
    toastDuration: 3000, // ms
    debounceDelay: 500, // ms
  },

  // Error Handling Configuration
  errors: {
    enableErrorBoundary: true,
    enableErrorReporting: process.env.NODE_ENV === 'production',
    showDetailedErrors: process.env.NODE_ENV === 'development',
  },
} as const;

/**
 * Environment Variables Validator
 */
export function validateEnvironment(): string[] {
  const errors: string[] = [];

  // Required variables
  const required = [
    'NEXT_PUBLIC_BACKEND_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  return errors;
}

/**
 * Get configuration value with fallback
 */
export function getConfig<T>(path: string, defaultValue?: T): T {
  try {
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue as T;
      }
    }

    return value as T;
  } catch {
    return defaultValue as T;
  }
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature] === true;
}

/**
 * Check if GPT-5 is enabled for the current client
 */
export function isGpt5Enabled(): boolean {
  return config.features.enableGpt5 === true;
}

/**
 * Runtime configuration validation
 */
export function validateConfig(): boolean {
  const errors = validateEnvironment();

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    return false;
  }

  return true;
}

export default config;
