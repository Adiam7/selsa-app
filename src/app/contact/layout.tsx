import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Get in touch with the Selsa team.',
  path: '/contact',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
