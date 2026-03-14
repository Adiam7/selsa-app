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
import { Upload } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { createAdminLocalProduct, uploadAdminLocalProductImage } from "@/lib/api/adminProducts";
import { getApiErrorMessage } from "@/lib/api/error";
import { generateSku } from "@/lib/utils/sku";

// Subcategory sub-forms
import { HairProductForm } from './HairProductForm';
import { PerfumeProductForm } from './PerfumeProductForm';
import { BodyScrubProductForm } from './BodyScrubProductForm';

type Category = {
  id: string;
  name: any;
  slug: string;
  path_slugs?: string;
  path_name_en?: string;
  path_name_ti?: string;
};

export function BeautyProductForm({ initialSubcategory, hideSelector }: { initialSubcategory?: string; hideSelector?: boolean } = {}) {
  const { status: sessionStatus } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const localT = (key: string, opts?: any) => t(key, { lng: activeLang, ...opts });

  const NONE = "__none__";

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [activeLang, setActiveLang] = useState<"en" | "ti">("en");

  // Generic fields
  const [nameEn, setNameEn] = useState("");
  const [nameTi, setNameTi] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTi, setDescriptionTi] = useState("");

  const [publish, setPublish] = useState<"true" | "false">("false");
  const [stockControl, setStockControl] = useState<"finite" | "infinite" | "preorder">("finite");
  const [stockQuantity, setStockQuantity] = useState("0");

  const [images, setImages] = useState<File[]>([]);
  const imagePreviews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  useEffect(() => {
    if (sku.trim()) return;
    setSku(generateSku("BEAU"));
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

  const filteredCategories = useMemo(() => {
    const withinBeauty = categories.filter((c) => {
      const slug = String(c.slug || "").toLowerCase();
      const path = String((c as any).path_slugs || "").toLowerCase();
      return slug === "beauty" || path === "beauty" || path.startsWith("beauty/");
    });
    return withinBeauty.length > 0 ? withinBeauty : categories;
  }, [categories]);

  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId) || null, [categories, categoryId]);
  const selectedSubcategorySlug = useMemo(() => {
    if (!selectedCategory) return "";
    const slug = String(selectedCategory.slug || "").toLowerCase();
    const path = String((selectedCategory as any).path_slugs || "").toLowerCase();
    if (path && path.includes("beauty/")) return path.split("/")[1] || slug;
    return slug;
  }, [selectedCategory]);

  // UI-driven subcategory selector (buttons) — takes precedence over category selection
  const [uiSelectedSubcategory, setUiSelectedSubcategory] = useState<string>(initialSubcategory || "");

  const effectiveSubcategory = uiSelectedSubcategory || selectedSubcategorySlug;

  // --- Hair-specific ---
  const [hairTypeEn, setHairTypeEn] = useState("");
  const [hairTypeTi, setHairTypeTi] = useState("");
  const [lengthValue, setLengthValue] = useState("");
  const [colorEn, setColorEn] = useState("");
  const [colorTi, setColorTi] = useState("");
  const [textureEn, setTextureEn] = useState("");
  const [textureTi, setTextureTi] = useState("");
  const [originEn, setOriginEn] = useState("");
  const [originTi, setOriginTi] = useState("");
  const [isVirgin, setIsVirgin] = useState(false);
  const [isLace, setIsLace] = useState(false);

  // --- Perfume-specific ---
  const [volumeMl, setVolumeMl] = useState("");
  const [concentration, setConcentration] = useState("");
  const [fragranceFamily, setFragranceFamily] = useState("");
  const [scentNotesEn, setScentNotesEn] = useState("");
  const [scentNotesTi, setScentNotesTi] = useState("");

  // --- Body-scrub-specific ---
  const [scrubWeight, setScrubWeight] = useState("");
  const [ingredientsEn, setIngredientsEn] = useState("");
  const [ingredientsTi, setIngredientsTi] = useState("");
  const [skinType, setSkinType] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);

  const canCreate = useMemo(() => {
    return nameEn.trim().length > 0 && String(price).trim().length > 0;
  }, [nameEn, price]);

  const categoryLabel = (c: Category, lang: "en" | "ti") => {
    const ti = (c as any)?.path_name_ti;
    const en = (c as any)?.path_name_en;
    const fromPath = lang === "ti" ? ti : en;
    const fallback = en || ti;
    const fromName = typeof c.name === "object" ? (lang === "ti" ? c.name?.ti : c.name?.en) : (c.name as string);
    return (fromPath || fromName || fallback || (c.slug || c.id)) as string;
  };

  const onCreate = async () => {
    if (loading || !canCreate) return;

    setLoading(true);
    try {
      const payload: any = {
        name: { en: nameEn.trim(), ...(nameTi.trim() ? { ti: nameTi.trim() } : {}) },
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
      };

      // Subcategory specific payload
      if (effectiveSubcategory === "hair" || effectiveSubcategory === "hair-extensions") {
        payload.product_type = "hair";
        if (hairTypeEn.trim() || hairTypeTi.trim()) payload.hair_type = { ...(hairTypeEn.trim() ? { en: hairTypeEn.trim() } : {}), ...(hairTypeTi.trim() ? { ti: hairTypeTi.trim() } : {}) };
        if (lengthValue.trim()) payload.length = { en: lengthValue.trim() };
        if (colorEn.trim() || colorTi.trim()) payload.color = { ...(colorEn.trim() ? { en: colorEn.trim() } : {}), ...(colorTi.trim() ? { ti: colorTi.trim() } : {}) };
        if (textureEn.trim() || textureTi.trim()) payload.texture = { ...(textureEn.trim() ? { en: textureEn.trim() } : {}), ...(textureTi.trim() ? { ti: textureTi.trim() } : {}) };
        if (originEn.trim() || originTi.trim()) payload.origin = { ...(originEn.trim() ? { en: originEn.trim() } : {}), ...(originTi.trim() ? { ti: originTi.trim() } : {}) };
        payload.is_virgin = !!isVirgin;
        payload.is_lace = !!isLace;
      } else if (effectiveSubcategory === "perfume") {
        payload.product_type = "perfume";
        if (volumeMl.trim()) payload.volume_ml = Number.parseFloat(volumeMl);
        if (concentration.trim()) payload.concentration = concentration.trim();
        if (fragranceFamily.trim()) payload.fragrance_family = fragranceFamily.trim();
        if (scentNotesEn.trim() || scentNotesTi.trim()) payload.scent_notes = { ...(scentNotesEn.trim() ? { en: scentNotesEn.trim() } : {}), ...(scentNotesTi.trim() ? { ti: scentNotesTi.trim() } : {}) };
      } else if (effectiveSubcategory === "body-scrub" || effectiveSubcategory === "bodyscrub" || effectiveSubcategory === "scrub") {
        payload.product_type = "body-scrub";
        if (scrubWeight.trim()) payload.weight = Number.parseFloat(scrubWeight);
        if (ingredientsEn.trim() || ingredientsTi.trim()) payload.ingredients = { ...(ingredientsEn.trim() ? { en: ingredientsEn.trim() } : {}), ...(ingredientsTi.trim() ? { ti: ingredientsTi.trim() } : {}) };
        if (skinType.trim()) payload.skin_type = skinType.trim();
        payload.is_organic = !!isOrganic;
      } else {
        // Generic beauty product
        payload.product_type = "beauty";
      }

      const created = await createAdminLocalProduct(payload);

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

      success(localT("Local product created"));
      router.push("/admin/products");
    } catch (err: any) {
      showError(getApiErrorMessage(err, t("Create failed.")));
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = useMemo(() => {
    if (effectiveSubcategory === 'hair') return localT('Add New Hair Product');
    if (effectiveSubcategory === 'perfume') return localT('Add New Perfume Product');
    if (effectiveSubcategory === 'body-scrub' || effectiveSubcategory === 'bodyscrub' || effectiveSubcategory === 'scrub') return localT('Add New Body Scrub Product');
    return localT('Add New Beauty Product');
  }, [effectiveSubcategory, localT]);

  const pageSubtitle = useMemo(() => {
    if (effectiveSubcategory === 'hair') return localT('Create a local hair product.');
    if (effectiveSubcategory === 'perfume') return localT('Create a local perfume product.');
    if (effectiveSubcategory === 'body-scrub' || effectiveSubcategory === 'bodyscrub' || effectiveSubcategory === 'scrub') return localT('Create a local body scrub product.');
    return localT('Create a local beauty product.');
  }, [effectiveSubcategory, localT]);

  // --- Synchronize UI subcategory ↔ selected category ---
  useEffect(() => {
    // when UI subcategory button changes, select matching category (if available)
    if (!uiSelectedSubcategory || filteredCategories.length === 0) return;
    const match = filteredCategories.find((c) => {
      const slug = String(c.slug || '').toLowerCase();
      const path = String((c as any).path_slugs || '').toLowerCase();
      return slug === uiSelectedSubcategory || path.includes(`beauty/${uiSelectedSubcategory}`);
    });
    if (match && match.id !== categoryId) setCategoryId(match.id);
  }, [uiSelectedSubcategory, filteredCategories, categoryId]);

  useEffect(() => {
    // when category changes, update UI-selected subcategory so the buttons reflect it
    if (!selectedSubcategorySlug) return;
    if (selectedSubcategorySlug !== uiSelectedSubcategory) setUiSelectedSubcategory(selectedSubcategorySlug);
  }, [selectedSubcategorySlug]);


  return (
    <section className="space-y-6">
      <div>
        {hideSelector ? (
          <div className="mb-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/products/new/beauty')}>{localT('Back to Beauty selection')}</Button>
          </div>
        ) : null}

        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
      </div>

      <Card className="shadow-none">
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
            <div className="space-y-1">
              <Label htmlFor={activeLang === "en" ? "nameEn" : "nameTi"}>{activeLang === "en" ? localT("Name (EN)") : localT("Name (TI)")}</Label>
              <Input id={activeLang === "en" ? "nameEn" : "nameTi"} value={activeLang === "en" ? nameEn : nameTi} onChange={(e) => (activeLang === "en" ? setNameEn(e.target.value) : setNameTi(e.target.value))} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sku">{localT("SKU")}</Label>
              <Input id="sku" value={sku} disabled />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">{localT("Price")}</Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>{localT("Subcategory (optional)")}</Label>

              {hideSelector && effectiveSubcategory ? (
                <div data-testid="preselected-subcategory" className="rounded-md border px-3 py-2">
                  {(() => {
                    const match = filteredCategories.find((c) => {
                      const slug = String(c.slug || '').toLowerCase();
                      const path = String((c as any).path_slugs || '').toLowerCase();
                      return slug === effectiveSubcategory || path.includes(`beauty/${effectiveSubcategory}`);
                    });
                    if (match) return categoryLabel(match, activeLang);
                    if (effectiveSubcategory === 'hair') return localT('Hair');
                    if (effectiveSubcategory === 'perfume') return localT('Perfume');
                    if (effectiveSubcategory === 'body-scrub' || effectiveSubcategory === 'bodyscrub' || effectiveSubcategory === 'scrub') return localT('Body Scrub');
                    return String(effectiveSubcategory).replace(/-/g, ' ');
                  })()}
                </div>
              ) : (
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
              )}

              {/* Quick-select chips (improves UX + easier for tests) */}
              {filteredCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {filteredCategories.map((c) => (
                    <button
                      key={`chip-${c.id}`}
                      data-testid={`category-chip-${String(c.slug || c.id)}`}
                      type="button"
                      className={`rounded-md border px-2 py-1 text-sm ${categoryId === c.id ? 'bg-muted/30' : 'bg-transparent'}`}
                      onClick={() => setCategoryId(c.id)}
                    >
                      {categoryLabel(c, activeLang)}
                    </button>
                  ))}
                </div>
              )}

              {!hideSelector && (
                // Quick UI buttons to choose a beauty subcategory directly
                <div className="pt-4 flex gap-2" role="group" aria-label="beauty-subcategory-buttons">
                  <button
                    type="button"
                    aria-pressed={uiSelectedSubcategory === 'hair'}
                    className={`rounded-md px-3 py-1 text-sm border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${uiSelectedSubcategory === 'hair' ? 'bg-muted/30 border-border text-foreground' : 'bg-transparent border-border text-muted-foreground hover:bg-muted/5'}`}
                    onClick={() => setUiSelectedSubcategory('hair')}
                  >
                    {localT('Hair')}
                  </button>

                  <button
                    type="button"
                    aria-pressed={uiSelectedSubcategory === 'perfume'}
                    className={`rounded-md px-3 py-1 text-sm border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${uiSelectedSubcategory === 'perfume' ? 'bg-muted/30 border-border text-foreground' : 'bg-transparent border-border text-muted-foreground hover:bg-muted/5'}`}
                    onClick={() => setUiSelectedSubcategory('perfume')}
                  >
                    {localT('Perfume')}
                  </button>

                  <button
                    type="button"
                    aria-pressed={uiSelectedSubcategory === 'body-scrub'}
                    className={`rounded-md px-3 py-1 text-sm border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${uiSelectedSubcategory === 'body-scrub' ? 'bg-muted/30 border-border text-foreground' : 'bg-transparent border-border text-muted-foreground hover:bg-muted/5'}`}
                    onClick={() => setUiSelectedSubcategory('body-scrub')}
                  >
                    {localT('Body Scrub')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {effectiveSubcategory === 'hair' && (
            <HairProductForm
              activeLang={activeLang}
              hairTypeEn={hairTypeEn}
              hairTypeTi={hairTypeTi}
              setHairTypeEn={setHairTypeEn}
              setHairTypeTi={setHairTypeTi}
              lengthValue={lengthValue}
              setLengthValue={setLengthValue}
              colorEn={colorEn}
              colorTi={colorTi}
              setColorEn={setColorEn}
              setColorTi={setColorTi}
              textureEn={textureEn}
              textureTi={textureTi}
              setTextureEn={setTextureEn}
              setTextureTi={setTextureTi}
              originEn={originEn}
              originTi={originTi}
              setOriginEn={setOriginEn}
              setOriginTi={setOriginTi}
              isVirgin={isVirgin}
              setIsVirgin={setIsVirgin}
              isLace={isLace}
              setIsLace={setIsLace}
            />
          )}

          {effectiveSubcategory === 'perfume' && (
            <PerfumeProductForm
              activeLang={activeLang}
              volumeMl={volumeMl}
              setVolumeMl={setVolumeMl}
              concentration={concentration}
              setConcentration={setConcentration}
              fragranceFamily={fragranceFamily}
              setFragranceFamily={setFragranceFamily}
              scentNotesEn={scentNotesEn}
              scentNotesTi={scentNotesTi}
              setScentNotesEn={setScentNotesEn}
              setScentNotesTi={setScentNotesTi}
            />
          )}

          {effectiveSubcategory === 'body-scrub' && (
            <BodyScrubProductForm
              activeLang={activeLang}
              scrubWeight={scrubWeight}
              setScrubWeight={setScrubWeight}
              ingredientsEn={ingredientsEn}
              ingredientsTi={ingredientsTi}
              setIngredientsEn={setIngredientsEn}
              setIngredientsTi={setIngredientsTi}
              skinType={skinType}
              setSkinType={setSkinType}
              isOrganic={isOrganic}
              setIsOrganic={setIsOrganic}
            />
          )}

          {/* Description + Images (show for main Beauty subtypes) */}
          {(effectiveSubcategory === 'hair' || effectiveSubcategory === 'perfume' || effectiveSubcategory === 'body-scrub') && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={activeLang === "en" ? "descEn" : "descTi"}>
                  {activeLang === "en" ? localT("Description (EN)") : localT("Description (TI)")}
                </Label>
                <Textarea
                  id={activeLang === "en" ? "descEn" : "descTi"}
                  value={activeLang === "en" ? descriptionEn : descriptionTi}
                  onChange={(e) => (activeLang === "en" ? setDescriptionEn(e.target.value) : setDescriptionTi(e.target.value))}
                  rows={4}
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
          )}

          <div className="h-px w-full bg-border" />

          <div className="grid gap-4 md:grid-cols-2">
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

            {effectiveSubcategory === 'hair' || effectiveSubcategory === 'perfume' || effectiveSubcategory === 'body-scrub' ? (
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
                    <Label htmlFor="stockQty">{localT("Stock quantity")}</Label>
                    <Input id="stockQty" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                  </div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" disabled={loading} onClick={() => router.push("/admin/products/new")}>
              {localT("Cancel")}
            </Button>
            <Button disabled={loading || !canCreate} onClick={onCreate}>{loading ? localT("Creating...") : localT("Create")}</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
