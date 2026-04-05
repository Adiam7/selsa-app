import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Reports',
  description: 'Business reports and analytics',
  path: '/admin/reports',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
