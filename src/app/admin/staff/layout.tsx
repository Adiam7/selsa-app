import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Staff Management',
  description: 'Manage staff accounts and roles',
  path: '/admin/staff',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
