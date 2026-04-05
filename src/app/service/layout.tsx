import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Customer Service',
  description: 'Selsa customer service — we are here to help.',
  path: '/service',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
