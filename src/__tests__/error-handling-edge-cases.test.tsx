/**
 * Error Handling & Edge Cases Test Suite
 * Tests error boundaries, network failures, edge cases, and resilience
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock console to capture errors
const originalConsoleError = console.error;
let consoleErrorSpy: jest.SpyInstance;

describe('Error Handling & Edge Cases Test Suite', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    mockFetch.mockReset(); // clear mockImplementation set by timeout/retry tests
    jest.useRealTimers(); // restore real timers if fake timers were used
  });

  describe('Network Error Handling', () => {
    it('handles network connection failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const NetworkErrorComponent = () => {
        const [error, setError] = React.useState('');
        const [loading, setLoading] = React.useState(false);

        const fetchData = async () => {
          setLoading(true);
          setError('');
          
          try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to fetch');
            await response.json();
          } catch (err) {
            setError('Failed to connect to server. Please check your internet connection.');
          } finally {
            setLoading(false);
          }
        };

        return (
          <div>
            <button onClick={fetchData} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Data'}
            </button>
            {error && <div data-testid="network-error">{error}</div>}
          </div>
        );
      };

      render(<NetworkErrorComponent />);

      const fetchButton = screen.getByText('Fetch Data');
      await user.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByTestId('network-error')).toHaveTextContent(
          'Failed to connect to server. Please check your internet connection.'
        );
      });
    });

    it('implements retry mechanism for failed requests', async () => {
      jest.useFakeTimers();
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'success' }),
        } as Response);
      });

      const RetryComponent = () => {
        const [result, setResult] = React.useState('');
        const [retries, setRetries] = React.useState(0);

        const fetchWithRetry = async (maxRetries = 3) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              setRetries(i + 1);
              const response = await fetch('/api/data');
              if (response.ok) {
                const data = await response.json();
                setResult(data.data);
                return;
              }
            } catch (err) {
              if (i === maxRetries - 1) {
                setResult('Failed after retries');
                throw err;
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        };

        return (
          <div>
            <button onClick={() => fetchWithRetry()}>Fetch with Retry</button>
            <div data-testid="retry-count">Retries: {retries}</div>
            <div data-testid="result">{result}</div>
          </div>
        );
      };

      render(<RetryComponent />);

      const fetchButton = screen.getByText('Fetch with Retry');
      // Click must use fireEvent when fake timers are active (userEvent internals use real timers)
      fireEvent.click(fetchButton);

      // Let the first 2 failing fetches run and advance timers for retry delays
      await act(async () => { jest.runAllTimers(); });
      await act(async () => { jest.runAllTimers(); });
      await act(async () => { jest.runAllTimers(); });

      jest.useRealTimers();

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('success');
        expect(screen.getByTestId('retry-count')).toHaveTextContent('Retries: 3');
      }, { timeout: 3000 });
    });

    it('handles timeout errors', async () => {
      // Mock a request that never resolves — component's AbortController will cancel it
      mockFetch.mockImplementation(
        (_url: string, options?: RequestInit) => new Promise((_, reject) => {
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              const abortError = new Error('AbortError');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }
        })
      );

      const TimeoutComponent = () => {
        const [error, setError] = React.useState('');

        const fetchWithTimeout = async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 50);

            await fetch('/api/slow-endpoint', { signal: controller.signal });
            clearTimeout(timeoutId);
          } catch (err) {
            if ((err as Error).name === 'AbortError') {
              setError('Request timed out');
            } else {
              setError('Request failed');
            }
          }
        };

        return (
          <div>
            <button onClick={fetchWithTimeout}>Fetch with Timeout</button>
            {error && <div data-testid="timeout-error">{error}</div>}
          </div>
        );
      };

      render(<TimeoutComponent />);

      const fetchButton = screen.getByText('Fetch with Timeout');
      await user.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByTestId('timeout-error')).toHaveTextContent('Request timed out');
      });
    });
  });

  describe('API Error Responses', () => {
    it('handles 400 Bad Request errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          errors: {
            email: ['This field is required.'],
            password: ['Password too weak.'],
          },
        }),
      } as Response);

      const FormErrorComponent = () => {
        const [errors, setErrors] = React.useState<any>({});

        const submitForm = async () => {
          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              body: JSON.stringify({ email: '', password: '123' }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              setErrors(errorData.errors || {});
            }
          } catch (err) {
            setErrors({ general: 'Network error occurred' });
          }
        };

        return (
          <div>
            <button onClick={submitForm}>Submit Form</button>
            {errors.email && <div data-testid="email-error">{errors.email[0]}</div>}
            {errors.password && <div data-testid="password-error">{errors.password[0]}</div>}
            {errors.general && <div data-testid="general-error">{errors.general}</div>}
          </div>
        );
      };

      render(<FormErrorComponent />);

      const submitButton = screen.getByText('Submit Form');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('This field is required.');
        expect(screen.getByTestId('password-error')).toHaveTextContent('Password too weak.');
      });
    });

    it('handles 401 Unauthorized errors with token refresh', async () => {
      let callCount = 0;
      mockFetch.mockImplementation((url) => {
        callCount++;
        
        if (callCount === 1) {
          // First call returns 401
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ detail: 'Token expired' }),
          } as Response);
        } else if (callCount === 2 && url.includes('/auth/refresh')) {
          // Refresh token call succeeds
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: 'new_token' }),
          } as Response);
        } else {
          // Retry with new token succeeds
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: 'protected_data' }),
          } as Response);
        }
      });

      const AuthErrorComponent = () => {
        const [data, setData] = React.useState('');
        const [token, setToken] = React.useState('old_token');

        const fetchProtectedData = async () => {
          try {
            let response = await fetch('/api/protected', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
              // Try to refresh token
              const refreshResponse = await fetch('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refresh_token: 'refresh_token' }),
              });

              if (refreshResponse.ok) {
                const { access_token } = await refreshResponse.json();
                setToken(access_token);

                // Retry original request
                response = await fetch('/api/protected', {
                  headers: { Authorization: `Bearer ${access_token}` },
                });
              }
            }

            if (response.ok) {
              const result = await response.json();
              setData(result.data);
            }
          } catch (err) {
            setData('Error occurred');
          }
        };

        return (
          <div>
            <button onClick={fetchProtectedData}>Fetch Protected Data</button>
            <div data-testid="protected-data">{data}</div>
          </div>
        );
      };

      render(<AuthErrorComponent />);

      const fetchButton = screen.getByText('Fetch Protected Data');
      await user.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByTestId('protected-data')).toHaveTextContent('protected_data');
        expect(mockFetch).toHaveBeenCalledTimes(3); // Original, refresh, retry
      });
    });

    it('handles 429 Rate Limiting with exponential backoff', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        
        if (callCount < 3) {
          return Promise.resolve({
            ok: false,
            status: 429,
            headers: new Headers({ 'Retry-After': '2' }),
            json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
          } as Response);
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'success' }),
        } as Response);
      });

      const RateLimitComponent = () => {
        const [result, setResult] = React.useState('');
        const [attempts, setAttempts] = React.useState(0);

        const fetchWithBackoff = async () => {
          const maxAttempts = 5;
          let attempt = 0;

          while (attempt < maxAttempts) {
            attempt++;
            setAttempts(attempt);

            try {
              const response = await fetch('/api/data');
              
              if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
                
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }

              if (response.ok) {
                const data = await response.json();
                setResult(data.data);
                return;
              }
            } catch (err) {
              if (attempt === maxAttempts) {
                setResult('Max attempts reached');
              }
            }
          }
        };

        return (
          <div>
            <button onClick={fetchWithBackoff}>Fetch with Backoff</button>
            <div data-testid="attempt-count">Attempts: {attempts}</div>
            <div data-testid="backoff-result">{result}</div>
          </div>
        );
      };

      render(<RateLimitComponent />);

      const fetchButton = screen.getByText('Fetch with Backoff');
      await user.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByTestId('backoff-result')).toHaveTextContent('success');
      }, { timeout: 5000 });
    });
  });

  describe('Error Boundaries', () => {
    it('catches JavaScript errors in component tree', () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error('Component error');
        }
        return <div>No error</div>;
      };

      class ErrorBoundary extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean; error?: Error }
      > {
        constructor(props: { children: React.ReactNode }) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError(error: Error) {
          return { hasError: true, error };
        }

        componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
          console.error('Error boundary caught error:', error, errorInfo);
        }

        render() {
          if (this.state.hasError) {
            return (
              <div data-testid="error-fallback">
                <h2>Something went wrong!</h2>
                <details>
                  <summary>Error details</summary>
                  <pre>{this.state.error?.message}</pre>
                </details>
                <button onClick={() => this.setState({ hasError: false })}>
                  Try again
                </button>
              </div>
            );
          }

          return this.props.children;
        }
      }

      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(false);

        return (
          <div>
            <button onClick={() => setShouldThrow(true)}>Trigger Error</button>
            <ErrorBoundary>
              <ThrowError shouldThrow={shouldThrow} />
            </ErrorBoundary>
          </div>
        );
      };

      render(<TestComponent />);

      const triggerButton = screen.getByText('Trigger Error');
      fireEvent.click(triggerButton);

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });

    it('provides fallback UI for chunk loading failures', () => {
      const ChunkErrorBoundary = () => {
        const [chunkError, setChunkError] = React.useState(false);

        React.useEffect(() => {
          const handleChunkError = (event: Event) => {
            setChunkError(true);
          };

          window.addEventListener('error', handleChunkError);
          return () => window.removeEventListener('error', handleChunkError);
        }, []);

        if (chunkError) {
          return (
            <div data-testid="chunk-error">
              <h2>Failed to load application</h2>
              <p>Please refresh the page to try again.</p>
              <button onClick={() => window.location.reload()}>Refresh Page</button>
            </div>
          );
        }

        return <div>App loaded successfully</div>;
      };

      render(<ChunkErrorBoundary />);

      // Simulate chunk loading error
      fireEvent(window, new Event('error'));

      expect(screen.getByTestId('chunk-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load application')).toBeInTheDocument();
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('handles malformed API responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve('invalid json structure'),
      } as Response);

      const MalformedDataComponent = () => {
        const [error, setError] = React.useState('');
        const [data, setData] = React.useState(null);

        const fetchData = async () => {
          try {
            const response = await fetch('/api/products');
            const result = await response.json();

            // Validate expected structure
            if (!result || typeof result !== 'object' || !Array.isArray(result.results)) {
              throw new Error('Invalid data format received');
            }

            setData(result);
          } catch (err) {
            setError('Invalid data received from server');
          }
        };

        return (
          <div>
            <button onClick={fetchData}>Fetch Data</button>
            {error && <div data-testid="malformed-error">{error}</div>}
            {data && <div data-testid="valid-data">Data loaded</div>}
          </div>
        );
      };

      render(<MalformedDataComponent />);

      const fetchButton = screen.getByText('Fetch Data');
      await user.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByTestId('malformed-error')).toHaveTextContent(
          'Invalid data received from server'
        );
      });
    });

    it('handles empty state gracefully', () => {
      const EmptyStateComponent = ({ items }: { items: any[] }) => {
        if (items.length === 0) {
          return (
            <div data-testid="empty-state">
              <h3>No items found</h3>
              <p>Try adjusting your search criteria.</p>
              <button>Browse All Products</button>
            </div>
          );
        }

        return (
          <div data-testid="items-list">
            {items.map((item, index) => (
              <div key={index}>{item.name}</div>
            ))}
          </div>
        );
      };

      render(<EmptyStateComponent items={[]} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('handles null and undefined values safely', () => {
      const NullSafeComponent = ({ user }: { user?: any }) => {
        const getName = () => {
          return user?.name || user?.email?.split('@')[0] || 'Guest';
        };

        const getAvatar = () => {
          return user?.avatar || '/default-avatar.png';
        };

        return (
          <div data-testid="user-info">
            <img src={getAvatar()} alt="User avatar" data-testid="avatar" />
            <span data-testid="user-name">{getName()}</span>
            <span data-testid="user-email">{user?.email || 'No email'}</span>
          </div>
        );
      };

      // Test with null user
      const { rerender } = render(<NullSafeComponent user={null} />);
      
      expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No email');
      expect(screen.getByTestId('avatar')).toHaveAttribute('src', '/default-avatar.png');

      // Test with partial user data
      rerender(<NullSafeComponent user={{ email: 'test@example.com' }} />);
      
      expect(screen.getByTestId('user-name')).toHaveTextContent('test');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  describe('Form Validation Edge Cases', () => {
    it('handles special characters in input fields', async () => {
      const SpecialCharForm = () => {
        const [value, setValue] = React.useState('');
        const [error, setError] = React.useState('');

        const validateInput = (input: string) => {
          // Test various edge cases
          if (input.length > 100) {
            return 'Input too long';
          }
          
          if (/[<>]/.test(input)) {
            return 'HTML characters not allowed';
          }
          
          if (/^\s*$/.test(input) && input.length > 0) {
            return 'Input cannot be only whitespace';
          }

          return '';
        };

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const validationError = validateInput(value);
          setError(validationError);
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid="special-char-input"
            />
            <button type="submit">Submit</button>
            {error && <div data-testid="validation-error">{error}</div>}
          </form>
        );
      };

      render(<SpecialCharForm />);

      const input = screen.getByTestId('special-char-input');
      const submitButton = screen.getByText('Submit');

      // Test HTML characters
      await user.type(input, '<script>alert("xss")</script>');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toHaveTextContent(
          'HTML characters not allowed'
        );
      });

      // Clear and test whitespace only
      await user.clear(input);
      await user.type(input, '   ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toHaveTextContent(
          'Input cannot be only whitespace'
        );
      });
    });

    it('handles extremely large form data', async () => {
      const LargeDataForm = () => {
        const [formData, setFormData] = React.useState('');
        const [error, setError] = React.useState('');

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          
          try {
            const response = await fetch('/api/large-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: formData }),
            });

            if (!response.ok) {
              throw new Error('Payload too large');
            }
          } catch (err) {
            setError((err as Error).message);
          }
        };

        return (
          <form onSubmit={handleSubmit}>
            <textarea
              value={formData}
              onChange={(e) => setFormData(e.target.value)}
              data-testid="large-textarea"
            />
            <button type="submit">Submit Large Data</button>
            {error && <div data-testid="large-data-error">{error}</div>}
          </form>
        );
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 413,
        json: () => Promise.resolve({ error: 'Payload too large' }),
      } as Response);

      render(<LargeDataForm />);

      const textarea = screen.getByTestId('large-textarea');
      const submitButton = screen.getByText('Submit Large Data');

      // Simulate large data
      const largeData = 'x'.repeat(10000);
      fireEvent.change(textarea, { target: { value: largeData } });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('large-data-error')).toHaveTextContent('Payload too large');
      });
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('handles localStorage unavailability', () => {
      const originalLocalStorage = window.localStorage;
      
      // Mock localStorage to throw error
      const mockLocalStorage = {
        getItem: jest.fn(() => { throw new Error('localStorage disabled'); }),
        setItem: jest.fn(() => { throw new Error('localStorage disabled'); }),
        removeItem: jest.fn(() => { throw new Error('localStorage disabled'); }),
        clear: jest.fn(() => { throw new Error('localStorage disabled'); }),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      const LocalStorageComponent = () => {
        const [data, setData] = React.useState('');
        const [error, setError] = React.useState('');

        const saveData = (value: string) => {
          try {
            localStorage.setItem('test-key', value);
            setData(value);
          } catch (err) {
            setError('Storage not available. Data will not persist.');
          }
        };

        return (
          <div>
            <button onClick={() => saveData('test-data')}>Save Data</button>
            <div data-testid="data">{data}</div>
            {error && <div data-testid="storage-error">{error}</div>}
          </div>
        );
      };

      render(<LocalStorageComponent />);

      const saveButton = screen.getByText('Save Data');
      fireEvent.click(saveButton);

      expect(screen.getByTestId('storage-error')).toHaveTextContent(
        'Storage not available. Data will not persist.'
      );

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('handles API fetch unavailability', async () => {
      const originalFetch = global.fetch;
      delete (global as any).fetch;

      const FetchPolyfillComponent = () => {
        const [result, setResult] = React.useState('');

        const makeRequest = async () => {
          if (typeof fetch === 'undefined') {
            setResult('Fetch API not supported');
            return;
          }

          try {
            const response = await fetch('/api/data');
            const data = await response.json();
            setResult(data.message);
          } catch (err) {
            setResult('Request failed');
          }
        };

        return (
          <div>
            <button onClick={makeRequest}>Make Request</button>
            <div data-testid="fetch-result">{result}</div>
          </div>
        );
      };

      render(<FetchPolyfillComponent />);

      const requestButton = screen.getByText('Make Request');
      await user.click(requestButton);

      expect(screen.getByTestId('fetch-result')).toHaveTextContent('Fetch API not supported');

      // Restore fetch
      global.fetch = originalFetch;
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('handles memory leaks from event listeners', () => {
      const MemoryLeakComponent = ({ active }: { active: boolean }) => {
        React.useEffect(() => {
          if (!active) return;

          const handleResize = () => {
            // Simulate expensive operation
          };

          window.addEventListener('resize', handleResize);

          // Cleanup function
          return () => {
            window.removeEventListener('resize', handleResize);
          };
        }, [active]);

        return <div data-testid="memory-component">Component {active ? 'active' : 'inactive'}</div>;
      };

      const { rerender } = render(<MemoryLeakComponent active={true} />);
      
      expect(screen.getByTestId('memory-component')).toHaveTextContent('active');

      // Deactivate component - should clean up listeners
      rerender(<MemoryLeakComponent active={false} />);

      expect(screen.getByTestId('memory-component')).toHaveTextContent('inactive');
    });

    it('handles infinite scroll with many items', () => {
      const InfiniteScrollComponent = () => {
        const [items, setItems] = React.useState(Array.from({ length: 20 }, (_, i) => i));
        const [loading, setLoading] = React.useState(false);

        const loadMore = React.useCallback(() => {
          if (loading) return;
          
          setLoading(true);
          // Simulate API call
          setTimeout(() => {
            setItems(prev => [...prev, ...Array.from({ length: 20 }, (_, i) => prev.length + i)]);
            setLoading(false);
          }, 500);
        }, [loading]);

        React.useEffect(() => {
          const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
              loadMore();
            }
          };

          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }, [loadMore]);

        return (
          <div>
            {items.map(item => (
              <div key={item} data-testid={`item-${item}`}>
                Item {item}
              </div>
            ))}
            {loading && <div data-testid="loading">Loading more...</div>}
            <div data-testid="item-count">Total items: {items.length}</div>
          </div>
        );
      };

      render(<InfiniteScrollComponent />);

      expect(screen.getByTestId('item-count')).toHaveTextContent('Total items: 20');

      // Trigger scroll event
      fireEvent.scroll(window, { target: { scrollY: 1000 } });

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });
});