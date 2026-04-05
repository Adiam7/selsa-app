import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Favourites',
  description: 'Your saved favourite products on Selsa.',
  path: '/favourites',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
