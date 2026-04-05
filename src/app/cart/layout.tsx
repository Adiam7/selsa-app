import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Cart',
  description: 'Review your shopping cart before checkout on Selsa.',
  path: '/cart',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
