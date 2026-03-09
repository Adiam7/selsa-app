// selsa-frontend/src/components/ProductOptionsSelector.tsx

"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductOptionsSelector({
  variants,
  onVariantSelect,
}: {
  variants: any[];
  onVariantSelect?: (variant: any) => void;
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.printful_variant_id);

  function handleSelect(variant: any) {
    setSelectedId(variant.printful_variant_id);
    if (onVariantSelect) onVariantSelect(variant);
  }

  return (
    <div className="flex gap-2">
      {variants.map((variant) => (
        <button
          key={variant.printful_variant_id}
          onClick={() => handleSelect(variant)}
          className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${
            selectedId === variant.printful_variant_id
              ? "border-black"
              : "border-gray-300 hover:border-black"
          }`}
          title={variant.name_display || variant.name}
        >
          {variant.image_url ? (
            <Image
              src={variant.image_url}
              alt={variant.name_display || variant.name}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="bg-gray-200 w-full h-full" />
          )}
        </button>
      ))}
    </div>
  );
}
