import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";

function base64UrlDecodeToString(input: string): string {
  // JWT uses base64url encoding.
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "===".slice((normalized.length + 3) % 4);

  // NextAuth callbacks run on the server (Node), but may also run in edge/browser.
  if (typeof atob === "function") {
    return atob(padded);
  }

  // Node.js fallback
  // eslint-disable-next-line no-undef
  return Buffer.from(padded, "base64").toString("utf8");
}

function tryGetJwtExpMs(jwt: string): number | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecodeToString(parts[1]);
    const payload = JSON.parse(payloadJson);
    if (typeof payload?.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

/**
 * Senior-level NextAuth configuration with multiple OAuth providers
 * Supports: Google, Apple, and Email/Password authentication
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Apple Sign-In Provider
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Credentials provider for email/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Call your backend API to verify credentials
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000";
          const loginUrl = `${backendUrl}/api/accounts/auth/login/`;
          console.log("Attempting login at:", loginUrl);

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log("Response status:", response.status);
          const responseText = await response.text();
          console.log("Response body:", responseText);

          if (!response.ok) {
            console.error("Backend returned error:", response.status, responseText);
            throw new Error(`Backend error: ${response.status}`);
          }

          const data = JSON.parse(responseText);
          
          const user = data.user;
          if (!user) {
            throw new Error("No user data in response");
          }

          // Extract token - backend returns camelCase: accessToken
          const accessToken = data.accessToken || data.access_token || data.token || data.access || null;

          // Extract refresh token in a robust way (support multiple field names)
          const refreshToken = data.refreshToken || data.refresh_token || data.refresh || null;

          const role = user.role || user.user_role || user.userRole || null;
          const isStaff = Boolean(user.is_staff ?? user.isStaff ?? user.staff ?? false);
          const isSuperuser = Boolean(user.is_superuser ?? user.isSuperuser ?? user.superuser ?? false);
          const plan = user.plan || user.subscription_plan || user.subscriptionPlan || null;

          return {
            id: user.id?.toString() || credentials.email,
            email: user.email,
            name: user.username || user.email.split("@")[0],
            image: user.image || null,
            accessToken: accessToken,
            refreshToken: refreshToken, // Also store refresh token
            role,
            is_staff: isStaff,
            is_superuser: isSuperuser,
            plan,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(`Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      },
    }),

    // Magic-link (passwordless) sign-in via token from email
    CredentialsProvider({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          throw new Error("Token required");
        }

        try {
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            process.env.BACKEND_URL ||
            "http://localhost:8000";

          const response = await fetch(
            `${backendUrl}/api/accounts/auth/magic-link/verify/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: credentials.token }),
            },
          );

          if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.error || "Invalid or expired link");
          }

          const data = await response.json();
          const user = data.user;
          if (!user) {
            throw new Error("No user data in response");
          }

          const accessToken =
            data.accessToken || data.access_token || data.token || null;
          const refreshToken =
            data.refreshToken || data.refresh_token || data.refresh || null;

          return {
            id: user.id?.toString() || user.email,
            email: user.email,
            name: user.username || user.email.split("@")[0],
            image: null,
            accessToken,
            refreshToken,
            role: null,
            is_staff: Boolean(user.is_staff ?? false),
            is_superuser: Boolean(user.is_superuser ?? false),
            plan: null,
          };
        } catch (error) {
          console.error("Magic-link auth error:", error);
          throw new Error(
            `Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      },
    }),
  ],

  // Configure callbacks for custom logic
  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials login (email/password or magic-link) — tokens come directly from the backend authorize() response
      if (user && (!account || account.provider === "credentials" || account.provider === "magic-link")) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role ?? null;
        token.is_staff = Boolean((user as any).is_staff ?? false);
        token.is_superuser = Boolean((user as any).is_superuser ?? false);
        token.plan = (user as any).plan ?? null;
        return token;
      }

      // OAuth sign-in — exchange the provider's id_token for Django JWT tokens
      if (account && (account.provider === "google" || account.provider === "apple")) {
        try {
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            process.env.BACKEND_URL ||
            "http://localhost:8000";
          const res = await fetch(
            `${backendUrl}/api/accounts/auth/social/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: account.provider,
                id_token: account.id_token,
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            token.id = data.user?.id?.toString() || token.sub;
            token.email = data.user?.email || (token.email as string);
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken;
            token.role = data.user?.role ?? null;
            token.is_staff = Boolean(data.user?.is_staff ?? false);
            token.is_superuser = Boolean(data.user?.is_superuser ?? false);
            token.plan = data.user?.plan ?? null;
          } else {
            console.error(
              "[AUTH] Social token exchange failed:",
              res.status,
              await res.text().catch(() => "")
            );
          }
        } catch (error) {
          console.error("[AUTH] Social token exchange error:", error);
        }
        return token;
      }

      // Subsequent requests — check if we need to refresh
      if (token.accessToken && token.refreshToken) {
        try {
          const expMs = tryGetJwtExpMs(token.accessToken as string);
          if (!expMs) return token;

          const expiresIn = expMs - Date.now();

          // If less than 30 seconds left (or already expired), refresh NOW
          if (expiresIn < 30 * 1000) {

            try {
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000";
              const refreshPayload = {
                refresh: (token as any).refreshToken,
              };
              if (!refreshPayload.refresh) {
                return token;
              }

              const response = await fetch(`${backendUrl}/api/accounts/auth/refresh/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(refreshPayload),
              });

              if (response.ok) {
                const data = await response.json();
                // Backend returns access_token (snake_case) or similar
                const newAccess = data.access_token || data.access || data.accessToken;
                const newRefresh = data.refresh_token || data.refresh || data.refreshToken;
                if (newAccess) {
                  token.accessToken = newAccess;
                }

                if (newRefresh) {
                  token.refreshToken = newRefresh;
                }
              } else {
                // Token refresh failed — session will expire naturally
              }
            } catch {
              // Refresh failed — session will expire naturally
            }
          }
        } catch {
          // Token parse error — non-fatal
        }
      }

      return token;
    },

    async session({ session, token }) {
      
      // Add custom properties to session
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        // Keep accessToken available to the client for API requests.
        (session.user as any).accessToken = token.accessToken as string;
        (session.user as any).role = (token as any).role ?? null;
        (session.user as any).is_staff = Boolean((token as any).is_staff ?? false);
        (session.user as any).is_superuser = Boolean((token as any).is_superuser ?? false);
        (session.user as any).plan = (token as any).plan ?? null;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },

    async signIn({ user, account, profile }) {
      // Validate user for OAuth providers
      if (account?.provider === "google" || account?.provider === "apple") {
        // You can add additional validation logic here
        // For example, checking if the email domain is allowed
        return true;
      }

      return true;
    },
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - standard e-commerce session duration
    updateAge: 12 * 60 * 60, // Update session every 12 hours
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours - match session timeout
    // Store JWT token in HTTP-only cookie for security
    // Cookie will be automatically sent on all requests (browser's standard behavior)
  },

  // Pages configuration
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/auth/register",
  },

  // Event handlers for comprehensive logging
  events: {
    async signIn({ user, account, isNewUser }) {
      const timestamp = new Date().toISOString();
      const provider = account?.provider || 'unknown';
      const userType = isNewUser ? 'new' : 'returning';
      console.log(`[AUTH] ✅ Sign in | User: ${user.email} | Provider: ${provider} | Type: ${userType} | Time: ${timestamp}`);
      // Log to external service in production
      if (process.env.NODE_ENV === 'production') {
        try {
          const { analytics } = await import('@/lib/services/analytics');
          analytics.trackAuthEvent('login_completed', {
            provider,
            userType,
            userId: user.id,
            email: user.email,
          });
        } catch {
          // Analytics unavailable — non-critical, continue silently
        }
      }
    },

    async signOut({ token }) {
      const timestamp = new Date().toISOString();
      console.log(`[AUTH] 👋 Sign out | User: ${token.email} | Time: ${timestamp}`);
    },
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Security options
  useSecureCookies: process.env.NODE_ENV === "production",
};
