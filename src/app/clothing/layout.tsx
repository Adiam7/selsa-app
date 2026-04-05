import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Clothing',
  description: 'Browse our clothing collection on Selsa.',
  path: '/clothing',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
