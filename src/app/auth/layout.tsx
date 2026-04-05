import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Sign In',
  description: 'Sign in or create a Selsa account.',
  path: '/auth',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
