import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Returns',
  description: 'Start a return or exchange for your Selsa order.',
  path: '/returns',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
