"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { Upload, Utensils } from "lucide-react";

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

export function FoodProductForm() {
  const { status: sessionStatus } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const NONE = "__none__";

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [activeLang, setActiveLang] = useState<"en" | "ti">("en");
  const localT = (k: string, opts?: any): string => String(t(k, { lng: activeLang, ...opts }));

  const [nameEn, setNameEn] = useState("");
  const [nameTi, setNameTi] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");

  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTi, setDescriptionTi] = useState("");

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

  const [publish, setPublish] = useState<"true" | "false">("false");
  const [stockControl, setStockControl] = useState<"finite" | "infinite" | "preorder">("finite");
  const [stockQuantity, setStockQuantity] = useState("0");

  const [images, setImages] = useState<File[]>([]);
  const imagePreviews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviews]);

  const canCreate = useMemo(() => {
    return (
      nameEn.trim().length > 0 &&
      nameTi.trim().length > 0 &&
      String(price).trim().length > 0
    );
  }, [nameEn, nameTi, price]);

  useEffect(() => {
    if (sku.trim()) return;
    setSku(generateSku("FOOD"));
  }, [sku]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get("/categories/flat/", {
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
  }, [sessionStatus]);

  const filteredCategories = useMemo(() => {
    const withinFood = categories.filter((c) => {
      const slug = String(c.slug || "").toLowerCase();
      const path = String((c as any).path_slugs || "").toLowerCase();
      return slug === "food" || path === "food" || path.startsWith("food/");
    });
    return withinFood.length > 0 ? withinFood : categories;
  }, [categories]);

  const categoryLabel = (c: Category, lang: "en" | "ti") => {
    const ti = (c as any)?.path_name_ti;
    const en = (c as any)?.path_name_en;
    const fromPath = lang === "ti" ? ti : en;
    const fallback = en || ti;
    const fromName = typeof c.name === "object" ? (lang === "ti" ? c.name?.ti : c.name?.en) : nameDisplay(c.name);
    return (fromPath || fromName || fallback || nameDisplay(c.name) || c.slug || c.id) as string;
  };

  const onCreate = async () => {
    if (loading || !canCreate) return;

    let nutrition: any = null;
    const raw = nutritionFactsText.trim();
    if (raw) {
      try {
        nutrition = JSON.parse(raw);
      } catch {
        showError(t("Nutrition facts must be valid JSON."));
        return;
      }
    }

    setLoading(true);
    try {
      const created = await createAdminLocalProduct({
        product_type: "food",
        name: { en: nameEn.trim(), ti: nameTi.trim() },
        sku: sku.trim(),
        price,
        description:
          descriptionEn.trim() || descriptionTi.trim()
            ? { ...(descriptionEn.trim() ? { en: descriptionEn.trim() } : {}), ...(descriptionTi.trim() ? { ti: descriptionTi.trim() } : {}) }
            : null,
        category_id: categoryId || null,
        publish: publish === "true",
        stock_control: stockControl,
        stock_quantity: Math.max(0, Number(stockQuantity || 0)),

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
        ...(weight.trim() ? { weight: Number.parseFloat(weight) } : {}),
      });

      if (images.length > 0) {
        for (let idx = 0; idx < images.length; idx++) {
          try {
            await uploadAdminLocalProductImage(created.id, images[idx], { is_primary: idx === 0 });
          } catch (err: any) {
            showError(getApiErrorMessage(err, localT("Image upload failed.")));
            break;
          }
        }
      }

      success(t("Food product created"));
      router.push("/admin/products");
    } catch (err: any) {
      showError(getApiErrorMessage(err, localT("Create failed.")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{localT("Add New Food Product")}</h1>
          <p className="text-sm text-muted-foreground">{localT("Create a local food product.")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={loading} onClick={() => router.push("/admin/products/new")}
          >
            {localT("Cancel")}
          </Button>
          <Button disabled={loading || !canCreate} onClick={onCreate}>
            {loading ? localT("Creating...") : localT("Create")}
          </Button>
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Utensils className="size-4" /> {localT("Food details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as any)}>
            <TabsList>
              <TabsTrigger value="en">{localT("English")}</TabsTrigger>
              <TabsTrigger value="ti">{localT("Tigrinya")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={activeLang === "en" ? "nameEn" : "nameTi"}>
                {activeLang === "en" ? localT("Name (EN)") : localT("Name (TI)")} *
              </Label>
              <Input
                id={activeLang === "en" ? "nameEn" : "nameTi"}
                value={activeLang === "en" ? nameEn : nameTi}
                onChange={(e) => (activeLang === "en" ? setNameEn(e.target.value) : setNameTi(e.target.value))}
                placeholder={activeLang === "en" ? localT("e.g. Spiced Tea") : localT("e.g. ቅመማ ሻሂ")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sku">{localT("SKU")}</Label>
              <Input id="sku" value={sku} disabled />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">{localT("Price")}</Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={localT("e.g. 12.50")} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="weight">{localT("Weight (kg)")}</Label>
              <Input id="weight" type="number" step="0.001" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={localT("e.g. 0.250")} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="exp">{localT("Best before date (optional)")}</Label>
              <Input id="exp" type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>{localT("Subcategory (optional)")}</Label>
              <Select value={categoryId || NONE} onValueChange={(v) => setCategoryId(v === NONE ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={localT("Select a category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{localT("None")}</SelectItem>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
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

                <div>
                  <Label htmlFor="qty">{localT("Stock quantity")}</Label>
                  <Input id="qty" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="isVegan" className="flex items-center gap-2">
                <input
                  id="isVegan"
                  type="checkbox"
                  aria-label={localT("Vegan")}
                  checked={isVegan}
                  onChange={(e) => setIsVegan(e.target.checked)}
                />
                {localT("Vegan")}
              </Label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="isOrganic" className="flex items-center gap-2">
                <input
                  id="isOrganic"
                  type="checkbox"
                  aria-label={localT("Organic")}
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                />
                {localT("Organic")}
              </Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={activeLang === "en" ? "descEn" : "descTi"}>
                {activeLang === "en" ? localT("Description (EN)") : localT("Description (TI)")}
              </Label>
              <Textarea
                id={activeLang === "en" ? "descEn" : "descTi"}
                value={activeLang === "en" ? descriptionEn : descriptionTi}
                onChange={(e) => (activeLang === "en" ? setDescriptionEn(e.target.value) : setDescriptionTi(e.target.value))}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>{localT("Images")}</Label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Upload className="size-4" />
                  <span>{localT("Upload images")}</span>
                  <span className="text-muted-foreground">{localT("(first image becomes primary)")}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    setImages(files);
                  }}
                />
              </label>

              {imagePreviews.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={src} className="rounded-md border bg-muted p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-20 w-full rounded object-contain" />
                      <div className="mt-1 text-xs text-muted-foreground">{idx === 0 ? localT("Primary") : localT("Gallery")}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={activeLang === "en" ? "ingEn" : "ingTi"}>
                {activeLang === "en" ? localT("Ingredients (EN)") : localT("Ingredients (TI)")}
              </Label>
              <Textarea
                id={activeLang === "en" ? "ingEn" : "ingTi"}
                value={activeLang === "en" ? ingredientsEn : ingredientsTi}
                onChange={(e) => (activeLang === "en" ? setIngredientsEn(e.target.value) : setIngredientsTi(e.target.value))}
                rows={3}
                placeholder={localT("Optional")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={activeLang === "en" ? "allEn" : "allTi"}>
                {activeLang === "en" ? localT("Allergens (EN)") : localT("Allergens (TI)")}
              </Label>
              <Textarea
                id={activeLang === "en" ? "allEn" : "allTi"}
                value={activeLang === "en" ? allergensEn : allergensTi}
                onChange={(e) => (activeLang === "en" ? setAllergensEn(e.target.value) : setAllergensTi(e.target.value))}
                rows={3}
                placeholder={localT("Optional")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor={activeLang === "en" ? "storEn" : "storTi"}>
              {activeLang === "en" ? localT("Storage instructions (EN)") : localT("Storage instructions (TI)")}
            </Label>
            <Textarea
              id={activeLang === "en" ? "storEn" : "storTi"}
              value={activeLang === "en" ? storageEn : storageTi}
              onChange={(e) => (activeLang === "en" ? setStorageEn(e.target.value) : setStorageTi(e.target.value))}
              rows={3}
              placeholder={localT("Optional")}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nutrition">{localT("Nutrition facts (JSON, optional)")}</Label>
            <Textarea
              id="nutrition"
              value={nutritionFactsText}
              onChange={(e) => setNutritionFactsText(e.target.value)}
              rows={4}
              placeholder={localT('e.g. {"calories": 120, "protein_g": 3}')}
            />
          </div>


        </CardContent>
      </Card>
    </section>
  );
}
