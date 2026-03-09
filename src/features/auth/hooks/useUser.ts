// src/features/auth/hooks/useUser.ts

import { useSession } from 'next-auth/react';

export interface User {
  id: string;
  email: string;
  // Add more fields as needed
}

export const useUser = (): { user: User | null; isAuthenticated: boolean } => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const user = isAuthenticated
    ? {
        id: String((session?.user as any)?.id ?? ''),
        email: String(session?.user?.email ?? ''),
      }
    : null;

  return {
    user,
    isAuthenticated,
  };
};
