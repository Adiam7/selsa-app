import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Gifts and Events',
  description: 'Find the perfect gift for every occasion.',
  path: '/gift-events',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
