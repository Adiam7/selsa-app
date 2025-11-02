// import { useState, useEffect, useCallback, useMemo } from "react";
// import type { Product, Variant } from "@/types/printful_product";

// export type GalleryItem = {
//   key: string;
//   url: string;
//   variantId?: string;
//   color?: string | null;
// };

// interface UseGalleryOptions {
//   skipFirstVariantImage?: boolean; // skip first image of each variant
// }

// export const useGallery = (product: Product, options?: UseGalleryOptions) => {
//   const { skipFirstVariantImage = true } = options ?? {};

//   const initialGallery = useMemo(() => {
//     const seen = new Set<string>();
//     const out: GalleryItem[] = [];

//     const pushUrl = (
//       url?: string | null,
//       keyHint?: string,
//       variantId?: string,
//       color?: string | null
//     ) => {
//       if (!url) return;
//       const trimmed = url.trim();
//       if (!trimmed) return;
//       if (seen.has(trimmed)) return;

//       // Skip printfile-preview only for non-variant images
//       if (!variantId && /printfile-preview/i.test(trimmed)) return;

//       seen.add(trimmed);
//       out.push({
//         key: keyHint ? `${keyHint}::${trimmed}` : `img::${trimmed}`,
//         url: trimmed,
//         variantId,
//         color: color ?? null,
//       });
//     };

//     // 1️⃣ Product gallery
//     for (const g of (product as any).gallery ?? []) {
//       if (typeof g === "string") pushUrl(g, "gallery");
//       else if (g?.url) pushUrl(g.url, "gallery");
//     }

//     // 2️⃣ Main product image
//     pushUrl((product as any).image_url, "main");

//     // 3️⃣ Product mockups
//     for (const m of product.mockups ?? []) pushUrl(m?.url, "mockup");

//     // 4️⃣ Variant images
//     (product.variants ?? []).forEach((v: Variant) => {
//       const variantImages = [v.image_url, ...(v.all_images ?? [])];

//       variantImages.forEach((imgUrl, idx) => {
//         if (!imgUrl) return;

//         // Skip the first image of each variant if option is enabled
//         if (skipFirstVariantImage && idx === 0) return;

//         pushUrl(
//           imgUrl,
//           `variant-${v.id}-${v.color ?? ""}-${v.size ?? ""}-${idx}`,
//           v.id,
//           v.color ?? null
//         );
//       });
//     });

//     return out;
//   }, [product, skipFirstVariantImage]);

//   const [galleryState, setGallery] = useState<GalleryItem[]>([]);
//   const [highlightedIdx, setHighlightedIdx] = useState<number>(0);

//   // Reset gallery when product changes
//   useEffect(() => {
//     setGallery(initialGallery);
//     setHighlightedIdx(0);
//   }, [initialGallery]);

//   // Highlight a specific variant image by variantId
//   const highlightVariantImage = useCallback(
//     (variant: Variant | null) => {
//       if (!variant) return;
//       const idx = galleryState.findIndex((g) => g.variantId === variant.id);
//       if (idx >= 0) setHighlightedIdx(idx);
//     },
//     [galleryState]
//   );

//   // --- NEW: Map of color => gallery items for quick lookup
//   const galleryByColor = useMemo(() => {
//     const map: Record<string, GalleryItem[]> = {};
//     galleryState.forEach((item) => {
//       const colorKey = item.color ?? "default";
//       if (!map[colorKey]) map[colorKey] = [];
//       map[colorKey].push(item);
//     });
//     return map;
//   }, [galleryState]);

//   return {
//     galleryState,
//     highlightedIdx,
//     setHighlightedIdx,
//     setGallery,
//     highlightVariantImage,
//     galleryByColor, // ✅ color mapping helper
//   };
// };
// useGalllery.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Product, Variant } from "@/types/printful_product";

export type GalleryItem = {
  key: string;
  url: string;
  variantId?: string;
  color?: string | null;
};

interface UseGalleryOptions {
  skipFirstVariantImage?: boolean;
  selectedColor?: string | null;
}

export const useGallery = (product: Product, options?: UseGalleryOptions) => {
  const skipFirstVariantImage = options?.skipFirstVariantImage ?? true;
  const selectedColor = options?.selectedColor ?? null;

  // ---------------------------------------------------------------------------
  // 1️⃣ Build initial gallery list
  // ---------------------------------------------------------------------------
  const buildGallery = useCallback((): GalleryItem[] => {
    const seen = new Set<string>();
    const out: GalleryItem[] = [];

    const pushUrl = (
      url?: string | null,
      keyHint?: string,
      variantId?: string,
      color?: string | null
    ) => {
      if (!url) return;
      const trimmed = url.trim();
      if (!trimmed || seen.has(trimmed)) return;
      if (!variantId && /printfile-preview/i.test(trimmed)) return;

      seen.add(trimmed);
      out.push({
        key: keyHint ? `${keyHint}::${trimmed}` : `img::${trimmed}`,
        url: trimmed,
        variantId,
        color: color ?? null,
      });
    };

    // product gallery, main, mockups
    for (const g of (product as any).gallery ?? []) {
      if (typeof g === "string") pushUrl(g, "gallery");
      else if (g?.url) pushUrl(g.url, "gallery");
    }

    pushUrl((product as any).image_url, "main");
    for (const m of product.mockups ?? []) pushUrl(m?.url, "mockup");

    // variant images
    (product.variants ?? []).forEach((v: Variant) => {
      const imgs = [v.image_url, ...(v.all_images ?? [])];
      imgs.forEach((imgUrl, idx) => {
        if (!imgUrl) return;
        if (skipFirstVariantImage && idx === 0) return;
        pushUrl(
          imgUrl,
          `variant-${v.id}-${v.color ?? ""}-${v.size ?? ""}-${idx}`,
          v.id,
          v.color ?? null
        );
      });
    });

    return out;
  }, [product, skipFirstVariantImage]);

  // ---------------------------------------------------------------------------
  // 2️⃣ Memoize initial gallery and set state
  // ---------------------------------------------------------------------------
  const initialGallery = useMemo(() => buildGallery(), [buildGallery]);
  const [galleryState, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  // ---------------------------------------------------------------------------
  // 3️⃣ Reset gallery when product changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setGallery(initialGallery);
    setHighlightedIdx(0);
  }, [initialGallery]);

  // ---------------------------------------------------------------------------
  // 4️⃣ Filter gallery when color changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedColor) {
      setGallery(initialGallery);
      return;
    }

    const filtered = initialGallery.filter(
      (g) => !g.color || g.color === selectedColor
    );
    setGallery(filtered);
    setHighlightedIdx(0);
  }, [selectedColor, initialGallery]);

  // ---------------------------------------------------------------------------
  // 5️⃣ Helpers
  // ---------------------------------------------------------------------------
  const highlightVariantImage = useCallback(
    (variant: Variant | null) => {
      if (!variant) return;
      const idx = galleryState.findIndex((g) => g.variantId === variant.id);
      if (idx >= 0) setHighlightedIdx(idx);
    },
    [galleryState]
  );

  const galleryByColor = useMemo(() => {
    const map: Record<string, GalleryItem[]> = {};
    for (const item of galleryState) {
      const key = item.color ?? "default";
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [galleryState]);

  // ---------------------------------------------------------------------------
  return {
    galleryState,
    highlightedIdx,
    setHighlightedIdx,
    setGallery,
    highlightVariantImage,
    galleryByColor,
  };
};
