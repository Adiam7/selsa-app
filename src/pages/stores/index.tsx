

import Link from "next/link";
import { useTranslation } from 'react-i18next';

type Store = {
  id: string | number;
  name: string;
};

type Props = {
  stores?: Store[];
};

export default function StoresPage({ stores = [] }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('Stores')}</h1>
      <ul>
        {stores.map((store) => (
          <li key={store.id}>
            {t(store.name)}
            <Link href={`/stores/${store.id}/members`}>{t('Manage Members')}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
