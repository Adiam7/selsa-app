"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Book, BookOpen, Upload } from "lucide-react";

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

export function BookProductForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const NONE = "__none__";

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [titleEn, setTitleEn] = useState("");
  const [titleTi, setTitleTi] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTi, setDescriptionTi] = useState("");

  const [activeLang, setActiveLang] = useState<"en" | "ti">("en");
  const localT = (key: string, opts?: any) => t(key, { lng: activeLang, ...opts });
  const [showTiMissing, setShowTiMissing] = useState(false);

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

  const [publish, setPublish] = useState<"true" | "false">("false");
  const [stockControl, setStockControl] = useState<"finite" | "infinite" | "preorder">("finite");
  const [stockQuantity, setStockQuantity] = useState("0");

  const [stockStatus, setStockStatus] = useState<"in" | "out">("in");

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [openBookImage, setOpenBookImage] = useState<File | null>(null);
  const [backCoverImage, setBackCoverImage] = useState<File | null>(null);

  const [samplePdf, setSamplePdf] = useState<File | null>(null);

  const coverPreview = useMemo(() => (coverImage ? URL.createObjectURL(coverImage) : null), [coverImage]);
  const openPreview = useMemo(() => (openBookImage ? URL.createObjectURL(openBookImage) : null), [openBookImage]);
  const backPreview = useMemo(() => (backCoverImage ? URL.createObjectURL(backCoverImage) : null), [backCoverImage]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (openPreview) URL.revokeObjectURL(openPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [coverPreview, openPreview, backPreview]);

  const enRequiredOk = useMemo(() => {
    return titleEn.trim().length > 0 && String(price).trim().length > 0 && authorEn.trim().length > 0;
  }, [titleEn, price, authorEn]);

  useEffect(() => {
    if (sku.trim()) return;
    setSku(generateSku("BOOK"));
  }, [sku]);

  const missingTiFields = useMemo(() => {
    const missing: Array<"title" | "author"> = [];
    if (!titleTi.trim()) missing.push("title");
    if (!authorTi.trim()) missing.push("author");
    return missing;
  }, [titleTi, authorTi]);

  const tiRequiredOk = useMemo(() => missingTiFields.length === 0, [missingTiFields.length]);
  const canCreate = useMemo(() => enRequiredOk && tiRequiredOk, [enRequiredOk, tiRequiredOk]);

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
    if (categoryId) return;
    if (categories.length === 0) return;
    const match = categories.find((c) => String(c.slug || "").toLowerCase() === "books");
    if (match) setCategoryId(match.id);
  }, [categories, categoryId]);

  const filteredCategories = useMemo(() => {
    const withinBooks = categories.filter((c) => {
      const slug = String(c.slug || "").toLowerCase();
      const path = String((c as any).path_slugs || "").toLowerCase();
      return slug === "books" || path === "books" || path.startsWith("books/");
    });
    return withinBooks.length > 0 ? withinBooks : categories;
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
    if (!canCreate) return;

    const cleanIsbn = isbn.trim();
    if (cleanIsbn && cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
      showError(t("ISBN must be 10 or 13 characters."));
      return;
    }

    setLoading(true);
    try {
      const tags = tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await createAdminLocalProduct({
        product_type: "book",
        name: { en: titleEn.trim(), ...(titleTi.trim() ? { ti: titleTi.trim() } : {}) },
        author: {
          en: authorEn.trim(),
          ...(authorTi.trim() ? { ti: authorTi.trim() } : {}),
        },
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
            ? {
                ...(translatedByEn.trim() ? { en: translatedByEn.trim() } : {}),
                ...(translatedByTi.trim() ? { ti: translatedByTi.trim() } : {}),
              }
            : null,
        publication_date: publicationDate ? publicationDate : null,
        language:
          languageEn || languageTi
            ? {
                ...(languageEn ? { en: languageEn } : {}),
                ...(languageTi.trim() ? { ti: languageTi.trim() } : {}),
              }
            : null,
        genre:
          genreEn || genreTi
            ? {
                ...(genreEn ? { en: genreEn } : {}),
                ...(genreTi.trim() ? { ti: genreTi.trim() } : {}),
              }
            : null,
        page_count: pageCount.trim() ? Number(pageCount) : null,
        tags,
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
      });

      const uploads: Array<{ file: File | null; alt: string; primary: boolean }> = [
        { file: coverImage, alt: "Book Cover", primary: true },
        { file: openBookImage, alt: "Open Book", primary: false },
        { file: backCoverImage, alt: "Back Cover", primary: false },
      ];

      for (const u of uploads) {
        if (!u.file) continue;
        try {
          await uploadAdminLocalProductImage(created.id, u.file, {
            is_primary: u.primary,
            alt_text: { en: u.alt },
          });
        } catch (err: any) {
          showError(getApiErrorMessage(err, localT("Image upload failed.")));
          break;
        }
      }

      success(t("Local product created"));
      router.push("/admin/products");
    } catch (err: any) {
      showError(getApiErrorMessage(err, localT("Create failed.")));
    } finally {
      setLoading(false);
    }
  };

  const onSubmitClick = () => {
    if (loading) return;
    if (!enRequiredOk) {
      setActiveLang("en");
      showError(t("Please fill the required English fields before submitting."));
      window.setTimeout(() => {
        document.getElementById(!titleEn.trim() ? "titleEn" : !authorEn.trim() ? "authorEn" : "price")?.focus();
      }, 0);
      return;
    }
    if (missingTiFields.length > 0) {
      setShowTiMissing(true);
      setActiveLang("ti");
      showError(t("Please fill the required Tigrinya fields before submitting."));
      const first = missingTiFields[0];
      window.setTimeout(() => {
        const id = first === "title" ? "titleTi" : "authorTi";
        document.getElementById(id)?.focus();
      }, 0);
      return;
    }
    void onCreate();
  };

  useEffect(() => {
    // Keep the payload consistent with the screenshot-like stock status.
    if (stockStatus === "out") {
      setStockControl("finite");
      setStockQuantity("0");
    } else {
      setStockControl("finite");
      if (Number(stockQuantity || 0) <= 0) setStockQuantity("1");
    }
    // Only react to explicit status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockStatus]);

  const GENRES = ["Fiction", "Non-fiction", "Poetry", "Children", "Biography", "Other"];
  const LANGUAGES = ["English", "Tigrinya", "Arabic", "Other"];

  const ImageTile = (props: {
    label: string;
    previewUrl: string | null;
    onPick: (file: File | null) => void;
    inputId: string;
    icon: React.ReactNode;
  }) => {
    return (
      <div className="space-y-2 max-w-xs mx-auto">
        <label htmlFor={props.inputId} className="block cursor-pointer">
          <div className="relative overflow-hidden rounded-md border bg-muted/10">
            <div className="aspect-4/3 w-full p-4">
              {props.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={props.previewUrl} alt={props.label} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="opacity-70">{props.icon}</div>
                    <div className="text-sm">{localT("Upload image")}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </label>
        <input
          id={props.inputId}
          type="file"
          accept="image/*"
          disabled={loading}
          className="sr-only"
          onChange={(e) => props.onPick((e.target.files || [])[0] || null)}
        />
        <p className="text-center text-sm font-medium">{props.label}</p>
      </div>
    );
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="pt-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">{localT("Add New Book")}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ImageTile
          label={localT("Book Cover")}
          previewUrl={coverPreview}
          inputId="bookCover"
          onPick={setCoverImage}
          icon={<Book className="h-10 w-10" />}
        />
        <ImageTile
          label={localT("Open Book")}
          previewUrl={openPreview}
          inputId="openBook"
          onPick={setOpenBookImage}
          icon={<BookOpen className="h-10 w-10" />}
        />
        <ImageTile
          label={localT("Back Cover")}
          previewUrl={backPreview}
          inputId="backCover"
          onPick={setBackCoverImage}
          icon={<Book className="h-10 w-10" />}
        />
      </div>

      <Card className="shadow-none">
        <CardContent className="space-y-6 pt-8">
          <div className="flex items-center justify-end gap-3">
            <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v === "ti" ? "ti" : "en")}>
              <TabsList>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger
                  value="ti"
                  className={showTiMissing && missingTiFields.length > 0 ? "text-destructive data-[state=active]:text-destructive" : undefined}
                >
                  TI
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Primary form (matches the screenshot grouping) */}
          <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            {/* Left column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={activeLang === "en" ? "titleEn" : "titleTi"}>
                  {activeLang === "en" ? localT("Book Title") : localT("Book Title")}
                </Label>
                {activeLang === "en" ? (
                  <Input id="titleEn" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                ) : (
                  <Input id="titleTi" value={titleTi} onChange={(e) => setTitleTi(e.target.value)} placeholder={localT("Optional")} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={activeLang === "en" ? "authorEn" : "authorTi"}>{localT("Author")}</Label>
                {activeLang === "en" ? (
                  <Input id="authorEn" value={authorEn} onChange={(e) => setAuthorEn(e.target.value)} />
                ) : (
                  <Input id="authorTi" value={authorTi} onChange={(e) => setAuthorTi(e.target.value)} placeholder={localT("Optional")} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">{localT("ISBN")}</Label>
                <Input id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder={localT("Optional")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{localT("Price")}</Label>
                <div className="flex items-center gap-2 flex-nowrap">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full max-w-40"
                  />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{localT("Genre")}</Label>
                {activeLang === "en" ? (
                  <Select value={genreEn || NONE} onValueChange={(v) => setGenreEn(v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={localT("Select Genre")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{localT("Select Genre")}</SelectItem>
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {localT(g)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={genreTi} onChange={(e) => setGenreTi(e.target.value)} placeholder={localT("Optional")} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicationDate">{localT("Publication Date")}</Label>
                <Input id="publicationDate" type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageCount">{localT("Page Count")}</Label>
                <Input
                  id="pageCount"
                  type="number"
                  min={1}
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                  placeholder={localT("Optional")}
                />
              </div>

              <div className="space-y-2">
                <Label>{localT("Language")}</Label>
                {activeLang === "en" ? (
                  <Select value={languageEn || NONE} onValueChange={(v) => setLanguageEn(v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={localT("Select Language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{localT("Select Language")}</SelectItem>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>
                          {localT(l)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={languageTi} onChange={(e) => setLanguageTi(e.target.value)} placeholder={localT("Optional")} />
                )}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Bottom section (PDF + tags + stock) */}
          <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <div className="space-y-2">
              <Label>{localT("Upload Sample (PDF)")}</Label>
              <label htmlFor="samplePdf" className="block cursor-pointer">
                <div className="flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/10">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <div className="text-sm font-medium text-foreground">{localT("Upload PDF")}</div>
                    {samplePdf ? (
                      <div className="max-w-60 truncate text-xs text-muted-foreground">{samplePdf.name}</div>
                    ) : null}
                  </div>
                </div>
              </label>
              <input
                id="samplePdf"
                type="file"
                accept="application/pdf"
                disabled={loading}
                className="sr-only"
                onChange={(e) => setSamplePdf((e.target.files || [])[0] || null)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">{localT("Tags")}</Label>
                <Input id="tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder={localT("Add tags")} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex-1 space-y-2">
                  <Label>{localT("Stock Status")}</Label>
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="stockStatus"
                        value="in"
                        checked={stockStatus === "in"}
                        onChange={() => setStockStatus("in")}
                        disabled={loading}
                        className="h-4 w-4 accent-black"
                      />
                      {localT("In Stock")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="stockStatus"
                        value="out"
                        checked={stockStatus === "out"}
                        onChange={() => setStockStatus("out")}
                        disabled={loading}
                        className="h-4 w-4 accent-black"
                      />
                      {localT("Out of Stock")}
                    </label>
                  </div>
                </div>

                <div className="w-full md:w-40 space-y-2">
                  <Label htmlFor="stockQty">{localT("Quantity")}</Label>
                  <Input id="stockQty" value={stockQuantity} disabled={stockStatus === "out"} onChange={(e) => setStockQuantity(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Additional details (still required for admin create) */}
          <div className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={activeLang === "en" ? "publisherEn" : "publisherTi"}>{localT("Publisher")}</Label>
                {activeLang === "en" ? (
                  <Input
                    id="publisherEn"
                    value={publisherEn}
                    onChange={(e) => setPublisherEn(e.target.value)}
                    placeholder={localT("Optional")}
                  />
                ) : (
                  <Input
                    id="publisherTi"
                    value={publisherTi}
                    onChange={(e) => setPublisherTi(e.target.value)}
                    placeholder={localT("Optional")}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={activeLang === "en" ? "translatedByEn" : "translatedByTi"}>{localT("Translated by")}</Label>
                {activeLang === "en" ? (
                  <Input
                    id="translatedByEn"
                    value={translatedByEn}
                    onChange={(e) => setTranslatedByEn(e.target.value)}
                    placeholder={localT("Optional")}
                  />
                ) : (
                  <Input
                    id="translatedByTi"
                    value={translatedByTi}
                    onChange={(e) => setTranslatedByTi(e.target.value)}
                    placeholder={localT("Optional")}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sku">{localT("SKU")}</Label>
                <Input id="sku" value={sku} disabled />
              </div>

              <div className="space-y-2">
                <Label>{localT("Subcategory (optional)")}</Label>
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{localT("No categories available yet.")}</p>
                ) : (
                  <Select value={categoryId || NONE} onValueChange={(v) => setCategoryId(v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={localT("Select a category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{localT("None")}</SelectItem>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {categoryLabel(c, activeLang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="space-y-2">
            <Label htmlFor={activeLang === "en" ? "descEn" : "descTi"}>{localT("Description")}</Label>
            {activeLang === "en" ? (
              <Textarea
                id="descEn"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder={localT("Enter book description...")}
                className="min-h-40"
              />
            ) : (
              <Textarea
                id="descTi"
                value={descriptionTi}
                onChange={(e) => setDescriptionTi(e.target.value)}
                placeholder={localT("Optional")}
                className="min-h-40"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" disabled={loading} onClick={() => router.push("/admin/products/new")}>
              {localT("Cancel")}
            </Button>
            <Button disabled={loading || !enRequiredOk} onClick={onSubmitClick}>
              {loading ? localT("Adding...") : localT("Add Book")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
