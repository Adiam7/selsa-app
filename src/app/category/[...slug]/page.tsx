// src/app/category/[...slug]/page.tsx

import CategoryClient from "./CategoryClient";
import { redirect } from "next/navigation";
import { Category } from "@/types/category";
import styles from "../page.module.css";
import ProductBadges from "../components/ProductBadges";
import { ProductCardWithWishlist } from "../components/ProductCardWithWishlist";
import { getTrendingProducts } from "@/lib/api/advanced";

type Props = {
  params: { slug?: string[] };
  searchParams?: { page?: string };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

// ✅ Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const slugArray = slug || [];
  const currentSlug = slugArray[slugArray.length - 1] || "Categories";

  return {
    title: `${currentSlug} | Selsa Store`,
    description: `Browse ${currentSlug} products and related categories at Selsa Store.`,
  };
}

export default async function CategoryPage(props: Props) {
  const { slug = [] } = await props.params;
  const searchParams = await props.searchParams;
  const slugArray = slug;
  const fullSlugPath = slugArray.join("/");
  const currentPage = Number(searchParams?.page || 1);
  const limit = 60;

  try {

    // 1️⃣ Fetch the category itself
    const categoryRes = await fetch(`${API_BASE_URL}/categories/${fullSlugPath}/`, {
      next: { revalidate: 60 },
    });
    


    if (!categoryRes.ok) {
      const errorData = await categoryRes.json().catch(() => ({}));

      // Handle 404 specifically
      if (categoryRes.status === 404 || errorData.detail === "Category not found.") {
        redirect(`/shop?category=${encodeURIComponent(fullSlugPath)}`);
      }

      // For any other error (500, 403, etc.)
      console.error("Category fetch error:", errorData);
      throw new Error(`Failed to fetch category: ${categoryRes.statusText}`);
    }

    const category: Category & { children?: Category[] & { product_count?: number }[] } = await categoryRes.json();

    // 2️⃣ Fetch paginated products for this category (leaf or mid-level)
    const lastSlug = slugArray[slugArray.length - 1];
    const productsUrl = `${API_BASE_URL}/catalog/products/?page=${currentPage}&page_size=${limit}&is_available=true&category_slug=${encodeURIComponent(
      (lastSlug || "").toLowerCase()
    )}`;

    // const productsUrl = `${API_BASE_URL}/printful/products/by-category/${lastSlug}/?limit=${limit}&offset=${(currentPage - 1) * limit}`;

    // const productsUrl = `${API_BASE_URL}/products/?category_slug=${fullSlugPath}&limit=${limit}&offset=${
    //   (currentPage - 1) * limit
    // }`;

    const productsRes = await fetch(productsUrl, { next: { revalidate: 60 } });


    if (!productsRes.ok) {
      throw new Error(`Failed to fetch products: ${productsRes.statusText}`);
    }

    const { results: products = [], count = 0 } = await productsRes.json();

    const totalPages = Math.ceil(count / limit);
    // Debug message
    // console.log("Fetched category:", category);
    // console.log(
    //   category.children && category.children.length > 0
    //     ? "🟢 This is a SUBCATEGORY view (shows subcategories)"
    //     : "🔵 This is a LEAF CATEGORY view (shows products)"
    // );

    return (
      <CategoryClient 
        category={category} 
        slugArray={slugArray}
        products={products}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    );
  } catch (error) {
    console.error("Category fetch error:", error);
    redirect(`/shop?category=${encodeURIComponent(fullSlugPath)}`);
    // redirect(`/shop`);
  }
}

// ...existing code...



