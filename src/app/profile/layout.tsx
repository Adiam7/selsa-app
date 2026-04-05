import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Profile',
  description: 'Manage your Selsa account settings.',
  path: '/profile',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
