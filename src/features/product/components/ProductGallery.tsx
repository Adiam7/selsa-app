// ProductGallery.tsx

import React from "react";
import Image from "next/image";

type ProductGalleryProps = {
  galleryImages: string[];
  selectedImageUrl: string;
  onImageClick: (img: string) => void;
};

const ProductGallery = ({
  galleryImages,
  selectedImageUrl,
  onImageClick,
}: ProductGalleryProps) => (
  <div className="image-gallery flex gap-2 flex-wrap">
    {galleryImages.map((img) => (
      <div key={img}>
        <Image
          src={img}
          alt="Product"
          width={80}
          height={80}
          className={`cursor-pointer border rounded ${
            img === selectedImageUrl ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => onImageClick(img)}
        />
      </div>
    ))}
  </div>
);

export default ProductGallery;
