// frontend/src/app/category/[...slug]/CategoryErrorBoundary.tsx
"use client";

import { useEffect } from "react";

export default function CategoryErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Category page error:", error);
  }, [error]);

  return (
    <div>
      <h2>{t('Something went wrong')}</h2>
      <p>{error.message}</p>
      <p>{t('Go back to')}<a href="/shop">{t('Shop')}</a>{t('.')}</p>
    </div>
  );
}
