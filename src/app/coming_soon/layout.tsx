import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Coming Soon',
  description: 'Exciting new products coming soon to Selsa.',
  path: '/coming-soon',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
