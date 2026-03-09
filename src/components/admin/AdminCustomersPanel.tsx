"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminCustomers,
  type AdminCustomer,
} from "@/lib/api/adminCustomers";

const STATUS_OPTIONS = ["ALL", "PENDING", "ACTIVE", "SUSPENDED", "DEACTIVATED"];

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatMoney = (value?: string | null) => {
  if (!value) return "0.00";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;
  return numberValue.toFixed(2);
};

export function AdminCustomersPanel() {
  const { error: showError } = useToast();
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const query = search.toLowerCase().trim();
    return customers.filter((customer) => {
      return (
        customer.email.toLowerCase().includes(query) ||
        (customer.username || "").toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminCustomers({
        page,
        pageSize,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setCustomers(response.items || []);
      setPageInfo({
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
      });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || t("Failed to load customers.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(pageInfo.count / pageSize));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl">{t("Customers")}</CardTitle>
        <CardDescription>{t("Search customers and review their orders.")}</CardDescription>
        <CardAction>
          <Button onClick={loadCustomers} variant="outline" disabled={loading}>
            {loading ? t("Loading...") : t("Refresh")}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search by email or username")}
            className="md:w-96"
          />

          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setPage(1);
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className="w-44" aria-label={t("Filter status")}>
                <SelectValue placeholder={t("All statuses")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "ALL" ? t("All statuses") : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPage(1);
                setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-32" aria-label={t("Page size")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / {t("page")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-sm">
              <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Email")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Username")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Status")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Orders")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">{t("Total spent")}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">{t("Joined")}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">{t("Action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-gray-900">{customer.email}</td>
                <td className="px-4 py-3 text-gray-700">{customer.username || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{customer.status}</td>
                <td className="px-4 py-3 text-gray-700">{customer.orders_count}</td>
                <td className="px-4 py-3 text-gray-700">{formatMoney(customer.total_spent)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatDate(customer.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/customers/${customer.id}`}>{t("View")}</Link>
                  </Button>
                </td>
              </tr>
            ))}

            {!loading && filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {t("No customers found.")}
                </td>
              </tr>
            )}
          </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {t("Page")} {page} {t("of")} {totalPages} · {pageInfo.count} {t("total")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              variant="outline"
              size="sm"
            >
              {t("Previous")}
            </Button>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              variant="outline"
              size="sm"
            >
              {t("Next")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
