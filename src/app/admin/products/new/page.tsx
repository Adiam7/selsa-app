"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHOICES: Array<{ key: string; label: string }> = [
  { key: "beauty", label: "Beauty" },
  { key: "books", label: "Books" },
  { key: "clothes", label: "Clothes" },
  { key: "food", label: "Food" },
  { key: "jewellery", label: "Jewellery" },
  { key: "digital", label: "Digital" },
];

export default function AdminNewLocalProductPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Add local product")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Choose a product type to continue.")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHOICES.map((c) => (
          <Link key={c.key} href={`/admin/products/new/${c.key}`} className="block group">
            <Card className="shadow-none transition-colors group-hover:bg-foreground group-hover:text-background">
              <CardHeader>
                <CardTitle className="text-base group-hover:text-background">{t(c.label)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground group-hover:text-background">
                  {t("Add new") + " " + t(c.label)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
