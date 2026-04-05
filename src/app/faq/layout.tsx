import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'FAQ',
  description: 'Frequently asked questions about Selsa orders, shipping, and returns.',
  path: '/faq',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
