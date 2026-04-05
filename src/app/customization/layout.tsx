import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Customization',
  description: 'Customize products to make them uniquely yours.',
  path: '/customization',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
