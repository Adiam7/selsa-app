import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Fulfillment',
  description: 'Order fulfillment management',
  path: '/admin/fulfillment',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
