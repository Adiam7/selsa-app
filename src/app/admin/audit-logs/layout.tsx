import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Audit Logs',
  description: 'View admin audit logs',
  path: '/admin/audit-logs',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
