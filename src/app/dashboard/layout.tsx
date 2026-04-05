import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: 'Dashboard',
  description: 'Your Selsa dashboard',
  path: '/dashboard',
  noIndex: true,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  );
}
