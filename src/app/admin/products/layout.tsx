import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Products Management',
  description: 'Product catalog management',
  path: '/admin/products',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
