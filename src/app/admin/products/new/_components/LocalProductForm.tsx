"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/Toast";

import { apiClient } from "@/lib/api/client";
import { createAdminLocalProduct, uploadAdminLocalProductImage } from "@/lib/api/adminProducts";
import { getApiErrorMessage } from "@/lib/api/error";
import { generateSku } from "@/lib/utils/sku";

type Category = {
  id: string;
  name: any;
  slug: string;
  parent_id?: string | null;
  level?: number;
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

export function AdminLocalProductForm(props: {
  title?: string;
  subtitle?: string;
  defaultCategorySlug?: string;
  skuPrefix?: string;
  cancelHref?: string;
  afterCreateHref?: string;
}) {
  const { title, subtitle, defaultCategorySlug, skuPrefix, cancelHref, afterCreateHref } = props;

  const { t } = useTranslation();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [activeLang, setActiveLang] = useState<"en" | "ti">("en");

  const NONE = "__none__";

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [nameEn, setNameEn] = useState("");
  const [nameTi, setNameTi] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTi, setDescriptionTi] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [additionalCategory1, setAdditionalCategory1] = useState<string>("");
  const [additionalCategory2, setAdditionalCategory2] = useState<string>("");

  const [publish, setPublish] = useState<"true" | "false">("false");
  const [stockControl, setStockControl] = useState<"finite" | "infinite" | "preorder">("finite");
  const [stockQuantity, setStockQuantity] = useState("0");

  const [images, setImages] = useState<File[]>([]);

  const canSubmit = useMemo(() => {
    return nameEn.trim().length > 0 && String(price).trim().length > 0;
  }, [nameEn, price]);

  useEffect(() => {
    if (sku.trim()) return;
    const prefix = (skuPrefix || defaultCategorySlug || "PROD").toUpperCase();
    setSku(generateSku(prefix));
  }, [sku, skuPrefix, defaultCategorySlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get("/api/categories/flat/", {
          params: { include_hidden: true },
        });
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

  useEffect(() => {
    if (!defaultCategorySlug) return;
    if (categoryId) return;
    if (categories.length === 0) return;

    const match = categories.find((c) => String(c.slug || "").toLowerCase() === defaultCategorySlug.toLowerCase());
    if (match) setCategoryId(match.id);
  }, [defaultCategorySlug, categories, categoryId]);

  const categoryLabel = (c: Category) => {
    const ti = (c as any)?.path_name_ti;
    const en = (c as any)?.path_name_en;
    return (ti || en || nameDisplay(c.name) || c.slug || c.id) as string;
  };

  const onCreate = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const created = await createAdminLocalProduct({
        name: { en: nameEn.trim(), ...(nameTi.trim() ? { ti: nameTi.trim() } : {}) },
        sku: sku.trim(),
        price: price,
        description:
          descriptionEn.trim() || descriptionTi.trim()
            ? {
                ...(descriptionEn.trim() ? { en: descriptionEn.trim() } : {}),
                ...(descriptionTi.trim() ? { ti: descriptionTi.trim() } : {}),
              }
            : null,
        category_id: categoryId || null,
        additional_category_ids: [additionalCategory1, additionalCategory2].filter(
          (id) => !!id && id !== categoryId
        ),
        publish: publish === "true",
        stock_control: stockControl,
        stock_quantity: Math.max(0, Number(stockQuantity || 0)),
      });

      if (images.length > 0) {
        for (let idx = 0; idx < images.length; idx++) {
          try {
            await uploadAdminLocalProductImage(created.id, images[idx], { is_primary: idx === 0 });
          } catch (err: any) {
            // Product was created successfully; image upload can be retried later.
            showError(getApiErrorMessage(err, t("Image upload failed.", { lng: activeLang })));
            break;
          }
        }
      }

      success(t("Local product created"));
      router.push(afterCreateHref || "/admin/products");
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Create failed.", { lng: activeLang })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title || t("Add local product", { lng: activeLang })}</h1>
        <p className="text-sm text-muted-foreground">
          {subtitle || t("Create a local (non-Printful) product for the catalog.", { lng: activeLang })}
        </p>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("Product details", { lng: activeLang })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-end gap-3">
            <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v === "ti" ? "ti" : "en")}> 
              <TabsList>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="ti">TI</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor={activeLang === "en" ? "nameEn" : "nameTi"}>{activeLang === "en" ? t("Name (EN)") : t("Name (TI)")} *</Label>
              <Input
                id={activeLang === "en" ? "nameEn" : "nameTi"}
                value={activeLang === "en" ? nameEn : nameTi}
                onChange={(e) => (activeLang === "en" ? setNameEn(e.target.value) : setNameTi(e.target.value))}
                placeholder={activeLang === "en" ? t("e.g. Handmade Hat", { lng: activeLang }) : t("Optional", { lng: activeLang })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sku">{t("SKU", { lng: activeLang })}</Label>
              <Input
                id="sku"
                value={sku}
                disabled
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">{t("Base price", { lng: activeLang })}</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t("e.g. 12.50", { lng: activeLang })}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>{t("Category", { lng: activeLang })}</Label>
              <Select value={categoryId || NONE} onValueChange={(v) => setCategoryId(v === NONE ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Select a category", { lng: activeLang })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("None", { lng: activeLang })}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {categoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="images">{t("Images", { lng: activeLang })}</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={loading}
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                />

                {images.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-4">
                    {images.map((f, i) => (
                      <div key={i} className="rounded-md border bg-muted p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(f)} alt="" className="h-20 w-full rounded object-contain" />
                        <div className="mt-1 text-xs text-muted-foreground">{i === 0 ? t("Primary", { lng: activeLang }) : t("Gallery", { lng: activeLang })}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <Label>{t("Additional category 1", { lng: activeLang })}</Label>
              <Select value={additionalCategory1 || NONE} onValueChange={(v) => setAdditionalCategory1(v === NONE ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Optional", { lng: activeLang })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("None", { lng: activeLang })}</SelectItem>
                  {categories
                    .filter((c) => c.id !== categoryId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {categoryLabel(c)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t("Additional category 2", { lng: activeLang })}</Label>
              <Select value={additionalCategory2 || NONE} onValueChange={(v) => setAdditionalCategory2(v === NONE ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Optional", { lng: activeLang })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("None", { lng: activeLang })}</SelectItem>
                  {categories
                    .filter((c) => c.id !== categoryId && c.id !== additionalCategory1)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {categoryLabel(c)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t("Publish", { lng: activeLang })}</Label>
              <Select value={publish} onValueChange={(v) => setPublish(v as "true" | "false")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">{t("Unpublished", { lng: activeLang })}</SelectItem>
                  <SelectItem value="true">{t("Published", { lng: activeLang })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t("Stock control", { lng: activeLang })}</Label>
              <Select value={stockControl} onValueChange={(v) => setStockControl(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finite">{t("Finite", { lng: activeLang })}</SelectItem>
                  <SelectItem value="infinite">{t("Infinite", { lng: activeLang })}</SelectItem>
                  <SelectItem value="preorder">{t("Preorder", { lng: activeLang })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="stockQty">{t("Stock quantity", { lng: activeLang })}</Label>
              <Input id="stockQty" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor={activeLang === "en" ? "descEn" : "descTi"}>{activeLang === "en" ? t("Description (EN)") : t("Description (TI)")}</Label>
              <Textarea
                id={activeLang === "en" ? "descEn" : "descTi"}
                value={activeLang === "en" ? descriptionEn : descriptionTi}
                onChange={(e) => (activeLang === "en" ? setDescriptionEn(e.target.value) : setDescriptionTi(e.target.value))}
                placeholder={t("Optional", { lng: activeLang })}
                rows={6}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" disabled={loading} onClick={() => router.push(cancelHref || "/admin/products")}>
              {t("Cancel", { lng: activeLang })}
            </Button>
            <Button disabled={loading || !canSubmit} onClick={onCreate}>
              {loading ? t("Creating...", { lng: activeLang }) : t("Create", { lng: activeLang })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
