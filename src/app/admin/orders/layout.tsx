import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Admin Orders',
  description: 'Manage and track orders',
  path: '/admin/orders',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
