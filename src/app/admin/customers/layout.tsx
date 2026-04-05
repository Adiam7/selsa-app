import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Customers',
  description: 'Manage customer accounts',
  path: '/admin/customers',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
