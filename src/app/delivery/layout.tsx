import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Delivery',
  description: 'Delivery options and estimated shipping times for Selsa.',
  path: '/delivery',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
