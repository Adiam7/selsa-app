"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { Brush, Trash2 } from "lucide-react";
import {
  listAdminCatalogProducts,
  deleteAdminLocalCatalogProduct,
  setAdminCatalogProductAvailability,
  type AdminCatalogProduct,
} from "@/lib/api/adminProducts";
import { API_BASE_URL } from "@/lib/api/client";

type SourceFilter = "all" | "local" | "printful";
type AvailabilityFilter = "all" | "true" | "false";

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminCatalogProduct[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");

  const params = useMemo(() => {
    return {
      page,
      page_size: 50,
      q: query.trim() || undefined,
      source: source === "all" ? undefined : source,
      is_available: availability === "all" ? undefined : availability,
      ordering: "-updated_at",
    };
  }, [availability, page, query, source]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listAdminCatalogProducts(params);
      setItems(data.results);
      setCount(data.count);
    } catch (err: any) {
      showError(err?.response?.data?.detail || err?.message || t("Failed to load products."));
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const toggleAvailability = async (product: AdminCatalogProduct) => {
    setLoading(true);
    try {
      const updated = await setAdminCatalogProductAvailability(product.id, !product.is_available);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
      success(updated.is_available ? t("Product published") : t("Product unpublished"));
    } catch (err: any) {
      showError(err?.response?.data?.detail || err?.message || t("Update failed."));
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (product: AdminCatalogProduct) => {
    if (loading) return;
    if (product.source !== "local") {
      showError(t("Printful products can't be deleted here. Unpublish it instead."));
      return;
    }

    const ok = window.confirm(t("Unpublish and delete this product permanently? This cannot be undone."));
    if (!ok) return;

    setLoading(true);
    try {
      // Safety: unpublish first to reduce accidental visibility.
      if (product.is_available) {
        const updated = await setAdminCatalogProductAvailability(product.id, false);
        setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
      }
      await deleteAdminLocalCatalogProduct(product.id);
      setItems((prev) => prev.filter((x) => x.id !== product.id));
      setCount((c) => Math.max(0, c - 1));
      success(t("Product deleted"));
    } catch (err: any) {
      showError(err?.response?.data?.detail || err?.message || t("Delete failed."));
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / 50));

  const resolveImageUrl = (url: string | null) => {
    if (!url) return null;
    const trimmed = String(url).trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("/")) return `${API_BASE_URL}${trimmed}`;
    return trimmed;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Products")}</h1>
          <p className="text-sm text-muted-foreground">{t("Manage catalog availability.")}</p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <Label htmlFor="q">{t("Search")}</Label>
            <Input
              id="q"
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder={t("Search by slug or external id")}
              className="w-72"
            />
          </div>

          <div className="space-y-1">
            <Label>{t("Source")}</Label>
            <Select
              value={source}
              onValueChange={(v) => {
                setPage(1);
                setSource(v as SourceFilter);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All")}</SelectItem>
                <SelectItem value="local">{t("Local")}</SelectItem>
                <SelectItem value="printful">{t("Printful")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{t("Availability")}</Label>
            <Select
              value={availability}
              onValueChange={(v) => {
                setPage(1);
                setAvailability(v as AvailabilityFilter);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All")}</SelectItem>
                <SelectItem value="true">{t("Published")}</SelectItem>
                <SelectItem value="false">{t("Unpublished")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={refresh} variant="outline" disabled={loading}>
            {loading ? t("Loading...") : t("Refresh")}
          </Button>

          <Button
            asChild
            disabled={loading}
            variant="default"
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Link href="/admin/products/new">{t("Add local product")}</Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("Catalog products")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">{loading ? t("Loading...") : t("No products found.")}</div>
          ) : (
            <div className="divide-y rounded-lg border">
              {items.map((p) => (
                <div key={p.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveImageUrl(p.image_url) || undefined}
                        alt={p.name_display}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.name_display || p.slug || `#${p.id}`}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {p.slug ? p.slug : t("No slug")} · {p.source}
                        {p.external_product_id ? ` · ext:${p.external_product_id}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                    <Badge variant={p.is_available ? "default" : "secondary"}>
                      {p.is_available ? t("Published") : t("Unpublished")}
                    </Badge>
                    <div className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)}</div>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      disabled={loading}
                      title={t("Edit")}
                    >
                      <Link href={`/admin/products/${p.id}/edit`} aria-label={t("Edit")}>
                        <Brush className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      disabled={loading}
                      onClick={() => toggleAvailability(p)}
                    >
                      {p.is_available ? t("Unpublish") : t("Publish")}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={loading || p.source !== "local"}
                      onClick={() => deleteProduct(p)}
                      title={
                        p.source === "local"
                          ? t("Delete product")
                          : t("Only local products can be deleted")
                      }
                      className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {t("Showing page")} {page} {t("of")} {totalPages} ({count} {t("total")})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("Previous")}
              </Button>
              <Button
                variant="outline"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t("Next")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
