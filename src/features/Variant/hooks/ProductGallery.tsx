"use client";

import React from "react";

export interface GalleryItem {
  id: number;
  imageUrl: string;
  variantId: number; // link directly to variant
}

interface ProductGalleryProps {
  galleryItems?: GalleryItem[];
  highlightedVariantId: number | null;
  onThumbnailClick?: (variantId: number) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  galleryItems = [],
  highlightedVariantId,
  onThumbnailClick,
}) => {
  if (!galleryItems.length) {
    return (
      <div className="text-gray-400 text-sm mt-2">
        No product images available.
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap gallery-container ">
      {galleryItems.map((item, index) => {
        const isHighlighted = item.variantId === highlightedVariantId;

        return (
          <div
            key={`${item.variantId}-${item.id}-${index}`} // ✅ unique key
            className={`gallery-thumbnail border rounded-md p-1 cursor-pointer transition-all duration-150 ${
                        isHighlighted ? "selected" : "border-gray-300"
            }`}
            onClick={() => onThumbnailClick?.(item.variantId)}
          >
            <img
              src={item.imageUrl}
              alt={`Variant ${item.variantId}`}
              width={60}
              height={60}
              className="object-cover rounded-md gallery-thumbnail img "
            />
          </div>
        );
      })}
    </div>
  );
};
