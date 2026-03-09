// lib/api/health-check.ts
/**
 * Health check utility to verify backend API connectivity
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api');
const BACKEND_ROOT = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')) || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

export async function checkBackendHealth(): Promise<{
  isHealthy: boolean;
  message: string;
  url: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    // Use dedicated health endpoint
    const response = await fetch(`${API_BASE}/health/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        isHealthy: true,
        message: 'Backend is connected',
        url: API_BASE,
      };
    }

    return {
      isHealthy: false,
      message: `Backend returned ${response.status}`,
      url: API_BASE,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          isHealthy: false,
          message: 'Backend connection timeout',
          url: API_BASE,
        };
      }
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        return {
          isHealthy: false,
          message: 'Cannot connect to backend. Make sure the Django server is running.',
          url: API_BASE,
        };
      }
    }

    return {
      isHealthy: false,
      message: 'Unknown connection error',
      url: API_BASE,
    };
  }
}

/**
 * Log backend connection status to console
 */
export async function logBackendStatus(): Promise<void> {
  const status = await checkBackendHealth();
  return;
}
