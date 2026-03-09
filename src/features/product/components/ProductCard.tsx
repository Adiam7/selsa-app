'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSafeImageUrl } from "@/lib/utils/utils";
import { FavoriteSelector } from "@/components/FavoriteSelector";
import { getDisplayName } from "@/utils/i18nDisplay";

export default function ProductCard({ product }: { product: any }) {
  return (
    <div className="border rounded-xl p-4 hover:shadow-md transition relative bg-white">
      {/* Image container */}
      <div className="relative w-full aspect-square mb-3">
        <Link href={`/product/${product.slug}`} className="block">
          <Image
            src={getSafeImageUrl(product)}
            alt={getDisplayName(product)}
            width={250}
            height={250}
            className="object-cover w-full h-64 rounded-xl"
          />
        </Link>

        {/* Favorite Button using FavoriteSelector component */}
        <div className="absolute bottom-6 right-3 z-10">
          <FavoriteSelector
            productId={product.id}
            contentType="products.product"
            size={24}
          />
        </div>
      </div>

      {/* Product Name and Price */}
      <div className="w-full text-center flex flex-col items-center">
        <Link href={`/product/${product.slug}`} className="hover:underline">
          <p className="font-semibold text-base line-clamp-2">{getDisplayName(product)}</p>
        </Link>
        <p className="text-gray-700">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}
