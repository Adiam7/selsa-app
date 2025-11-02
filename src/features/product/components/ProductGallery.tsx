// ProductGallery.tsx

import React from "react";
import Image from "next/image";
import { ProductImage } from '@/types/product' // adjust path as needed

type ProductGalleryProps = {
  galleryImages: ProductImage[];
  selectedImageUrl: string;
  onImageClick: (img: ProductImage) => void;
};

const ProductGallery = ({
  galleryImages,
  selectedImageUrl,
  onImageClick,
}: ProductGalleryProps) => (
  <div className="image-gallery flex gap-2 flex-wrap">
    {galleryImages.map((img) => (
      <div key={img.id}>
        <Image
          src={img.image}
          alt={img.alt_text || ""}
          width={80}
          height={80}
          className={`cursor-pointer border rounded ${
            img.image === selectedImageUrl ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onImageClick(img)}
        />
      </div>
    ))}
  </div>
);

export default ProductGallery;
