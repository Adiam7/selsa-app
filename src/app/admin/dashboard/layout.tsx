import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Admin Dashboard',
  description: 'Admin overview and analytics',
  path: '/admin/dashboard',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
