"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { AdminLocalProductForm } from "../_components/LocalProductForm";
import { BookProductForm } from "./_components/BookProductForm";
import { FoodProductForm } from "./_components/FoodProductForm";
import { JewelleryProductForm } from "./_components/JewelleryProductForm";
import { BeautyProductForm } from "./_components/BeautyProductForm";
import { BeautySelection } from "./_components/BeautySelection";
import { ClothesProductForm } from "./_components/ClothesProductForm";

const TYPE_CONFIG: Record<
  string,
  { title: string; subtitle: string; defaultCategorySlug?: string }
> = {
  beauty: {
    title: "Add New Beauty Product",
    subtitle: "Create a local beauty product.",
    defaultCategorySlug: "beauty",
  },
  books: {
    title: "Add New Book",
    subtitle: "Create a local book product.",
    defaultCategorySlug: "books",
  },
  clothes: {
    title: "Add New Clothing",
    subtitle: "Create a local clothing product.",
    defaultCategorySlug: "clothes",
  },
  food: {
    title: "Add New Food Product",
    subtitle: "Create a local food product.",
    defaultCategorySlug: "food",
  },
  jewellery: {
    title: "Add New Jewellery",
    subtitle: "Create a local jewellery product.",
    defaultCategorySlug: "jewellery",
  },
  digital: {
    title: "Add New Digital Product",
    subtitle: "Create a local digital product.",
    defaultCategorySlug: "digital",
  },
};

export default function AdminNewLocalProductByTypePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();

  const type = String((params as any)?.type || "").toLowerCase();

  const cfg = useMemo(() => TYPE_CONFIG[type], [type]);

  useEffect(() => {
    if (!cfg) router.replace("/admin/products/new");
  }, [cfg, router]);

  if (!cfg) return null;

  if (type === "books") {
    return <BookProductForm />;
  }

  if (type === "food") {
    return <FoodProductForm />;
  }

  if (type === "jewellery") {
    return <JewelleryProductForm />;
  }

  if (type === "beauty") {
    return <BeautySelection />;
  }

  if (type === "clothes") {
    return <ClothesProductForm />;
  }

  return (
    <AdminLocalProductForm
      title={t(cfg.title)}
      subtitle={t(cfg.subtitle)}
      defaultCategorySlug={cfg.defaultCategorySlug}
      skuPrefix={type}
      cancelHref="/admin/products/new"
      afterCreateHref="/admin/products"
    />
  );
}
