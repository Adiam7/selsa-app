'use client';

import { useMergeCart } from '@/features/cart/hooks/useMergeCart';

export default function MergeCartClient() {
  useMergeCart();

  return null; // This component only runs a hook
}
