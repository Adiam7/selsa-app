import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Checkout',
  description: 'Complete your Selsa order — secure checkout with multiple payment options.',
  path: '/checkout',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
