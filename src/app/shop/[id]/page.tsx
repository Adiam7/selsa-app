// src/app/shop/[id]/page.tsx

import ProductView from "./product-view";
import ProductStructuredData from "./product-structured-data";
import { getProduct } from "@/lib/api/api";
import { getCatalogProductByExternalId } from "@/lib/api/catalog";
import { Product } from "@/types/printful_product";
import type { CatalogProduct, CatalogProductVariant } from "@/types/catalog";
import { resolveBackendAssetUrl } from "@/lib/utils/utils";
import { redirect } from "next/navigation";


type Props = {
  params: Promise<{ id: string }>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

interface ProductFile {
  preview_url?: string;
  url?: string;
  type?: string;
}

function toFilesFromImages(images: unknown): ProductFile[] {
  if (!images) return [];

  // If backend already sent a Printful-like files array, keep it
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === "object") {
    const first = images[0] as ProductFile;
    if (first && ("preview_url" in first || "url" in first)) return images as ProductFile[];
  }

  const urls: string[] = Array.isArray(images)
    ? (images as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

  return urls
    .map((url) => resolveBackendAssetUrl(url) || url)
    .map((url) => ({ preview_url: url, url }));
}

function adaptCatalogProductToShopProduct(catalog: CatalogProduct): Product {
  const safeCatalogId = Number(catalog?.id);
  const pseudoPrintfulId = Number.isFinite(safeCatalogId)
    ? 1_000_000_000_000 + safeCatalogId
    : 1_000_000_000_000;

  const productImages: string[] = Array.isArray(catalog?.all_images)
    ? catalog.all_images
    : [];
  const fallbackImageRaw = catalog?.image_url ?? productImages[0] ?? null;
  const fallbackImage = resolveBackendAssetUrl(fallbackImageRaw) ?? fallbackImageRaw;

  const variants = Array.isArray(catalog?.variants) ? catalog.variants : [];
  const adaptedVariants = variants.map((v: CatalogProductVariant) => {
    const variantImageUrlRaw = v?.image_url ?? null;
    const variantImageUrl = resolveBackendAssetUrl(variantImageUrlRaw) ?? variantImageUrlRaw;

    const variantAllImagesRaw: string[] = Array.isArray(v?.all_images) ? v.all_images : [];

    // Local catalog variants often have `all_images: []` even when the product has images.
    // Fall back to the catalog product image(s) so the detail page can render.
    const baseImagesRaw = variantAllImagesRaw.length
      ? variantAllImagesRaw
      : (fallbackImage ? [fallbackImage] : []);

    const variantImages = Array.from(
      new Set([
        variantImageUrl,
        ...baseImagesRaw.map((u) => resolveBackendAssetUrl(u) ?? u),
      ].filter(Boolean))
    ) as string[];

    const files = toFilesFromImages(
      Array.isArray(v?.files_json) && v.files_json.length > 0 ? v.files_json : variantImages
    );

    return {
      id: Number(v?.id),
      name: catalog?.name ?? catalog?.name_display ?? "Product",
      name_display: (v as any)?.product_name_display ?? catalog?.name_display,
      sku: v?.sku ?? null,
      price: Number(v?.price ?? catalog?.price ?? 0) || 0,
      image_url: variantImageUrl ?? fallbackImage,
      all_images: variantImages,
      is_available: Boolean(v?.is_available ?? true),
      color: null,
      size: null,
      currency: "USD",
      files,
      external_id: v?.external_id ?? null,
    };
  });

  const gallery = Array.from(
    new Set(
      adaptedVariants
        .flatMap((v: { all_images?: string[] }) => (Array.isArray(v?.all_images) ? v.all_images : []))
        .filter(Boolean)
    )
  );

  return {
    printful_id: pseudoPrintfulId,
    name: catalog?.name ?? catalog?.name_display ?? "Product",
    name_display: catalog?.name_display,
    description: catalog?.description ?? null,
    description_display: catalog?.description_display,
    category: null,
    image_url: fallbackImage,
    variants: adaptedVariants,
    mockups: [],
    gallery,
    colors: [],
    sizes: [],
  } as Product;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  let title: string = "Product";
  let img: string | undefined = undefined;

  if (id.startsWith("c-")) {
    const catalogId = id.slice(2);
    const res = await fetch(`${API_BASE_URL}/catalog/products/${catalogId}/`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const catalog = await res.json();
      title = catalog?.name_display ?? catalog?.name ?? "Product";
      img = catalog?.image_url ?? (Array.isArray(catalog?.all_images) ? catalog.all_images[0] : undefined);
    }
  } else {
    const product: Product = await getProduct(id, 900);
    title = product?.name_display ?? String(product?.name) ?? "Product";
    img = product?.image_url ?? product?.mockups?.[0]?.url;
  }

  return {
    title,
    openGraph: {
      images: [img],
    },
  };
}


export default async function Page({ params }: Props) {
  const { id } = await params;

  if (!id || id === "null" || id === "undefined") {
    redirect("/shop");
  }

  // Catalog products (local + fallback printful) are linked as:
  // - /shop/c-<catalogId>  (local)
  // - /shop/cp-<catalogId> (printful when Printful ID missing)
  if (id.startsWith("c-") || id.startsWith("cp-")) {
    const catalogId = id.startsWith("cp-") ? id.slice(3) : id.slice(2);
    const res = await fetch(`${API_BASE_URL}/catalog/products/${catalogId}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch catalog product");
    }
    const catalogProduct = await res.json();
    const adapted = adaptCatalogProductToShopProduct(catalogProduct);
    return (
      <>
        <ProductStructuredData product={adapted} pagePath={`/shop/${id}`} catalogProductId={Number(catalogId)} />
        <ProductView product={adapted} catalogProductId={Number(catalogId)} />
      </>
    );
  }

  // 1️⃣ Fetch Printful product
  const printfulProduct: Product = await getProduct(id);
  // console.log("Printful Product:", printfulProduct);

  // 2️⃣ Use REAL Printful product ID
  const externalProductId = String(printfulProduct.printful_id);
  // console.log("Using Printful PRODUCT ID:", externalProductId);

  // 3️⃣ Fetch catalog product by external_product_id
  let catalogProduct = null;
  if (externalProductId) {
    try {
      catalogProduct = await getCatalogProductByExternalId(externalProductId);
      console.log("Fetched Catalog Product:", catalogProduct);
    } catch (error: unknown) {
      // Catalog product not found is okay - it means the product hasn't been synced yet
      const axiosErr = error as { response?: { status?: number } };
      if (axiosErr?.response?.status === 404) {
        console.log("Catalog product not found (404) - product not synced yet");
      } else {
        console.error("Error fetching catalog product:", error);
      }
    }
  }

  // 4️⃣ Merge catalog variants into Printful product
  const combinedProduct = {
    ...printfulProduct,
    catalog_variants: catalogProduct?.variants || [],
  };

  console.log("Combined Product:", combinedProduct);

  // 5️⃣ Render
  return (
    <>
      <ProductStructuredData product={combinedProduct} pagePath={`/shop/${id}`} catalogProductId={catalogProduct?.id ?? null} />
      <ProductView product={combinedProduct} catalogProductId={catalogProduct?.id ?? null} />
    </>
  );
}
