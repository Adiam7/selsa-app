import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'New Collection',
  description: 'Discover the latest arrivals in our new collection.',
  path: '/new-collection',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
