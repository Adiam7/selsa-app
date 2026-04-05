import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Finance',
  description: 'Financial reports and transactions',
  path: '/admin/finance',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
