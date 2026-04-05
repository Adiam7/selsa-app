import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Return Policy',
  description: 'Selsa return and exchange policy — hassle-free returns.',
  path: '/return',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
