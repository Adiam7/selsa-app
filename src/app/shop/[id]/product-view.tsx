// product-view.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

import { addToCart } from "@/lib/api/cart";
import { useCart } from "@/features/cart/hooks/useCart";

import { QuantitySelector } from "@/components/QuantitySelector";
import { FavoriteSelector } from "@/components/FavoriteSelector";
import { ColorSelector } from "@/components/ColorSelector";
import { SizeSelector } from "@/components/SizeSelector";
import { SelectedVariantPreview } from "@/components/SelectedVariantPreview";

import { useVariantSelector } from "@/features/Variant/hooks/useVariantSelector";
import { ProductGallery } from "@/features/Variant/hooks/ProductGallery";

import type { Product } from "@/types/printful_product";
import ShareProduct from "@/components/ShareProduct.js";

import "@/components/SizeSelector.css";
import "@/components/ColorSelector.css";
import "@/components/QuantitySelector.css";
import "@/components/FavoriteSelector.css";
import "@/features/Variant/hooks/GallerySelector.css";

/** Helper */
function money(v: number | string | undefined, c?: string) {
  const num = typeof v === "string" ? Number(v) || 0 : v ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c || "USD",
  }).format(num);
}

export default function ProductView({ product }: { product: Product }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/cart";
  const { cart, loading } = useCart();

  const [qty, setQty] = useState<number>(1);
  const [isFavorited, setIsFavorited] = useState(false);

  // --- Auth fallback ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      null;
    setIsAuthenticated(Boolean(token));
  }, []);

  // --- VARIANT SELECTOR ---
  const {
    selectedVariant,
    selectedColor,
    selectedSize,
    colors,
    sizes,
    inStock,
    variantImages,
    galleryItems,
    highlightedVariantId,
    handleColorSelect,
    handleSizeSelect,
    handleThumbnailClick,
    setSize,
  } = useVariantSelector(product.variants);

  // // --- Main image URL derived from highlighted variant ---
  // const mainImageUrl = highlightedVariantId
  //   ? product.variants.find((v) => v.id === highlightedVariantId)?.image_url
  //   : product.variants[0]?.image_url;

  // --- Main image URL derived from highlighted variant ---
  const mainImageUrl = (() => {
    const variant = highlightedVariantId
      ? product.variants.find((v) => v.id === highlightedVariantId)
      : product.variants[0];

    if (!variant) return undefined;

    const uniqueImages = [...new Set(variant.files?.map((f) => f.preview_url) ?? [])];
    // Skip the first image if there are multiple images
    return uniqueImages.length > 1 ? uniqueImages[1] : uniqueImages[0];
  })();

  // --- Add to cart ---
  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant) {
      toast.error("Please select a valid variant.");
      return;
    }

    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    const openCart = Array.isArray(cart)
      ? cart.find((c) => c.status === "open")
      : cart;
    if (!openCart?.id) {
      toast.error("Cart not found.");
      return;
    }

    try {
      await addToCart({
        cartId: openCart.id,
        productVariantId: selectedVariant.id,
        quantity: qty,
        variantColor: selectedColor,
        variantSize: selectedSize,
      });
      toast.success("Added to cart");
      router.push(callbackUrl);
    } catch (err: any) {
      toast.error(
        `Failed: ${err?.response?.data?.error || err?.message || "unknown"}`
      );
    }
  }, [
    selectedVariant,
    qty,
    selectedColor,
    selectedSize,
    isAuthenticated,
    cart,
    router,
    callbackUrl,
  ]);

  const priceLabel = selectedVariant
    ? money(selectedVariant.price, selectedVariant.currency)
    : money(product.variants[0]?.price, product.variants[0]?.currency);

  // --- Render ---
  return (

    <section className="product-detail-container flex flex-col md:flex-row gap-8">
      {/* LEFT: Images */}
      <div className="product-images flex flex-col gap-4">
        <div className="main-image relative">
          {mainImageUrl ? (
            <div className="relative w-[500px] h-[500px]">
              <Image
                src={mainImageUrl}
                alt={product.name}
                width={500}
                height={500}
                className="object-cover rounded-xl"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteSelector
              isFavorited={isFavorited}
              toggleFavorite={() => setIsFavorited(!isFavorited)}
              size={28}
            />
          </div>
        </div>

        {/* GALLERY */}
        {/* <ProductGallery
          galleryItems={variantImages.map((v) => ({
            id: v.id,
            imageUrl: v.image_url,
            variantId: v.id,
          }))}
          
          highlightedVariantId={highlightedVariantId}
          onThumbnailClick={(variantId) => {
            const variant = product.variants.find((v) => v.id === variantId);
            if (variant) handleThumbnailClick(variant);
          }}
        /> */}


        <ProductGallery
          galleryItems={galleryItems}
          highlightedVariantId={highlightedVariantId}
          onThumbnailClick={handleThumbnailClick}
        />


      </div>

      {/* RIGHT: Info */}
      <div className="product_info flex-1 space-y-4">
        <h1 className="product-title text-2xl font-bold">{product.name}</h1>
        <div className="product-price text-xl font-semibold text-gray-800">
          {priceLabel}
        </div>

        {/* Color Selector */}
        <ColorSelector
          colors={colors}
          selectedColor={selectedColor}
          onSelect={handleColorSelect}
          variantImages={variantImages}
        />


        {/* Size Selector */}
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSelect={handleSizeSelect}
          disabledSizes={product.variants
            .filter((v) => v.color === selectedColor && !v.is_available)
            .map((v) => v.size ?? "")}
        />

        {/* Quantity */}
        <QuantitySelector
          qty={qty}
          setQty={setQty}
          min={1}
          max={selectedVariant?.quantity ?? 99}
        />

        {/* Preview */}
        <SelectedVariantPreview
          color={selectedColor}
          size={selectedSize}
          image={mainImageUrl}
        />

        {/* Stock Status */}
        <div
          style={{ color: inStock ? "green" : "red" }}
          className={`stock-status mb-2 font-medium ${
            inStock ? "text-green-800" : "text-red-800"
          }`}
        >
          {inStock ? "Available in stock " : "Out of Stock"}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label="Add to Cart"
          className="add-to-cart-btn px-4 py-2 rounded bg-blue-600 text-white flex items-center gap-2"
          disabled={!inStock || loading || !cart}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>

        {/* Description */}
        {product.description && (
          <div className="product-description mt-6 overflow-auto">
            <p>{product.description}</p>
          </div>
        )}

        {/* Social Share */}
        <ShareProduct productName={product.name} />
      </div>
    </section>
  );
}
