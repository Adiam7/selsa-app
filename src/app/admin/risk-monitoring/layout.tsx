import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata({
  title: 'Risk Monitoring',
  description: 'Fraud and risk monitoring',
  path: '/admin/risk-monitoring',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
