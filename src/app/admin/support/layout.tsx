import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Support Management',
  description: 'Customer support ticket management',
  path: '/admin/support',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
