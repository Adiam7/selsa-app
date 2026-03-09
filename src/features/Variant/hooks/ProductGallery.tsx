"use client";

import React from "react";
import "./GallerySelector.css";
import { useTranslation } from "react-i18next";

export interface GalleryItem {
  id: number;
  imageUrl: string;
  variantId: number; // link directly to variant
}

interface ProductGalleryProps {
  galleryItems?: GalleryItem[];
  highlightedVariantId: number | null;
  onThumbnailClick?: (variantId: number) => void;
  imageFit?: "cover" | "contain";
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  galleryItems = [],
  highlightedVariantId,
  onThumbnailClick,
  imageFit = "cover",
}) => {
  const { t } = useTranslation();
  if (!galleryItems.length) {
    return (<div className="text-gray-400 text-sm mt-2">{t('No product images available.')}</div>);
  }

  return (
    <div className="gallery-container">
      {galleryItems.map((item, index) => {
        const isHighlighted = item.variantId === highlightedVariantId;

        return (
          <div
            key={`${item.variantId}-${item.id}-${index}`}
            className={`gallery-thumbnail ${isHighlighted ? "selected" : ""}`}
            onClick={() => onThumbnailClick?.(item.variantId)}
          >
            <img
              src={item.imageUrl}
              alt={`Variant ${item.variantId}`}
              width={80}
              height={80}
              className={imageFit === "contain" ? "object-contain" : "object-cover"}
            />
          </div>
        );
      })}
    </div>
  );
};
