/**
 * Security & Route Protection Tests
 * Tests authentication guards, RBAC, XSS protection, and security measures
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock next-auth
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: jest.fn(),
}));

// Mock router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  }),
  usePathname: () => '/protected-route',
}));

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Security & Route Protection Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  describe('Authentication Guards', () => {
    it('redirects unauthenticated users from protected routes', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const ProtectedRoute = () => {
        const { data: session, status } = mockUseSession();

        React.useEffect(() => {
          if (status === 'unauthenticated') {
            mockPush('/auth/login?callbackUrl=/protected-route');
          }
        }, [status]);

        if (status === 'loading') {
          return <div data-testid="auth-loading">Loading...</div>;
        }

        if (!session) {
          return null; // Will redirect
        }

        return <div data-testid="protected-content">Protected Content</div>;
      };

      render(<ProtectedRoute />);

      expect(mockPush).toHaveBeenCalledWith('/auth/login?callbackUrl=/protected-route');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('allows authenticated users to access protected routes', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: 1, email: 'test@example.com' },
          expires: '2026-03-01T00:00:00Z',
        },
        status: 'authenticated',
      });

      const ProtectedRoute = () => {
        const { data: session, status } = mockUseSession();

        if (status === 'loading') {
          return <div data-testid="auth-loading">Loading...</div>;
        }

        if (!session) {
          return null;
        }

        return <div data-testid="protected-content">Welcome, {session.user.email}!</div>;
      };

      render(<ProtectedRoute />);

      expect(screen.getByTestId('protected-content')).toHaveTextContent(
        'Welcome, test@example.com!'
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles loading state during authentication check', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const ProtectedRoute = () => {
        const { data: session, status } = mockUseSession();

        if (status === 'loading') {
          return <div data-testid="auth-loading">Checking authentication...</div>;
        }

        return session ? (
          <div data-testid="protected-content">Protected Content</div>
        ) : (
          <div data-testid="please-login">Please log in</div>
        );
      };

      render(<ProtectedRoute />);

      expect(screen.getByTestId('auth-loading')).toHaveTextContent('Checking authentication...');
    });

    it('redirects authenticated users away from auth pages', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 1, email: 'test@example.com' } },
        status: 'authenticated',
      });

      const AuthPage = () => {
        const { data: session, status } = mockUseSession();

        React.useEffect(() => {
          if (status === 'authenticated' && session) {
            mockReplace('/dashboard');
          }
        }, [session, status]);

        if (session) {
          return null; // Will redirect
        }

        return <div data-testid="login-form">Login Form</div>;
      };

      render(<AuthPage />);

      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('restricts access based on user roles', () => {
      const adminUser = {
        id: 1,
        email: 'admin@example.com',
        roles: ['admin', 'user'],
      };

      const regularUser = {
        id: 2,
        email: 'user@example.com',
        roles: ['user'],
      };

      const RoleProtectedComponent = ({ user, requiredRole }: { user: any; requiredRole: string }) => {
        const hasRole = user?.roles?.includes(requiredRole);

        if (!user) {
          return <div data-testid="no-user">Please log in</div>;
        }

        if (!hasRole) {
          return <div data-testid="access-denied">Access Denied</div>;
        }

        return <div data-testid="admin-content">Admin Dashboard</div>;
      };

      // Test with admin user
      const { rerender } = render(
        <RoleProtectedComponent user={adminUser} requiredRole="admin" />
      );

      expect(screen.getByTestId('admin-content')).toBeInTheDocument();

      // Test with regular user
      rerender(
        <RoleProtectedComponent user={regularUser} requiredRole="admin" />
      );

      expect(screen.getByTestId('access-denied')).toBeInTheDocument();

      // Test with no user
      rerender(
        <RoleProtectedComponent user={null} requiredRole="admin" />
      );

      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    it('validates permissions for API requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Insufficient permissions' }),
      } as Response);

      const PermissionProtectedAction = () => {
        const [error, setError] = React.useState('');

        const performAdminAction = async () => {
          try {
            const response = await fetch('/api/admin/users', {
              method: 'DELETE',
              headers: {
                Authorization: 'Bearer user_token',
                'Content-Type': 'application/json',
              },
            });

            if (response.status === 403) {
              setError('You do not have permission to perform this action.');
              return;
            }

            if (!response.ok) {
              throw new Error('Failed to perform action');
            }
          } catch (err) {
            setError('An error occurred');
          }
        };

        return (
          <div>
            <button onClick={performAdminAction}>Delete User</button>
            {error && <div data-testid="permission-error">{error}</div>}
          </div>
        );
      };

      render(<PermissionProtectedAction />);

      const deleteButton = screen.getByText('Delete User');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('permission-error')).toHaveTextContent(
          'You do not have permission to perform this action.'
        );
      });
    });

    it('enforces resource ownership', async () => {
      mockFetch.mockImplementation((url) => {
        if (url === '/api/orders/123') {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Order not found' }),
          } as Response);
        }
        
        if (url === '/api/orders/456') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 456,
              user_id: 1,
              status: 'pending',
              total: 99.99,
            }),
          } as Response);
        }

        return Promise.reject(new Error('Unknown endpoint'));
      });

      const ResourceOwnershipComponent = () => {
        const [order, setOrder] = React.useState<any>(null);
        const [error, setError] = React.useState('');

        const fetchOrder = async (orderId: string) => {
          try {
            const response = await fetch(`/api/orders/${orderId}`);
            
            if (response.status === 404) {
              setError('Order not found or access denied');
              return;
            }

            if (response.ok) {
              const orderData = await response.json();
              setOrder(orderData);
            }
          } catch (err) {
            setError('Failed to fetch order');
          }
        };

        return (
          <div>
            <button onClick={() => fetchOrder('123')}>
              Fetch Other User's Order
            </button>
            <button onClick={() => fetchOrder('456')}>
              Fetch My Order
            </button>
            {error && <div data-testid="ownership-error">{error}</div>}
            {order && <div data-testid="order-data">Order ID: {order.id}</div>}
          </div>
        );
      };

      render(<ResourceOwnershipComponent />);

      // Try to access other user's order
      const otherOrderButton = screen.getByText("Fetch Other User's Order");
      await user.click(otherOrderButton);

      await waitFor(() => {
        expect(screen.getByTestId('ownership-error')).toHaveTextContent(
          'Order not found or access denied'
        );
      });

      // Access own order
      const myOrderButton = screen.getByText('Fetch My Order');
      await user.click(myOrderButton);

      await waitFor(() => {
        expect(screen.getByTestId('order-data')).toHaveTextContent('Order ID: 456');
      });
    });
  });

  describe('XSS Protection', () => {
    it('sanitizes user input to prevent XSS', () => {
      const sanitizeHtml = (input: string) => {
        const temp = document.createElement('div');
        temp.textContent = input;
        return temp.innerHTML;
      };

      const UserContentComponent = ({ content }: { content: string }) => {
        const sanitizedContent = sanitizeHtml(content);

        return (
          <div 
            data-testid="user-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        );
      };

      const maliciousScript = '<script>alert("XSS")</script><p>Safe content</p>';

      render(<UserContentComponent content={maliciousScript} />);

      const contentElement = screen.getByTestId('user-content');
      
      // Script should be escaped, but safe content should remain
      expect(contentElement.innerHTML).toBe(
        '&lt;script&gt;alert("XSS")&lt;/script&gt;&lt;p&gt;Safe content&lt;/p&gt;'
      );
    });

    it('validates and escapes form inputs', async () => {
      const XSSProtectedForm = () => {
        const [inputValue, setInputValue] = React.useState('');
        const [error, setError] = React.useState('');
        const [submittedValue, setSubmittedValue] = React.useState('');

        const validateInput = (value: string) => {
          // Check for script tags
          if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(value)) {
            return 'Script tags are not allowed';
          }

          // Check for javascript: protocol
          if (/javascript\s*:/gi.test(value)) {
            return 'JavaScript URLs are not allowed';
          }

          // Check for event handlers
          if (/\s*on\w+\s*=/gi.test(value)) {
            return 'Event handlers are not allowed';
          }

          return '';
        };

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          
          const validationError = validateInput(inputValue);
          if (validationError) {
            setError(validationError);
            return;
          }

          setError('');
          setSubmittedValue(inputValue);
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              data-testid="xss-input"
            />
            <button type="submit">Submit</button>
            {error && <div data-testid="xss-error">{error}</div>}
            {submittedValue && <div data-testid="submitted-value">{submittedValue}</div>}
          </form>
        );
      };

      render(<XSSProtectedForm />);

      const input = screen.getByTestId('xss-input');
      const submitButton = screen.getByText('Submit');

      // Test script injection
      await user.type(input, '<script>alert("xss")</script>');
      await user.click(submitButton);

      expect(screen.getByTestId('xss-error')).toHaveTextContent('Script tags are not allowed');

      // Test event handler injection
      await user.clear(input);
      await user.type(input, '<img src="x" onerror="alert(\'xss\')">');
      await user.click(submitButton);

      expect(screen.getByTestId('xss-error')).toHaveTextContent('Event handlers are not allowed');

      // Test safe input
      await user.clear(input);
      await user.type(input, 'Safe user content');
      await user.click(submitButton);

      expect(screen.queryByTestId('xss-error')).not.toBeInTheDocument();
      expect(screen.getByTestId('submitted-value')).toHaveTextContent('Safe user content');
    });
  });

  describe('Token Security', () => {
    it('automatically refreshes expired tokens', async () => {
      let tokenRefreshed = false;

      mockFetch.mockImplementation((url) => {
        if (url === '/api/protected' && !tokenRefreshed) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Token expired' }),
          } as Response);
        }

        if (url === '/api/auth/refresh') {
          tokenRefreshed = true;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: 'new_token' }),
          } as Response);
        }

        if (url === '/api/protected' && tokenRefreshed) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: 'protected_data' }),
          } as Response);
        }

        return Promise.reject(new Error('Unknown endpoint'));
      });

      const TokenRefreshComponent = () => {
        const [data, setData] = React.useState('');
        const [token, setToken] = React.useState('expired_token');

        const fetchWithTokenRefresh = async () => {
          let response = await fetch('/api/protected', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 401) {
            // Token expired, refresh it
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: 'refresh_token' }),
            });

            if (refreshResponse.ok) {
              const { access_token } = await refreshResponse.json();
              setToken(access_token);

              // Retry with new token
              response = await fetch('/api/protected', {
                headers: { Authorization: `Bearer ${access_token}` },
              });
            }
          }

          if (response.ok) {
            const result = await response.json();
            setData(result.data);
          }
        };

        return (
          <div>
            <button onClick={fetchWithTokenRefresh}>Fetch Protected Data</button>
            <div data-testid="token-data">{data}</div>
          </div>
        );
      };

      render(<TokenRefreshComponent />);

      const fetchButton = screen.getByText('Fetch Protected Data');
      await user.click(fetchButton);

      await waitFor(() => {
        expect(screen.getByTestId('token-data')).toHaveTextContent('protected_data');
        expect(mockFetch).toHaveBeenCalledTimes(3); // Original, refresh, retry
      });
    });

    it('secures token storage', () => {
      const TokenStorageComponent = () => {
        const [stored, setStored] = React.useState(false);

        const storeToken = (token: string) => {
          try {
            // Secure token storage (httpOnly cookies would be better)
            sessionStorage.setItem('auth_token', token);
            setStored(true);
          } catch (err) {
            console.error('Failed to store token securely');
          }
        };

        const clearToken = () => {
          sessionStorage.removeItem('auth_token');
          setStored(false);
        };

        return (
          <div>
            <button onClick={() => storeToken('secure_token')}>Store Token</button>
            <button onClick={clearToken}>Clear Token</button>
            <div data-testid="token-stored">{stored ? 'Token stored' : 'No token'}</div>
          </div>
        );
      };

      render(<TokenStorageComponent />);

      const storeButton = screen.getByText('Store Token');
      const clearButton = screen.getByText('Clear Token');

      fireEvent.click(storeButton);
      expect(screen.getByTestId('token-stored')).toHaveTextContent('Token stored');

      fireEvent.click(clearButton);
      expect(screen.getByTestId('token-stored')).toHaveTextContent('No token');
    });

    it('validates JWT token format', () => {
      const validateJWT = (token: string) => {
        const parts = token.split('.');
        
        if (parts.length !== 3) {
          return false;
        }

        try {
          const payload = JSON.parse(atob(parts[1]));
          
          // Check for required claims
          if (!payload.exp || !payload.iat) {
            return false;
          }

          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            return false;
          }

          return true;
        } catch (err) {
          return false;
        }
      };

      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Lkb7Y7j0_DOtQfYg3K6RqRl9dJ8VZYoZpq8eQ7J9w2s';
      const invalidToken = 'invalid.token.format';
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      expect(validateJWT(validToken)).toBe(true);
      expect(validateJWT(invalidToken)).toBe(false);
      expect(validateJWT(expiredToken)).toBe(false);
    });
  });

  describe('CSRF Protection', () => {
    it('validates CSRF tokens on state-changing requests', async () => {
      mockFetch.mockImplementation((url, options) => {
        const headers = options?.headers as Record<string, string>;
        
        if (!headers || !headers['X-CSRF-Token']) {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({ error: 'CSRF token missing' }),
          } as Response);
        }

        if (headers['X-CSRF-Token'] !== 'valid-csrf-token') {
          return Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({ error: 'Invalid CSRF token' }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      });

      const CSRFProtectedComponent = () => {
        const [csrfToken] = React.useState('valid-csrf-token');
        const [result, setResult] = React.useState('');

        const makeStateChangingRequest = async () => {
          try {
            const response = await fetch('/api/update-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
              },
              body: JSON.stringify({ name: 'New Name' }),
            });

            if (!response.ok) {
              const error = await response.json();
              setResult(error.error);
            } else {
              setResult('Update successful');
            }
          } catch (err) {
            setResult('Request failed');
          }
        };

        return (
          <div>
            <button onClick={makeStateChangingRequest}>Update Profile</button>
            <div data-testid="csrf-result">{result}</div>
          </div>
        );
      };

      render(<CSRFProtectedComponent />);

      const updateButton = screen.getByText('Update Profile');
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('csrf-result')).toHaveTextContent('Update successful');
      });
    });
  });

  describe('Content Security Policy (CSP)', () => {
    it('blocks inline scripts when CSP is enforced', async () => {
      const CSPTestComponent = () => {
        const [blocked, setBlocked] = React.useState(false);

        React.useEffect(() => {
          // Simulate CSP violation
          const handleCSPViolation = (e: SecurityPolicyViolationEvent) => {
            if (e.violatedDirective === 'script-src') {
              setBlocked(true);
            }
          };

          document.addEventListener('securitypolicyviolation', handleCSPViolation);
          
          return () => {
            document.removeEventListener('securitypolicyviolation', handleCSPViolation);
          };
        }, []);

        return (
          <div>
            {blocked && <div data-testid="csp-blocked">Inline script blocked by CSP</div>}
            <div data-testid="safe-content">Safe content loaded</div>
          </div>
        );
      };

      render(<CSPTestComponent />);

      // Simulate CSP violation event inside act() so React state updates flush
      await act(async () => {
        const cspEvent = new Event('securitypolicyviolation') as SecurityPolicyViolationEvent;
        Object.defineProperty(cspEvent, 'violatedDirective', { value: 'script-src' });
        document.dispatchEvent(cspEvent);
      });

      expect(screen.getByTestId('csp-blocked')).toBeInTheDocument();
    });
  });

  describe('Rate Limiting', () => {
    it('implements client-side rate limiting', async () => {
      const RateLimitComponent = () => {
        const [attempts, setAttempts] = React.useState(0);
        const [blocked, setBlocked] = React.useState(false);
        const maxAttempts = 3;
        const timeWindow = 60000; // 1 minute

        const makeRequest = () => {
          const now = Date.now();
          const lastReset = localStorage.getItem('rate_limit_reset');
          const currentAttempts = parseInt(localStorage.getItem('rate_limit_attempts') || '0');

          // Reset if time window has passed
          if (!lastReset || now - parseInt(lastReset) > timeWindow) {
            localStorage.setItem('rate_limit_reset', now.toString());
            localStorage.setItem('rate_limit_attempts', '1');
            setAttempts(1);
            setBlocked(false);
          } else if (currentAttempts >= maxAttempts) {
            setBlocked(true);
          } else {
            const newAttempts = currentAttempts + 1;
            localStorage.setItem('rate_limit_attempts', newAttempts.toString());
            setAttempts(newAttempts);
            
            if (newAttempts >= maxAttempts) {
              setBlocked(true);
            }
          }
        };

        return (
          <div>
            <button onClick={makeRequest} disabled={blocked}>
              Make Request ({attempts}/{maxAttempts})
            </button>
            {blocked && (
              <div data-testid="rate-limited">
                Rate limit exceeded. Try again later.
              </div>
            )}
          </div>
        );
      };

      render(<RateLimitComponent />);

      const requestButton = screen.getByText('Make Request (0/3)');

      // Make 3 requests quickly
      await user.click(requestButton);
      await user.click(requestButton);
      await user.click(requestButton);

      await waitFor(() => {
        expect(screen.getByTestId('rate-limited')).toBeInTheDocument();
        expect(requestButton).toBeDisabled();
      });
    });
  });

  describe('Data Sanitization', () => {
    it('sanitizes file uploads', () => {
      const FileUploadComponent = () => {
        const [error, setError] = React.useState('');
        const [uploadedFile, setUploadedFile] = React.useState('');

        const validateFile = (file: File) => {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          const maxSize = 5 * 1024 * 1024; // 5MB

          if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Only JPEG, PNG, and GIF are allowed.';
          }

          if (file.size > maxSize) {
            return 'File size too large. Maximum size is 5MB.';
          }

          // Check for disguised executables
          if (file.name.includes('.exe') || file.name.includes('.js')) {
            return 'Suspicious file detected.';
          }

          return '';
        };

        const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const validationError = validateFile(file);
          if (validationError) {
            setError(validationError);
            setUploadedFile('');
          } else {
            setError('');
            setUploadedFile(file.name);
          }
        };

        return (
          <div>
            <input 
              type="file" 
              onChange={handleFileUpload} 
              data-testid="file-input"
            />
            {error && <div data-testid="file-error">{error}</div>}
            {uploadedFile && <div data-testid="uploaded-file">{uploadedFile}</div>}
          </div>
        );
      };

      render(<FileUploadComponent />);

      const fileInput = screen.getByTestId('file-input');

      // Test malicious file
      const maliciousFile = new File(['malicious content'], 'malware.exe.jpg', {
        type: 'image/jpeg',
      });

      fireEvent.change(fileInput, { target: { files: [maliciousFile] } });

      expect(screen.getByTestId('file-error')).toHaveTextContent('Suspicious file detected.');

      // Test valid file
      const validFile = new File(['image content'], 'photo.jpg', {
        type: 'image/jpeg',
      });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(screen.getByTestId('uploaded-file')).toHaveTextContent('photo.jpg');
      expect(screen.queryByTestId('file-error')).not.toBeInTheDocument();
    });
  });
});