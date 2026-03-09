"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/Toast";

import { API_BASE_URL, apiClient } from "@/lib/api/client";
import {
  getAdminLocalProductDetail,
  updateAdminLocalProduct,
  uploadAdminLocalProductImage,
  deleteAdminLocalProductImage,
  reorderAdminLocalProductImages,
  setAdminLocalProductImagePrimary,
  type AdminLocalProductDetail,
} from "@/lib/api/adminProducts";
import { getApiErrorMessage } from "@/lib/api/error";

type Category = {
  id: string;
  name: any;
  slug: string;
  path_slugs?: string;
  path_name_en?: string;
  path_name_ti?: string;
};

function nameDisplay(name: any): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (typeof name === "object") return name.en || name.ti || "";
  return "";
}

function resolveImageUrl(url: string | null | undefined): string {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${API_BASE_URL}${trimmed}`;
  return trimmed;
}

export default function AdminEditProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { success, error: showError } = useToast();
  const localT = (k: string, opts?: any) => t(k, { lng: activeLang, ...opts });

  const productId = useMemo(() => Number(params?.id), [params?.id]);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AdminLocalProductDetail | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [additionalCategoryIds, setAdditionalCategoryIds] = useState<string[]>([]);

  const [activeLang, setActiveLang] = useState<"en" | "ti">("en");
  const [showTiMissing, setShowTiMissing] = useState(false);

  const [titleEn, setTitleEn] = useState("");
  const [titleTi, setTitleTi] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTi, setDescriptionTi] = useState("");

  const [isbn, setIsbn] = useState("");
  const [authorEn, setAuthorEn] = useState("");
  const [authorTi, setAuthorTi] = useState("");
  const [publisherEn, setPublisherEn] = useState("");
  const [publisherTi, setPublisherTi] = useState("");
  const [translatedByEn, setTranslatedByEn] = useState("");
  const [translatedByTi, setTranslatedByTi] = useState("");
  const [publicationDate, setPublicationDate] = useState<string>("");
  const [languageEn, setLanguageEn] = useState<string>("");
  const [languageTi, setLanguageTi] = useState<string>("");
  const [genreEn, setGenreEn] = useState<string>("");
  const [genreTi, setGenreTi] = useState<string>("");
  const [pageCount, setPageCount] = useState<string>("");
  const [tagsText, setTagsText] = useState("");

  // Food
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [ingredientsEn, setIngredientsEn] = useState("");
  const [ingredientsTi, setIngredientsTi] = useState("");
  const [allergensEn, setAllergensEn] = useState("");
  const [allergensTi, setAllergensTi] = useState("");
  const [storageEn, setStorageEn] = useState("");
  const [storageTi, setStorageTi] = useState("");
  const [isVegan, setIsVegan] = useState(false);
  const [isOrganic, setIsOrganic] = useState(false);
  const [nutritionFactsText, setNutritionFactsText] = useState<string>("");
  const [weight, setWeight] = useState("");

  // Jewellery
  const [materialEn, setMaterialEn] = useState("");
  const [materialTi, setMaterialTi] = useState("");
  const [gemstoneEn, setGemstoneEn] = useState("");
  const [gemstoneTi, setGemstoneTi] = useState("");
  const [purityEn, setPurityEn] = useState("");
  const [purityTi, setPurityTi] = useState("");
  const [certificationEn, setCertificationEn] = useState("");
  const [certificationTi, setCertificationTi] = useState("");
  const [isHandmade, setIsHandmade] = useState(false);

  const [publish, setPublish] = useState<"true" | "false">("false");
  const [stockControl, setStockControl] = useState<"finite" | "infinite" | "preorder">("finite");
  const [stockQuantity, setStockQuantity] = useState("0");

  const [coverUrl, setCoverUrl] = useState<string>("");
  const [openUrl, setOpenUrl] = useState<string>("");
  const [backUrl, setBackUrl] = useState<string>("");

  const enRequiredOk = useMemo(() => {
    if (detail?.product_type === "book") {
      return titleEn.trim().length > 0 && sku.trim().length > 0 && String(price).trim().length > 0 && authorEn.trim().length > 0;
    }
    if (detail?.product_type === "food") {
      return titleEn.trim().length > 0 && sku.trim().length > 0 && String(price).trim().length > 0;
    }
    return titleEn.trim().length > 0 && sku.trim().length > 0 && String(price).trim().length > 0;
  }, [titleEn, sku, price, authorEn, detail?.product_type]);

  const missingTiFields = useMemo(() => {
    const missing: Array<"title" | "author"> = [];
    if (!titleTi.trim()) missing.push("title");
    if (detail?.product_type === "book" && !authorTi.trim()) missing.push("author");
    return missing;
  }, [titleTi, authorTi, detail?.product_type]);

  const tiRequiredOk = useMemo(() => missingTiFields.length === 0, [missingTiFields.length]);
  const tiTabIsMissing = showTiMissing || missingTiFields.length > 0;
  const canSave = useMemo(() => enRequiredOk && tiRequiredOk, [enRequiredOk, tiRequiredOk]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get("/api/categories/flat/", { params: { include_hidden: true } });
        const data = Array.isArray(res.data) ? (res.data as Category[]) : [];
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const pt = detail?.product_type;
    const target = pt === "food" ? "food" : pt === "book" ? "books" : null;
    if (!target) return categories;

    const within = categories.filter((c) => {
      const slug = String(c.slug || "").toLowerCase();
      const path = String((c as any).path_slugs || "").toLowerCase();
      return slug === target || path === target || path.startsWith(`${target}/`);
    });
    return within.length > 0 ? within : categories;
  }, [categories, detail?.product_type]);

  const categoryLabel = (c: Category, lang: "en" | "ti") => {
    const ti = (c as any)?.path_name_ti;
    const en = (c as any)?.path_name_en;
    const fromPath = lang === "ti" ? ti : en;
    const fallback = en || ti;
    const fromName = typeof c.name === "object" ? (lang === "ti" ? c.name?.ti : c.name?.en) : nameDisplay(c.name);
    return (fromPath || fromName || fallback || nameDisplay(c.name) || c.slug || c.id) as string;
  };

  const syncFromDetail = (d: AdminLocalProductDetail) => {
    // eslint-disable-next-line no-console
    console.log('syncFromDetail called, product_type=', (d as any)?.product_type);
    setDetail(d);
    setTitleEn(String(d?.name?.en || ""));
    setTitleTi(String(d?.name?.ti || ""));
    setSku(String(d?.sku || ""));
    setPrice(String(d?.price ?? ""));
    setDescriptionEn(String(d?.description?.en || ""));
    setDescriptionTi(String(d?.description?.ti || ""));

    setAuthorEn(String((d as any)?.author?.en || ""));
    setAuthorTi(String((d as any)?.author?.ti || ""));
    setIsbn(String((d as any)?.isbn || ""));
    setPublisherEn(String((d as any)?.publisher?.en || ""));
    setPublisherTi(String((d as any)?.publisher?.ti || ""));
    setTranslatedByEn(String((d as any)?.translated_by?.en || ""));
    setTranslatedByTi(String((d as any)?.translated_by?.ti || ""));
    setPublicationDate(String((d as any)?.publication_date || ""));
    setLanguageEn(String((d as any)?.language?.en || ""));
    setLanguageTi(String((d as any)?.language?.ti || ""));
    setGenreEn(String((d as any)?.genre?.en || ""));
    setGenreTi(String((d as any)?.genre?.ti || ""));
    setPageCount((d as any)?.page_count ? String((d as any).page_count) : "");
    setTagsText(Array.isArray((d as any)?.tags) ? ((d as any).tags as string[]).join(", ") : "");

    // Food
    setExpirationDate(String((d as any)?.expiration_date || ""));
    setIngredientsEn(String((d as any)?.ingredients?.en || ""));
    setIngredientsTi(String((d as any)?.ingredients?.ti || ""));
    setAllergensEn(String((d as any)?.allergens?.en || ""));
    setAllergensTi(String((d as any)?.allergens?.ti || ""));
    setStorageEn(String((d as any)?.storage_instructions?.en || ""));
    setStorageTi(String((d as any)?.storage_instructions?.ti || ""));
    setIsVegan(Boolean((d as any)?.is_vegan || false));
    setIsOrganic(Boolean((d as any)?.is_organic || false));
    setNutritionFactsText(
      (d as any)?.nutrition_facts ? JSON.stringify((d as any).nutrition_facts, null, 2) : ""
    );
    setWeight(String((d as any)?.weight ?? ""));

    // Jewellery
    setMaterialEn(String((d as any)?.material?.en || ""));
    setMaterialTi(String((d as any)?.material?.ti || ""));
    setGemstoneEn(String((d as any)?.gemstone?.en || ""));
    setGemstoneTi(String((d as any)?.gemstone?.ti || ""));
    setPurityEn(String((d as any)?.purity?.en || ""));
    setPurityTi(String((d as any)?.purity?.ti || ""));
    setCertificationEn(String((d as any)?.certification?.en || ""));
    setCertificationTi(String((d as any)?.certification?.ti || ""));
    setIsHandmade(Boolean((d as any)?.is_handmade || false));

    setPublish(d.publish ? "true" : "false");
    setStockControl(d.stock_control || "finite");
    setStockQuantity(String(d.stock_quantity ?? 0));

    setCategoryId(d.category_id || "");
    setAdditionalCategoryIds(Array.isArray(d.additional_category_ids) ? d.additional_category_ids : []);

    // Only apply the 3-slot preview layout for books.
    if (d.product_type === "book") {
      const imgs = Array.isArray(d.images) ? d.images : [];
      const primary = imgs.find((x) => x.is_primary) || imgs[0];

      const byAlt = (needle: string) =>
        imgs.find((x) => String((x.alt_text as any)?.en || "").toLowerCase().includes(needle.toLowerCase()));

      setCoverUrl(resolveImageUrl((byAlt("book cover") || primary)?.url));
      setOpenUrl(resolveImageUrl(byAlt("open book")?.url));
      setBackUrl(resolveImageUrl(byAlt("back cover")?.url));
    } else {
      setCoverUrl("");
      setOpenUrl("");
      setBackUrl("");
    }
  };

  const refresh = async () => {
    if (!Number.isFinite(productId) || !productId) return;
    setLoading(true);
    try {
      const d = await getAdminLocalProductDetail(productId);
      syncFromDetail(d);
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Failed to load product.")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // debug: log when detail updates so tests can confirm render path
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('render-effect detail:', detail ? Object.keys(detail) : 'null');

    // debug: check whether test hook is already present in DOM
    // eslint-disable-next-line no-console
    console.log('querySelector admin-edit-page-root (from component):', document.querySelector('[data-testid="admin-edit-page-root"]'));
  }, [detail]);

  const uploadSlot = async (file: File, primary: boolean, alt: string) => {
    if (!detail) return;
    setLoading(true);
    try {
      await uploadAdminLocalProductImage(productId, file, {
        is_primary: primary,
        alt_text: { en: alt },
      });
      await refresh();
      success(t("Image uploaded"));
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Image upload failed.")));
    } finally {
      setLoading(false);
    }
  };

  const orderedImages = useMemo(() => {
    const imgs = Array.isArray(detail?.images) ? detail!.images : [];
    return [...imgs].sort((a, b) => {
      const ap = a.is_primary ? 1 : 0;
      const bp = b.is_primary ? 1 : 0;
      if (ap !== bp) return bp - ap;
      const as = typeof a.sort_order === "number" ? a.sort_order : 0;
      const bs = typeof b.sort_order === "number" ? b.sort_order : 0;
      if (as !== bs) return as - bs;
      return (a.id || 0) - (b.id || 0);
    });
  }, [detail]);

  const persistImageOrder = async (next: { id: number }[]) => {
    if (!detail) return;
    setLoading(true);
    try {
      const ids = next.map((x) => x.id);
      const updated = await reorderAdminLocalProductImages(productId, ids);
      syncFromDetail(updated);
      success(t("Image order updated"));
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Failed to reorder images.")));
    } finally {
      setLoading(false);
    }
  };

  const moveImage = async (imageId: number, dir: -1 | 1) => {
    const imgs = orderedImages;
    const idx = imgs.findIndex((x) => x.id === imageId);
    if (idx < 0) return;

    // Keep the primary image pinned at the top.
    if (imgs[idx]?.is_primary) return;

    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= imgs.length) return;
    if (imgs[swapWith]?.is_primary) return;

    const next = [...imgs];
    const tmp = next[idx];
    next[idx] = next[swapWith];
    next[swapWith] = tmp;

    await persistImageOrder(next);
  };

  const onSetPrimary = async (imageId: number) => {
    if (!detail) return;
    setLoading(true);
    try {
      const updated = await setAdminLocalProductImagePrimary(productId, imageId);
      syncFromDetail(updated);
      success(t("Primary image updated"));
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Failed to set primary image.")));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteImage = async (imageId: number) => {
    if (!detail) return;
    const ok = window.confirm(t("Delete this image?"));
    if (!ok) return;
    setLoading(true);
    try {
      const updated = await deleteAdminLocalProductImage(productId, imageId);
      syncFromDetail(updated);
      success(t("Image deleted"));
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Failed to delete image.")));
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (loading) return;
    if (!enRequiredOk) {
      setActiveLang("en");
      showError(t("Please fill the required English fields before saving."));
      return;
    }
    if (missingTiFields.length > 0) {
      setShowTiMissing(true);
      setActiveLang("ti");
      showError(t("Please fill the required Tigrinya fields before saving."));
      return;
    }

    const cleanIsbn = isbn.trim();
    if (detail?.product_type === "book") {
      if (cleanIsbn && cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
        showError(t("ISBN must be 10 or 13 characters."));
        return;
      }
    }

    let nutrition: any = null;
    if (detail?.product_type === "food") {
      const raw = nutritionFactsText.trim();
      if (raw) {
        try {
          nutrition = JSON.parse(raw);
        } catch {
          showError(t("Nutrition facts must be valid JSON."));
          return;
        }
      }
    }

    setLoading(true);
    try {
      const tags = tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const basePayload: any = {
        name: { en: titleEn.trim(), ...(titleTi.trim() ? { ti: titleTi.trim() } : {}) },
        price,
        description:
          descriptionEn.trim() || descriptionTi.trim()
            ? {
                ...(descriptionEn.trim() ? { en: descriptionEn.trim() } : {}),
                ...(descriptionTi.trim() ? { ti: descriptionTi.trim() } : {}),
              }
            : null,
        category_id: categoryId || null,
        additional_category_ids: additionalCategoryIds,
        publish: publish === "true",
        stock_control: stockControl,
        stock_quantity: Math.max(0, Number(stockQuantity || 0)),
      };

      if (detail?.product_type === "book") {
        Object.assign(basePayload, {
          author: { en: authorEn.trim(), ...(authorTi.trim() ? { ti: authorTi.trim() } : {}) },
          isbn: cleanIsbn ? cleanIsbn : null,
          publisher:
            publisherEn.trim() || publisherTi.trim()
              ? {
                  ...(publisherEn.trim() ? { en: publisherEn.trim() } : {}),
                  ...(publisherTi.trim() ? { ti: publisherTi.trim() } : {}),
                }
              : null,
          translated_by:
            translatedByEn.trim() || translatedByTi.trim()
              ? { ...(translatedByEn.trim() ? { en: translatedByEn.trim() } : {}), ...(translatedByTi.trim() ? { ti: translatedByTi.trim() } : {}) }
              : null,
          publication_date: publicationDate ? publicationDate : null,
          language:
            languageEn || languageTi
              ? { ...(languageEn ? { en: languageEn } : {}), ...(languageTi.trim() ? { ti: languageTi.trim() } : {}) }
              : null,
          genre:
            genreEn || genreTi
              ? { ...(genreEn ? { en: genreEn } : {}), ...(genreTi.trim() ? { ti: genreTi.trim() } : {}) }
              : null,
          page_count: pageCount.trim() ? Number(pageCount) : null,
          tags,
        });
      }

      if (detail?.product_type === "food") {
        Object.assign(basePayload, {
          expiration_date: expirationDate ? expirationDate : null,
          ingredients:
            ingredientsEn.trim() || ingredientsTi.trim()
              ? { ...(ingredientsEn.trim() ? { en: ingredientsEn.trim() } : {}), ...(ingredientsTi.trim() ? { ti: ingredientsTi.trim() } : {}) }
              : null,
          allergens:
            allergensEn.trim() || allergensTi.trim()
              ? { ...(allergensEn.trim() ? { en: allergensEn.trim() } : {}), ...(allergensTi.trim() ? { ti: allergensTi.trim() } : {}) }
              : null,
          storage_instructions:
            storageEn.trim() || storageTi.trim()
              ? { ...(storageEn.trim() ? { en: storageEn.trim() } : {}), ...(storageTi.trim() ? { ti: storageTi.trim() } : {}) }
              : null,
          is_vegan: isVegan,
          is_organic: isOrganic,
          nutrition_facts: nutrition,
          weight: weight.trim() ? Number.parseFloat(weight) : null,
        });
      }

      if (detail?.product_type === "jewellery") {
        Object.assign(basePayload, {
          material:
            materialEn.trim() || materialTi.trim()
              ? { ...(materialEn.trim() ? { en: materialEn.trim() } : {}), ...(materialTi.trim() ? { ti: materialTi.trim() } : {}) }
              : null,
          gemstone:
            gemstoneEn.trim() || gemstoneTi.trim()
              ? { ...(gemstoneEn.trim() ? { en: gemstoneEn.trim() } : {}), ...(gemstoneTi.trim() ? { ti: gemstoneTi.trim() } : {}) }
              : null,
          purity:
            purityEn.trim() || purityTi.trim()
              ? { ...(purityEn.trim() ? { en: purityEn.trim() } : {}), ...(purityTi.trim() ? { ti: purityTi.trim() } : {}) }
              : null,
          certification:
            certificationEn.trim() || certificationTi.trim()
              ? { ...(certificationEn.trim() ? { en: certificationEn.trim() } : {}), ...(certificationTi.trim() ? { ti: certificationTi.trim() } : {}) }
              : null,
          is_handmade: isHandmade,
          weight: weight.trim() ? Number.parseFloat(weight) : null,
        });
      }

      const updated = await updateAdminLocalProduct(productId, basePayload);
      syncFromDetail(updated);
      success(t("Product updated"));
    } catch (err: any) {
      showError(getApiErrorMessage(err, localT("Update failed.")));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-console
  console.log('about to return JSX — detail present?', Boolean(detail));
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-12 px-4 sm:px-6 lg:px-8" data-testid="admin-edit-page-root">
      <div className="pt-2 text-center">
        <h1 className="text-2xl font-bold">
          {detail?.product_type === "food" ? localT("Edit Food Product") : localT("Edit Book")}
        </h1>
        <p className="text-sm text-muted-foreground">{localT("Update details and upload images.")}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          {t("Cancel")}
        </Button>
        <Button disabled={!canSave || loading} onClick={onSave} data-testid="save-changes-button">
          {loading ? t("Saving...") : t("Save changes")}
        </Button>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            {detail?.product_type === "food" ? t("Food details") : t("Book details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as any)}>
            <TabsList>
              <TabsTrigger value="en">{localT("English")}</TabsTrigger>
              <TabsTrigger value="ti" className={tiTabIsMissing ? "text-destructive" : undefined}>
                {localT("Tigrinya")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={activeLang === "en" ? "titleEn" : "titleTi"}>
                {activeLang === "en" ? t("Title (EN)") : t("Title (TI)")}
              </Label>
              <Input
                id={activeLang === "en" ? "titleEn" : "titleTi"}
                value={activeLang === "en" ? titleEn : titleTi}
                onChange={(e) => (activeLang === "en" ? setTitleEn(e.target.value) : setTitleTi(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sku">{t("SKU")}</Label>
              <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} data-testid="sku-input" />
            </div>

            {detail?.product_type === "book" ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor={activeLang === "en" ? "authorEn" : "authorTi"}>
                    {activeLang === "en" ? t("Author (EN)") : t("Author (TI)")}
                  </Label>
                  <Input
                    id={activeLang === "en" ? "authorEn" : "authorTi"}
                    value={activeLang === "en" ? authorEn : authorTi}
                    onChange={(e) => (activeLang === "en" ? setAuthorEn(e.target.value) : setAuthorTi(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={activeLang === "en" ? "translatedByEn" : "translatedByTi"}>
                    {activeLang === "en" ? t("Translated by (EN)") : t("Translated by (TI)")}
                  </Label>
                  <Input
                    id={activeLang === "en" ? "translatedByEn" : "translatedByTi"}
                    value={activeLang === "en" ? translatedByEn : translatedByTi}
                    onChange={(e) => (activeLang === "en" ? setTranslatedByEn(e.target.value) : setTranslatedByTi(e.target.value))}
                  />
                </div>
              </>
            ) : null}

            {detail?.product_type === "jewellery" ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor={activeLang === "en" ? "materialEn" : "materialTi"}>{t("Material")}</Label>
                  <Input
                    id={activeLang === "en" ? "materialEn" : "materialTi"}
                    value={activeLang === "en" ? materialEn : materialTi}
                    onChange={(e) => (activeLang === "en" ? setMaterialEn(e.target.value) : setMaterialTi(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={activeLang === "en" ? "gemstoneEn" : "gemstoneTi"}>{t("Gemstone")}</Label>
                  <Input
                    id={activeLang === "en" ? "gemstoneEn" : "gemstoneTi"}
                    value={activeLang === "en" ? gemstoneEn : gemstoneTi}
                    onChange={(e) => (activeLang === "en" ? setGemstoneEn(e.target.value) : setGemstoneTi(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="weight">{t("Weight (g)")}</Label>
                  <Input id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={t("e.g. 1.25")} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <input id="isHandmade" type="checkbox" checked={isHandmade} onChange={(e) => setIsHandmade(e.target.checked)} className="h-4 w-4 accent-black" />
                    <Label htmlFor="isHandmade">{t("Handmade")}</Label>
                  </div>
                </div>
              </>
            ) : null}

            <div className="space-y-1">
              <Label htmlFor="price">{t("Price")}</Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} data-testid="price-input" />
            </div>

            {detail?.product_type === "book" ? (
              <div className="space-y-1">
                <Label htmlFor="isbn">{t("ISBN")}</Label>
                <Input id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder={t("10 or 13 characters")} />
              </div>
            ) : null}

            {detail?.product_type === "food" ? (
              <>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="exp">{t("Best before date (optional)")}</Label>
                  <Input id="exp" type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="weight">{t("Weight (kg)")}</Label>
                  <Input id="weight" type="number" step="0.001" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={t("e.g. 0.250")} />
                </div>

                <div className="space-y-1">
                  <Label>{t("Vegan")}</Label>
                  <Select value={isVegan ? "true" : "false"} onValueChange={(v) => setIsVegan(v === "true")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t("Yes")}</SelectItem>
                      <SelectItem value="false">{t("No")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>{t("Organic")}</Label>
                  <Select value={isOrganic ? "true" : "false"} onValueChange={(v) => setIsOrganic(v === "true")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t("Yes")}</SelectItem>
                      <SelectItem value="false">{t("No")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}

            <div className="space-y-1">
              <Label>{localT("Publish")}</Label>
              <Select value={publish} onValueChange={(v) => setPublish(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{localT("Published")}</SelectItem>
                  <SelectItem value="false">{localT("Unpublished")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{localT("Stock control")}</Label>
              <Select value={stockControl} onValueChange={(v) => setStockControl(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finite">{localT("Finite")}</SelectItem>
                  <SelectItem value="infinite">{localT("Infinite")}</SelectItem>
                  <SelectItem value="preorder">{localT("Preorder")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="stockQty">{localT("Stock quantity")}</Label>
              <Input id="stockQty" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>{t("Subcategory (optional)")}</Label>
              <Select value={categoryId || ""} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder={localT("Select a category")}/>
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">{localT("No categories available yet.")}</div>
                  ) : (
                    filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {categoryLabel(c, activeLang)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="tags">{localT("Tags")}</Label>
              <Input id="tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder={localT("e.g. fiction, self-help")}/>
            </div>
          </div>

          {detail?.product_type === "book" ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: t("Cover"), url: coverUrl, primary: true, alt: "Book Cover" },
                { label: t("Open book"), url: openUrl, primary: false, alt: "Open Book" },
                { label: t("Back cover"), url: backUrl, primary: false, alt: "Back Cover" },
              ].map((tile) => (
                <div key={tile.alt} className="space-y-2">
                  <div className="text-sm font-medium">{tile.label}</div>
                  <label className="block cursor-pointer rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                        {tile.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tile.url} alt={tile.alt} className="h-full w-full object-contain p-2" />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{t("Click to upload")}</div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        void uploadSlot(f, tile.primary, tile.alt);
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="text-sm font-medium">{localT("All images")}</div>
            {orderedImages.length === 0 ? (
              <div className="text-sm text-muted-foreground">{localT("No images uploaded yet.")}</div>
            ) : (
              <div className="space-y-2">
                {orderedImages.map((img, index) => (
                  <div key={img.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveImageUrl(img.url)} alt="" className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {img.is_primary ? (
                            <span className="font-medium">{localT("Primary")}</span>
                          ) : (
                            <span className="text-muted-foreground">{localT("Gallery")}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {String((img.alt_text as any)?.en || (img.alt_text as any)?.ti || "").trim() || t("No alt text")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={loading || img.is_primary}
                        onClick={() => void onSetPrimary(img.id)}
                      >
                        {localT("Set primary")}
                      </Button>

                      <Button
                        variant="outline"
                        disabled={loading || img.is_primary || index === 0}
                        onClick={() => void moveImage(img.id, -1)}
                      >
                        {localT("Up")}
                      </Button>

                      <Button
                        variant="outline"
                        disabled={loading || img.is_primary || index === orderedImages.length - 1}
                        onClick={() => void moveImage(img.id, 1)}
                      >
                        {localT("Down")}
                      </Button>

                      <Button
                        variant="outline"
                        disabled={loading}
                        onClick={() => void onDeleteImage(img.id)}
                      >
                        {localT("Delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={activeLang === "en" ? "descEn" : "descTi"}>
                {activeLang === "en" ? t("Description (EN)") : t("Description (TI)")}
              </Label>
              <Textarea
                id={activeLang === "en" ? "descEn" : "descTi"}
                value={activeLang === "en" ? descriptionEn : descriptionTi}
                onChange={(e) => (activeLang === "en" ? setDescriptionEn(e.target.value) : setDescriptionTi(e.target.value))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              {detail?.product_type === "book" ? null : (
                <>
                  <div className="text-sm font-medium">{localT("Upload images")}</div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={loading}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      // upload in order; first becomes primary
                      for (let i = 0; i < files.length; i++) {
                        await uploadSlot(files[i], i === 0, i === 0 ? "Primary" : "Gallery");
                      }
                      e.target.value = "";
                    }}
                  />
                  <div className="text-xs text-muted-foreground">{localT("First image will be set as primary.")}</div>
                </>
              )}
            </div>
          </div>

          {detail?.product_type === "jewellery" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={activeLang === "en" ? "purityEn" : "purityTi"}>{activeLang === "en" ? t("Purity / Karat (EN)") : t("Purity / Karat (TI)")}</Label>
                <Input
                  id={activeLang === "en" ? "purityEn" : "purityTi"}
                  value={activeLang === "en" ? purityEn : purityTi}
                  onChange={(e) => (activeLang === "en" ? setPurityEn(e.target.value) : setPurityTi(e.target.value))}
                  data-testid="purity-en-input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={activeLang === "en" ? "certificationEn" : "certificationTi"}>{activeLang === "en" ? t("Certification (EN)") : t("Certification (TI)")}</Label>
                <Input
                  id={activeLang === "en" ? "certificationEn" : "certificationTi"}
                  value={activeLang === "en" ? certificationEn : certificationTi}
                  onChange={(e) => (activeLang === "en" ? setCertificationEn(e.target.value) : setCertificationTi(e.target.value))}
                  data-testid="certification-en-input"
                />
              </div>
            </div>
          ) : null}

          {detail?.product_type === "food" ? (
            <>
              <div className="space-y-1">
                <Label htmlFor={activeLang === "en" ? "ingEn" : "ingTi"}>
                  {activeLang === "en" ? t("Ingredients (EN)") : t("Ingredients (TI)")}
                </Label>
                <Textarea
                  id={activeLang === "en" ? "ingEn" : "ingTi"}
                  value={activeLang === "en" ? ingredientsEn : ingredientsTi}
                  onChange={(e) => (activeLang === "en" ? setIngredientsEn(e.target.value) : setIngredientsTi(e.target.value))}
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={activeLang === "en" ? "allEn" : "allTi"}>
                  {activeLang === "en" ? t("Allergens (EN)") : t("Allergens (TI)")}
                </Label>
                <Textarea
                  id={activeLang === "en" ? "allEn" : "allTi"}
                  value={activeLang === "en" ? allergensEn : allergensTi}
                  onChange={(e) => (activeLang === "en" ? setAllergensEn(e.target.value) : setAllergensTi(e.target.value))}
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={activeLang === "en" ? "stEn" : "stTi"}>
                  {activeLang === "en" ? t("Storage instructions (EN)") : t("Storage instructions (TI)")}
                </Label>
                <Textarea
                  id={activeLang === "en" ? "stEn" : "stTi"}
                  value={activeLang === "en" ? storageEn : storageTi}
                  onChange={(e) => (activeLang === "en" ? setStorageEn(e.target.value) : setStorageTi(e.target.value))}
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nf">{t("Nutrition facts (JSON)")}</Label>
                <Textarea id="nf" value={nutritionFactsText} onChange={(e) => setNutritionFactsText(e.target.value)} rows={6} />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
