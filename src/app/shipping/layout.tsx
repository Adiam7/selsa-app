import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Shipping',
  description: 'Shipping information, rates, and policies for Selsa orders.',
  path: '/shipping',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
