import { signIn } from "next-auth/react";
import { useState } from "react";

interface OAuthLoginOptions {
  provider: "google" | "apple";
  redirectTo?: string;
}

interface OAuthState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Senior-level hook for handling OAuth authentication
 * Manages loading states, error handling, and provider-specific logic
 */
export function useOAuthLogin() {
  const [state, setState] = useState<OAuthState>({
    isLoading: false,
    error: null,
  });

  const login = async (options: OAuthLoginOptions) => {
    setState({ isLoading: true, error: null });

    try {
      const result = await signIn(options.provider, {
        redirect: true,
        callbackUrl: options.redirectTo || "/dashboard",
      });

      if (result?.error) {
        setState({
          isLoading: false,
          error: `${options.provider} login failed: ${result.error}`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${options.provider}`;

      setState({
        isLoading: false,
        error: errorMessage,
      });

      console.error(`OAuth login error (${options.provider}):`, error);
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    clearError,
  };
}
