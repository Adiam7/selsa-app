/**
 * LoginForm (LoginPage) component tests
 * Tests: render, validation, signIn calls, show/hide password, OAuth buttons
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';

// ── Mock next/navigation ──────────────────────────────────────────────────────
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockGetParam = jest.fn().mockReturnValue(null);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, back: mockRouterBack }),
  useSearchParams: () => ({ get: mockGetParam }),
  usePathname: () => '/',
}));

// ── Mock next-auth/react ──────────────────────────────────────────────────────
const mockSignIn = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// ── Mock framer-motion ────────────────────────────────────────────────────────
// Strip animation props before forwarding to real DOM elements
const stripMotionProps = (props: any) => {
  const {
    initial, animate, exit, transition, variants, whileHover, whileTap,
    whileFocus, whileDrag, whileInView, layout, layoutId, drag, dragConstraints,
    dragElastic, onDragStart, onDragEnd, onHoverStart, onHoverEnd,
    viewport, ...rest
  } = props;
  return rest;
};

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, whileFocus, whileDrag, whileInView, layout, layoutId, drag, dragConstraints, dragElastic, onDragStart, onDragEnd, onHoverStart, onHoverEnd, viewport, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, whileFocus, whileDrag, whileInView, layout, layoutId, drag, dragConstraints, dragElastic, onDragStart, onDragEnd, onHoverStart, onHoverEnd, viewport, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, whileFocus, whileDrag, whileInView, layout, layoutId, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
    label: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, whileFocus, whileDrag, whileInView, layout, layoutId, ...rest } = props;
      return <label {...rest}>{children}</label>;
    },
    p: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, whileFocus, whileDrag, whileInView, layout, layoutId, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
    a: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, whileFocus, whileDrag, whileInView, layout, layoutId, ...rest } = props;
      return <a {...rest}>{children}</a>;
    },
    h1: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, ...rest } = props;
      return <h1 {...rest}>{children}</h1>;
    },
    input: ({ ...props }: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, ...rest } = props;
      return <input {...rest} />;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ── Mock next/image ───────────────────────────────────────────────────────────
jest.mock('next/image', () =>
  function MockImage({ src, alt, ...rest }: any) {
    return <img src={src} alt={alt} {...rest} />;
  }
);

// ── Mock LoginLogo ────────────────────────────────────────────────────────────
jest.mock('@/components/icons/LoginLogo', () => ({
  LoginLogo: () => <div data-testid="login-logo" />,
}));

// ── Import component ──────────────────────────────────────────────────────────
import LoginForm from '@/components/forms/LoginForm';

// ── Tests ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockGetParam.mockReturnValue(null);
});

describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders email and password inputs', () => {
      render(<LoginForm />);
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    });

    it('renders the sign-in submit button', () => {
      render(<LoginForm />);
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it('renders Google OAuth button', () => {
      render(<LoginForm />);
      expect(
        screen.getByRole('button', { name: /google/i })
      ).toBeInTheDocument();
    });

    it('renders Apple OAuth button', () => {
      render(<LoginForm />);
      expect(
        screen.getByRole('button', { name: /apple/i })
      ).toBeInTheDocument();
    });

    it('renders the logo', () => {
      render(<LoginForm />);
      expect(screen.getByTestId('login-logo')).toBeInTheDocument();
    });

    it('password input type is password by default (hidden)', () => {
      render(<LoginForm />);
      const passwordInput = screen.getByPlaceholderText('Enter password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('show/hide password', () => {
    it('toggles password visibility when eye button is clicked', async () => {
      render(<LoginForm />);
      const passwordInput = screen.getByPlaceholderText('Enter password');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // The toggle button is the inline `type="button"` inside the password input wrapper
      const passwordWrapper = passwordInput.parentElement!;
      const toggleBtn = passwordWrapper.querySelector('button[type="button"]') as HTMLButtonElement;
      expect(toggleBtn).not.toBeNull();

      await act(async () => {
        fireEvent.click(toggleBtn);
      });

      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('validation', () => {
    it('shows "Email is required" when submitting empty email', async () => {
      render(<LoginForm />);
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows "Invalid email" for malformed email', async () => {
      render(<LoginForm />);
      const emailInput = screen.getByPlaceholderText('you@example.com');

      // Type invalid email, then blur the field to trigger the onBlur validation
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
      });
      await act(async () => {
        fireEvent.blur(emailInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('shows "Password is required" when email is valid but password empty', async () => {
      render(<LoginForm />);
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('does not call signIn when validation fails', async () => {
      render(<LoginForm />);
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('calls signIn("credentials") with email and password on valid submit', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null });

      render(<LoginForm />);
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('Enter password');
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'MyPassword1!' } });
        fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'credentials',
          expect.objectContaining({
            email: 'user@example.com',
            password: 'MyPassword1!',
            redirect: false,
          })
        );
      });
    });

    it('shows error message when signIn returns an error', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' });

      render(<LoginForm />);
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('Enter password');
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('redirects to callbackUrl after successful login', async () => {
      jest.useFakeTimers();
      mockSignIn.mockResolvedValue({ ok: true, error: null });
      mockGetParam.mockImplementation((key: string) =>
        key === 'callbackUrl' ? '/cart' : null
      );

      render(<LoginForm />);
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('Enter password');

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'MyPassword1!' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(mockRouterPush).toHaveBeenCalledWith('/cart');
      jest.useRealTimers();
    });
  });

  describe('OAuth buttons', () => {
    it('calls signIn("google") when Google button is clicked', async () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<LoginForm />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /google/i }));
      });

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'google',
          expect.objectContaining({ callbackUrl: expect.any(String) })
        );
      });
    });

    it('calls signIn("apple") when Apple button is clicked', async () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<LoginForm />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /apple/i }));
      });

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'apple',
          expect.objectContaining({ callbackUrl: expect.any(String) })
        );
      });
    });
  });
});
