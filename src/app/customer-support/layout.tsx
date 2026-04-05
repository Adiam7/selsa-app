import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Customer Support',
  description: 'Get help with your Selsa order or account.',
  path: '/customer-support',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
