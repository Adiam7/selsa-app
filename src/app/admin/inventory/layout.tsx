import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Inventory',
  description: 'Inventory tracking and management',
  path: '/admin/inventory',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
