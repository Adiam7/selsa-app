import Link from "next/link";

export function StoreSidebar({ storeId }: { storeId: string }) {
  return (
    <nav>
      <Link href={`/stores/${storeId}`}>{t('Dashboard')}</Link>
      <Link href={`/stores/${storeId}/products`}>{t('Products')}</Link>
      <Link href={`/stores/${storeId}/members`}>{t('Members')}</Link>
      <Link href={`/stores/${storeId}/settings`}>{t('Settings')}</Link>
    </nav>
  );
}
