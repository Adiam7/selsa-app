"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type Category = { id: string; name: any; slug: string; path_name_en?: string; path_name_ti?: string };

const NONE = "__none__";

export function ClothesProductForm() {
  const { status: sessionStatus } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  // name/description (i18n)
  const [titleEn, setTitleEn] = useState("");
  const [titleTi, setTitleTi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTi, setDescriptionTi] = useState("");

  // sku/price/stock
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [publish, setPublish] = useState<"true" | "false">("false");
  const [stockControl, setStockControl] = useState<"finite" | "infinite" | "preorder">("finite");
  const [stockQuantity, setStockQuantity] = useState("0");

  // clothes-specific
  const [sizesInput, setSizesInput] = useState(""); // comma-separated (S,M,L)
  const [colorsInput, setColorsInput] = useState(""); // comma-separated (Red,Blue)
  const [gender, setGender] = useState<string>("");
  const [fit, setFit] = useState<string>("");
  const [materialEn, setMaterialEn] = useState("");
  const [materialTi, setMaterialTi] = useState("");
  const [careEn, setCareEn] = useState("");
  const [careTi, setCareTi] = useState("");
  const [sizeChartUrl, setSizeChartUrl] = useState("");
  const [weight, setWeight] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const [activeLang, setActiveLang] = useState<"en" | "ti">("en");
  const localT = (key: string, opts?: any) => t(key, { lng: activeLang, ...opts });

  const canCreate = useMemo(() => {
    return titleEn.trim().length > 0 && String(price).trim().length > 0;
  }, [titleEn, price]);

  useEffect(() => {
    if (sku.trim()) return;
    setSku(generateSku("CLOT"));
  }, [sku]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get("/categories/flat/", { params: { include_hidden: true } });
        const data = Array.isArray(res.data) ? (res.data as Category[]) : [];
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  useEffect(() => {
    if (categoryId) return;
    if (categories.length === 0) return;
    const match = categories.find((c) => String(c.slug || "").toLowerCase() === "clothes");
    if (match) setCategoryId(match.id);
  }, [categories, categoryId]);

  const categoryLabel = (c: Category, lang: "en" | "ti") => {
    const ti = (c as any)?.path_name_ti;
    const en = (c as any)?.path_name_en;
    const fromPath = lang === "ti" ? ti : en;
    const fallback = en || ti;
    return (fromPath || fallback || (typeof c.name === "object" ? (lang === "ti" ? c.name?.ti : c.name?.en) : c.name) || c.slug || c.id) as string;
  };

  const parseList = (val: string) => val.split(",").map(s => s.trim()).filter(Boolean);

  const onCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      const payload: any = {
        // no dedicated `clothes` product_type exists in API types — use generic 'product'
        product_type: "product",
        name: { en: titleEn.trim(), ...(titleTi.trim() ? { ti: titleTi.trim() } : {}) },
        sku: sku.trim(),
        price,
        description:
          descriptionEn.trim() || descriptionTi.trim()
            ? {
                ...(descriptionEn.trim() ? { en: descriptionEn.trim() } : {}),
                ...(descriptionTi.trim() ? { ti: descriptionTi.trim() } : {}),
              }
            : null,
        category_id: categoryId || null,
        publish: publish === "true",
        stock_control: stockControl,
        stock_quantity: Math.max(0, Number(stockQuantity || 0)),
        // clothes-specific
        sizes: parseList(sizesInput),
        colors: parseList(colorsInput),
        gender: gender || null,
        fit: fit || null,
        material:
          materialEn.trim() || materialTi.trim()
            ? { ...(materialEn.trim() ? { en: materialEn.trim() } : {}), ...(materialTi.trim() ? { ti: materialTi.trim() } : {}) }
            : null,
        care_instructions:
          careEn.trim() || careTi.trim()
            ? { ...(careEn.trim() ? { en: careEn.trim() } : {}), ...(careTi.trim() ? { ti: careTi.trim() } : {}) }
            : null,
        size_chart_url: sizeChartUrl.trim() || null,
        weight: weight.trim() ? Number.parseFloat(weight) : null,
      };

      const created = await createAdminLocalProduct(payload);

      // upload images if any were attached (first becomes primary)
      if (images.length > 0) {
        for (let idx = 0; idx < images.length; idx++) {
          try {
            await uploadAdminLocalProductImage(created.id, images[idx], { is_primary: idx === 0 });
          } catch (err: any) {
            // Product created; image upload can be retried later — surface toast and stop further uploads
            showError(getApiErrorMessage(err, t("Image upload failed.")));
            break;
          }
        }
      }

      success(t("Local product created"));
      router.push("/admin/products");
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Create failed.")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="pt-2 text-center">
        <h1 className="text-2xl font-bold">{localT("Add New Clothing")}</h1>
        <p className="text-sm text-muted-foreground">{localT("Create a local clothing product.")}</p>
      </div>

      <Card className="shadow-none">
        <CardContent className="space-y-6 pt-8">
          <div className="flex items-center justify-end gap-3">
            <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v === "ti" ? "ti" : "en")}> 
              <TabsList>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="ti">TI</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={activeLang === "en" ? "titleEn" : "titleTi"}>{localT("Product Title")}</Label>
                {activeLang === "en" ? (
                  <Input id="titleEn" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                ) : (
                  <Input id="titleTi" value={titleTi} onChange={(e) => setTitleTi(e.target.value)} placeholder={localT("Optional")} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">{localT("SKU")}</Label>
                <Input id="sku" value={sku} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{localT("Price")}</Label>
                <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={activeLang === "en" ? "materialEn" : "materialTi"}>{localT("Material")}</Label>
                {activeLang === "en" ? (
                  <Input id="materialEn" value={materialEn} onChange={(e) => setMaterialEn(e.target.value)} placeholder={localT("e.g. Cotton")} />
                ) : (
                  <Input id="materialTi" value={materialTi} onChange={(e) => setMaterialTi(e.target.value)} placeholder={localT("Optional")} />
                )}
              </div>

            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={activeLang === "en" ? "descEn" : "descTi"}>{localT("Description")}</Label>
                {activeLang === "en" ? (
                  <Textarea id="descEn" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder={localT("Optional")} />
                ) : (
                  <Textarea id="descTi" value={descriptionTi} onChange={(e) => setDescriptionTi(e.target.value)} placeholder={localT("Optional")} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">{localT("Weight (kg)")}</Label>
                <Input id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={localT("e.g. 0.250")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizeChart">{localT("Size chart URL (optional)")}</Label>
                <Input id="sizeChart" value={sizeChartUrl} onChange={(e) => setSizeChartUrl(e.target.value)} placeholder={localT("https://example.com/size-chart.png")} />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <div className="space-y-2">
              <Label>{localT("Clothing options")}</Label>

              <div className="space-y-2">
                <Label htmlFor="sizes">{localT("Sizes (comma separated)")}</Label>
                <Input id="sizes" value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder={localT("e.g. XS,S,M,L,XL")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">{localT("Colors (comma separated)")}</Label>
                <Input id="colors" value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder={localT("e.g. Red,Blue,Black")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{localT("Gender")}</Label>
                <Select value={gender || NONE} onValueChange={(v) => setGender(v === NONE ? "" : v)}>
                  <SelectTrigger className="w-full" data-testid="gender-select">
                    <SelectValue placeholder={localT("Select a gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{localT("None")}</SelectItem>
                    <SelectItem value="men">{localT("Men")}</SelectItem>
                    <SelectItem value="women">{localT("Women")}</SelectItem>
                    <SelectItem value="unisex">{localT("Unisex")}</SelectItem>
                    <SelectItem value="kids">{localT("Kids")}</SelectItem>
                    <SelectItem value="other">{localT("Other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fit">{localT("Fit")}</Label>
                <Select value={fit || NONE} onValueChange={(v) => setFit(v === NONE ? "" : v)}>
                  <SelectTrigger className="w-full" data-testid="fit-select">
                    <SelectValue placeholder={localT("Select fit")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{localT("None")}</SelectItem>
                    <SelectItem value="slim">{localT("Slim")}</SelectItem>
                    <SelectItem value="regular">{localT("Regular")}</SelectItem>
                    <SelectItem value="oversized">{localT("Oversized")}</SelectItem>
                    <SelectItem value="athletic">{localT("Athletic")}</SelectItem>
                    <SelectItem value="relaxed">{localT("Relaxed")}</SelectItem>
                    <SelectItem value="other">{localT("Other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor={activeLang === "en" ? "careEn" : "careTi"}>{localT("Care instructions")}</Label>
              {activeLang === "en" ? (
                <Textarea id="careEn" value={careEn} onChange={(e) => setCareEn(e.target.value)} placeholder={localT("e.g. Machine wash cold") } />
              ) : (
                <Textarea id="careTi" value={careTi} onChange={(e) => setCareTi(e.target.value)} placeholder={localT("Optional")} />
              )}

              <div className="space-y-2">
                <Label>{localT("Category")}</Label>
                <Select value={categoryId || NONE} onValueChange={(v) => setCategoryId(v === NONE ? "" : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={localT("Select a category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{localT("None")}</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {categoryLabel(c, activeLang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">{localT("Images")}</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={loading}
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                />
              </div>

            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="grid gap-6 md:grid-cols-2 md:gap-x-10 items-center">
            {/* Left: Stock status + Quantity (side-by-side) */}
            <div className="flex items-center gap-6">
              <div>
                <Label className="mb-2 block">{localT("Stock Status")}</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input aria-label={localT("In Stock")} type="radio" name="stockStatus" value="in" checked={stockQuantity !== "0"} onChange={() => setStockQuantity("1")} className="h-4 w-4 accent-black" />
                    {localT("In Stock")}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input aria-label={localT("Out of Stock")} type="radio" name="stockStatus" value="out" checked={stockQuantity === "0"} onChange={() => setStockQuantity("0")} className="h-4 w-4 accent-black" />
                    {localT("Out of Stock")}
                  </label>
                </div>
              </div>

              <div className="w-36">
                <Label htmlFor="stockQty">{localT("Quantity")}</Label>
                <Input id="stockQty" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
              </div>
            </div>

            {/* Right: Publish control aligned to the right */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-3">
                <Label className="mr-2">{localT("Publish")}</Label>
                <Select value={publish} onValueChange={(v) => setPublish(v === "true" ? "true" : "false")}> 
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{localT("Published")}</SelectItem>
                    <SelectItem value="false">{localT("Unpublished")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" disabled={loading} onClick={() => router.push("/admin/products/new")}>{localT("Cancel")}</Button>
            <Button data-testid="create-product-button" disabled={loading || !canCreate} onClick={onCreate}>{loading ? localT("Creating...") : localT("Create Clothing")}</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
