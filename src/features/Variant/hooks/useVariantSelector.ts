"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Variant } from "@/types/printful_product";
import { getColorHex } from "@/utils/colorMap";

export const useVariantSelector = (variants: Variant[]) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [highlightedVariantId, setHighlightedVariantId] = useState<number | null>(null);

  const initializedRef = useRef(false);

  // 🟢 Deduplicate and list colors/sizes
  // const colors = useMemo(
  //   () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
  //   [variants]
  // );
  // const sizes = useMemo(
  //   () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
  //   [variants]
  // );

  // Colors with availability
  const colors = useMemo(() => {
    const map = new Map<string, boolean>();
    variants.forEach((v) => {
      if (!v.color) return;
      map.set(v.color, (map.get(v.color) || false) || v.is_available);
    });
    return Array.from(map.entries()).map(([color, available]) => ({ 
      color, 
      value: getColorHex(color), // Convert color name to hex code
      available 
    }));
  }, [variants]);

  // Sizes filtered by selectedColor
  const sizes = useMemo(() => {
    if (!selectedColor) return [];
    const map = new Map<string, boolean>();
    variants
      .filter((v) => v.color === selectedColor)
      .forEach((v) => {
        if (!v.size) return;
        map.set(v.size, (map.get(v.size) || false) || v.is_available);
      });
    return Array.from(map.entries()).map(([size, available]) => ({ size, available }));
  }, [variants, selectedColor]);



  // 🟢 Automatically select first available variant---fixedby the highlight second.id
   useEffect(() => {
    if (initializedRef.current || !variants.length) return;
    initializedRef.current = true;

    const first = variants.find((v) => v.is_available) ?? variants[0];
    if (!first) return;

    setSelectedColor(first.color ?? null);
    setSelectedSize(first.size ?? null);

    // Get unique images for this variant
    const uniqueImages = [...new Set(first.files?.map((f) => f.preview_url) ?? [])];

    let highlightedId = first.id;

    // If there's a second image, find the variant associated with it
    if (uniqueImages.length > 1) {
      const secondImageUrl = uniqueImages[1];
      const secondVariant = variants.find((v) =>
        v.files?.some((f) => f.preview_url === secondImageUrl)
      );
      if (secondVariant) highlightedId = secondVariant.id;
    }
    setHighlightedVariantId(highlightedId);

  }, [variants]);

  // 🟢 Automatically select first available variant---fixed the highlight first.id
  // useEffect(() => {
  //   if (initializedRef.current || !variants.length) return;
  //   initializedRef.current = true;

  //   const first = variants.find((v) => v.is_available) ?? variants[0];
  //   if (first) {
  //     setSelectedColor(first.color ?? null);
  //     setSelectedSize(first.size ?? null);
  //     setHighlightedVariantId(first.id);
  //   }
  //   console.log(first.color,first.size,first.id)
  //   console.log(first.image_url)
  // }, [variants]);

  // This is last working as well
  // useEffect(() => {
  //   if (initializedRef.current || !variants.length) return;
  //   initializedRef.current = true;

  //   // Find first available variant
  //   const first = variants.find((v) => v.is_available) ?? variants[0];
  //   if (!first) return;

  //   // Get unique images for this variant
  //   const uniqueImages = [...new Set(first.files?.map((f) => f.preview_url) ?? [])];
  //   const displayImage = uniqueImages.length > 1 ? uniqueImages[1] : uniqueImages[0];

  //   setSelectedColor(first.color ?? null);
  //   setSelectedSize(first.size ?? null);

  //   // Skip first variant ID if there are multiple images
  //   // If there's more than one image, find the variant associated with the second image
  //   let highlightedId = first.id;
  //   if (uniqueImages.length > 1) {
  //     const secondImageUrl = uniqueImages[1];
  //     // Find the variant that has this image (usually it's the same variant, but can be used if you have multiple variants sharing images)
  //     const secondVariant = variants.find((v) =>
  //       v.files?.some((f) => f.preview_url === secondImageUrl)
  //     );
  //     if (secondVariant) highlightedId = secondVariant.id;
  //   }

  //   setHighlightedVariantId(highlightedId);
  //   console.log(displayImage, highlightedId);
  // }, [variants]);

  
  // useEffect(() => {
  //   if (initializedRef.current || !variants.length) return;
  //   initializedRef.current = true;

  //   const first = variants.find((v) => v.is_available) ?? variants[0];
  //   if (first) {
  //     setSelectedColor(first.color ?? null);
  //     setSelectedSize(first.size ?? null);
  //     setHighlightedVariantId(first.id);

  //     // Skip first image if there are multiple images
  //     const uniqueImages = [...new Set(first.files?.map((f) => f.preview_url) ?? [])];
  //     const displayImage = uniqueImages.length > 1 ? uniqueImages[1] : uniqueImages[0];
  //     console.log(first.color,first.size)
  //     console.log(displayImage);
  //   }
  // }, [variants]);


  // 🟢 Current selected variant
  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) =>
          v.color === selectedColor &&
          v.size === selectedSize
      ) ?? null,
    [variants, selectedColor, selectedSize]
  );

  // 🟢 Handle color or size selection --- Need fix size gets selected
  // const handleColorSelect = useCallback(
  //   (color: string) => {
  //     setSelectedColor(color);
  //     setSelectedSize(null);

  //     const variant = variants.find((v) => v.color === color);
  //     if (variant) setHighlightedVariantId(variant.id);
  //   },
  //   [variants]
  // );

  // 🟢 Stock availability of selected variant
  const inStock = useMemo(() => {
    return selectedVariant ? selectedVariant.is_available : false;
  }, [selectedVariant]);

  const handleColorSelect = useCallback(
    (color: string) => {
      setSelectedColor(color);

      // Find first available variant for this color
      const variant = variants.find(v => v.color === color && v.is_available);
      if (variant) {
        setSelectedSize(variant.size ?? null);
        setHighlightedVariantId(variant.id);
      } else {
        setSelectedSize(null);
        setHighlightedVariantId(null);
      }
    },
    [variants]
  );


  const handleSizeSelect = useCallback(
    (size: string) => {
      setSelectedSize(size);
      const variant = variants.find(
        (v) => v.size === size && (!selectedColor || v.color === selectedColor)
      );
      if (variant) setHighlightedVariantId(variant.id);
    },
    [variants, selectedColor]
  );

  const handleThumbnailClick = useCallback(
    (variantId: number) => {
      const variant = variants.find((v) => v.id === variantId);
      if (!variant) return;
      setSelectedColor(variant.color ?? null);
      setSelectedSize(variant.size ?? null);
      setHighlightedVariantId(variant.id);
    },
    [variants]
  );

  // 🟢 Build variantImages (for ColorSelector)
  const variantImages = useMemo(() => {
    const map: Record<string, string> = {};
    variants.forEach((v) => {
      if (!v.color || !v.files?.length) return;
      const uniqueImages = [...new Set(v.files.map((f) => f.preview_url))];
      if (uniqueImages.length > 1) {
        // skip the first image (mockup)
        map[v.color] = uniqueImages[1];
      } else if (uniqueImages.length === 1) {
        map[v.color] = uniqueImages[0];
      }
    });
    return map;
  }, [variants]);

  // 🟢 Build galleryItems for ProductGallery (deduped)
  const galleryItems = useMemo(() => {
    const seen = new Set<string>();
    const items = variants.flatMap((v, idx) => {
      if (!v.files) return [];
      const urls = v.files.map((f) => f.preview_url).filter(Boolean);
      const variantImages = urls.length > 1 ? urls.slice(1) : urls;
      return variantImages
        .filter((url) => {
          if (seen.has(url)) return false;
          seen.add(url);
          return true;
        })
        .map((url, i) => ({
          id: idx * 100 + i,
          imageUrl: url,
          variantId: v.id,
        }));
    });
    return items;
  }, [variants]);

  return {
    selectedColor,
    selectedSize,
    selectedVariant,
    highlightedVariantId,
    colors,
    sizes,
    inStock,
    variantImages,
    galleryItems,
    handleColorSelect,
    handleSizeSelect,
    handleThumbnailClick,
  };
};
