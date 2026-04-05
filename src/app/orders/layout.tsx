import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'My Orders',
  description: 'Track and manage your Selsa orders.',
  path: '/orders',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
