import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'About',
  description: 'Learn about Selsa — our story, mission, and unique approach to fashion.',
  path: '/about',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
