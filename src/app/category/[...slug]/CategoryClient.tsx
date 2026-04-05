"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { ProductCardWithWishlist } from "../components/ProductCardWithWishlist";
import { resolveBackendAssetUrl } from "@/lib/utils/utils";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CategoryClientProps {
  category: Category;
  slugArray: string[];
  products?: Product[];
  totalPages?: number;
  currentPage?: number;
}

export default function CategoryClient({ 
  category, 
  slugArray, 
  products = [],
  totalPages = 1,
  currentPage = 1
}: CategoryClientProps) {
  const { t } = useTranslation();
  const hasSubcategories = category.children && category.children.length > 0;
  const hasProducts = products && products.length > 0;

  const lastSlug = slugArray?.[slugArray.length - 1] || '';
  const showProductsBelowFor = new Set(['t-shirts', 'hoodies', 'sweatshirts']);
  const showProductsBelow = showProductsBelowFor.has(String(lastSlug).toLowerCase());
  
  // Subcategory view (has children)
  if (hasSubcategories) {
    return (
      <div className="category-container">
        <div className="category-header">
          <h1>{category.name_display || (typeof category.name === 'string' ? category.name : category.name?.en || 'Untitled')}</h1>
          <p>{category.children?.length || 0} {t('subcategories available')}</p>
        </div>
        
        <nav className="category-breadcrumb">
          <Link href="/">{t('Home')}</Link>
          <span>/</span>
          <Link href="/shop">{t('Store')}</Link>
          {category.ancestors?.map((ancestor, i) => {
            const path = `/category/${[...category.ancestors!.slice(0, i + 1).map(a => a.slug)].join("/")}`;
            return (
              <React.Fragment key={i}>
                <span>/</span>
                <Link href={path}>{ancestor.name_display}</Link>
              </React.Fragment>
            );
          })}
          <span>/</span>
          <span>{category.name_display || (typeof category.name === 'string' ? category.name : category.name?.en || '')}</span>
        </nav>

        {/* Render subcategories grid */}
        <div className="grid grid-cols-4 gap-6 product-container">
          {category.children?.map((child: Category) => {
            const childSlug = [...slugArray, child.slug].join('/');
            const displayName = child.name_display || (typeof child.name === 'string' ? child.name : child.name?.en || 'Untitled');
            
            return (
              <Link 
                key={child.id} 
                href={`/category/${childSlug}`}
                className="rounded-xl p-4 hover:shadow-md transition hovercontainer"
              >
                <div className="relative w-full aspect-square mb-2 arrowButton">
                  {child.image ? (
                    <Image 
                      src={resolveBackendAssetUrl(child.image) || child.image} 
                      alt={displayName}
                      width={250}
                      height={250}
                      className="object-cover w-full h-64 rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <p className="text-center mt-3 font-semibold">{displayName}</p>
              </Link>
            );
          })}
        </div>

        {/* Products below (for mid-level categories like T-shirts) */}
        {showProductsBelow && hasProducts && (
          <div className="mt-10">
            <div className="grid grid-cols-4 gap-6 product-container">
              {products.map((product: Product) => (
                <ProductCardWithWishlist key={product.printful_id || product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-4">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Link
                    key={i + 1}
                    href={`/category/${slugArray.join('/') }?page=${i + 1}`}
                    className={`px-4 py-2 border rounded ${
                      currentPage === i + 1
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Leaf category view (has products)
  return (
    <div className="category-container">
      <div className="category-header">
        <h1>{category.name_display || (typeof category.name === 'string' ? category.name : category.name?.en || 'Untitled')}</h1>
      </div>
      
      <nav className="category-breadcrumb">
        <Link href="/">{t('Home')}</Link>
        <span>/</span>
        <Link href="/shop">{t('Store')}</Link>
        {category.ancestors?.map((ancestor, i) => {
          const path = `/category/${[...category.ancestors!.slice(0, i + 1).map(a => a.slug)].join("/")}`;
          return (
            <React.Fragment key={i}>
              <span>/</span>
              <Link href={path}>{ancestor.name_display}</Link>
            </React.Fragment>
          );
        })}
        <span>/</span>
        <span>{category.name_display || (typeof category.name === 'string' ? category.name : category.name?.en || '')}</span>
      </nav>

      {/* Products grid */}
      {!hasProducts ? (
        <p className="text-gray-500 text-center">{t('No products found in this category')}</p>
      ) : (
        <div className="grid grid-cols-4 gap-6 product-container">
          {products.map((product: Product) => (
            <ProductCardWithWishlist key={product.printful_id || product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i + 1}
              href={`/category/${slugArray.join('/')}?page=${i + 1}`}
              className={`px-4 py-2 border rounded ${
                currentPage === i + 1
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
