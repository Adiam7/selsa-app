// product-view.tsx

"use client";


import { CatalogProductVariant} from "@/types/catalog";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { getDisplayName } from "@/utils/i18nDisplay";
import { useTranslation } from "react-i18next";

import { addToCart } from "@/lib/api/cart";
import { useCart } from "@/features/cart/hooks/useCart";

import { QuantitySelector } from "@/components/QuantitySelector";
import { FavoriteSelector } from "@/components/FavoriteSelector";
import { ColorSelector } from "@/components/ColorSelector";
import { SizeSelector } from "@/components/SizeSelector";
import { SelectedVariantPreview } from "@/components/SelectedVariantPreview";

import { useVariantSelector } from "@/features/Variant/hooks/useVariantSelector";
import { ProductGallery } from "@/features/Variant/hooks/ProductGallery";
import { useFavorites, useInvalidateFavorites } from "@/lib/hooks/useFavorites";
import { toggleFavorite, removeFavoriteByType } from "@/lib/api/favorites";

import type { Product, Variant } from "@/types/printful_product";
import type { CartItem } from "@/types/cart";
import ShareProduct from "@/components/ShareProduct.js";
import { ProductReviews } from "@/components/reviews";
import { useStockPrice } from "@/lib/hooks/useStockPrice";
import { StockPriceBadge } from "@/components/StockPriceBadge";


/** Helper */
function money(v: number | string | undefined, c?: string) {
  const num = typeof v === "string" ? Number(v) || 0 : v ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c || "USD",
  }).format(num);
}


export default function ProductView({ product, catalogProductId }: { product: Product; catalogProductId?: number | null }) {
  // ── Real-time stock & price polling (every 30s) ──
  const { getVariant: getLiveVariant, changedIds: stockChangedIds, clearChanges: clearStockChanges } = useStockPrice({
    productId: catalogProductId ?? undefined,
    intervalMs: 30_000,
    enabled: !!catalogProductId,
  });
  const { t, i18n } = useTranslation();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/cart";
  const { cart,loading,mutate } = useCart();

  const [qty, setQty] = useState<number>(1);

  const isBook = useMemo(() => {
    const skuFromVariants = Array.isArray(product?.variants)
      ? product.variants.some((v: Variant) => String(v?.sku || "").startsWith("Book-"))
      : false;
    const skuFromProduct = String((product as Product & { sku?: string })?.sku || "").startsWith("Book-");
    return skuFromProduct || skuFromVariants;
  }, [product]);
  
  // Reactive product name based on language
  const displayName = useMemo(() => {
    const nameValue = product.name || product.name_display || '';
    if (typeof nameValue === 'object' && nameValue !== null) {
      const localized = nameValue as { en?: string; ti?: string };
      const lang = i18n.language?.toLowerCase().startsWith('ti') ? 'ti' : 'en';
      return localized[lang] || localized.en || localized.ti || '';
    }
    return String(nameValue);
  }, [product, i18n.language]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // --- Get session for authentication ---
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  // --- Get favorites from the main favorites hook ---
  const { data: favorites = [] } = useFavorites();
  const invalidateFavorites = useInvalidateFavorites();

  // --- Check if product is favorited ---
  useEffect(() => {
    console.log("[ProductView] Favorites changed, total favorites:", favorites.length);
    console.log("[ProductView] Current product ID:", product.printful_id);
    
    if (!favorites || favorites.length === 0) {
      console.log("[ProductView] No favorites found, setting isFavorited to false");
      setIsFavorited(false);
      return;
    }

    // Check if this product is in favorites
    const isFav = favorites.some(
      (fav) => fav.content_type_name === "product" && fav.object_id === String(product.printful_id)
    );
    console.log("[ProductView] Product found in favorites:", isFav);
    console.log("[ProductView] All favorites:", favorites.map(f => ({ type: f.content_type_name, id: f.object_id })));
    setIsFavorited(isFav);
  }, [favorites, product.printful_id]);

  // --- Handle favorite toggle ---
  const handleToggleFavorite = useCallback(async () => {
    console.log("[handleToggleFavorite] Starting toggle, isAuthenticated:", isAuthenticated);
    console.log("[handleToggleFavorite] Current isFavorited:", isFavorited);
    
    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }

    setIsTogglingFavorite(true);
    try {
      const productId = String(product.printful_id);
      console.log("[handleToggleFavorite] Calling toggleFavorite API with productId:", productId);
      
      const result = await toggleFavorite("products.product", productId);
      console.log("[handleToggleFavorite] API result:", result);
      
      // Refetch favorites to get the latest state from backend
      console.log("[handleToggleFavorite] Invalidating favorites cache");
      await invalidateFavorites();
      
      const newState = !isFavorited;
      console.log("[handleToggleFavorite] New state should be:", newState);
      toast.success(newState ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      console.error("[handleToggleFavorite] Error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to update favorite";
      toast.error(errorMsg);
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [isFavorited, product.printful_id, isAuthenticated, invalidateFavorites]);

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
  } = useVariantSelector(product.variants);

  // --- Introduce a UI-level max quantity ---
  const MAX_QTY_PER_ITEM = 99;
  useEffect(() => {
    if (qty > MAX_QTY_PER_ITEM) {
      setQty(MAX_QTY_PER_ITEM);
    }
  }, [qty]);


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

    // For books, prefer the full cover image to avoid cropped/square previews.
    if (isBook) {
      const byVariant = variant.image_url;
      if (byVariant && typeof byVariant === 'string') return byVariant;
      const firstPreview = variant.files?.find((f: { preview_url?: string }) => typeof f?.preview_url === 'string')?.preview_url;
      return firstPreview;
    }

    const uniqueImages = [...new Set(variant.files?.map((f) => f.preview_url) ?? [])];
    // Skip the first image if there are multiple images
    return uniqueImages.length > 1 ? uniqueImages[1] : uniqueImages[0];
  })();

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant) {
      toast.error("Please select a valid variant.");
      return;
    }

    // Continue with add to cart logic
    // The variant is already selected and available

    if (!selectedVariant?.sku) {
      console.error("❌ Selected variant has no SKU", selectedVariant);
      toast.error("Variant SKU missing");
      return;
    }

    const sku = selectedVariant.sku;
    console.log("User selected quantity:", qty);


    // 2️⃣ Get open cart
    const openCart = Array.isArray(cart)
      ? cart.find((c) => c.status === "open")
      : cart;

    if (!openCart?.id) {
      toast.error("Cart not found.");
      return;
    }

    // 3️⃣ Optimistic cart
    const optimisticCart = {
      ...openCart,
      items: (() => {
        const existing = openCart.items.find(
          (it: CartItem) => it.sku === selectedVariant.sku
        );
        if (existing) {
          return openCart.items.map((it: CartItem) =>
            it.sku === selectedVariant.sku
              ? { ...it, quantity: it.quantity + qty }
              : it
          );
        }
        return [
          ...openCart.items,
          {
            id: Date.now(),
            variant: selectedVariant,
            // variant_sku: selectedVariant.sku,
            quantity: qty,
            // variant_color: selectedColor,
            // variant_size: selectedSize,
            variant_image: mainImageUrl,
            // variant_price: selectedVariant.price,
            // variant_currency: selectedVariant.currency,
            
          },
        ];
      })(),
    };

    try {
      await mutate(
        async () => {
          const imageForCart =
            mainImageUrl ||
            selectedVariant.files?.[0]?.preview_url ||
            selectedVariant.image_url ||
            product.image_url ||
            "/placeholder.jpg";

          const serverCart = await addToCart({
            cartId: openCart.id,
            variant: selectedVariant,
            image: imageForCart,
            quantity: qty,
            isAuthenticated,
          });
          return serverCart;
        },
        {
          optimisticData: optimisticCart,
          revalidate: true,
          rollbackOnError: true,
        }
      );

      toast.success("Added to cart");
      router.push(callbackUrl);
    } catch (err: unknown) {
      console.error("Add to cart error:", err);
      const axiosErr = err as { response?: { status?: number; data?: { error?: string; code?: string } } };
      const errCode = axiosErr?.response?.data?.code;
      const errMsg = axiosErr?.response?.data?.error;

      if (errCode === "out_of_stock" || errCode === "variant_unavailable") {
        toast.error(errMsg || t("This item is currently out of stock."));
      } else if (errCode === "insufficient_stock") {
        toast.error(errMsg || t("Not enough stock available."));
      } else {
        toast.error(errMsg || "Failed to add to cart");
      }
    }
  }, [
    selectedVariant,
    mainImageUrl,
    qty,
    // selectedColor,
    // selectedSize,
    isAuthenticated,
    cart,
    mutate,
    router,
    callbackUrl,
    // product.catalog_variants,

  ]);


  

  const priceLabel = selectedVariant
    ? money(selectedVariant.price, selectedVariant.currency)
    : money(product.variants[0]?.price, product.variants[0]?.currency);

  // --- Render ---
  return (
    <section className="product-detail-container flex flex-row gap-8">
      {/* LEFT: Images */}
      <div className="product-images flex flex-col gap-4">
        <div
          className={`main-image ${isBook ? "w-[420px] h-[560px]" : "w-[500px] h-[500px]"} rounded-xl overflow-hidden relative`}
        >
          {mainImageUrl ? (
            <Image
              src={mainImageUrl}
              alt={getDisplayName(product)}
              width={isBook ? 420 : 500}
              height={isBook ? 560 : 500}
              className={`${isBook ? "!object-contain" : "object-cover"} w-full h-full`}
              sizes={isBook ? "(max-width: 768px) 100vw, 420px" : "(max-width: 768px) 100vw, 500px"}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
          )}
          <div 
            style={{ 
              position: "absolute",
              top: "16px",
              right: "16px",
              zIndex: 20
            }}
          >
            <FavoriteSelector
              productId={String(product.printful_id)}
              isFavorited={isFavorited}
              toggleFavorite={handleToggleFavorite}
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
          imageFit={isBook ? "contain" : "cover"}
        />


      </div>
      {/* RIGHT: Info */}
      <div className="product_info flex-1 space-y-4">
        <h1 className="product-title text-2xl font-bold">{displayName}</h1>
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
        />

        {/* Quantity */}
        <QuantitySelector
          qty={qty}
          setQty={setQty}
          min={1}
          max={MAX_QTY_PER_ITEM}
        />


        {/* Preview */}
        {/* <SelectedVariantPreview
          color={selectedColor}
          size={selectedSize}
          image={mainImageUrl}
        /> */}

        {/* Stock Status */}
        <div
          style={{ color: inStock ? "green" : "red" }}
          className={`stock-status mb-2 font-medium ${
            inStock ? "text-green-800" : "text-red-800"
          }`}
        >
          {inStock ? t('Available (In stock)') : t('Out of Stock')}
        </div>

        {/* Live stock/price updates */}
        {selectedVariant && (
          <StockPriceBadge
            live={getLiveVariant(selectedVariant.id)}
            displayedPrice={selectedVariant.price}
          />
        )}

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={t('Add to Cart')}
          className="add-to-cart-btn w-full px-4 py-3 rounded bg-black text-white font-semibold text-center"
          disabled={!inStock || loading || !cart}
        >
          {loading ? t('Adding...') : t('Add to Cart')}
        </button>


        {/* Description */}
        {product.description && (
          <div className="product-description mt-6 overflow-auto">
            <p>{product.description_display || (typeof product.description === 'string' ? product.description : product.description?.en || '')}</p>
          </div>
        )}

        {/* Social Share */}
        <ShareProduct productName={displayName} />

        {/* Customer Reviews */}
        <ProductReviews productId={catalogProductId ?? null} />
      </div>
    </section>
  );
}
